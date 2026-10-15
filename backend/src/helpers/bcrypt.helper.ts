import bcrypt from 'bcryptjs';

export class BcryptHelper {
  /**
   * Hash password menggunakan bcrypt
   * @param password - Password yang akan di-hash
   * @returns Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Membandingkan password dengan hash
   * @param password - Password plain text
   * @param hashedPassword - Password yang sudah di-hash
   * @returns True jika password cocok
   */
  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}