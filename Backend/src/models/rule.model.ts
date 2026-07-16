import mongoose, { Schema, Document } from "mongoose";

export type RuleType =
    | "max_capital_percent"
    | "max_trades_per_day"
    | "no_trade_after_time"
    | "no_revenge_trade";

export interface IRule extends Document {
    owner: mongoose.Types.ObjectId;
    type: RuleType;
    value: any;
    isActive: boolean;
}

const ruleSchema = new Schema<IRule>({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            "max_capital_percent",
            "max_trades_per_day",
            "no_trade_after_time",
            "no_revenge_trade"
        ]
    },
    value: {
        type: Schema.Types.Mixed,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const Rule = mongoose.model<IRule>("Rule", ruleSchema);
