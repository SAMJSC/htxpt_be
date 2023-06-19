import { UserEntity } from "@entities/user.entity";
import { UserRegisterDto } from "@modules/auth/dto/UserRegister.dto";
import * as bcrypt from "bcrypt";
import { scrypt } from "crypto";
import { UserDto } from "@modules/user/dto/user.dto";
import { UserService } from "@modules/user/user.service";
import { HttpException, HttpStatus } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { promisify } from "util";
import { LoginMetadata, LoginResponseData, Session } from "type";
import { DeviceSessionEntity } from "@entities/devices-session.entity";
import { generateAccessJWT, generateRefreshJWT } from "utils/jwt";
import { UserLoginDto } from "@modules/auth/dto/UserLogin.dto";

export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        private jwtService: JwtService,
        private userService: UserService,
        @InjectRepository(DeviceSessionEntity)
        private deviceSessionRepository: Repository<DeviceSessionEntity>
    ) {}

    isDifferentUser(session: Session, user: UserEntity) {
        return session.user.id !== user.id;
    }

    hideSensitiveUserData(user: UserDto) {
        delete user.password;
        delete user.resetToken;
    }

    async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });

        if (!user) {
            throw new HttpException(
                `User with email:${email} doesn't existed`,
                HttpStatus.NOT_FOUND
            );
        }

        return user;
    }

    async checkPassword(
        userPassword: string,
        hashedPassword: string
    ): Promise<boolean> {
        const [salt, storedHash] = hashedPassword.split("#");
        const hash = (await promisify(scrypt)(
            userPassword,
            salt,
            32
        )) as Buffer;

        return hash.toString("hex") !== storedHash;
    }

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        const hash = (await promisify(scrypt)(password, salt, 32)) as Buffer;
        const hashedPassword = salt + "#" + hash.toString("hex");
        return hashedPassword;
    }

    async isEmailInUse(email: string): Promise<boolean> {
        const isEmailInUse = await this.userRepository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.email = :email", { email })
            .getOne();

        return !!isEmailInUse;
    }

    async getSession(deviceId: string, userId?: string, refreshToken?: string) {
        const queryBuilder = this.deviceSessionRepository
            .createQueryBuilder("session")
            .leftJoinAndSelect("session.user", "user")
            .select(["session", "user.id"])
            .where("session.deviceId = :deviceId", { deviceId });

        if (userId) {
            queryBuilder.andWhere("session.user.id = :userId", { userId });
        }

        if (refreshToken) {
            queryBuilder.andWhere("session.refreshToken = :refreshToken", {
                refreshToken,
            });
        }

        return await queryBuilder.getOne();
    }

    async createSession(user: UserEntity, loginMetaData: LoginMetadata) {
        const { userData, accessToken, refreshToken } =
            await this.generateResponseLoginData(user);

        const session = await this.getSession(loginMetaData.deviceId, user.id);
        const refreshTokenExpireAtMs =
            Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRE_IN_SEC) * 1000;
        const newDevice = new DeviceSessionEntity();

        newDevice.createdAt = new Date(Date.now());
        newDevice.refreshToken = refreshToken;
        newDevice.deviceId = loginMetaData.deviceId;
        newDevice.ipAddress = session
            ? session.ipAddress
            : loginMetaData.ipAddress;
        newDevice.ua = loginMetaData.ua;
        newDevice.expiredAt = new Date(refreshTokenExpireAtMs);
        newDevice.userId = userData.id;

        await this.deviceSessionRepository.save(newDevice);

        return {
            userData,
            accessToken,
            refreshToken,
            loginMetaData,
        };
    }

    async generateResponseLoginData(
        user: UserEntity
    ): Promise<LoginResponseData> {
        const userData = { ...user };
        delete userData.resetToken;
        delete userData.password;
        delete userData.createdAt;
        delete userData.updatedAt;
        let accessToken: string;
        let refreshToken: string;

        try {
            accessToken = generateAccessJWT(userData, {
                expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRE_IN_SEC),
            });
            refreshToken = generateRefreshJWT(userData, {
                expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRE_IN_SEC),
            });
        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        return {
            accessToken,
            refreshToken,
            userData,
        };
    }

    async signUp(userData: UserRegisterDto): Promise<UserDto> {
        const {
            dateOfBirth,
            firstName,
            middleName,
            lastName,
            email,
            password,
            passwordConfirm,
        } = userData;

        if (await this.isEmailInUse(email)) {
            throw new HttpException(
                `Email ${email} already exists`,
                HttpStatus.CONFLICT
            );
        }

        if (password !== passwordConfirm) {
            throw new HttpException(
                "Password and Confirm Password do not match",
                HttpStatus.BAD_REQUEST
            );
        }

        const hashedPassword = await this.hashPassword(password);

        let savedUser: UserEntity;

        const newUser = this.userRepository.create({
            ...userData,
            firstName,
            lastName,
            middleName,
            email,
            dateOfBirth,
            password: hashedPassword,
        });

        await this.userRepository.manager.transaction(async (entityManager) => {
            try {
                savedUser = await entityManager.save(newUser);
            } catch (error) {
                throw new Error(`Internal server error: ${error.message}`);
            }
        });

        this.hideSensitiveUserData(savedUser);
        return savedUser;
    }

    async signIn(loginDto: UserLoginDto, loginMetaData: LoginMetadata) {
        const user = await this.getUserByEmail(loginDto.email);

        if (await this.checkPassword(loginDto.password, user.password)) {
            throw new HttpException(
                "Password is invalid",
                HttpStatus.BAD_REQUEST
            );
        }

        const session = await this.getSession(
            loginMetaData.deviceId,
            user.id,
            undefined
        );

        if (session) {
            if (new Date(session.expiredAt).getTime() < Date.now()) {
                await this.deviceSessionRepository.delete(session.id);
                throw new HttpException(
                    "Session expired",
                    HttpStatus.UNAUTHORIZED
                );
            }
        }

        if (!session || this.isDifferentUser(session, user)) {
            return await this.createSession(user, loginMetaData);
        }

        return {
            refreshToken: session.refreshToken,
        };
    }
}
