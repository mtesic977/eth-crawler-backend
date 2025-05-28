"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalance = exports.getTransactions = void 0;
const crawlerService_1 = require("../services/crawlerService");
const balanceService_1 = require("../services/balanceService");
const getTransactions = async (req, res) => {
    console.log(req.query);
    const { wallet, startBlock } = req.query;
    if (!wallet || !startBlock) {
        return res
            .status(400)
            .json({ error: 'wallet and startBlock are required' });
    }
    try {
        const txs = await (0, crawlerService_1.crawlTransactions)(wallet, parseInt(startBlock));
        res.json(txs);
    }
    catch (err) {
        res
            .status(500)
            .json({ error: 'Failed to crawl transactions', details: err });
    }
};
exports.getTransactions = getTransactions;
const getBalance = async (req, res) => {
    const { wallet, dateStr } = req.body;
    if (!wallet || !dateStr) {
        return res.status(400).json({ error: 'wallet and date are required' });
    }
    try {
        const balance = await (0, balanceService_1.getAllBalancesAtDate)(wallet, dateStr);
        res.json({ balance });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get balance', details: err });
    }
};
exports.getBalance = getBalance;
