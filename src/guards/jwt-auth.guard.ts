/* eslint-disable no-unused-vars */
import {
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { verifyAccessJWT } from "utils/jwt";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    constructor(private reflector: Reflector) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const bearerHeader = request.headers.authorization;
        if (!bearerHeader) {
            throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        const bearer = bearerHeader.split(" ");
        const token = bearer[1];

        const payload: any = await verifyAccessJWT(token);

        if (Date.now() < payload.exp) {
            throw new HttpException(
                "Access token expired",
                HttpStatus.UNAUTHORIZED
            );
        }
        if (payload) {
            return true;
        }

        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleRequest(err, user, info) {
        if (err || !user) {
            throw (
                err ||
                new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED)
            );
        }
        return user;
    }
}
