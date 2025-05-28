import { Balance } from '../models/Balance';

export class BalanceRepository {
  static async find(wallet: string, date: string) {
    return Balance.findOne({ wallet, date }).exec();
  }

  static async saveIfNotExists(data: any) {
    const { wallet, date } = data;

    const existing = await this.find(wallet, date);
    if (existing) return existing;

    const balance = new Balance(data);
    return balance.save();
  }

  static async findAllForWallet(wallet: string, blockNumber?: number) {
    const query: any = { wallet };
    if (blockNumber !== undefined) query.blockNumber = blockNumber;
    return Balance.find(query).exec();
  }
}
