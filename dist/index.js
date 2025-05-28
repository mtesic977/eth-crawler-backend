"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const ethRoutes_1 = __importDefault(require("./routes/ethRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use("/api", ethRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
mongoose_1.default.connect('mongodb://root:password@localhost:27017/ethcrawler?authSource=admin')
    .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
})
    .catch(err => {
    console.error("MongoDB connection error:", err);
});
