import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { verifyAccessJWT } from "utils/jwt";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<string[]>(
            "role",
            context.getHandler()
        );

        if (!roles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const bearerHeader = request.headers.authorization;
        if (!bearerHeader) {
            throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }
        const bearer = bearerHeader.split(" ");
        const token = bearer[1];

        const payload: any = await verifyAccessJWT(token);

        return roles.includes(payload.role);
    }
}
