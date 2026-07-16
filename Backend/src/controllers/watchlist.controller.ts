import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError"
import { Watchlist } from "../models/watchlist.model";

const addToWatchlist = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 - Get fields from the bofy
    const { symbol, tags, notes } = req.body;

    // STEP 2 - Symbol is the only field which is required
    if(!symbol || symbol.trim() === "") {
        throw new ApiError(400, "Symbol is required");
    }

    // STEP 3 - Check if this user already has this symbol
    const existing = await Watchlist.findOne({
        owner: req.user!._id,
        symbol: symbol.toUpperCase()
    });

    if(existing) {
        throw new ApiError(409, `${symbol.toUpperCase()} is already in your watchlist`);
    }

    // STEP 4 - Create a watchlist items
    const item = await Watchlist.create({
        symbol,
        tags: tags || [],
        notes: notes || "",
        owner: req.user!._id
    });

    return res.status(201).json(
        new ApiResponse(201, item, "Symbol added to watchlist")
    );
});

const getWatchlist = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 - Base filter always scoped to logged in user
    const filter: any = { owner: req.user!._id };

    // STEP 2 - Optional tag filter
    if(req.query.tag) {
        filter.tags = { $elemMatch: { $eq: req.query.tag }};
    }

    // STEP 3 - Fetch and sort by newest first
    const watchlist = await Watchlist.find(filter).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, watchlist, "Watchlist fetched successfully")
    );
});

const updateWatchlistItem = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 - Find the item by id
    const item = await Watchlist.findById(req.params.id);

    if(!item) {
        throw new ApiError(404, "Watchlist item not found");
    }

    // STEP 2 - If item belongs to someone else
    if(item.owner.toString() !== req.user!._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this item");
    }

    // STEP 3 - Only allow updating tags and notes
    if (req.body.tags !== undefined) item.tags = req.body.tags;
    if (req.body.notes !== undefined) item.notes = req.body.notes;

    await item.save();

    return res.status(200).json(
        new ApiResponse(200, item, "Watchlist item updated successfully")
    );
});

const removeFromWatchlist = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 - Find the item
    const item = await Watchlist.findById(req.params.id);

    if(!item) {
        throw new ApiError(404, "Watchlist item not found");
    }

    // STEP 2 - If not owned
    if(item.owner.toString() !== req.user!._id.toString()) {
        throw new ApiError(403, "You are not authorized to remove the item");
    }

    // STEP 3 - Delete 
    await Watchlist.findByIdAndDelete(req.params.id);

    return res.status(200).json(
        new ApiResponse(200, { deleted: true }, "Symbol removed from watchlist")
    );
});

export { addToWatchlist, getWatchlist, updateWatchlistItem, removeFromWatchlist };
