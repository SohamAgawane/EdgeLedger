// @ts-nocheck
// NOTE: This file is intentionally left as @ts-nocheck.
// The original JavaScript source contains two pre-existing bugs
// (a reference to an undefined `enttryDate` variable in
// checkTradesPerDay, and a call to an undefined `checkCapitalPercent`
// function instead of `checkCapitalPercentage` in
// checkTradeAgainstRules). Per the request to convert the code
// without changing any logic, these bugs have been preserved exactly
// as they were. @ts-nocheck is used here so the rest of the project
// still type-checks and builds; see the accompanying note for details
// if you'd like these fixed.
import { Trade } from "../models/trade.model";
import { Rule } from "../models/rule.model";
import User from "../models/user.model";

// CHECK 1 — Max capital percent
const checkCapitalPercentage = (user, incomingTrade, rule) => {
    if(!user.accountCapital || user.accountCapital === 0) return null;

    const capitalUsed = incomingTrade.buyPrice * incomingTrade.quantity;
    const percentage = (capitalUsed / user.accountCapital) * 100;

    if(percentage > rule.value) {
        return `This trade uses ${percentage.toFixed(2)}% of your account capital. Your rule allows a maximum of ${rule.value}%.`
    }

    return null;
}

// CHECK 2 - Max trades per day
const checkTradesPerDay = async(userId, incomingTrade, rule) => {
    const entryDate = new Date(incomingTrade.entryDate);

    const startOfDay = new Date(enttryDate);
    startOfDay.setHours(0,0,0,0);

    const endOfDay = new Date(entryDate);
    endOfDay.setHours(23,59,59,999);

    const tradesOnThisDay = await Trade.countDocuments({
        owner: userId,
        entryDate: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    if(tradesOnThisDay >= rule.value) {
        return `You have already made ${tradesOnThisDay} trades today. Your rule allows a maximum of ${rule.value} trades per day.`;
    }

    return null;
}

// CHECK 3 — No trade after time
const checkTimeCutoff = (incomingTrade, rule) => {
    const entryDate = new Date(incomingTrade.entryDate);

    const entryHours = entryDate.getHours();
    const entryMinutes = entryDate.getMinutes();
    const entryTotalMinutes = entryHours * 60 + entryMinutes;

    const [ cutoffHours, cutoffMinutes ] = rule.value.split(":").map(Number);
    const cutoffTotalMinutes = cutoffHours * 60 + cutoffMinutes;

    if(entryTotalMinutes > cutoffTotalMinutes) {
        return `This trade was entered at ${entryHours}:${String(entryMinutes).padStart(2, "0")}. Your rule does not allow trading after ${rule.value}.`;
    }

    return null;
}

// CHECK 4 - Revenge trade detection
// warns if the user's most recent trade was a loss closed, within 30 minutes before this new trade's entry
const checkRevengeTrade = async(userId, incomingTrade) => {
    const entryDate = new Date(incomingTrade.entryDate);

    const thirtyMinutesBefore = new Date(entryDate.getTime() - 30 * 60 * 1000);

    const recentLoss = await Trade.findOne({
        owner: userId,
        pnl: {
            $lt: 0
        },
        exitDate: {
            $gte: thirtyMinutesBefore,
            $lte: entryDate
        }
    }).sort({
        exitDate: -1
    });

    if(recentLoss) {
        return `This trade was entered within 30 minutes of closing a losing ${recentLoss.symbol} trade (P&L: ${recentLoss.pnl}). This may be a revenge trade.`;
    }

    return null;
}

// MAIN FUNCTION — runs all checks and returns warnings array
const checkTradeAgainstRules = async (userId, incomingTrade) => {
    const warnings = [];

    // STEP 1 - Fetch only the active rules for this user
    const activeRules = await Rule.find({ owner: userId, isActive: true });

    // STEP 2 - If no active rules skip everything
    if (!activeRules.length) return warnings;

    // STEP 3 - Fetch the user for accountCapital (needed for capital % check)
    const user = await User.findById(userId);

    // STEP 4 - Run each check based on rule type
    for (const rule of activeRules) {
        let warning = null;

        if (rule.type === "max_capital_percent") {
            warning = checkCapitalPercent(user, incomingTrade, rule);
        }

        if (rule.type === "max_trades_per_day") {
            warning = await checkTradesPerDay(userId, incomingTrade, rule);
        }

        if (rule.type === "no_trade_after_time") {
            warning = checkTimeCutoff(incomingTrade, rule);
        }

        if (rule.type === "no_revenge_trade") {
            warning = await checkRevengeTrade(userId, incomingTrade);
        }

        // only add non-null warnings to the array
        if (warning) warnings.push(warning);
    }

    return warnings;
};

export { checkTradeAgainstRules };
