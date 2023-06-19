import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserController } from "./user.controller";
import { UserEntity } from "../../entities/user.entity";
import { UserService } from "./user.service";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    controllers: [UserController],
    exports: [UserService],
    providers: [UserService],
})
export class UserModule {}
