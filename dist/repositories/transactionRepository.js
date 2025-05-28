"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRepository = void 0;
const Transaction_1 = require("../models/Transaction");
class TransactionRepository {
    static async findByHash(hash) {
        return Transaction_1.Transaction.findOne({ hash }).exec();
    }
    static async saveManyIfNotExists(transactions) {
        const hashes = transactions.map((tx) => tx.hash);
        const existing = await Transaction_1.Transaction.find({ hash: { $in: hashes } })
            .select('hash')
            .lean()
            .exec();
        const existingHashes = new Set(existing.map((e) => e.hash));
        const toInsert = transactions.filter((tx) => !existingHashes.has(tx.hash));
        if (toInsert.length > 0) {
            await Transaction_1.Transaction.insertMany(toInsert);
        }
        return toInsert;
    }
    static async findByWallet(address, options = {}) {
        return Transaction_1.Transaction.find({
            $or: [
                { from: new RegExp(`^${address}$`, 'i') },
                { to: new RegExp(`^${address}$`, 'i') },
            ],
            ...options,
        }).exec();
    }
}
exports.TransactionRepository = TransactionRepository;
