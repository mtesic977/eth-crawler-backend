import express from "express";
import cors from 'cors';
import dotenv from "dotenv";
import ethRoutes from "./routes/ethRoutes";
import authRoutes from "./routes/authRoutes";
import { connectDB } from "./config/db";

dotenv.config();

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", ethRoutes);
app.use('/api/auth', authRoutes);

// Connect to DB and start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});