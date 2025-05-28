"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const TransactionSchema = new mongoose_1.default.Schema({
    hash: { type: String, unique: true },
    from: String,
    to: String,
    value: String,
    blockNumber: Number,
    timestamp: Number,
}, { timestamps: true });
TransactionSchema.index({ from: 1, to: 1, blockNumber: 1 });
exports.Transaction = mongoose_1.default.model('Transaction', TransactionSchema);
