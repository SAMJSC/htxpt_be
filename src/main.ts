import { USER_ROLES } from "@constants/common.constants";
import { AdminService } from "@modules/admin/admin.service";
import {
    HttpStatus,
    Logger,
    UnprocessableEntityException,
    ValidationPipe,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory, Reflector } from "@nestjs/core";
import * as bcrypt from "bcrypt";
// import { scrypt } from "crypto";
import { rateLimit } from "express-rate-limit";
import session from "express-session";
import { HttpExceptionFilter } from "filters/bad-request.filter";
import { CustomExceptionFilter } from "filters/exception.filter";
import { DuplicateKeyFilter } from "filters/mongo-error.filter";
import { QueryFailedFilter } from "filters/query-fail.filter";
import { get, x64hash128 } from "fingerprintjs2";
import helmet from "helmet";
import passport from "passport";
import { initSwagger } from "swagger";

// import { promisify } from "util";
import { AppModule } from "./app.module";

//TODO: if email or phone not active yet prevent some actions

async function bootstrap() {
    const logger = new Logger(bootstrap.name);
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const adminService = app.get(AdminService);

    // async function hashPassword(password: string): Promise<string> {
    //     const salt = await bcrypt.genSalt();
    //     const hash = (await promisify(scrypt)(password, salt, 32)) as Buffer;
    //     const hashedPassword = salt + "#" + hash.toString("hex");
    //     return hashedPassword;
    // }

    async function hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    }

    const superAdmin = await adminService.findOneByCondition({
        role: USER_ROLES.SUPER_ADMIN,
    });

    if (!superAdmin) {
        const hashedPassword = await hashPassword("admin@123");
        adminService.create({
            email: "company@vsam.vn",
            user_name: "admin",
            password: hashedPassword,
            role: "super_admin",
        });
    }

    app.enableCors();
    app.use(helmet());

    if (configService.get<string>("SWAGGER_PATH")) {
        initSwagger(app, configService.get<string>("SWAGGER_PATH"));
    }

    app.use(
        rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 1000,
        })
    );

    app.use(
        session({
            secret: "my-secret",
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 60000,
            },
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());

    const reflector = app.get(Reflector);

    app.useGlobalFilters(
        new HttpExceptionFilter(reflector),
        new QueryFailedFilter(reflector),
        new DuplicateKeyFilter(),
        new CustomExceptionFilter()
    );

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            transform: true,
            dismissDefaultMessages: true,
            exceptionFactory: (errors) =>
                new UnprocessableEntityException(errors),
        })
    );

    const getDeviceId = () => {
        return new Promise((resolve) => {
            get((components: any) => {
                const values = components.map(
                    (component: any) => component.value
                );
                const murmur = x64hash128(values.join(""), 31);
                resolve(murmur);
            });
        });
    };

    app.use(async (req: any, res: any, next: any) => {
        const deviceId = await getDeviceId();
        req.deviceId = deviceId;
        next();
    });

    await app.listen(configService.get("PORT"), () => {
        logger.log(`Application running on port ${configService.get("PORT")}`);
    });
}
bootstrap();
