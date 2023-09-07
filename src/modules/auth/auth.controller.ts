import { USER_ROLES } from "@constants/common.constants";
import { CustomerGoogleAuthGuard } from "@guards/customer-google-auth.guard";
import { GardenerGoogleAuthGuard } from "@guards/gardener-google-auth.guard";
import { JwtAuthGuard } from "@guards/jwt-auth.guard";
import { RolesGuard } from "@guards/roles.guard";
import { AdminService } from "@modules/admin/admin.service";
import { AuthService } from "@modules/auth/auth.service";
import { AdminLoginDto } from "@modules/auth/dtos/admin-login.dto";
import { AdminRegistrationDto } from "@modules/auth/dtos/admin-registration.dto";
import { ChangePasswordDto } from "@modules/auth/dtos/change-password.dto";
import { CustomerLoginDto } from "@modules/auth/dtos/customer-login.dto";
import { CustomerRegistrationDto } from "@modules/auth/dtos/customer-registration.dto";
import { ForgotPasswordDto } from "@modules/auth/dtos/forgot-password.dto";
import { GardenLoginDto } from "@modules/auth/dtos/garden-login.dto";
import { GardenerRegistrationDto } from "@modules/auth/dtos/garden-registration.dto";
import { RefreshTokenDto } from "@modules/auth/dtos/refresh_token.dto";
import { ResendVerifyEmailDto } from "@modules/auth/dtos/resend-email.dto";
import { SendOtpForgotPasswordDto } from "@modules/auth/dtos/send-otp-password.dto";
import { SendSmsDto } from "@modules/auth/dtos/send-sms.dto";
import { VerifyOtpDto } from "@modules/auth/dtos/verify-sms-otp.dto";
import { CustomersService } from "@modules/customers/customers.service";
import { GardensService } from "@modules/gardens/gardens.service";
import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    HttpException,
    HttpStatus,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
    ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Admin } from "@schemas/admin.schema";
import { Customer } from "@schemas/customer.schema";
import { Response } from "@shared/response/response.interface";
import { UserDecorator } from "decorators/current-user.decorator";
import { Roles } from "decorators/roles.decorator";
import { Gardener } from "schemas/garden.schema";
import { LoginMetadata } from "types/common.type";

@Controller("auth")
export class AuthController {
    constructor(
        private authService: AuthService,
        private adminService: AdminService,
        private gardenService: GardensService,
        private customerService: CustomersService
    ) {}

    @Get("/customer/google/login")
    @UseGuards(CustomerGoogleAuthGuard)
    customerGoogleAuth() {
        return 1;
    }

    @Get("/gardener/google/login")
    @UseGuards(GardenerGoogleAuthGuard)
    gardenerGoogleAuth() {
        return 1;
    }

    @Get("/google/redirect")
    @UseGuards(AuthGuard("google"))
    async googleAuthRedirect(@Req() req: any, @Headers() headers: Headers) {
        const userData = req.user;
        const { role } = req.session;
        const ipAddress = req.connection.remoteAddress;
        const ua = headers["user-agent"];
        const { deviceId } = req;
        const metaData: LoginMetadata = { ipAddress, ua, deviceId };

        if (role === "customer") {
            return await this.authService.loginByGoogle(
                this.customerService,
                userData,
                metaData
            );
        }
        if (role === "gardener") {
            return await this.authService.loginByGoogle(
                this.gardenService,
                userData,
                metaData
            );
        }
    }

    @Post("customer/login")
    async customerLogin(
        @Req() req: any,
        @Body() customerLoginDto: CustomerLoginDto,
        @Headers() headers: Headers
    ): Promise<Response> {
        const ipAddress = req.connection.remoteAddress;
        const ua = headers["user-agent"];
        const { deviceId } = req;
        const metaData: LoginMetadata = { ipAddress, ua, deviceId };

        return this.authService.login(
            this.customerService,
            customerLoginDto,
            metaData
        );
    }

    @Post("customer/register")
    async customerRegistration(
        @Body(ValidationPipe) createUserDto: CustomerRegistrationDto
    ): Promise<Response> {
        return await this.authService.registration(
            this.customerService,
            createUserDto,
            "createCustomer",
            false
        );
    }

    @Post("gardens/register")
    @HttpCode(HttpStatus.CREATED)
    async gardenRegistration(
        @Body(ValidationPipe) createUserDto: GardenerRegistrationDto
    ): Promise<Response> {
        return await this.authService.registration(
            this.gardenService,
            createUserDto,
            "createGarden",
            false
        );
    }

    @UseGuards(JwtAuthGuard)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(USER_ROLES.SUPER_ADMIN)
    @Post("admin/register")
    async adminRegistration(
        @Body(ValidationPipe) createUserDto: AdminRegistrationDto
    ): Promise<Response> {
        return await this.authService.registration(
            this.adminService,
            createUserDto,
            "createAdmin",
            false
        );
    }

    @Get("/customer/verify-email")
    async verifyCustomerEmail(
        @Query("token") token: string
    ): Promise<Response> {
        return this.authService.verifyEmail(this.customerService, token);
    }

    @Get("/gardener/verify-email")
    async verifyGardenerEmail(
        @Query("token") token: string
    ): Promise<Response> {
        return this.authService.verifyEmail(this.gardenService, token);
    }

    @Post("/gardener/resend-verify-email")
    async resendVerificationGardenerEmail(
        @Body() body: ResendVerifyEmailDto
    ): Promise<Response> {
        const { email } = body;
        return await this.authService.resendVerificationEmail(
            this.gardenService,
            email
        );
    }

    @Post("/customer/resend-verify-email")
    async resendVerificationCustomerEmail(
        @Body() body: ResendVerifyEmailDto
    ): Promise<Response> {
        const { email } = body;
        return await this.authService.resendVerificationEmail(
            this.customerService,
            email
        );
    }

    @Post("gardens/login")
    async gardenLogin(
        @Req() req: any,
        @Body() gardenLoginDto: GardenLoginDto,
        @Headers() headers: Headers
    ): Promise<Response> {
        const ipAddress = req.connection.remoteAddress;
        const ua = headers["user-agent"];
        const { deviceId } = req;
        const metaData: LoginMetadata = { ipAddress, ua, deviceId };

        return this.authService.login(
            this.gardenService,
            gardenLoginDto,
            metaData
        );
    }

    @Post("admin/login")
    async adminLogin(
        @Req() req: any,
        @Body() adminLoginDto: AdminLoginDto,
        @Headers() headers: Headers
    ): Promise<Response> {
        const ipAddress = req.connection.remoteAddress;
        const ua = headers["user-agent"];
        const { deviceId } = req;
        const metaData: LoginMetadata = { ipAddress, ua, deviceId };

        return this.authService.login(
            this.adminService,
            adminLoginDto,
            metaData
        );
    }

    @Post("/refresh-token")
    async generateNewAccessJWT(
        @Body() refreshTokenDto: RefreshTokenDto,
        @Req() req: any
    ): Promise<Response> {
        const { deviceId } = req;
        return await this.authService.generateNewAccessJWT(
            deviceId,
            refreshTokenDto
        );
    }

    @Patch("/change-password")
    async changePassword(
        @UserDecorator() user: Gardener | Admin,
        @Body() changePasswordDto: ChangePasswordDto
    ): Promise<Response> {
        try {
            if (user.role === USER_ROLES.CUSTOMER) {
                return await this.authService.changePassword(
                    user.email,
                    changePasswordDto,
                    this.customerService
                );
            }

            if (user.role === USER_ROLES.GARDENER) {
                return await this.authService.changePassword(
                    user.email,
                    changePasswordDto,
                    this.gardenService
                );
            }

            if (user.role === USER_ROLES.ADMIN) {
                return await this.authService.changePassword(
                    user.email,
                    changePasswordDto,
                    this.adminService
                );
            }
        } catch (error) {
            throw new HttpException(
                error.message ||
                    "An error occurred while changing the password",
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post("/customer/send-otp-forgot-password")
    async sendOtpCustomerForgotPassword(
        @Body() body: SendOtpForgotPasswordDto
    ): Promise<Response> {
        return this.authService.sendOtpForgotPassword(
            this.customerService,
            body
        );
    }

    @Post("/gardener/send-otp-forgot-password")
    async sendOtpGardenerForgotPassword(
        @Body() body: SendOtpForgotPasswordDto
    ): Promise<Response> {
        return this.authService.sendOtpForgotPassword(this.gardenService, body);
    }

    @Post("/customer/forgot-password")
    async forgotCustomerPassword(
        @Body() body: ForgotPasswordDto
    ): Promise<Response> {
        return this.authService.forgotPassword(this.customerService, body);
    }

    @Post("/gardener/forgot-password")
    async forgotGardenerPassword(
        @Body() body: ForgotPasswordDto
    ): Promise<Response> {
        return this.authService.forgotPassword(this.gardenService, body);
    }

    @Post("/logout")
    async logout(
        @UserDecorator() user: Gardener | Admin | Customer,
        @Req() req: any
    ): Promise<Response> {
        const { deviceId } = req;

        if (user.role === USER_ROLES.GARDENER) {
            return this.authService.logout(
                user._id.toString(),
                deviceId,
                this.gardenService
            );
        }

        if (
            user.role === USER_ROLES.ADMIN ||
            user.role === USER_ROLES.SUPER_ADMIN
        ) {
            return this.authService.logout(
                user._id.toString(),
                deviceId,
                this.adminService
            );
        }

        if (user.role === USER_ROLES.CUSTOMER) {
            return this.authService.logout(
                user._id.toString(),
                deviceId,
                this.customerService
            );
        }
    }

    @Get("/profile")
    async getCurrentUserInfo(
        @UserDecorator() user: Gardener
    ): Promise<Response> {
        if (user.role === USER_ROLES.CUSTOMER) {
            return this.authService.getCurrentUser(
                this.customerService,
                user.email
            );
        }
        if (user.role === USER_ROLES.GARDENER) {
            return this.authService.getCurrentUser(
                this.gardenService,
                user.email
            );
        }
        if (user.role === USER_ROLES.ADMIN || USER_ROLES.SUPER_ADMIN) {
            return this.authService.getCurrentUser(
                this.adminService,
                user.email
            );
        }
    }

    @Post("send-otp")
    async sendOtpToSms(@Body() sendSmsDto: SendSmsDto): Promise<Response> {
        return this.authService.sendOtp(sendSmsDto);
    }

    @Post("verify-otp")
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<Response> {
        return this.authService.verifyOtp(verifyOtpDto);
    }
}
