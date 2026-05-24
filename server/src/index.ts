import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import authRouter from './api/routes/auth.js';
import booksRouter from './api/routes/books.js';
import { authMiddleware, type AuthRequest } from './middleware/auth.js';

import type { Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/books', booksRouter);

app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Bookify API is running!' });
});

app.get('/api/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  res.json({ userId: req.userId });
});

console.log('About to listen...');
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
console.log('After listen called');
