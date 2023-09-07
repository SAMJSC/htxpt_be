import { MODULES } from "@modules/index";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { database_config } from "configs/database.config";
import { JwtMalformedFilter } from "filters/jwt-malformed.filter";
import Joi from "joi";
import { LocalStrategy } from "strategegies/local.strategy";
import { LoggerMiddleware } from "utils/logger";

import { AuthController } from "./modules/auth/auth.controller";
import { BlogController } from "./modules/blog/blog.controller";
import { FruitCategoryController } from "./modules/fruit-category/fruit-category.controller";

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
                DATABASE_HOST: Joi.string().required(),
                DATABASE_URI: Joi.string().required(),
                TWILIO_ACCOUNT_SID: Joi.string().required(),
                TWILIO_AUTH_TOKEN: Joi.string().required(),
                TWILIO_VERIFICATION_SERVICE_SID: Joi.string().required(),
                DATABASE_PASSWORD: Joi.string().required(),
                DATABASE_USER: Joi.string().required(),
                REDIS_HOST: Joi.string().hostname().required(),
                REDIS_PORT: Joi.number().port().required(),
                REGISTER_TTL: Joi.number().required(),
                REFRESH_JWT_SECRET_KEY: Joi.string().required(),
                ACCESS_JWT_SECRET_KEY: Joi.string().required(),
                RESET_JWT_SECRET_KEY: Joi.string().required(),
                ACCESS_TOKEN_EXPIRE_IN_SEC: Joi.number().required(),
                REFRESH_TOKEN_EXPIRE_IN_SEC: Joi.number().required(),
                VERIFY_EMAIL_TOKEN_IN_SEC: Joi.number().required(),
                CLOUD_NAME: Joi.string().required(),
                CLOUD_API_KEY: Joi.string().required(),
                CLOUD_SECRET_KEY: Joi.string().required(),
                GOOGLE_CLIENT_ID: Joi.string().required(),
                GOOGLE_CLIENT_SECRET: Joi.string().required(),
                MAIL_ACCOUNT: Joi.string().email().required(),
                MAIL_PASSWORD: Joi.string().required(),
                MAIL_FROM_ADDRESS: Joi.string().email().required(),
                MAIL_FROM_NAME: Joi.string().required(),
                MAIL_SERVICE: Joi.string().required(),
                MAIL_HOST: Joi.string().hostname().required(),
                MAIL_TRANSPORT: Joi.string().required(),
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
    controllers: [AuthController, BlogController, FruitCategoryController],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes("*");
    }
}
