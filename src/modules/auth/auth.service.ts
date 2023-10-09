import { AUTHEN_METHODS, USER_ROLES } from "@constants/common.constants";
import { AdminService } from "@modules/admin/admin.service";
import { AdminRegistrationDto } from "@modules/auth/dtos/admin-registration.dto";
import { ChangePasswordDto } from "@modules/auth/dtos/change-password.dto";
import { CustomerRegistrationDto } from "@modules/auth/dtos/customer-registration.dto";
import { ForgotPasswordDto } from "@modules/auth/dtos/forgot-password.dto";
import { GardenerRegistrationDto } from "@modules/auth/dtos/garden-registration.dto";
import { RefreshTokenDto } from "@modules/auth/dtos/refresh_token.dto";
import { SendOtpForgotPasswordDto } from "@modules/auth/dtos/send-otp-password.dto";
import { SendSmsDto } from "@modules/auth/dtos/send-sms.dto";
import { VerifyOtpDto } from "@modules/auth/dtos/verify-sms-otp.dto";
import { CustomersService } from "@modules/customers/customers.service";
import { GardensService } from "@modules/gardens/gardens.service";
import { RegisterEmailDto } from "@modules/mail/dtos/register-email.dto";
import { SendVerifyOtpDto } from "@modules/mail/dtos/send-verify-otp.dto";
import { MailService } from "@modules/mail/mail.service";
import SmsService from "@modules/sms/sms.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Admin } from "@schemas/admin.schema";
import { Customer } from "@schemas/customer.schema";
import { httpResponse } from "@shared/response";
import { Response } from "@shared/response/response.interface";
import * as bcrypt from "bcrypt";
import { Cache } from "cache-manager";
import crypto, { scrypt } from "crypto";
import { Model } from "mongoose";
import { DeviceSession } from "schemas/device_session.schema";
import { Gardener } from "schemas/garden.schema";
import {
    LoginDto,
    LoginMetadata,
    LoginResponseData,
    LoginService,
    Session,
} from "type";
import { SessionResponse } from "types/common.type";
import { promisify } from "util";
import {
    generateAccessJWT,
    generateRefreshJWT,
    verifyAccessJWT,
    verifyRefreshJWT,
} from "utils/jwt";

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(DeviceSession.name)
        private readonly deviceSessionModel: Model<DeviceSession>,
        private readonly gardenService: GardensService,
        private readonly adminService: AdminService,
        private readonly customerService: CustomersService,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        private readonly mailService: MailService,
        private readonly smsService: SmsService
    ) {}

    private generateOtp(): number {
        return Math.floor(100000 + Math.random() * 900000);
    }

    generateUniqueToken(): string {
        return crypto.randomBytes(32).toString("hex");
    }

    async findUserByEmail(email: string): Promise<Customer> {
        return this.customerService.findOneByCondition({ email });
    }

    async validateGarden(phone: string, password: string): Promise<Gardener> {
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

    isDifferentUser(session: Session, user: Admin | Gardener | Customer) {
        const userRoles = ["gardener", "admin", "super_admin"];

        for (const role of userRoles) {
            if (session[role]) {
                return session[role]._id.toString() !== user._id.toString();
            }
        }
    }

    async generateResponseLoginData(
        user: Admin | Gardener | Customer
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
        user: Admin | Gardener | Customer,
        loginMetaData: LoginMetadata,
        service: AdminService | GardensService | CustomersService
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
            customer: user.role === USER_ROLES.CUSTOMER ? user : null,
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

    googleLogin(req) {
        if (!req.user) {
            return "noUser from google";
        }

        return {
            message: "User infor from google",
            user: req.user,
        };
    }

    async getSession(
        deviceId: string,
        userRole: USER_ROLES,
        userId: string,
        refreshToken?: string
    ) {
        const query = { device_id: deviceId };

        if (userId) {
            query[userRole] = userId;
        }

        if (refreshToken) {
            query["refresh_token"] = refreshToken;
        }

        const session = await this.deviceSessionModel.findOne(query);

        return session;
    }

    async checkExistence(fields: {
        email?: string;
        userName?: string;
        phone?: string;
    }) {
        const services = [
            this.gardenService,
            this.adminService,
            this.customerService,
        ];

        const fieldNames = ["email", "user_name", "phone"];

        for (const service of services) {
            for (const fieldName of fieldNames) {
                if (!fields[fieldName]) continue;

                const existingEntity = await service.findOneByCondition({
                    [fieldName]: fields[fieldName],
                });

                if (existingEntity) {
                    throw new HttpException(
                        `${
                            fieldName.charAt(0).toUpperCase() +
                            fieldName.slice(1)
                        } already exists!!`,
                        HttpStatus.CONFLICT
                    );
                }
            }
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

    async sendOtp(sendSmsDto: SendSmsDto): Promise<Response> {
        const email = "email" in sendSmsDto ? sendSmsDto.email : null;
        const phone = "phone" in sendSmsDto ? sendSmsDto.phone : null;

        if (phone) {
            await this.smsService.initiatePhoneNumberVerification(
                sendSmsDto.phone
            );
            return httpResponse.SEND_SMS_SUCCESSFULLY;
        }

        if (email) {
            const otp = this.generateOtp();
            const sendVerifyOtpDto: SendVerifyOtpDto = { email, otp };
            await Promise.all([
                this.mailService.sendVerifyOtp(sendVerifyOtpDto),
                this.cacheManager.set(`otp-${email}`, Number(otp), 30000),
            ]);
            return httpResponse.SEND_VERIFY_VIA_MAIL_SUCCESSFULLY;
        }
    }

    async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<Response> {
        const { otp, phone, email } = verifyOtpDto;

        if (phone) {
            const response = await this.smsService.confirmCode(otp, phone);

            if (response.status === "approved") {
                this.cacheManager.set(`verified-${phone}`, true, 300000);
                return httpResponse.VERIFY_SMS_SUCCESSFULLY;
            } else {
                throw new HttpException(
                    "OTP verification failed",
                    HttpStatus.BAD_REQUEST
                );
            }
        }

        if (email) {
            const checkOtp = await this.cacheManager.get(`otp-${email}`);
            if (Number(checkOtp) !== Number(otp)) {
                throw new HttpException(
                    "The token invalid",
                    HttpStatus.BAD_REQUEST
                );
            }
            if (Number(checkOtp) === Number(otp)) {
                this.cacheManager.set(`verified-${email}`, true, 300000);
            }
            return httpResponse.VERIFY_SMS_SUCCESSFULLY;
        }
    }

    async registration(
        service: GardensService | AdminService | CustomersService,
        dto:
            | GardenerRegistrationDto
            | AdminRegistrationDto
            | CustomerRegistrationDto,
        creationMethod: string,
        isGoogleAuth: boolean
    ): Promise<Response> {
        const { password, confirm_password, email, user_name } = dto;

        const phone = "phone" in dto ? dto.phone : null;

        await this.checkExistence({ email, userName: user_name, phone });

        let hashedPassword: string | undefined;
        let authMethod: AUTHEN_METHODS;
        let emailVerified = false;
        let phoneVerified = false;

        if (isGoogleAuth) {
            authMethod = AUTHEN_METHODS.GOOGLE;
            emailVerified = true;
        } else {
            this.checkPasswordMatch(password, confirm_password);
            hashedPassword = await this.hashPassword(password);
            authMethod = AUTHEN_METHODS.LOCAL;

            if (phone) {
                const isVerified = await this.cacheManager.get(
                    `verified-${phone}`
                );
                if (!isVerified) {
                    throw new HttpException(
                        "The phone is not verified yet",
                        HttpStatus.BAD_REQUEST
                    );
                }
                phoneVerified = true;
            }

            if (email) {
                const isVerified = await this.cacheManager.get(
                    `verified-${email}`
                );
                if (!isVerified) {
                    throw new HttpException(
                        "The email is not verified yet",
                        HttpStatus.BAD_REQUEST
                    );
                }
                emailVerified = true;
            }
        }

        await service[creationMethod]({
            ...dto,
            authen_method: authMethod,
            email_verified: emailVerified,
            phone_verified: phoneVerified,
            password: hashedPassword,
        });

        return httpResponse.REGISTER_SUCCESSFULLY;
    }

    async resendVerificationEmail(
        service: GardensService | AdminService | CustomersService,
        email: string
    ): Promise<Response> {
        const user = await service.findOneByCondition({ email });

        if (!user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }

        if (user.email_verified) {
            throw new HttpException(
                "Email is already verified",
                HttpStatus.BAD_REQUEST
            );
        }

        const newToken = generateAccessJWT(
            { email },
            { expiresIn: Number(process.env.VERIFY_EMAIL_TOKEN_IN_SEC) }
        );

        const registerEmailDto: RegisterEmailDto = {
            email: email,
            token: newToken,
            username: user.user_name || email,
            role:
                service instanceof CustomersService
                    ? USER_ROLES.CUSTOMER
                    : service instanceof GardensService
                    ? USER_ROLES.GARDENER
                    : USER_ROLES.ADMIN,
        };

        await this.mailService.sendRegisterMail(registerEmailDto);

        return httpResponse.EMAIL_RESENT_SUCCESSFULLY;
    }

    async verifyEmail(
        service: GardensService | AdminService | CustomersService,
        token: string
    ): Promise<Response> {
        const payload = (await verifyAccessJWT(token)) as any;
        const user = await service.findOneByCondition({
            email: payload.email,
        });

        if (!user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }

        await service.update(user._id.toString(), {
            email_verified: true,
        });

        return httpResponse.REGISTER_SUCCESSFULLY;
    }

    async login(
        service: LoginService,
        loginDto: LoginDto,
        loginData: LoginMetadata
    ): Promise<Response> {
        const identifier = this.getIdentifier(service, loginDto);

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
            user._id.toString()
        );

        if (
            !session ||
            this.isExpired(session) ||
            this.isDifferentUser(session, user)
        ) {
            return this.createAndReturnNewSession(user, loginData, service);
        }

        return {
            ...httpResponse.LOGIN_SUCCESSFULLY,
            data: {
                session: { refreshToken: session.refresh_token },
            },
        };
    }

    private getIdentifier(
        service: LoginService,
        loginDto: LoginDto
    ): Record<string, unknown> {
        if (service instanceof AdminService) {
            if ("user_name" in loginDto && loginDto.user_name) {
                return { user_name: loginDto.user_name };
            } else {
                throw new HttpException(
                    "Username is required for admin users",
                    HttpStatus.BAD_REQUEST
                );
            }
        }

        if ("phone" in loginDto) return { phone: loginDto.phone };
        if ("email" in loginDto) return { email: loginDto.email };

        throw new HttpException(
            "Invalid login information",
            HttpStatus.BAD_REQUEST
        );
    }

    private async createAndReturnNewSession(
        user: Admin | Gardener | Customer,
        loginData: LoginMetadata,
        service: LoginService
    ): Promise<Response> {
        const { refreshToken, accessToken } = await this.createSession(
            user,
            loginData,
            service
        );
        return {
            ...httpResponse.LOGIN_SUCCESSFULLY,
            data: {
                session: { accessToken, refreshToken },
            },
        };
    }

    private isExpired(session: any): boolean {
        return new Date(session.expired_at).getTime() < Date.now();
    }

    async loginByGoogle(
        service: GardensService | CustomersService,
        googleUserData: any,
        loginData: LoginMetadata
    ): Promise<Response> {
        const { email } = googleUserData;

        let user = await service.findOneByCondition({ email });

        if (!user) {
            if (service instanceof GardensService) {
                await this.registration(
                    service,
                    googleUserData,
                    "createGarden",
                    true
                );
            } else if (service instanceof CustomersService) {
                await this.registration(
                    service,
                    googleUserData,
                    "createCustomer",
                    true
                );
            }

            user = await service.findOneByCondition({ email });
        }

        if (user.authen_method !== AUTHEN_METHODS.GOOGLE) {
            throw new HttpException(
                "User did not register with Google",
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
        service: GardensService | AdminService | CustomersService
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
        service: AdminService | GardensService | CustomersService,
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

    async sendOtpForgotPasswordToMail(
        service: AdminService | GardensService | CustomersService,
        email: string
    ) {
        const newToken = this.generateOtp();
        const userExisted = await service.findOneByCondition({
            email,
        });
        await Promise.all([
            this.cacheManager.set(`forgotPassword-${email}`, newToken, 30000),
            this.mailService.sendForgotPasswordMail({
                email: email,
                username: userExisted.user_name,
                token: `${newToken}`,
            }),
        ]);
        return httpResponse.REGISTER_SEND_MAIL;
    }

    async sendOtpForgotPassword(
        service: AdminService | GardensService | CustomersService,
        body: SendOtpForgotPasswordDto
    ): Promise<Response> {
        const { email, phone } = body;
        const condition = email ? { email } : { phone };

        const userExisted = await service.findOneByCondition(condition);

        if (!userExisted) {
            throw new HttpException(
                "User doesn't exist",
                HttpStatus.BAD_REQUEST
            );
        }

        if (email) {
            if (
                !(service instanceof AdminService) &&
                !userExisted.email_verified
            ) {
                throw new HttpException(
                    "The email is not verified yet",
                    HttpStatus.BAD_REQUEST
                );
            }
            return this.sendOtpForgotPasswordToMail(service, email);
        }

        if (phone) {
            await this.smsService.initiatePhoneNumberVerification(phone);
            return httpResponse.SEND_SMS_SUCCESSFULLY;
        }
    }

    async forgotPassword(
        service: AdminService | GardensService | CustomersService,
        body: ForgotPasswordDto
    ) {
        const { email, phone, password, otp, confirmPassword } = body;

        if (!(password === confirmPassword)) {
            throw new HttpException(
                "The confirm password and password are not the same",
                HttpStatus.BAD_REQUEST
            );
        }

        if (email) {
            const [checkOTP, user] = await Promise.all([
                this.cacheManager.get(`forgotPassword-${email}`),
                service.findOneByCondition({ email }),
            ]);

            if (!checkOTP || otp != checkOTP) {
                throw new HttpException(
                    "The OTP not found",
                    HttpStatus.NOT_FOUND
                );
            }

            if (!user) {
                throw new HttpException("User not found", HttpStatus.NOT_FOUND);
            }

            const comparePassword = await bcrypt.compare(
                password,
                user.password
            );
            if (comparePassword) {
                throw new HttpException(
                    "The new password cannot be the same as the old password",
                    HttpStatus.BAD_REQUEST
                );
            }

            const passwordHash = await this.hashPassword(password);
            await Promise.all([
                service.update(user._id.toString(), { password: passwordHash }),
                this.cacheManager.del(`forgotPassword-${email}`),
            ]);

            return httpResponse.FORGOT_PASSWORD_SUCCESS;
        }

        if (phone) {
            const user = await service.findOneByCondition({ phone });
            const verify = await this.smsService.confirmCode(otp, phone);

            if (!user) {
                throw new HttpException("User not found", HttpStatus.NOT_FOUND);
            }

            if (verify.status !== "approved") {
                throw new HttpException(
                    "OTP verification failed",
                    HttpStatus.BAD_REQUEST
                );
            }

            const passwordHash = await this.hashPassword(password);
            await service.update(user._id.toString(), {
                password: passwordHash,
            });
            return httpResponse.FORGOT_PASSWORD_SUCCESS;
        }
    }

    async logout(
        userId: string,
        deviceId: string,
        service: GardensService | AdminService | CustomersService
    ): Promise<Response> {
        const user = await service.findOneByCondition({
            _id: userId,
        });

        const session: any = await this.getSession(
            deviceId,
            user.role,
            user._id.toString()
        );

        if (!session || !user) {
            throw new HttpException("You need to login", HttpStatus.FORBIDDEN);
        }
        const keyCache = this.getKeyCache(userId, session.id);

        await this.cacheManager.del(keyCache);

        user.device_sessions = user.device_sessions.filter(
            (devSession: any) => !devSession._id.equals(session._id)
        );

        await Promise.all([
            service.create(user),
            this.deviceSessionModel.deleteOne(session._id),
        ]);

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
