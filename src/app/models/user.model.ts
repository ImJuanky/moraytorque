// src/app/models/user.model.ts
export interface User {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}