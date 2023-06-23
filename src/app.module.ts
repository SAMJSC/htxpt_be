import { MODULES } from "@modules/index";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import { MySQLModule } from "configs/mysql.module";
import { JwtMalformedFilter } from "filters/jwt-malformed.filter";

const modules = [MySQLModule, ...MODULES];

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath:
                process.env.NODE_ENV === "develop" ? ".env.dev" : ".env",
            cache: true,
            expandVariables: true,
        }),
        MongooseModule.forRoot("mongodb://localhost:27017/htx_pt_db"),
        MongooseModule,
        ...modules,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: JwtMalformedFilter,
        },
    ],
})
export class AppModule {}
