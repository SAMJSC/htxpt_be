import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>("DATABASE_URI"),
                // dbName: configService.get<string>("DATABASE_NAME"),
            }),
            inject: [ConfigService],
        }),
        MongooseModule,
    ],
})
export class MongoDBModule {}
