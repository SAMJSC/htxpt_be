import { DeviceSessionEntity } from "@entities/devices-session.entity";
import { UserEntity } from "@entities/user.entity";
import { AuthController } from "@modules/auth/auth.controller";
import { AuthService } from "@modules/auth/auth.service";

import { UserDto } from "@modules/user/dto/user.dto";
import { UserModule } from "@modules/user/user.module";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        PassportModule,
        TypeOrmModule.forFeature([UserDto, UserEntity, DeviceSessionEntity]),
        JwtModule,
        UserModule,
    ],
    providers: [AuthService],
    exports: [],
    controllers: [AuthController],
})
export class AuthModule {}
