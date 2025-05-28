import { Request, Response } from 'express';
import { crawlTransactions } from '../services/crawlerService';
import { getAllBalancesAtDate } from '../services/balanceService';

export const getTransactions = async (req: Request, res: Response) => {
  const { wallet, startBlock } = req.query;

  if (!wallet || !startBlock) {
    return res
      .status(400)
      .json({ error: 'wallet and startBlock are required' });
  }

  try {
    const txs = await crawlTransactions(
      wallet as string,
      parseInt(startBlock as string)
    );
    res.json(txs);
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Failed to crawl transactions', details: err });
  }
};

export const getBalance = async (req: Request, res: Response) => {
  const { wallet, dateStr } = req.body;

  if (!wallet || !dateStr) {
    return res.status(400).json({ error: 'wallet and date are required' });
  }

  try {
    const balance = await getAllBalancesAtDate(wallet as string, dateStr as string);
    res.json({ balance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get balance', details: err });
  }
};
