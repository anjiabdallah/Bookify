import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import cors from 'cors';
import express from 'express';

import authRouter from './api/routes/auth/auth.js';
import booksRouter from './api/routes/books/books.js';
import { authMiddleware, type AuthRequest } from './middleware/auth.js';

import type { Response } from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const uploadsPath = path.resolve(__dirname, '../uploads');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsPath));
app.use('/api/books', booksRouter);

app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Bookify API is running!' });
});

app.get('/api/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  res.json({ userId: req.userId });
});

app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ error: message });
});

console.log('About to listen...');
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
console.log('After listen called');
