import { UserRole } from "./user";

export interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  imageUrl: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  gender?: string;
  dob?: string;
  phone?: string;
  role?: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
