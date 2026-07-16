import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Trade } from "../models/trade.model";
import mongoose from "mongoose";

const getDashboard = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 - Convert the user id string to a MongoDB ObjectId
    // aggregate pipelines need ObjectId not plain string
    const userId = new mongoose.Types.ObjectId(req.user!._id as any);

    // STEP 2 - Run full analytics pipeline
    const result = await Trade.aggregate([
        {
            $match: { owner: userId } // filter to only this user's trade
        },

        // run all 8 metrics in parallel
        {
            $facet: {
                // METRIC 1 - win rate
                winRate: [
                    {
                        $group: {
                            _id: null,
                            totalTrades: { $sum: 1 },
                            winningTrades: {
                                $sum: {
                                    $cond: [{ $gt: ["$pnl", 0] }, 1, 0]
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            totalTrades: 1,
                            winningTrades: 1,
                            winRate: {
                                $cond: [
                                    { $eq: ["$totalTrades", 0] },
                                    0,
                                    {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    "$winningTrades",
                                                    "$totalTrades"
                                                ]
                                            },
                                            100
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],

                // METRIC 2 - avg pnl
                avgPnl: [
                    {
                        $group: {
                            _id: null,
                            avgPnl: {
                                $avg: "$pnl"
                            },
                            totalPnl: {
                                $sum: "$pnl"
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            avgPnl: {
                                $round: ["$avgPnl", 2]
                            },
                            totalPnl: 1
                        }
                    }
                ],

                // METRIC 3 - sector performance
                sectorPerformance: [
                    {
                        $match: {
                            sector: {
                                $ne: null
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$sector",
                            avgPnl: {
                                $avg: "$pnl"
                            },
                            totalPnl: {
                                $sum: "$pnl"
                            },
                            tradeCount: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            sector: "$_id",
                            avgPnl: {
                                $round: ["$avgPnl", 2]
                            },
                            totalPnl: 1,
                            tradeCount: 1
                        }
                    },
                    {
                        $sort: {
                            avgPnl: -1
                        }
                    }
                ],

                // METRIC 4 - weekday performance
                weekdayPerformance: [
                    {
                        $project: {
                            pnl: 1,
                            dayOfWeek: {
                                $dayOfWeek: "$entryDate"
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$dayOfWeek",
                            avgPnl: {
                                $avg: "$pnl"
                            },
                            tradeCount: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            day: "$_id",
                            avgPnl: {
                                $round: ["$avgPnl", 2]
                            },
                            tradeCount: 1
                        }
                    },
                    {
                        $sort: {
                            day: 1
                        }
                    }
                ],

                // METRIC 5 - average holding peroid
                avgHoldingPeriod: [
                    {
                        $match: {
                            exitDate: {
                                $exists: true,
                                $ne: null
                            }
                        }
                    },
                    {
                        $project: {
                            holdingDays: {
                                $divide: [
                                    {
                                        $subtract: ["$exitDate", "$entryDate"]
                                    },
                                    1000 * 60 * 60 * 24
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            avgHoldingDays: {
                                $avg: "$holdingDays"
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            avgHoldingDays: {
                                $round: ["$avgHoldingDays", 2]
                            }
                        }
                    }
                ],

                // METRIC 6 - mistake distribution
                mistakeDistribution: [
                    {
                        $match: {
                            mistakeCategory: {
                                $ne: null
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$mistakeCategory",
                            count: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            mistake: "$_id",
                            count: 1
                        }
                    },
                    {
                        $sort: {
                            count: -1
                        }
                    }
                ],

                // METRIC 7 - conviction vs profit
                convictionVsProfit: [
                    {
                        $match: {
                            convictionScore: {
                                $exists: true,
                                $ne: null
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$convictionScore",
                            avgPnl: {
                                $avg: "$pnl"
                            },
                            tradeCount: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            convictionScore: "$_id",
                            avgPnl: {
                                $round: ["$avgPnl", 2]
                            },
                            tradeCount: 1
                        }
                    },
                    {
                        $sort: {
                            convictionScore: 1
                        }
                    }
                ],

                // METRIC 8 - risk concentration
                riskConcentration: [
                    {
                        $project: {
                            sector: 1,
                            capitalDeployed: {
                                $multiply: ["$buyPrice", "$quantity"]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$sector",
                            totalCapital: {
                                $sum: "$capitalDeployed"
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            sector: "$_id",
                            totalCapital: 1
                        }
                    },
                    {
                        $sort: {
                            totalCapital: -1
                        }
                    }
                ]
            }
        }
    ]);

    // STEP 3 — $facet always returns an array with one element
    const analytics: any = result[0] || {};

    // STEP 4 — Weekday numbers to day names
    const DAY_MAP: Record<number, string> = {
        1: "Sunday",
        2: "Monday",
        3: "Tuesday",
        4: "Wednesday",
        5: "Thursday",
        6: "Friday",
        7: "Saturday"
    };

    const weekdayPerformanceNamed = (analytics.weekdayPerformance || []).map((item: any) => ({
        ...item,
        day: DAY_MAP[item.day] || "Unknown"
    }));

    // STEP 5 - Compute risk concentration percentages
    const sectors = analytics.riskConcentration || [];

    const totalCapitalDeployed = sectors.reduce((sum: number, sector: any) => sum + sector.totalCapital, 0);

    const riskConcentrationWithPercentage = sectors.map((sector: any) => {
        if (totalCapitalDeployed === 0) {
            return {
                ...sector,
                percentage: 0,
                isOverConcentrated: false
            };
        }

        const percentage = (sector.totalCapital / totalCapitalDeployed) * 100;

        const roundedPercentage = parseFloat(percentage.toFixed(2));

        const isOverConcentrated = percentage >= 30;

        return {
            ...sector,
            percentage: roundedPercentage,
            isOverConcentrated
        };
    });

    // STEP 6 — return the shaped response
    // [0] on single-value metrics because $group with _id:null
    // returns a single-element array
    return res.status(200).json(
        new ApiResponse(200, {
            winRate: analytics.winRate[0] || {
                totalTrades: 0,
                winningTrades: 0,
                winRate: 0
            },
            avgPnl: analytics.avgPnl[0] || {
                avgPnl: 0,
                totalPnl: 0
            },

            sectorPerformance: analytics.sectorPerformance,
            weekdayPerformance: weekdayPerformanceNamed,

            avgHoldingPeriod: analytics.avgHoldingPeriod[0] || {
                avgHoldingDays: 0
            },

            mistakeDistribution: analytics.mistakeDistribution,
            convictionVsProfit: analytics.convictionVsProfit,
            riskConcentration: riskConcentrationWithPercentage
        }, "Dashboard fetched successfully")
    );
});

export { getDashboard };
