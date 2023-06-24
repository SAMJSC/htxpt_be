import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { MongoError } from "mongodb";

@Catch(MongoError)
export class DuplicateKeyFilter implements ExceptionFilter {
    catch(exception: MongoError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception.code === 11000) {
            const statusCode = HttpStatus.CONFLICT; // 409 Conflict

            response.status(statusCode).json({
                statusCode,
                message: exception.message,
            });
        }
    }
}
