import { USER_ROLES } from "@constants/common.constants";
import { AdminService } from "@modules/admin/admin.service";
import { AdminLoginDto } from "@modules/auth/dtos/admin-login.dto";
import { AdminRegistrationDto } from "@modules/auth/dtos/admin-registration.dto";
import { ChangePasswordDto } from "@modules/auth/dtos/change-password.dto";
import { GardenLoginDto } from "@modules/auth/dtos/garden-login.dto";
import { GardenRegistrationDto } from "@modules/auth/dtos/garden-registration.dto";
import { RefreshTokenDto } from "@modules/auth/dtos/refresh_token.dto";
import { GardensService } from "@modules/gardens/gardens.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Admin } from "@schemas/admin.schema";
import { httpResponse } from "@shared/response";
import { Response } from "@shared/response/response.interface";
import * as bcrypt from "bcrypt";
import { Cache } from "cache-manager";
import { scrypt } from "crypto";
import { Model } from "mongoose";
import { DeviceSession } from "schemas/device_session.schema";
import { Garden } from "schemas/garden.schema";
import { LoginMetadata, LoginResponseData, Session } from "type";
import { SessionResponse } from "types/common.type";
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
        private readonly adminService: AdminService,
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

    isDifferentUser(session: Session, garden: Admin | Garden) {
        if (session.gardener) {
            return session.gardener._id.toString() !== garden._id.toString();
        }
        if (session.admin) {
            return session.admin._id.toString() !== garden._id.toString();
        }
        if (session.super_admin) {
            return session.super_admin._id.toString() !== garden._id.toString();
        }
    }

    async generateResponseLoginData(
        user: Admin | Garden
    ): Promise<LoginResponseData> {
        const userData = {
            ...(user as any).toObject(),
            role: user.role ? user.role : USER_ROLES.GARDENER,
        };

        delete userData.reset_token;
        delete userData.password;
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

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        const hash = (await promisify(scrypt)(password, salt, 32)) as Buffer;
        const hashedPassword = salt + "#" + hash.toString("hex");
        return hashedPassword;
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
        return hash.toString("hex") === storedHash;
    }

    async generateNewAccessJWT(
        deviceId: string,
        refreshTokenDto: RefreshTokenDto
    ): Promise<Response> {
        const { refreshToken } = refreshTokenDto;

        const session: any = await this.getSession(
            deviceId,
            undefined,
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

        return {
            ...httpResponse.REFRESH_TOKEN_SUCCESSFULLY,
            data: {
                session: { accessToken },
            },
        };
    }

    async createSession(
        user: Admin | Garden,
        loginMetaData: LoginMetadata,
        service: AdminService | GardensService
    ): Promise<SessionResponse> {
        const { userData, accessToken, refreshToken } =
            await this.generateResponseLoginData(user);

        const session = await this.getSession(
            loginMetaData.deviceId,
            user.role,
            user.id
        );
        const refreshTokenExpireAtMs =
            Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRE_IN_SEC) * 1000;

        const newDevice = await this.deviceSessionModel.create({
            device_id: loginMetaData.deviceId,
            ip_address: session ? session.ip_address : loginMetaData.ipAddress,
            gardener: user.role === USER_ROLES.GARDENER ? user : null,
            admin: user.role === USER_ROLES.ADMIN ? user : null,
            super_admin: user.role === USER_ROLES.SUPER_ADMIN ? user : null,
            expired_at: new Date(refreshTokenExpireAtMs),
            ua: loginMetaData.ua,
            refresh_token: refreshToken,
        });

        const userUpdate = await service.findOne(user._id.toString());

        userUpdate.device_sessions.push(newDevice);

        await service.update(user._id.toString(), userUpdate);

        return {
            userData,
            accessToken,
            refreshToken,
            loginMetaData,
        };
    }

    async getSession(
        deviceId: string,
        userRole: USER_ROLES,
        gardenID?: string,
        refreshToken?: string
    ) {
        const query = { device_id: deviceId };

        if (gardenID) {
            query[userRole] = gardenID;
        }

        if (refreshToken) {
            query["refresh_token"] = refreshToken;
        }

        const session = await this.deviceSessionModel.findOne(query);

        return session;
    }

    private async checkExistence(
        service: GardensService | AdminService,
        email: string,
        username = null,
        phone = null
    ) {
        const checks = [
            service.findOneByCondition({ email }),
            username
                ? service.findOneByCondition({ user_name: username })
                : null,
            phone ? service.findOneByCondition({ phone }) : null,
        ];

        const [existedEmail, existedUser, existedPhone] = await Promise.all(
            checks
        );

        if (existedEmail) {
            throw new HttpException(
                "Email already existed!!",
                HttpStatus.CONFLICT
            );
        }

        if (existedUser) {
            throw new HttpException(
                "Username already existed!!",
                HttpStatus.CONFLICT
            );
        }

        if (existedPhone) {
            throw new HttpException(
                "Phone already existed!!",
                HttpStatus.CONFLICT
            );
        }
    }

    private checkPasswordMatch(password: string, confirm_password: string) {
        if (password !== confirm_password) {
            throw new HttpException(
                "Password and Confirm Password do not match",
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async registration(
        service: GardensService | AdminService,
        dto: GardenRegistrationDto | AdminRegistrationDto,
        creationMethod: string
    ): Promise<Response> {
        const { password, confirm_password, email } = dto;

        const userName = "user_name" in dto ? dto.user_name : null;
        const phone = "phone" in dto ? dto.phone : null;

        await this.checkExistence(service, email, userName, phone);
        this.checkPasswordMatch(password, confirm_password);

        const hashedPassword = await this.hashPassword(password);

        service[creationMethod]({
            ...dto,
            password: hashedPassword,
        });
        return httpResponse.REGISTER_SUCCESSFULLY;
    }

    async login(
        service: GardensService | AdminService,
        loginDto: GardenLoginDto | AdminLoginDto,
        loginData: LoginMetadata
    ): Promise<Response> {
        let identifier: unknown;

        if (service instanceof GardensService) {
            if (!("phone" in loginDto) || !loginDto.phone) {
                throw new HttpException(
                    "Phone number is required for garden users",
                    HttpStatus.BAD_REQUEST
                );
            }
            identifier = { phone: loginDto.phone };
        } else if (service instanceof AdminService) {
            if (!("user_name" in loginDto) || !loginDto.user_name) {
                throw new HttpException(
                    "Username is required for admin users",
                    HttpStatus.BAD_REQUEST
                );
            }
            identifier = { user_name: loginDto.user_name };
        }

        const user = await service.findOneByCondition(identifier);

        if (
            !user ||
            !(await this.checkPassword(loginDto.password, user.password))
        ) {
            throw new HttpException(
                "Invalid credentials",
                HttpStatus.BAD_REQUEST
            );
        }

        const session = await this.getSession(
            loginData.deviceId,
            user.role,
            user._id.toString(),
            undefined
        );

        if (session && new Date(session.expired_at).getTime() < Date.now()) {
            await this.deviceSessionModel.deleteOne(session._id);
            throw new HttpException("Session expired", HttpStatus.UNAUTHORIZED);
        }

        if (!session || this.isDifferentUser(session, user)) {
            const { refreshToken, accessToken, loginMetaData, userData } =
                await this.createSession(user, loginData, service);
            return {
                ...httpResponse.LOGIN_SUCCESSFULLY,
                data: {
                    user: {
                        userData,
                    },
                    session: {
                        accessToken,
                        refreshToken,
                        loginMetaData,
                    },
                },
            };
        }

        return {
            ...httpResponse.LOGIN_SUCCESSFULLY,
            data: {
                session: { refreshToken: session.refresh_token },
            },
        };
    }

    async changePassword(
        email: string,
        changePasswordDto: ChangePasswordDto,
        service: GardensService | AdminService
    ): Promise<Response> {
        const user = await service.findOneByCondition({ email });

        if (!user) {
            throw new HttpException(
                service instanceof GardensService
                    ? "Garden not found"
                    : "Admin not found",
                HttpStatus.NOT_FOUND
            );
        }

        if (
            changePasswordDto.newPassword !== changePasswordDto.confirmPassword
        ) {
            throw new HttpException(
                "New password and confirm password do not match",
                HttpStatus.BAD_REQUEST
            );
        }

        const isOldPasswordValid = await this.checkPassword(
            changePasswordDto.oldPassword,
            user.password
        );

        if (!isOldPasswordValid) {
            throw new HttpException(
                "Invalid old password",
                HttpStatus.BAD_REQUEST
            );
        }

        const hashedPassword = await this.hashPassword(
            changePasswordDto.newPassword
        );

        await service.update(user._id.toString(), { password: hashedPassword });

        return {
            ...httpResponse.CHANGE_PASSWORD_SUCCESSFULLY,
            data: {
                message: "Password changed successfully",
            },
        };
    }

    async getCurrentUser(
        service: AdminService | GardensService,
        email: string
    ): Promise<Response> {
        const user = await service.findOneByCondition({ email });
        if (!user) {
            throw new HttpException("Not found", HttpStatus.NOT_FOUND);
        }

        return {
            ...httpResponse.GET_PROFILE_SUCCESSFULLY,
            data: { session: { user: user } },
        };
    }

    async logout(
        userId: string,
        deviceId: string,
        service: GardensService | AdminService
    ): Promise<Response> {
        const user = await service.findOneByCondition({
            id: userId,
        });

        const session: any = await this.getSession(deviceId, user.role);

        if (!session || !user) {
            throw new HttpException("You need to login", HttpStatus.FORBIDDEN);
        }
        const keyCache = this.getKeyCache(userId, session.id);

        await this.cacheManager.del(keyCache);

        user.device_sessions = user.device_sessions.filter(
            (devSession: any) => !devSession._id.equals(session._id)
        );

        await service.create(user);

        await this.deviceSessionModel.deleteOne(session._id);
        return {
            ...httpResponse.LOGOUT_SUCCESSFULLY,
            data: {
                session,
            },
        };
    }

    getKeyCache(gardenID: string, deviceId: string): string {
        return `sk_${gardenID}_${deviceId}`;
    }
}
