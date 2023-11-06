import { ForgotPasswordEmailDto } from "@modules/mail/dtos/forgot-password.dto";
import { RegisterEmailDto } from "@modules/mail/dtos/register-email.dto";
import { SendVerifyOtpDto } from "@modules/mail/dtos/send-verify-otp.dto";
import { InjectQueue } from "@nestjs/bull";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { Cache } from "cache-manager";

@Injectable()
export class MailService {
    constructor(
        @InjectQueue("emailSending")
        private readonly emailQueue: Queue,
        @Inject(CACHE_MANAGER) private readonly cache: Cache
    ) {}

    async sendRegisterMail(registerDto: RegisterEmailDto): Promise<void> {
        await this.emailQueue.add("sendRegisterMail", {
            ...registerDto,
        });
    }

    async sendForgotPasswordMail(
        forgotPasswordDto: ForgotPasswordEmailDto
    ): Promise<void> {
        await this.emailQueue.add("sendForgotPasswordMail", {
            ...forgotPasswordDto,
        });
    }

    async sendVerifyOtp(sendVerifyOtpDto: SendVerifyOtpDto): Promise<void> {
        await this.emailQueue.add("sendVerifyOtp", {
            ...sendVerifyOtpDto,
        });
    }
}
