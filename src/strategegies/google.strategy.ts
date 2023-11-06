import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/redirect",
            scope: ["profile", "email", "openid"],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any
    ): Promise<any> {
        const user = {
            email: profile.emails[0].value,
            first_name: profile.name.givenName,
            last_name: profile.name.familyName,
            avatar: profile.photos[0].value,
            accessToken,
        };
        return user;
    }
}
