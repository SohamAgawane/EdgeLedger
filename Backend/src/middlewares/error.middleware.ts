import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    // if the error is our own ApiError, use its values
    // if it is an unexpected crash, fall back to 500
    const statusCode = err instanceof ApiError ? err.statusCode : 500;

    const message = err.message || "Something went wrong";

    // only send the stack trace during development
    // never expose it in production
    const stack = process.env.NODE_ENV === "development" ? err.stack : undefined;

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
        stack
    });
};

export { errorHandler };
