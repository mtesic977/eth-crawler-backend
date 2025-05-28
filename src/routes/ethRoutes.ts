import express from 'express';
import { getTransactions, getBalance } from '../controllers/ethController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/transactions', authenticateToken, getTransactions);
router.post('/balance', authenticateToken, getBalance);

export default router;
