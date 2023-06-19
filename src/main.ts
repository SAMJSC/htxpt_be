import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
    HttpStatus,
    Logger,
    UnprocessableEntityException,
    ValidationPipe,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { initSwagger } from "swagger";
import { HttpExceptionFilter } from "filters/bad-request.filter";
import { QueryFailedFilter } from "filters/query-fail.filter";
import * as Fingerprint2 from "fingerprintjs2";

async function bootstrap() {
    const logger = new Logger(bootstrap.name);
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    app.enableCors();
    app.use(helmet());

    if (configService.get<string>("SWAGGER_PATH")) {
        initSwagger(app, configService.get<string>("SWAGGER_PATH"));
    }

    app.use(
        rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100,
        })
    );

    const reflector = app.get(Reflector);

    app.useGlobalFilters(
        new HttpExceptionFilter(reflector),
        new QueryFailedFilter(reflector)
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
            Fingerprint2.get((components: any) => {
                const values = components.map(
                    (component: any) => component.value
                );
                const murmur = Fingerprint2.x64hash128(values.join(""), 31);
                resolve(murmur);
            });
        });
    };

    app.use(async (req, res, next) => {
        const deviceId = await getDeviceId();
        req.deviceId = deviceId;
        next();
    });

    await app.listen(configService.get("PORT"), () => {
        logger.log(`Application running on port ${configService.get("PORT")}`);
    });
}
bootstrap();
