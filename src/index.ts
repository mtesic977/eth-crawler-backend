import express from "express";
import cors from 'cors';
import mongoose from "mongoose";
import dotenv from "dotenv";
import ethRoutes from "./routes/ethRoutes";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", ethRoutes);
app.use('/api/auth', authRoutes);

mongoose.connect('mongodb://root:password@localhost:27017/ethcrawler?authSource=admin')
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });
