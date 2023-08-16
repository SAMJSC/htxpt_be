import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from "@nestjs/common";
import { Response } from "express";

@Catch()
export class FileExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception.message.includes("File size too large")) {
            response.status(400).json({
                statusCode: 400,
                message:
                    "The uploaded file is too large. Please upload a file smaller than 10MB.",
            });
        } else {
            throw exception;
        }
    }
}
