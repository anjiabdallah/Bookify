import type { ReactNode } from 'react';
import { z } from 'zod';
import {
  BookOpen,
  BookMarked,
  Heart,
  Landmark,
  Rocket,
  Search,
  Wand2,
  Zap,
} from 'lucide-react';

export const categories = [
  'Fantasy',
  'Romance',
  'Mystery',
  'Science Fiction',
  'Historical',
  'Thriller',
  'Young Adult',
  'Nonfiction',
] as const;

export const categoryIcons: Record<string, ReactNode> = {
  Fantasy: <Wand2 size={20} />,
  Romance: <Heart size={20} />,
  Mystery: <Search size={20} />,
  'Science Fiction': <Rocket size={20} />,
  Historical: <Landmark size={20} />,
  Thriller: <Zap size={20} />,
  'Young Adult': <BookOpen size={20} />,
  Nonfiction: <BookMarked size={20} />,
};

const profileCoreSchema = z.object({
  bio: z.string().max(500).optional(),
  favoriteCategories: z.array(z.string()).optional(),
});

export const profileFormSchema = profileCoreSchema.extend({
  age: z.string().optional().refine(
    (value) => {
      if (value === undefined || value.trim() === '') {
        return true;
      }

      const numberValue = Number(value);
      return (
        Number.isInteger(numberValue)
        && numberValue >= 13
        && numberValue <= 120
      );
    },
    { message: 'Age must be a whole number between 13 and 120.' },
  ),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
