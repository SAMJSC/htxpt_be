import { UserRoles } from "@constants/common.constants";
import { UserEntity } from "@entities/users.entity";
import { JwtAuthGuard } from "@guards/jwt-auth.guard";
import { RolesGuard } from "@guards/roles.guard";
import { AuthService } from "@modules/auth/auth.service";
import { ChangePasswordDto } from "@modules/auth/dto/ChangePassword.dto";
import { RefreshTokenDto } from "@modules/auth/dto/RefreshToken.dto";
import { UserLoginDto } from "@modules/auth/dto/UserLogin.dto";
import { UserRegisterDto } from "@modules/auth/dto/UserRegister.dto";
import { UserDto } from "@modules/user/dto/user.dto";
import { UserService } from "@modules/user/user.service";
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
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UserDecorator } from "decorators/auth-user.decorator";
import { Roles } from "decorators/roles.decorator";
import { LoginMetadata } from "type";

@Controller("auth")
export class AuthController {
    constructor(
        private userService: UserService,
        private authService: AuthService
    ) {}

    @Post("/register")
    async signUp(
        @Body(ValidationPipe) createUserDto: UserRegisterDto
    ): Promise<UserDto> {
        return this.authService.signUp(createUserDto);
    }

    @Post("/login")
    async signIn(
        @Req() req: any,
        @Body() loginDto: UserLoginDto,
        @Headers() headers: Headers
    ) {
        const ipAddress = req.connection.remoteAddress;
        const ua = headers["user-agent"];
        const { deviceId } = req;

        const metaData: LoginMetadata = { ipAddress, ua, deviceId };
        return await this.authService.login(loginDto, metaData);
    }

    @Get("/me")
    @Roles(UserRoles.USER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    getCurrentUser(@UserDecorator() user: UserEntity): Promise<UserEntity> {
        return this.authService.getCurrentUser(user.email);
    }

    @Patch("/change-password")
    async changePassword(
        @UserDecorator() user: UserEntity,
        @Body() changePasswordDto: ChangePasswordDto
    ): Promise<void> {
        await this.authService.changePassword(user.email, changePasswordDto);
    }

    @Post("/refresh-token")
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

    @Post("logout")
    @ApiOperation({ summary: "Logout user from device" })
    @ApiResponse({
        status: 200,
        description: "Logout successfully.",
    })
    async logout(@UserDecorator() user: UserEntity, @Req() req: any) {
        const { deviceId } = req;
        return this.authService.logout(user.id, deviceId);
    }
}
