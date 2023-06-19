import { HttpException, HttpStatus } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { SignOptions, VerifyOptions } from "jsonwebtoken";

export const generateAccessJWT = (data: any, options: SignOptions = {}) => {
    const key = process.env.ACCESS_JWT_SECRET_KEY;
    if (!key) {
        throw new Error("ACCESS_JWT_SECRET_KEY is not defined");
    }
    return jwt.sign(data, key, options);
};

export const verifyAccessJWT = async (
    token: string,
    options: VerifyOptions = {}
) => {
    const key = process.env.ACCESS_JWT_SECRET_KEY;
    if (!key) {
        throw new Error("ACCESS_JWT_SECRET_KEY is not defined");
    }
    try {
        return jwt.verify(token, key, options);
    } catch (err) {
        if (err.message === "jwt expired") {
            throw new HttpException("Token expired", HttpStatus.UNAUTHORIZED);
        } else {
            throw err;
        }
    }
};

export const generateRefreshJWT = (data: any, options: SignOptions = {}) => {
    const key = process.env.REFRESH_JWT_SECRET_KEY;
    if (!key) {
        throw new Error("REFRESH_JWT_SECRET_KEY is not defined");
    }
    return jwt.sign(data, key, options);
};

export const verifyRefreshJWT = async (
    token: string,
    options: VerifyOptions = {}
) => {
    const key = process.env.REFRESH_JWT_SECRET_KEY;
    if (!key) {
        throw new Error("REFRESH_JWT_SECRET_KEY is not defined");
    }
    try {
        return jwt.verify(token, key, options);
    } catch (err) {
        if (err.message === "jwt expired") {
            throw new HttpException("Token expired", HttpStatus.UNAUTHORIZED);
        } else {
            throw err;
        }
    }
};

export const generateResetJWT = (data: any, options: SignOptions = {}) => {
    const key = process.env.RESET_JWT_SECRET_KEY;
    return jwt.sign(data, key, options);
};

export const verifyResetPasswordToken = async (
    token: string,
    options: VerifyOptions = {}
) => {
    const key = process.env.RESET_JWT_SECRET_KEY;
    try {
        return jwt.verify(token, key, options);
    } catch (err) {
        if (err.message === "jwt expired") {
            throw new HttpException("Token expired", HttpStatus.UNAUTHORIZED);
        } else {
            throw err;
        }
    }
};
