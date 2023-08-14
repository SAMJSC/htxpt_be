import { MailService } from "@modules/mail/mail.service";
import { BullModule, BullModuleOptions } from "@nestjs/bull";
import { CacheModule } from "@nestjs/cache-manager";
import { Logger, Module, Provider } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { TransportType } from "@nestjs-modules/mailer/dist/interfaces/mailer-options.interface";
import { emailConfig } from "configs/email.config";
import { redisConfig } from "configs/redis.config";

import { MailProcessor } from "./mail.processor";

const bullOptions: BullModuleOptions = { name: "emailSending" };
const providers: Provider[] = [Logger, MailProcessor, MailService];

@Module({
    imports: [
        MailerModule.forRoot({
            transport: emailConfig as TransportType,
            defaults: {
                from: emailConfig.from,
            },
            template: {
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        }),
        BullModule.forRoot({
            redis: redisConfig,
        }),
        CacheModule.register(),
        BullModule.registerQueue(bullOptions),
    ],
    providers: providers,
    exports: [MailService],
})
export class MailModule {}
