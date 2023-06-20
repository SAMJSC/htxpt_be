import { Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { JsonWebTokenError } from "jsonwebtoken";

@Catch(JsonWebTokenError)
export class JwtMalformedFilter implements ExceptionFilter {
    catch(
        exception: JsonWebTokenError,
        host: import("@nestjs/common").ArgumentsHost
    ) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        const status = HttpStatus.UNAUTHORIZED;
        const message = "Invalid token";

        response.status(status).json({
            statusCode: status,
            message: message,
        });
    }
}
