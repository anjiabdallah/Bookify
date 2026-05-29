import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import bcrypt from 'bcrypt';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import multer, { type FileFilterCallback } from 'multer';
import { z } from 'zod';

import { db } from '../../../db/index.js';
import { authMiddleware, type AuthRequest } from '../../../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

const uploadDir = path.resolve(__dirname, '../../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `profile-${Date.now()}${safeExt}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb: FileFilterCallback) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and GIF profile images are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const passwordRequirement = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  });

const formatZodError = (error: z.ZodError) => {
  const flattened = error.flatten();
  const fieldMessages = Object.values(flattened.fieldErrors).flat();
  if (flattened.formErrors.length > 0) {
    return flattened.formErrors.join(', ');
  }
  if (fieldMessages.length > 0) {
    return fieldMessages.join(', ');
  }
  return 'Invalid input';
};

const registerSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(4, { message: 'Username must be at least 4 characters' })
    .max(20, { message: 'Username must be at most 20 characters' }),
  password: passwordRequirement,
});

const profileSchema = z.object({
  age: z.number().int().min(6).max(100).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  favorite_categories: z.array(z.string().min(1)).nullable().optional(),
  profile_image_url: z.string().url().nullable().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: 'Enter your password' }),
});

// Register
router.post('/register', async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: formatZodError(result.error) });
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
    res.status(400).json({ error: formatZodError(result.error) });
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
    .select(['id', 'email', 'username', 'age', 'bio', 'favorite_categories', 'profile_image_url'])
    .executeTakeFirst();

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const buildImageUrl = (value: string | null | undefined) => {
    if (!value) return undefined;
    if (value.startsWith('http')) return value;
    return `${req.protocol}://${req.get('host')}${value}`;
  };

  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    age: user.age ?? null,
    bio: user.bio ?? undefined,
    favoriteCategories: user.favorite_categories
      ? user.favorite_categories.split(',').map(category => category.trim()).filter(Boolean)
      : undefined,
    profileImageUrl: buildImageUrl(user.profile_image_url),
  });
});

router.put('/profile', authMiddleware, async (req: AuthRequest, res) => {
  const result = profileSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: formatZodError(result.error) });
    return;
  }

  const {
    age = null,
    bio = null,
    favorite_categories = [],
    profile_image_url = null,
  } = result.data;
  const categoriesString = favorite_categories && favorite_categories.length > 0 ? favorite_categories.join(', ') : null;

  const updatedUser = await db
    .updateTable('users')
    .set({
      age,
      bio,
      favorite_categories: categoriesString,
      profile_image_url,
    })
    .where('id', '=', req.userId as number)
    .returning(['id', 'email', 'username', 'age', 'bio', 'favorite_categories', 'profile_image_url'])
    .executeTakeFirst();

  if (!updatedUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const buildImageUrl = (value: string | null | undefined) => {
    if (!value) return undefined;
    if (value.startsWith('http')) return value;
    return `${req.protocol}://${req.get('host')}${value}`;
  };

  res.json({
    id: updatedUser.id,
    email: updatedUser.email,
    username: updatedUser.username,
    age: updatedUser.age ?? null,
    bio: updatedUser.bio ?? undefined,
    favoriteCategories: updatedUser.favorite_categories
      ? updatedUser.favorite_categories.split(',').map(category => category.trim()).filter(Boolean)
      : undefined,
    profileImageUrl: buildImageUrl(updatedUser.profile_image_url),
  });
});

router.post('/profile/avatar', authMiddleware, upload.single('profileImage'), async (req: AuthRequest & { file?: Express.Multer.File }, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Profile image file is required' });
    return;
  }

  const profileImagePath = `/uploads/${req.file.filename}`;

  const updatedUser = await db
    .updateTable('users')
    .set({ profile_image_url: profileImagePath })
    .where('id', '=', req.userId as number)
    .returning(['id', 'email', 'username', 'age', 'bio', 'favorite_categories', 'profile_image_url'])
    .executeTakeFirst();

  if (!updatedUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const imageUrl = `${req.protocol}://${req.get('host')}${profileImagePath}`;

  res.json({
    id: updatedUser.id,
    email: updatedUser.email,
    username: updatedUser.username,
    age: updatedUser.age ?? null,
    bio: updatedUser.bio ?? undefined,
    favoriteCategories: updatedUser.favorite_categories
      ? updatedUser.favorite_categories.split(',').map(category => category.trim()).filter(Boolean)
      : undefined,
    profileImageUrl: imageUrl,
  });
});

export default router;
