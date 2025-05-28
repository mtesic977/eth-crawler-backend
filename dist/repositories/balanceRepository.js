"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceRepository = void 0;
const Balance_1 = require("../models/Balance");
class BalanceRepository {
    static async find(wallet, date) {
        return Balance_1.Balance.findOne({ wallet, date }).exec();
    }
    static async saveIfNotExists(data) {
        const { wallet, date } = data;
        const existing = await this.find(wallet, date);
        if (existing)
            return existing;
        const balance = new Balance_1.Balance(data);
        return balance.save();
    }
    static async findAllForWallet(wallet, blockNumber) {
        const query = { wallet };
        if (blockNumber !== undefined)
            query.blockNumber = blockNumber;
        return Balance_1.Balance.find(query).exec();
    }
}
exports.BalanceRepository = BalanceRepository;
