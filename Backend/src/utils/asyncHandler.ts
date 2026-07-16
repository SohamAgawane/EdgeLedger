import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error: any) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        })
    }
}

export { asyncHandler };
