import { LocalAuthGuard } from "@guards/local-auth.guard";
import { AuthService } from "@modules/auth/auth.service";
import { ChangePasswordDto } from "@modules/auth/dtos/change-password.dto";
import { GardenLoginDto } from "@modules/auth/dtos/garden-login.dto";
import { GardenRegistrationDto } from "@modules/auth/dtos/garden-registration.dto";
import { RefreshTokenDto } from "@modules/auth/dtos/refresh_token.dto";
import {
    Body,
    Controller,
    Get,
    Headers,
    Patch,
    Post,
    Req,
    UseGuards,
    ValidationPipe,
} from "@nestjs/common";
import { GardenDecorator } from "decorators/current-garden.decorator";
import { Garden as Garden } from "schemas/garden.schema";
import { LoginMetadata } from "types/common.type";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("gardens/register")
    async gardenRegistration(
        @Body(ValidationPipe) createUserDto: GardenRegistrationDto
    ): Promise<Garden> {
        return await this.authService.gardenRegistration(createUserDto);
    }

    @Post("gardens/login")
    @UseGuards(LocalAuthGuard)
    async gardenLogin(
        @Req() req: any,
        @Body() gardenLoginDto: GardenLoginDto,
        @Headers() headers: Headers
    ) {
        const ipAddress = req.connection.remoteAddress;
        const ua = headers["user-agent"];
        const { deviceId } = req;
        const metaData: LoginMetadata = { ipAddress, ua, deviceId };
        return this.authService.gardenLogin(gardenLoginDto, metaData);
    }

    @Post("gardens/refresh-token")
    async generateNewAccessJWT(
        @Body() refreshTokenDto: RefreshTokenDto,
        @Req() req: any
    ) {
        const { deviceId } = req;
        return await this.authService.generateNewAccessJWT(
            deviceId,
            refreshTokenDto
        );
    }

    @Patch("gardens/change-password")
    async changePassword(
        @GardenDecorator() garden: Garden,
        @Body() changePasswordDto: ChangePasswordDto
    ): Promise<void> {
        await this.authService.changePassword(garden.phone, changePasswordDto);
    }

    @Post("gardens/logout")
    async logout(@GardenDecorator() garden: Garden, @Req() req: any) {
        const { deviceId } = req;
        return this.authService.logout(garden.id, deviceId);
    }

    @Get("gardens/profile")
    async getCurrentUserInfo(@GardenDecorator() garden: Garden) {
        return this.authService.getCurrentUser(garden.email);
    }
}
