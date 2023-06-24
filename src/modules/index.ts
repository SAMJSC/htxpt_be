import { AuthModule } from "@modules/auth/auth.module";
import { GardensModule } from "@modules/gardens/gardens.module";
import { CustomersModule } from "@modules/users/customers.module";
import { PassportModule } from "@nestjs/passport";
import { MongoDBModule } from "configs/mongodb.module";

export const MODULES = [
    CustomersModule,
    MongoDBModule,
    AuthModule,
    GardensModule,
    PassportModule,
];
