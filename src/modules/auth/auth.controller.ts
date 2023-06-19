import { AuthService } from "@modules/auth/auth.service";
import { UserRegisterDto } from "@modules/auth/dto/UserRegister.dto";
import { UserLoginDto } from "@modules/auth/dto/UserLogin.dto";
import { UserDto } from "@modules/user/dto/user.dto";
import { UserService } from "@modules/user/user.service";
import {
    Body,
    Controller,
    Headers,
    Post,
    Req,
    ValidationPipe,
} from "@nestjs/common";
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
        return await this.authService.signIn(loginDto, metaData);
    }
}
