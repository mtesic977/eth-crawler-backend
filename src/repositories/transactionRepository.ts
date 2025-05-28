import { Transaction } from '../models/Transaction';

export class TransactionRepository {
  static async findByHash(hash: string) {
    return Transaction.findOne({ hash }).exec();
  }

  static async saveManyIfNotExists(transactions: any[]) {
    const hashes = transactions.map((tx) => tx.hash);
    const existing = await Transaction.find({ hash: { $in: hashes } })
      .select('hash')
      .lean()
      .exec();
    const existingHashes = new Set(existing.map((e) => e.hash));

    const toInsert = transactions.filter((tx) => !existingHashes.has(tx.hash));

    if (toInsert.length > 0) {
      await Transaction.insertMany(toInsert);
    }

    return toInsert;
  }

  static async findByWallet(address: string, options = {}) {
    return Transaction.find({
      $or: [
        { from: new RegExp(`^${address}$`, 'i') },
        { to: new RegExp(`^${address}$`, 'i') },
      ],
      ...options,
    }).exec();
  }
}
