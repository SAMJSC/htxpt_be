import { ForgotPasswordEmailDto } from "@modules/mail/dtos/forgot-password.dto";
import { RegisterEmailDto } from "@modules/mail/dtos/register-email.dto";
import { SendVerifyOtpDto } from "@modules/mail/dtos/send-verify-otp.dto";
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
                subject: `Xác nhận đăng ký HTX phat thu`,
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
                subject: `Xác nhận quên mật khẩu HTX phat thu`,
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

    @Process("sendVerifyOtp")
    async sendVerifyOtp({ data }: Job<SendVerifyOtpDto>): Promise<number> {
        this.logger.log(`Start job: send otp user with email ${data.email}`);
        const context = {
            email: data.email,
            otp: data.otp,
        };
        try {
            await this.mailerService.sendMail({
                from: emailConfig.from,
                to: data.email,
                subject: `Xác nhận email HTX phat thu`,
                template: `src/modules/mail/templates/send-otp.template.hbs`,
                context: context,
            });
        } catch (e) {
            this.logger.debug(e);
        }
        this.logger.log(`Done job: send otp to email ${data.email}`);
        return 1;
    }
}
