import mongoose, { Schema, Document } from "mongoose";

export interface IWatchlist extends Document {
    owner: mongoose.Types.ObjectId;
    symbol: string;
    tags: string[];
    notes: string;
}

const watchlistSchema = new Schema<IWatchlist>({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    symbol: {
        type: String,
        uppercase: true,
        trim: true,
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    notes: {
        type: String,
        trim: true,
        default: ""
    }
}, { timestamps: true });

watchlistSchema.index({ owner: 1, symbol: 1 }, { unique: true });

export const Watchlist = mongoose.model<IWatchlist>("Watchlist", watchlistSchema);
