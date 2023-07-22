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
            const statusCode = HttpStatus.CONFLICT;
            response.status(statusCode).json({
                statusCode,
                message: exception.message,
            });
        } else if (exception.name === "CastError") {
            const statusCode = HttpStatus.BAD_REQUEST;
            response.status(statusCode).json({
                statusCode,
                message: "Invalid ID format",
            });
        }
    }
}
