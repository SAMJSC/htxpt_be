import { AdminModule } from "@modules/admin/admin.module";
import { AdminService } from "@modules/admin/admin.service";
import { AuthService } from "@modules/auth/auth.service";
import { BonsaiModule } from "@modules/bonsai/bonsai.module";
import { CloudinaryModule } from "@modules/cloudinary/cloudinary.module";
import { CustomersModule } from "@modules/customers/customers.module";
import { CustomersService } from "@modules/customers/customers.service";
import { FruitsModule } from "@modules/fruits/fruits.module";
import { GardensModule } from "@modules/gardens/gardens.module";
import { GardensService } from "@modules/gardens/gardens.service";
import { MailModule } from "@modules/mail/mail.module";
import { SmsModule } from "@modules/sms/sms.module";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { Admin, AdminSchema } from "@schemas/admin.schema";
import { Customer, CustomerSchema } from "@schemas/customer.schema";
import { Fruit, FruitSchema } from "@schemas/fruit.schema";
import { AdminRepository } from "repository/admin.repository";
import { CustomerRepository } from "repository/customer.repository";
import { FruitRepository } from "repository/fruit.repository";
import { GardensRepository } from "repository/gardens.repository";
import {
    DeviceSession,
    DeviceSessionSchema,
} from "schemas/device_session.schema";
import { Gardener, GardenerSchema } from "schemas/garden.schema";
import { GoogleStrategy } from "strategegies/google.strategy";
import { JwtStrategy } from "strategegies/jwt.strategy";
import { LocalStrategy } from "strategegies/local.strategy";

@Module({
    imports: [
        MailModule,
        MongooseModule.forFeature([
            { name: DeviceSession.name, schema: DeviceSessionSchema },
            { name: Gardener.name, schema: GardenerSchema },
            { name: Fruit.name, schema: FruitSchema },
            { name: Admin.name, schema: AdminSchema },
            { name: Customer.name, schema: CustomerSchema },
        ]),
        CacheModule.register(),
        GardensModule,
        CustomersModule,
        AdminModule,
        FruitsModule,
        BonsaiModule,
        PassportModule,
        SmsModule,
        CloudinaryModule,
    ],
    providers: [
        GardensService,
        AdminService,
        AuthService,
        CustomersService,
        LocalStrategy,
        JwtStrategy,
        { provide: "GardensRepositoryInterface", useClass: GardensRepository },
        { provide: "FruitRepositoryInterface", useClass: FruitRepository },
        { provide: "AdminRepositoryInterface", useClass: AdminRepository },
        {
            provide: "CustomerRepositoryInterface",
            useClass: CustomerRepository,
        },
        GoogleStrategy,
    ],
    exports: [AuthService, GoogleStrategy],
})
export class AuthModule {}
