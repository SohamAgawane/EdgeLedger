import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import User from "../models/user.model";

export const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    // STEP 1 — extract token from cookie or Authorization header
    const token = req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    // STEP 2 — verify the token is valid and not expired
    const decodedToken: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);

    // STEP 3 — find the user from the decoded token
    const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
    );

    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    // STEP 4 — attach user to request object
    req.user = user;
    next();
});
