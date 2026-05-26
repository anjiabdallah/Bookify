import type { ReactNode } from 'react';
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

export type ProfileFormData = {
  age?: string;
  bio?: string;
  favoriteCategories?: string[];
};
