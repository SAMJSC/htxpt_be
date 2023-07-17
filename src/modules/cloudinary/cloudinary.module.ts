import { CloudinaryProvider } from "@modules/cloudinary/cloudinary.provider";
import { Module } from "@nestjs/common";

import { CloudinaryService } from "./cloudinary.service";

@Module({
    providers: [CloudinaryProvider, CloudinaryService],
    exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}
