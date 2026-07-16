import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import User from "../models/user.model";
import jwt from "jsonwebtoken";

const generateTokens = async (userId: any) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user!.generateAccessToken();
        const refreshToken = user!.generateRefreshToken();

        user!.refreshToken = refreshToken;
        await user!.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 - pull the fields out of the request body
    const { username, email, fullName, password } = req.body;

    // STEP 2 - validate none of them are empty
    if(
        [username, email, fullName, password].some((field) => !field || field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // STEP 3 - check if a user with this username or email already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if(existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // STEP 4 - create the user
    // password hashing happens automatically via the pre-save hook in user.model.js
    const user = await User.create({
        username,
        email,
        fullName,
        password
    });

    // STEP 5 — re-fetch the user excluding sensitive fields
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // STEP 6 - safety check, in case something went wrong during creation
    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // STEP 7 - return the safe user object
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )

});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 - Get username/email and password from req body
    const { username, email, password } = req.body;

    // STEP 2 - Validate atleast one of them is present
    if(!(username || email)) {
        throw new ApiError(400, "Username or email is required");
    }

    // STEP 3 - Find the user by username or email
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if(!user) {
        throw new ApiError(404, "User does not exists");
    }

    // STEP 4 — check if password is correct
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    // STEP 5 - Generate both the tokens
    const { accessToken, refreshToken } = await generateTokens(user._id);

    // STEP 6 - Fetch the user without password and refresh token
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // STEP 7 - Set cookies and return response 
    const options = {
        httpOnly: true,
        secure: true
    };

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken
        }, "User logged in successfully")
    );
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 - Remove refresh token from DB
    await User.findByIdAndUpdate(
        req.user!._id,
        {
            $unset: { refreshToken: 1 }
        },
        { new: true }
    );

    // STEP 2 — Clear both cookies
    const options = {
        httpOnly: true,
        secure: true
    };

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 — Get the incoming refresh token from cookie or body
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    // STEP 2 — Verify the token is valid
    const decodeToken: any = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET as string);

    // STEP 3 - Find the user from the decoded token
    const user = await User.findById(decodeToken?._id);

    if(!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    // STEP 4 - Compare incoming token with the one stored in DB
    if(incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is used or expired");
    }

    // STEP 5 - Issue new token pair
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user._id);

    // STEP 6 — Set new cookies and return
    const cookieOptions = {
        httpOnly: true,
        secure: true
    };

    return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
        new ApiResponse(
            200,
            { accessToken, refreshToken: newRefreshToken },
            "Access token refreshed successfully"
        )
    )
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
