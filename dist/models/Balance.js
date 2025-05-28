"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Balance = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const BalanceSchema = new mongoose_1.default.Schema({
    wallet: { type: String, required: true, index: true },
    tokenAddress: { type: String, required: true, index: true },
    blockNumber: { type: Number, required: true, index: true },
    timestamp: { type: Number, required: true },
    rawBalance: { type: String, required: true },
    formattedBalance: { type: String, required: true },
    decimals: { type: Number },
    symbol: { type: String },
}, {
    timestamps: true,
});
BalanceSchema.index({ wallet: 1, tokenAddress: 1, blockNumber: 1 }, { unique: true });
exports.Balance = mongoose_1.default.model('Balance', BalanceSchema);
