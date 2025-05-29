import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongo_uri = process.env.MONGO_URI as string;

export const connectDB = async () => {
  try {
    await mongoose.connect(mongo_uri || 'mongodb://localhost:27017/ethcrawler');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
