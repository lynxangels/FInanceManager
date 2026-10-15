// controllers/authController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface AuthRequest extends Request {
  user?: {
    id_pengguna: number;
    email: string;
    role: string;
  };
}

export class AuthController {
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const { nama, email, kata_sandi } = req.body;

      if (!nama || !email || !kata_sandi) {
        return res.status(400).json({
          success: false,
          message: 'Nama, email, dan kata sandi wajib diisi'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Format email tidak valid'
        });
      }

      // Password strength validation
      if (kata_sandi.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Kata sandi minimal 6 karakter'
        });
      }

      // Check if email already exists
      const existingUser = await prisma.users.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(kata_sandi, 10);

      // Create user
      const user = await prisma.users.create({
        data: {
          nama,
          email,
          kata_sandi: hashedPassword,
          tanggal_daftar: new Date(),
          status_akun: 'Aktif',
          role: 'user'
        },
        select: {
          id_pengguna: true,
          nama: true,
          email: true,
          tanggal_daftar: true,
          status_akun: true,
          role: true
        }
      });

      // Generate token
      const token = jwt.sign(
        { 
          id_pengguna: user.id_pengguna, 
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      console.error('Error registering user:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat registrasi'
      });
    }
  }

  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, kata_sandi } = req.body;

      if (!email || !kata_sandi) {
        return res.status(400).json({
          success: false,
          message: 'Email dan kata sandi wajib diisi'
        });
      }

      // Find user
      const user = await prisma.users.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email atau kata sandi salah'
        });
      }

      // Check if account is active
      if (user.status_akun !== 'Aktif') {
        return res.status(403).json({
          success: false,
          message: 'Akun Anda tidak aktif. Silakan hubungi administrator'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(kata_sandi, user.kata_sandi);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email atau kata sandi salah'
        });
      }

      // Generate token
      const token = jwt.sign(
        { 
          id_pengguna: user.id_pengguna, 
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Login berhasil',
        data: {
          user: {
            id_pengguna: user.id_pengguna,
            nama: user.nama,
            email: user.email,
            role: user.role,
            status_akun: user.status_akun
          },
          token
        }
      });
    } catch (error) {
      console.error('Error logging in:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat login'
      });
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return res.json({
      success: true,
      message: 'Logout berhasil'
    });
  }


  static async getProfile(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;

      const user = await prisma.users.findUnique({
        where: { id_pengguna },
        select: {
          id_pengguna: true,
          nama: true,
          email: true,
          tanggal_daftar: true,
          status_akun: true,
          role: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil profil'
      });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { nama, email } = req.body;

      const updateData: any = {};
      if (nama) updateData.nama = nama;
      if (email) {
        // Check if new email is already used
        const existingUser = await prisma.users.findFirst({
          where: {
            email,
            NOT: { id_pengguna }
          }
        });

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Email sudah digunakan'
          });
        }
        updateData.email = email;
      }

      const user = await prisma.users.update({
        where: { id_pengguna },
        data: updateData,
        select: {
          id_pengguna: true,
          nama: true,
          email: true,
          tanggal_daftar: true,
          status_akun: true,
          role: true
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Profil berhasil diupdate',
        data: user
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate profil'
      });
    }
  }

  static async changePassword(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { kata_sandi_lama, kata_sandi_baru } = req.body;

      if (!kata_sandi_lama || !kata_sandi_baru) {
        return res.status(400).json({
          success: false,
          message: 'Kata sandi lama dan baru wajib diisi'
        });
      }

      if (kata_sandi_baru.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Kata sandi baru minimal 6 karakter'
        });
      }

      const user = await prisma.users.findUnique({
        where: { id_pengguna }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Verify old password
      const isPasswordValid = await bcrypt.compare(kata_sandi_lama, user.kata_sandi);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Kata sandi lama tidak sesuai'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(kata_sandi_baru, 10);

      await prisma.users.update({
        where: { id_pengguna },
        data: { kata_sandi: hashedPassword }
      });

      return res.status(200).json({
        success: true,
        message: 'Kata sandi berhasil diubah'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengubah kata sandi'
      });
    }
  }
}

// ==================== FINANCIAL GOAL CONTROLLER ====================
export class FinancialGoalController {
  static async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { nama_tujuan, total_target, tanggal_target } = req.body;
      const id_pengguna = req.user!.id_pengguna;

      if (!nama_tujuan || !total_target || !tanggal_target) {
        return res.status(400).json({
          success: false,
          message: 'Semua field wajib diisi'
        });
      }

      if (total_target <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Total target harus lebih dari 0'
        });
      }

      const goal = await prisma.financial_goals.create({
        data: {
          id_pengguna,
          nama_tujuan,
          total_target: parseFloat(total_target),
          tanggal_target: new Date(tanggal_target),
          status: 'Belum_Tercapai'
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Tujuan finansial berhasil dibuat',
        data: goal
      });
    } catch (error) {
      console.error('Error creating financial goal:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat membuat tujuan finansial'
      });
    }
  }

  static async getAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { status } = req.query;

      const where: any = { id_pengguna };
      if (status) where.status = status;

      const goals = await prisma.financial_goals.findMany({
        where,
        orderBy: { tanggal_target: 'asc' }
      });

      // Calculate progress for each goal
      const totalIncome = await prisma.incomes.aggregate({
        where: { id_pengguna },
        _sum: { jumlah: true }
      });

      const totalExpense = await prisma.expenses.aggregate({
        where: { id_pengguna },
        _sum: { jumlah: true }
      });

      const currentSavings = (parseFloat(totalIncome._sum.jumlah?.toString() || '0') - 
                             parseFloat(totalExpense._sum.jumlah?.toString() || '0'));

      const goalsWithProgress = goals.map(goal => ({
        ...goal,
        tabungan_saat_ini: currentSavings,
        progress_persentase: (currentSavings / parseFloat(goal.total_target.toString())) * 100,
        sisa_target: parseFloat(goal.total_target.toString()) - currentSavings
      }));

      return res.status(200).json({
        success: true,
        data: goalsWithProgress
      });
    } catch (error) {
      console.error('Error fetching financial goals:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil tujuan finansial'
      });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const id_pengguna = req.user!.id_pengguna;

      const goal = await prisma.financial_goals.findFirst({
        where: {
          id_tujuan: parseInt(id),
          id_pengguna
        }
      });

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Tujuan finansial tidak ditemukan'
        });
      }

      return res.status(200).json({
        success: true,
        data: goal
      });
    } catch (error) {
      console.error('Error fetching financial goal:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil tujuan finansial'
      });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nama_tujuan, total_target, tanggal_target, status } = req.body;
      const id_pengguna = req.user!.id_pengguna;

      const existingGoal = await prisma.financial_goals.findFirst({
        where: {
          id_tujuan: parseInt(id),
          id_pengguna
        }
      });

      if (!existingGoal) {
        return res.status(404).json({
          success: false,
          message: 'Tujuan finansial tidak ditemukan'
        });
      }

      const updateData: any = {};
      if (nama_tujuan) updateData.nama_tujuan = nama_tujuan;
      if (total_target) updateData.total_target = parseFloat(total_target);
      if (tanggal_target) updateData.tanggal_target = new Date(tanggal_target);
      if (status) updateData.status = status;

      const goal = await prisma.financial_goals.update({
        where: { id_tujuan: parseInt(id) },
        data: updateData
      });

      return res.status(200).json({
        success: true,
        message: 'Tujuan finansial berhasil diupdate',
        data: goal
      });
    } catch (error) {
      console.error('Error updating financial goal:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate tujuan finansial'
      });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const id_pengguna = req.user!.id_pengguna;

      const existingGoal = await prisma.financial_goals.findFirst({
        where: {
          id_tujuan: parseInt(id),
          id_pengguna
        }
      });

      if (!existingGoal) {
        return res.status(404).json({
          success: false,
          message: 'Tujuan finansial tidak ditemukan'
        });
      }

      await prisma.financial_goals.delete({
        where: { id_tujuan: parseInt(id) }
      });

      return res.status(200).json({
        success: true,
        message: 'Tujuan finansial berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting financial goal:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus tujuan finansial'
      });
    }
  }
}