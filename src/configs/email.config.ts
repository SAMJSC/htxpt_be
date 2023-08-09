import * as dotenv from "dotenv";
dotenv.config();
export const emailConfig = {
    registerTTL: +process.env.REGISTER_TTL,
    auth: {
        user: process.env.MAIL_ACCOUNT,
        pass: process.env.MAIL_PASSWORD,
    },
    from: {
        address: process.env.MAIL_FROM_ADDRESS,
        name: process.env.MAIL_FROM_NAME,
    },
    service: process.env.MAIL_SERVICE,
    // port: getConfig().get<string>("mail.port"),
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
};
