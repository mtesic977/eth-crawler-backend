import mongoose from 'mongoose';

const BalanceSchema = new mongoose.Schema(
  {
    wallet: { type: String, required: true, index: true },
    tokenAddress: { type: String, required: true, index: true },
    blockNumber: { type: Number, required: true, index: true },
    timestamp: { type: Number, required: true },
    rawBalance: { type: String, required: true },
    formattedBalance: { type: String, required: true },
    decimals: { type: Number },
    symbol: { type: String },
  },
  {
    timestamps: true,
  }
);

BalanceSchema.index(
  { wallet: 1, tokenAddress: 1, blockNumber: 1 },
  { unique: true }
);

export const Balance = mongoose.model('Balance', BalanceSchema);
