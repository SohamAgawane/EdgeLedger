import { Request, Response } from "express";
import csv from "csv-parser";
import fs from "fs";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Trade } from "../models/trade.model";
import { ApiError } from "../utils/ApiError";
import { checkTradeAgainstRules } from "../utils/ruleEngine";

const createTrade = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 - Get fields
    const {
        symbol,
        buyPrice,
        sellPrice,
        quantity,
        entryDate,
        exitDate,
        isOpen,
        sector,
        emotionBefore,
        emotionAfter,
        mistakeCategory,
        convictionScore,
        notes
    } = req.body;

    // STEP 2 - Validate required fields
    if (
        !symbol ||
        buyPrice == null ||
        quantity == null ||
        !entryDate ||
        !sector
    ) {
        throw new ApiError(
            400,
            "Symbol, buy price, quantity, entry date and sector are required"
        );
    }

    if (!isOpen && sellPrice == null) {
        throw new ApiError(
            400,
            "Sell price is required for closed trades"
        );
    }

    // STEP 3 - Create trade
    const trade = await Trade.create({
        symbol,
        buyPrice,
        sellPrice: isOpen ? null : sellPrice,
        quantity,
        entryDate,
        exitDate: isOpen ? null : exitDate,
        isOpen,
        sector,
        emotionBefore,
        emotionAfter,
        mistakeCategory,
        convictionScore,
        notes,
        owner: req.user!._id,
    });

    // STEP 4 - Run rules engine
    const warnings = await checkTradeAgainstRules(req.user!._id, trade);

    // STEP 5 - Response
    return res.status(201).json(
        new ApiResponse(
            201,
            { trade, warnings },
            "Trade logged successfully"
        )
    );
});

const getTrades = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 — always scope to the logged in user
    const filter: any = { owner: req.user!._id };

    // STEP 2 - Optional filters from query params
    if (req.query.sector) {
        filter.sector = req.query.sector;
    }

    if (req.query.mistakeCategory) {
        filter.mistakeCategory = req.query.mistakeCategory;
    }

    // date reange filter - from=2026-01-01&to=2026-06-30
    if (req.query.from || req.query.to) {
        filter.entryDate = {};
        // $gte and $lte are MongoDB range operators
        if (req.query.from) filter.entryDate.$gte = new Date(req.query.from as string);
        if (req.query.to) filter.entryDate.$lte = new Date(req.query.to as string);
    }

    // pnl range filter - minPnl=-500&maxPnl=5000
    if (req.query.minPnl || req.query.maxPnl) {
        filter.pnl = {};
        if (req.query.minPnl) filter.pnl.$gte = Number(req.query.minPnl);
        if (req.query.maxPnl) filter.pnl.$lte = Number(req.query.maxPnl);
    }

    // STEP 3 - Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // STEP 4 - Fetch trades + total count in parallel
    const [trades, totalCount] = await Promise.all([
        Trade.find(filter)
            .sort({ entryDate: -1 })
            .skip(skip)
            .limit(limit),
        Trade.countDocuments(filter)
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            trades,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                limit
            }
        }, "Trades fetched successfully")
    );
});

const getTradeById = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 - Find trade by id
    const trade = await Trade.findById(req.params.id);

    // STEP 2 - 404 if it does not exist
    if (!trade) {
        throw new ApiError(404, "Trade not found");
    }

    // STEP 3 - If it exists but belongs to someone else
    if (trade.owner.toString() !== req.user!._id.toString()) {
        throw new ApiError(403, "You are not authorized to access this trade");
    }

    return res.status(200).json(
        new ApiResponse(200, trade, "Trade fetched successfully")
    );
});

const updateTrade = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 - Find the trade
    const trade: any = await Trade.findById(req.params.id);

    if (!trade) {
        throw new ApiError(404, "Trade not found");
    }

    // STEP 2 - Check ownership
    if (trade.owner.toString() !== req.user!._id.toString()) {
        throw new ApiError(403, "You are not authorized to access this trade");
    }

    // STEP 3 - Allowed fields
    const allowedFields = [
        "symbol",
        "buyPrice",
        "sellPrice",
        "quantity",
        "entryDate",
        "exitDate",
        "isOpen",
        "sector",
        "emotionBefore",
        "emotionAfter",
        "mistakeCategory",
        "convictionScore",
        "notes",
    ];

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            trade[field] = req.body[field];
        }
    });

    // STEP 4 - Handle open trades
    if (trade.isOpen) {
        trade.sellPrice = null;
        trade.exitDate = null;
    } else {
        if (trade.sellPrice == null) {
            throw new ApiError(
                400,
                "Sell price is required for closed trades"
            );
        }

        if (!trade.exitDate) {
            throw new ApiError(
                400,
                "Exit date is required for closed trades"
            );
        }
    }

    // STEP 5 - Save
    await trade.save({ validateBeforeSave: true });

    return res.status(200).json(
        new ApiResponse(
            200,
            trade,
            "Trade updated successfully"
        )
    );
});

const deleteTrade = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 - Find the trade
    const trade = await Trade.findById(req.params.id);

    if (!trade) {
        throw new ApiError(404, "Trade not found");
    }

    // STEP 2 - Check ownership
    if (trade.owner.toString() !== req.user!._id.toString()) {
        throw new ApiError(403, "You are not authorized to access this trade");
    }

    // STEP 3 - Delete the trade
    await Trade.findByIdAndDelete(req.params.id);

    return res.status(200).json(
        new ApiResponse(200, { deleted: true }, "Trade deleted successfully")
    )
});

const importTradesFromCSV = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 - Check upload
    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }

    const filePath = req.file.path;

    const validRows: any[] = [];
    const errors: any[] = [];

    // STEP 2 - Read CSV
    await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row: any) => {

                const rowNumber = validRows.length + errors.length + 1;

                const isOpen =
                    String(row.isOpen).toLowerCase() === "true";

                // Required fields
                if (
                    !row.symbol ||
                    !row.buyPrice ||
                    !row.quantity ||
                    !row.entryDate ||
                    !row.sector
                ) {
                    errors.push({
                        row: rowNumber,
                        reason:
                            "Missing required fields: symbol, buyPrice, quantity, entryDate, sector",
                    });
                    return;
                }

                if (!isOpen && !row.sellPrice) {
                    errors.push({
                        row: rowNumber,
                        reason:
                            "Sell price is required for closed trades",
                    });
                    return;
                }

                // Type conversion
                const buyPrice = Number(row.buyPrice);
                const sellPrice = isOpen
                    ? null
                    : Number(row.sellPrice);

                const quantity = Number(row.quantity);

                const entryDate = new Date(row.entryDate);

                const exitDate =
                    !isOpen && row.exitDate
                        ? new Date(row.exitDate)
                        : null;

                const convictionScore = row.convictionScore
                    ? Number(row.convictionScore)
                    : undefined;

                // Validation
                if (Number.isNaN(buyPrice) || buyPrice <= 0) {
                    errors.push({
                        row: rowNumber,
                        reason: "Invalid buyPrice",
                    });
                    return;
                }

                if (
                    !isOpen &&
                    (Number.isNaN(sellPrice as number) || (sellPrice as number) <= 0)
                ) {
                    errors.push({
                        row: rowNumber,
                        reason: "Invalid sellPrice",
                    });
                    return;
                }

                if (
                    Number.isNaN(quantity) ||
                    quantity <= 0
                ) {
                    errors.push({
                        row: rowNumber,
                        reason: "Invalid quantity",
                    });
                    return;
                }

                if (Number.isNaN(entryDate.getTime())) {
                    errors.push({
                        row: rowNumber,
                        reason: "Invalid entryDate",
                    });
                    return;
                }

                if (
                    exitDate &&
                    Number.isNaN(exitDate.getTime())
                ) {
                    errors.push({
                        row: rowNumber,
                        reason: "Invalid exitDate",
                    });
                    return;
                }

                validRows.push({
                    owner: req.user!._id,

                    symbol: row.symbol.trim().toUpperCase(),

                    buyPrice,

                    sellPrice,

                    quantity,

                    entryDate,

                    exitDate,

                    isOpen,

                    sector: row.sector.trim(),

                    emotionBefore:
                        row.emotionBefore?.trim() || undefined,

                    emotionAfter:
                        row.emotionAfter?.trim() || undefined,

                    mistakeCategory:
                        row.mistakeCategory?.trim() || undefined,

                    convictionScore,

                    notes:
                        row.notes?.trim() || "",

                    pnl: isOpen
                        ? null
                        : ((sellPrice as number) - buyPrice) * quantity,
                });
            })
            .on("end", () => resolve())
            .on("error", (err) => reject(err));
    });

    // STEP 3 - Insert
    let imported = 0;

    if (validRows.length > 0) {
        const inserted = await Trade.insertMany(validRows, {
            ordered: false,
        });

        imported = inserted.length;
    }

    // STEP 4 - Delete temp file
    fs.unlinkSync(filePath);

    // STEP 5 - Response
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalRows: validRows.length + errors.length,
                imported,
                failed: errors.length,
                errors,
            },
            `Import completed. ${imported} trades imported.`
        )
    );
});

export { createTrade, getTrades, getTradeById, updateTrade, deleteTrade, importTradesFromCSV };
