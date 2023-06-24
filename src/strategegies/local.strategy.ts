import { AuthService } from "@modules/auth/auth.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { Garden } from "schemas/garden.schema";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: "phone",
            passwordField: "password",
        });
    }

    async validate(phone: string, password: string): Promise<Garden> {
        const user = await this.authService.validateGarden(phone, password);

        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
