"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';
router.post('/token', (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        const token = jsonwebtoken_1.default.sign({ user: username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    }
    else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});
exports.default = router;
