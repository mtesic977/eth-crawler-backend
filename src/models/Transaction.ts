import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema(
  {
    hash: { type: String, unique: true },
    from: String,
    to: String,
    value: String,
    blockNumber: Number,
    timestamp: Number,
  },
  { timestamps: true }
);

TransactionSchema.index({ from: 1, to: 1, blockNumber: 1});

export const Transaction = mongoose.model('Transaction', TransactionSchema);
