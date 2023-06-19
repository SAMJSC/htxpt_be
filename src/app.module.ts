import { AuthModule } from "@modules/auth/auth.module";
import { MODULES } from "@modules/index";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MySQLModule } from "configs/mysql.module";

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
        ...modules,
        AuthModule,
    ],
})
export class AppModule {}
