export type RegisterResponse = {
  user: { id: number; email: string; username: string };
  token: string;
};

export type LoginResponse = {
  user: { id: number; email: string; username: string };
  token: string;
};
