import { Response, NextFunction } from 'express';
import { JwtHelper } from '../helpers';
import { AuthRequest, ApiResponse } from '../types';

export class AuthMiddleware {
  static async verifyToken(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      let token: string | undefined;

      // 🔥 1. Ambil dari Cookie
      token = req.cookies?.token;

      // 🔥 2. Kalau tidak ada, ambil dari Authorization Header
      if (!token) {
        const authorization = req.headers.authorization;
        if (authorization?.startsWith("Bearer ")) {
          token = authorization.substring(7);
        }
      }

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Token tidak ditemukan',
        } as ApiResponse);
        return;
      }

      // 🔥 3. Verifikasi Token
      const decoded = JwtHelper.verifyToken(token);

      if (!decoded) {
        res.status(401).json({
          success: false,
          message: 'Token tidak valid atau sudah expired',
        } as ApiResponse);
        return;
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({
        success: false,
        message: 'Token tidak valid',
      });
    }
  }

  static async verifyAdmin(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
      return;
    }
    next();
  }
}
