"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Token required' });
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}
