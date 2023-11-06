import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";

export const CloudinaryProvider = {
    provide: "CLOUDINARY",
    useFactory: (configService: ConfigService) => {
        return cloudinary.config({
            cloud_name: configService.get<string>("CLOUD_NAME"),
            api_key: configService.get<string>("CLOUD_API_KEY"),
            api_secret: configService.get<string>("CLOUD_SECRET_KEY"),
        });
    },
    inject: [ConfigService],
};
