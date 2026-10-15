import { Request } from 'express';

export interface JwtPayload {
  id_pengguna: number;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface RegisterDto {
  nama: string;
  email: string;
  kata_sandi: string;
}

export interface LoginDto {
  email: string;
  kata_sandi: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}