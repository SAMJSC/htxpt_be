import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const host = configService.get<string>("DATABASE_HOST");
                const port = configService.get<number>("DATABASE_PORT");
                const username = configService.get<string>("DATABASE_USER");
                const password = configService.get<string>("DATABASE_PASSWORD");
                const database = configService.get<string>("DATABASE");

                const typeOrmOptions: TypeOrmModuleOptions = {
                    type: "mysql",
                    host: host || "localhost",
                    port: port || 3306,
                    username: username || "root",
                    password: password || "",
                    database: database || "mydatabase",
                    entities: ["dist/**/*.entity.{ts,js}"],
                    synchronize: true,
                    autoLoadEntities: true,
                };

                return typeOrmOptions;
            },
        }),
    ],
})
export class MySQLModule {}
