import { UsersController } from "@modules/users/users.controller";
import { UsersService } from "@modules/users/users.service";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "Schemas/users.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [UsersController],
    exports: [UsersService],
    providers: [UsersService],
})
export class UsersModule {}
