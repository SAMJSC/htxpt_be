import { MODULES } from "@modules/index";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { database_config } from "configs/database.config";
import { JwtMalformedFilter } from "filters/jwt-malformed.filter";
import Joi from "joi";
import { LocalStrategy } from "strategegies/local.strategy";

import { AuthController } from "./modules/auth/auth.controller";

const modules = [...MODULES];

@Module({
    imports: [
        ConfigModule.forRoot({
            validationSchema: Joi.object({
                NODE_ENV: Joi.string()
                    .valid("development", "production", "test", "provision")
                    .default("development"),
                PORT: Joi.number().port().required(),
                DATABASE_PORT: Joi.number().port().required(),
                // DATABASE_USERNAME: Joi.string().min(4).required(),
                // DATABASE_PASSWORD: Joi.string().min(4).required(),
                DATABASE_HOST: Joi.string().required(),
                DATABASE_URI: Joi.string().required(),
            }),
            load: [database_config],
            validationOptions: {
                abortEarly: false,
            },
            isGlobal: true,
            envFilePath:
                process.env.NODE_ENV === "develop" ? ".env.dev" : ".env",
            cache: true,
            expandVariables: true,
        }),
        ...modules,
    ],
    providers: [
        LocalStrategy,
        JwtService,
        {
            provide: APP_FILTER,
            useClass: JwtMalformedFilter,
        },
    ],
    controllers: [AuthController],
})
export class AppModule {}
