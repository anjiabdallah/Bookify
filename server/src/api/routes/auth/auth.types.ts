export type RegisterResponse = {
  user: { id: number; email: string; username: string };
  token: string;
};

export type LoginResponse = {
  user: { id: number; email: string; username: string };
  token: string;
};

export type ProfileResponse = {
  id: number;
  email: string;
  username: string;
  age: number | null;
  bio?: string;
  favoriteCategories?: string[];
  profileImageUrl?: string;
};
