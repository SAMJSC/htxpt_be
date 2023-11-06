import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Twilio } from "twilio";

@Injectable()
export default class SmsService {
    private twilio: Twilio;
    constructor(private readonly configService: ConfigService) {
        const accountSid = configService.get("TWILIO_ACCOUNT_SID");
        const authToken = configService.get("TWILIO_AUTH_TOKEN");

        this.twilio = new Twilio(accountSid, authToken);
    }

    initiatePhoneNumberVerification(phoneNumber: string) {
        const serviceSid = this.configService.get(
            "TWILIO_VERIFICATION_SERVICE_SID"
        );

        return this.twilio.verify.v2
            .services(serviceSid)
            .verifications.create({ to: phoneNumber, channel: "sms" });
    }

    async confirmCode(verificationCode: string, phone: string): Promise<any> {
        const serviceSid = this.configService.get(
            "TWILIO_VERIFICATION_SERVICE_SID"
        );

        const result = await this.twilio.verify.v2
            .services(serviceSid)
            .verificationChecks.create({ to: phone, code: verificationCode });
        if (result && result?.valid === false) {
            throw new HttpException("The opt invalid", HttpStatus.BAD_REQUEST);
        }
        return result;
    }
}
