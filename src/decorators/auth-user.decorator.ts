import {
    createParamDecorator,
    ExecutionContext,
    HttpException,
    HttpStatus,
} from "@nestjs/common";
import { verifyAccessJWT } from "utils/jwt";

export const UserDecorator = createParamDecorator(
    async (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const bearerHeader = request.headers.authorization;
        if (!bearerHeader) {
            throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        const bearer = bearerHeader.split(" ");
        const token = bearer[1];

        const payload = await verifyAccessJWT(token);

        if (payload) {
            return payload;
        }
        return false;
    }
);
