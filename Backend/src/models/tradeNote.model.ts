import mongoose, { Schema, Document } from "mongoose";

export interface ITradeNote extends Document {
    trade: mongoose.Types.ObjectId;
    owner: mongoose.Types.ObjectId;
    text: string;
}

const tradeNoteSchema = new Schema<ITradeNote>({
    trade: {
        type: Schema.Types.ObjectId,
        ref: "Trade",
        required: true,
        index: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

export const TradeNote = mongoose.model<ITradeNote>("TradeNote", tradeNoteSchema);
