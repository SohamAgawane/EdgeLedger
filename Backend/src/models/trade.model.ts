import mongoose, { Schema, Document } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface ITrade extends Document {
    owner: mongoose.Types.ObjectId;
    symbol: string;
    buyPrice: number;
    sellPrice?: number | null;
    quantity: number;
    entryDate: Date;
    isOpen: boolean;
    exitDate?: Date | null;
    sector: string;
    emotionBefore?: string;
    emotionAfter?: string;
    mistakeCategory?: string;
    convictionScore?: number;
    notes?: string;
    pnl?: number | null;
}

const tradeSchema = new Schema<ITrade>({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    symbol: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    buyPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    sellPrice: {
        type: Number,
        default: null,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    entryDate: {
        type: Date,
        required: true
    },
    isOpen: {
        type: Boolean,
        default: false
    },
    exitDate: {
        type: Date,
        default: null
    },
    sector: {
        type: String,
        required: true,
        enum: ["IT", "Banking", "Energy", "Auto", "Pharma", "Finance", "Infrastructure", "FMCG", "Metals", "Real Estate", "Other"]
    },
    emotionBefore: {
        type: String,
        enum: ["confident", "fearful", "greedy", "fomo", "calm", "anxious", "neutral", "revenge"]
    },
    emotionAfter: {
        type: String,
        enum: ["confident", "fearful", "greedy", "fomo", "calm", "anxious", "neutral", "revenge"]
    },
    mistakeCategory: {
        type: String,
        enum: ["overtrading", "revenge_trade", "no_stop_loss", "fomo_entry", "ignored_plan", "oversized_position", "early_exit", "late_exit", "chasing_news", "none"]
    },
    convictionScore: {
        type: Number,
        min: 1,
        max: 10
    },
    notes: {
        type: String
    },
    pnl: {
        type: Number
    }
}, { timestamps: true });

tradeSchema.pre("save", function (this: ITrade) {
    if (this.isOpen) {
        this.pnl = null;
        this.sellPrice = null;
        this.exitDate = null;
    } else {
        this.pnl = (this.sellPrice as number - this.buyPrice) * this.quantity;
    }
});

tradeSchema.index({ owner: 1, entryDate: -1 });

tradeSchema.plugin(mongooseAggregatePaginate);

export const Trade = mongoose.model<ITrade>("Trade", tradeSchema);
