import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { JwtPayload } from "../types";

export class JwtHelper {
  private static SECRET = process.env.JWT_SECRET || "your-secret-key";
  private static EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || "7d";

  /**
   * Generate JWT token
   */
  static generateToken(payload: JwtPayload): string {
    const options: SignOptions = {
      expiresIn: this.EXPIRES_IN as any,
    };

    return jwt.sign(payload, this.SECRET, options);
  }

  /**
   * Verify token
   */
  static verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.SECRET) as JwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * Decode without verify
   */
  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }
}
