import { AdminModule } from "@modules/admin/admin.module";
import { AuthModule } from "@modules/auth/auth.module";
import { BlogModule } from "@modules/blog/blog.module";
import { BonsaiModule } from "@modules/bonsai/bonsai.module";
import { CloudinaryModule } from "@modules/cloudinary/cloudinary.module";
import { CustomersModule } from "@modules/customers/customers.module";
import { FruitCategoryModule } from "@modules/fruit-category/fruit-category.module";
import { FruitsModule } from "@modules/fruits/fruits.module";
import { GardensModule } from "@modules/gardens/gardens.module";
import { HealthCheckModule } from "@modules/health-check/health-check.module";
import { MailModule } from "@modules/mail/mail.module";
import { SmsModule } from "@modules/sms/sms.module";
import { SpecialFruitModule } from "@modules/special-fruit/special-fruit.module";
import { BullModule } from "@nestjs/bull";
import { PassportModule } from "@nestjs/passport";
import { ThrottlerModule } from "@nestjs/throttler";
import { MongoDBModule } from "configs/mongodb.module";
import { redisConfig } from "configs/redis.config";

export const MODULES = [
    CustomersModule,
    MongoDBModule,
    BullModule.forRoot({
        redis: redisConfig,
    }),
    MailModule,
    AuthModule,
    GardensModule,
    PassportModule,
    FruitsModule,
    SpecialFruitModule,
    BonsaiModule,
    AdminModule,
    FruitCategoryModule,
    PassportModule.register({ session: true }),
    CloudinaryModule,
    HealthCheckModule,
    BlogModule,
    SmsModule,
    ThrottlerModule.forRoot([
        {
            ttl: 60000,
            limit: 10,
        },
    ]),
];
