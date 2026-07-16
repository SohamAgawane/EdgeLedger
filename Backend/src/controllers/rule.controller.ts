import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { Rule } from "../models/rule.model";

const validateRule = (type: string, value: any) => {
    if(type === "max_capital_percent") {
        if(typeof value !=="number" || value < 1 || value > 100) {
            throw new ApiError(400, "max_capital_percent value must be a number between 1 and 100");
        }
    }

    if(type === "max_trades_per_day") {
        if(typeof value  !=="number" || value < 1 || value > 20) {
            throw new ApiError(400, "max_trades_per_day value must be a number between 1 and 20");
        }
    }

    if(type === "no_trade_after_time") {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if(typeof value !=="string" || !timeRegex.test(value)) {
            throw new ApiError(400, "no_trade_after_time value must be a time string in HH:mm format, e.g. 15:30");
        }
    }

    if(type === "no_revenge_trade") {
        if(value !== true) {
            throw new ApiError(400, "no_revenge_trade value must be true");
        }
    }
}

const createRule = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 — get type and value from body
    const { type, value } = req.body;

    if(!type) {
        throw new ApiError(400, "Rule type is required");
    }

    // STEP 2 — validate value is present
    if(value === undefined || value === null) {
        throw new ApiError(400, "Rule value is required");
    }

    // STEP 3 — validate value format matches the rule type
    validateRule(type, value);

    // STEP 4 — check if user already has an active rule of this type
    // a user should not have two max_capital_percent rules at once
    const existingRule = await Rule.findOne({ owner: req.user!._id, type });

    if(existingRule) {
        throw new ApiError(409, `You already have a ${type} rule. Update the existing one instead.`);
    }

    // STEP 5 — create the rule
    const rule = await Rule.create({ type, value, owner: req.user!._id });

    return res.status(201).json(
        new ApiResponse(201, rule, "Rule created successfully")
    );
});

const getRules = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 - Fetch all rules for this user, active ones first
    const rules = await Rule.find({ owner: req.user!._id}).sort({ isActive: -1, createdAt: -1});

    return res.status(200).json(
        new ApiResponse(200, rules, "Rules fetched successfully")
    );
});

const updateRule = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 — find the rule
    const rule = await Rule.findById(req.params.id);

    if(!rule) {
        throw new ApiError(404, "Rule not found");
    }

    // STEP 2 — 403 if not owned
    if(rule.owner.toString() !== req.user!._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this rule");
    }

    // STEP 3 — only value and isActive can be updated
    if(req.body.value !==undefined) {
        // validate the new value against the existing rule type
        validateRule(rule.type, req.body.value);
        rule.value = req.body.value;
    }

    if(req.body.isActive !== undefined) {
        rule.isActive = req.body.isActive;
    }

    await rule.save();

    return res.status(200).json(
        new ApiResponse(200, rule, "Rule updated successfully")
    );
});

const deleteRule = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 — find the rule
    const rule = await Rule.findById(req.params.id);

    if(!rule) {
        throw new ApiError(404, "Rule not found");
    }

    // STEP 2 — 403 if not owned
    if(rule.owner.toString() !== req.user!._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this rule");
    }

    // STEP 3 — delete
    await Rule.findByIdAndDelete(req.params.id);

    return res.status(200).json(
        new ApiResponse(200, { deleted: true }, "Rule deleted successfully")
    );
});

const toggleRuleActive = asyncHandler(async (req: Request, res: Response) => {
    // STEP 1 — find the rule
    const rule = await Rule.findById(req.params.id);

    if(!rule) {
        throw new ApiError(404, "Rule not found");
    }

    // STEP 2 — 403 if not owned
    if(rule.owner.toString() !== req.user!._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this rule");
    }

    // STEP 3 — flip isActive
    // if it was true it becomes false, if false it becomes true
    rule.isActive = !rule.isActive;

    await rule.save();

    return res.status(200).json(
        new ApiResponse( 200, rule, `Rule ${rule.isActive ? "activated" : "deactivated"} successfully`)
    );
});

export { createRule, getRules, updateRule, deleteRule, toggleRuleActive };
