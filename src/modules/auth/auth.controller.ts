import { USER_ROLES } from "@constants/common.constants";
import { JwtAuthGuard } from "@guards/jwt-auth.guard";
import { RolesGuard } from "@guards/roles.guard";
import { AdminService } from "@modules/admin/admin.service";
import { AuthService } from "@modules/auth/auth.service";
import { AdminLoginDto } from "@modules/auth/dtos/admin-login.dto";
import { AdminRegistrationDto } from "@modules/auth/dtos/admin-registration.dto";
import { ChangePasswordDto } from "@modules/auth/dtos/change-password.dto";
import { GardenLoginDto } from "@modules/auth/dtos/garden-login.dto";
import { GardenRegistrationDto } from "@modules/auth/dtos/garden-registration.dto";
import { RefreshTokenDto } from "@modules/auth/dtos/refresh_token.dto";
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
    Req,
    UseGuards,
    ValidationPipe,
} from "@nestjs/common";
import { Admin } from "@schemas/admin.schema";
import { Response } from "@shared/response/response.interface";
import { UserDecorator } from "decorators/current-garden.decorator";
import { Roles } from "decorators/roles.decorator";
import { Garden } from "schemas/garden.schema";
import { LoginMetadata } from "types/common.type";

@Controller("auth")
export class AuthController {
    constructor(
        private authService: AuthService,
        private adminService: AdminService,
        private gardenService: GardensService
    ) {}

    @Post("gardens/register")
    @HttpCode(HttpStatus.CREATED)
    async gardenRegistration(
        @Body(ValidationPipe) createUserDto: GardenRegistrationDto
    ): Promise<Response> {
        return await this.authService.registration(
            this.gardenService,
            createUserDto,
            "createGarden"
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
            "createAdmin"
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

    @Patch("gardens/change-password")
    async changePassword(
        @UserDecorator() user: Garden | Admin,
        @Body() changePasswordDto: ChangePasswordDto
    ): Promise<Response> {
        try {
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

    @Post("/logout")
    async logout(
        @UserDecorator() user: Garden | Admin,
        @Req() req: any
    ): Promise<Response> {
        const { deviceId } = req;
        if (user.role === USER_ROLES.GARDENER) {
            return this.authService.logout(
                user.id,
                deviceId,
                this.gardenService
            );
        }

        if (user.role === USER_ROLES.ADMIN) {
            return this.authService.logout(
                user.id,
                deviceId,
                this.adminService
            );
        }
    }

    @Get("/profile")
    async getCurrentUserInfo(@UserDecorator() user: Garden): Promise<Response> {
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
}
