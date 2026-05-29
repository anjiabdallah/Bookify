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

import type { LucideIcon } from 'lucide-react';

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

export const categoryIcons: Record<string, LucideIcon> = {
  'Fantasy': Wand2,
  'Romance': Heart,
  'Mystery': Search,
  'Science Fiction': Rocket,
  'Historical': Landmark,
  'Thriller': Zap,
  'Young Adult': BookOpen,
  'Nonfiction': BookMarked,
};
