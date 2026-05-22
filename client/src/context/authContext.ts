import { createContext, useContext } from 'react';

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  logout: () => void;
  setAuth: (user: User, token: string) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
