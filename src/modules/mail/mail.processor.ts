import { ForgotPasswordEmailDto } from "@modules/mail/dtos/forgot-password.dto";
import { RegisterEmailDto } from "@modules/mail/dtos/register-email.dto";
import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { Job } from "bull";
import { emailConfig } from "configs/email.config";

@Processor("emailSending")
export class MailProcessor {
    constructor(
        private readonly mailerService: MailerService,
        private readonly logger: Logger
    ) {}

    @Process("sendRegisterMail")
    async sendRegisterMail({ data }: Job<RegisterEmailDto>): Promise<number> {
        this.logger.log(
            `Start job: sendUpdateEmail user ${data.username} email ${data.email}`
        );
        const context = {
            email: data.email,
            token: data.token,
            username: data.username,
            role: data.role,
        };

        try {
            await this.mailerService.sendMail({
                from: emailConfig.from,
                to: data.email,
                subject: `Xác nhận đăng ký HTX-Phat-thu`,
                template: `src/modules/mail/templates/register.template.hbs`,
                context: context,
            });
        } catch (e) {
            this.logger.debug(e);
        }
        this.logger.log(
            `Done job: sendUpdateEmail ${data.email} email ${data.username}`
        );
        return 1;
    }

    @Process("sendForgotPasswordMail")
    async sendForgotPasswordMail({
        data,
    }: Job<ForgotPasswordEmailDto>): Promise<number> {
        this.logger.log(
            `Start job: sendUpdateEmail user ${data.username} email ${data.email}`
        );
        const context = {
            email: data.email,
            token: data.token,
            username: data.username,
        };
        try {
            await this.mailerService.sendMail({
                from: emailConfig.from,
                to: data.email,
                subject: `Xác nhận quên mật khẩu KLearnIt`,
                template: `src/modules/mail/templates/forgot-password.template.hbs`,
                context: context,
            });
        } catch (e) {
            this.logger.debug(e);
        }
        this.logger.log(
            `Done job: sendUpdateEmail ${data.email} email ${data.username}`
        );
        return 1;
    }
}
