import { AuthModule } from "@modules/auth/auth.module";
import { CustomersModule } from "@modules/customers/customers.module";
import { FruitsModule } from "@modules/fruits/fruits.module";
import { GardensModule } from "@modules/gardens/gardens.module";
import { PassportModule } from "@nestjs/passport";
import { MongoDBModule } from "configs/mongodb.module";

export const MODULES = [
    CustomersModule,
    MongoDBModule,
    AuthModule,
    GardensModule,
    PassportModule,
    FruitsModule,
];
