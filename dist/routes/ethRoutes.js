"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ethController_1 = require("../controllers/ethController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/transactions', authMiddleware_1.authenticateToken, ethController_1.getTransactions);
router.post('/balance', authMiddleware_1.authenticateToken, ethController_1.getBalance);
exports.default = router;
