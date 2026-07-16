import mongoose, { Schema, Document } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export interface IUser extends Document {
    username: string;
    email: string;
    fullName: string;
    password: string;
    avatar?: string;
    accountCapital: number;
    refreshToken?: string;
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email address"]
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    avatar: {
        type: String
    },
    accountCapital: {
        type: Number,
        default: 0
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
});

userSchema.pre("save", async function (this: IUser) {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.isPasswordCorrect = async function (this: IUser, password: string) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function (this: IUser) {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } as jwt.SignOptions
    );
};

userSchema.methods.generateRefreshToken = function (this: IUser) {
    return jwt.sign(
        { _id: this._id, },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } as jwt.SignOptions
    );
};

export default mongoose.model<IUser>("User", userSchema);
