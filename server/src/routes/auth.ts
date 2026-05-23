import bcrypt from 'bcrypt';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { db } from '../db.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(100),
  password: z.string().min(6),
});

const profileSchema = z.object({
  age: z.number().int().positive().nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  favorite_categories: z.array(z.string().min(1)).nullable().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register
router.post('/register', async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  const { email, username, password } = result.data;

  const existing = await db
    .selectFrom('users')
    .where('email', '=', email)
    .selectAll()
    .executeTakeFirst();

  if (existing) {
    res.status(409).json({ error: 'Email already in use' });
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = await db
    .insertInto('users')
    .values({ email, username, password_hash })
    .returning(['id', 'email', 'username'])
    .executeTakeFirstOrThrow();

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });

  res.status(201).json({ user, token });
});

// Login
router.post('/login', async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  const { email, password } = result.data;

  const user = await db
    .selectFrom('users')
    .where('email', '=', email)
    .selectAll()
    .executeTakeFirst();

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });

  res.json({ user: { id: user.id, email: user.email, username: user.username }, token });
});

router.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
  const user = await db
    .selectFrom('users')
    .where('id', '=', req.userId as number)
    .select(['id', 'email', 'username', 'age', 'bio', 'favorite_categories'])
    .executeTakeFirst();

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    age: user.age ?? null,
    bio: user.bio ?? undefined,
    favoriteCategories: user.favorite_categories
      ? user.favorite_categories.split(',').map(category => category.trim()).filter(Boolean)
      : undefined,
  });
});

router.put('/profile', authMiddleware, async (req: AuthRequest, res) => {
  const result = profileSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  const { age = null, bio = null, favorite_categories = [] } = result.data;
  const categoriesString = favorite_categories && favorite_categories.length > 0 ? favorite_categories.join(', ') : null;

  const updatedUser = await db
    .updateTable('users')
    .set({
      age,
      bio,
      favorite_categories: categoriesString,
    })
    .where('id', '=', req.userId as number)
    .returning(['id', 'email', 'username', 'age', 'bio', 'favorite_categories'])
    .executeTakeFirst();

  if (!updatedUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    id: updatedUser.id,
    email: updatedUser.email,
    username: updatedUser.username,
    age: updatedUser.age ?? null,
    bio: updatedUser.bio ?? undefined,
    favoriteCategories: updatedUser.favorite_categories
      ? updatedUser.favorite_categories.split(',').map(category => category.trim()).filter(Boolean)
      : undefined,
  });
});

export default router;
