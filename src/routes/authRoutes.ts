import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

router.post('/token', (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    const token = jwt.sign({ user: username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

export default router;
