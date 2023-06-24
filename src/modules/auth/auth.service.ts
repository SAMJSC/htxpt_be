import { USER_ROLES } from "@constants/common.constants";
import { ChangePasswordDto } from "@modules/auth/dtos/change-password.dto";
import { GardenLoginDto } from "@modules/auth/dtos/garden-login.dto";
import { GardenRegistrationDto } from "@modules/auth/dtos/garden-registration.dto";
import { RefreshTokenDto } from "@modules/auth/dtos/refresh_token.dto";
import { GardensService } from "@modules/gardens/gardens.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
import { Cache } from "cache-manager";
import { scrypt } from "crypto";
import { Model } from "mongoose";
import { DeviceSession } from "schemas/device_session.schema";
import { Garden } from "schemas/garden.schema";
import {
    GenerateAccessJWTData,
    LoginMetadata,
    LoginResponseData,
    Session,
} from "type";
import { promisify } from "util";
import {
    generateAccessJWT,
    generateRefreshJWT,
    verifyRefreshJWT,
} from "utils/jwt";

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(DeviceSession.name)
        private readonly deviceSessionModel: Model<DeviceSession>,
        private readonly gardenService: GardensService,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    async validateGarden(phone: string, password: string): Promise<Garden> {
        const garden = await this.gardenService.findOneByCondition({ phone });
        if (!garden) {
            throw new HttpException(
                `Garden with ${phone} not exist yet`,
                HttpStatus.NOT_FOUND
            );
        }

        const [salt, storedHash] = garden.password.split("#");
        const hashBuffer = (await promisify(scrypt)(
            password,
            salt,
            32
        )) as Buffer;
        const hash = hashBuffer.toString("hex");

        if (hash !== storedHash) {
            throw new HttpException(
                "Password is invalid",
                HttpStatus.BAD_REQUEST
            );
        }

        return garden;
    }

    isDifferentGarden(session: Session, garden: Garden) {
        return session.garden._id.toString() !== garden._id.toString();
    }

    async generateResponseLoginData(
        garden: Garden
    ): Promise<LoginResponseData> {
        const gardenData = {
            ...(garden as any).toObject(),
            role: garden.role ? garden.role : USER_ROLES.GARDENER,
        };

        delete gardenData.reset_token;
        delete gardenData.password;
        let accessToken: string;
        let refreshToken: string;

        try {
            accessToken = generateAccessJWT(gardenData, {
                expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRE_IN_SEC),
            });
            refreshToken = generateRefreshJWT(gardenData, {
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
            gardenData: gardenData,
        };
    }

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        const hash = (await promisify(scrypt)(password, salt, 32)) as Buffer;
        const hashedPassword = salt + "#" + hash.toString("hex");
        return hashedPassword;
    }

    async checkPassword(
        gardenPassword: string,
        hashedPassword: string
    ): Promise<boolean> {
        const [salt, storedHash] = hashedPassword.split("#");
        const hash = (await promisify(scrypt)(
            gardenPassword,
            salt,
            32
        )) as Buffer;
        return hash.toString("hex") === storedHash;
    }

    async generateNewAccessJWT(
        deviceId: string,
        refreshTokenDto: RefreshTokenDto
    ): Promise<GenerateAccessJWTData> {
        const { refreshToken } = refreshTokenDto;
        const session: any = await this.getSession(
            deviceId,
            undefined,
            refreshToken
        );

        if (!session || session.expiredAt < new Date()) {
            throw new HttpException(
                "Refresh token invalid",
                HttpStatus.UNAUTHORIZED
            );
        }
        let payload: any;
        try {
            payload = await verifyRefreshJWT(refreshToken);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
        }

        delete payload.exp;
        delete payload.iat;

        const accessToken = generateAccessJWT(payload, { expiresIn: 1800 });

        return { accessToken };
    }

    async createSession(garden: Garden, loginMetaData: LoginMetadata) {
        const { gardenData, accessToken, refreshToken } =
            await this.generateResponseLoginData(garden);

        const session = await this.getSession(
            loginMetaData.deviceId,
            garden.id
        );
        const refreshTokenExpireAtMs =
            Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRE_IN_SEC) * 1000;

        const newDevice = await this.deviceSessionModel.create({
            device_id: loginMetaData.deviceId,
            ip_address: session ? session.ip_address : loginMetaData.ipAddress,
            garden: garden,
            expired_at: new Date(refreshTokenExpireAtMs),
            ua: loginMetaData.ua,
            refresh_token: refreshToken,
        });

        const gardenUpdate = await this.gardenService.findOne(
            garden._id.toString()
        );

        gardenUpdate.device_sessions.push(newDevice);

        await this.gardenService.update(garden._id.toString(), gardenUpdate);

        return {
            gardenData,
            accessToken,
            refreshToken,
            loginMetaData,
        };
    }

    async getSession(
        deviceId: string,
        gardenID?: string,
        refreshToken?: string
    ) {
        const query = { device_id: deviceId };

        if (gardenID) {
            query["garden"] = gardenID;
        }

        if (refreshToken) {
            query["refresh_token"] = refreshToken;
        }
        const session = await this.deviceSessionModel.findOne(query);
        return session;
    }

    async gardenRegistration(
        gardenRegistrationDto: GardenRegistrationDto
    ): Promise<Garden> {
        const { password, confirm_password } = gardenRegistrationDto;

        const existedEmail = await this.gardenService.findOneByCondition({
            email: gardenRegistrationDto.email,
        });

        if (existedEmail) {
            throw new HttpException(
                "Email already existed!!",
                HttpStatus.CONFLICT
            );
        }

        const existedPhone = await this.gardenService.findOneByCondition({
            phone: gardenRegistrationDto.phone,
        });

        if (existedPhone) {
            throw new HttpException(
                "Phone already existed!!",
                HttpStatus.CONFLICT
            );
        }

        if (password !== confirm_password) {
            throw new HttpException(
                "Password and Confirm Password do not match",
                HttpStatus.BAD_REQUEST
            );
        }

        const hashedPassword = await this.hashPassword(password);

        const savedGarden = this.gardenService.createGarden({
            ...gardenRegistrationDto,
            password: hashedPassword,
        });

        return savedGarden;
    }

    async gardenLogin(
        gardenLoginDto: GardenLoginDto,
        loginMetaData: LoginMetadata
    ) {
        const { phone } = gardenLoginDto;
        const garden = await this.gardenService.findOneByCondition({ phone });
        if (
            await this.checkPassword(garden.password, gardenLoginDto.password)
        ) {
            throw new HttpException(
                "Password is invalid",
                HttpStatus.BAD_REQUEST
            );
        }

        const session = await this.getSession(
            loginMetaData.deviceId,
            garden._id.toString(),
            undefined
        );

        if (session) {
            if (new Date(session.expired_at).getTime() < Date.now()) {
                await this.deviceSessionModel.deleteOne(session._id);
                throw new HttpException(
                    "Session expired",
                    HttpStatus.UNAUTHORIZED
                );
            }
        }

        if (!session || this.isDifferentGarden(session, garden)) {
            return await this.createSession(garden, loginMetaData);
        }

        return {
            refreshToken: session.refresh_token,
        };
    }

    async changePassword(
        phone: string,
        changePasswordDto: ChangePasswordDto
    ): Promise<void> {
        const garden = await this.gardenService.findOneByCondition({
            phone: phone,
        });

        if (!garden) {
            throw new HttpException("Garden not found", HttpStatus.NOT_FOUND);
        }

        const isOldPasswordValid = await this.checkPassword(
            changePasswordDto.oldPassword,
            garden.password
        );

        if (!isOldPasswordValid) {
            throw new HttpException(
                "Invalid old password",
                HttpStatus.BAD_REQUEST
            );
        }

        garden.password = await this.hashPassword(
            changePasswordDto.newPassword
        );

        const newPassword = await this.hashPassword(
            changePasswordDto.newPassword
        );

        const updatePasswordDto = {
            password: newPassword,
        };

        await this.gardenService.update(
            garden._id.toString(),
            updatePasswordDto
        );
    }

    async getCurrentUser(email: string): Promise<Garden> {
        const user = this.gardenService.getGardenByEmail(email);
        return user;
    }

    async logout(gardenID: string, deviceId: string) {
        const session: any = await this.getSession(deviceId);

        const garden = await this.gardenService.findOneByCondition({
            id: gardenID,
        });

        if (!session || !garden) {
            throw new HttpException("You need to login", HttpStatus.FORBIDDEN);
        }
        const keyCache = this.getKeyCache(gardenID, session.id);

        await this.cacheManager.del(keyCache);
        await this.deviceSessionModel.deleteOne(session._id);
        return {
            message: "Logout success",
            status: 200,
            sessionId: deviceId,
        };
    }

    getKeyCache(gardenID: string, deviceId: string): string {
        return `sk_${gardenID}_${deviceId}`;
    }
}
