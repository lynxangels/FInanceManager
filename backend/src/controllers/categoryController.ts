// controllers/categoryController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id_pengguna: number;
    email: string;
    role: string;
  };
}

// ==================== CATEGORY CONTROLLER ====================
export class CategoryController {
  static async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { nama_kategori, tipe_kategori } = req.body;

      if (!nama_kategori || !tipe_kategori) {
        return res.status(400).json({
          success: false,
          message: 'Nama kategori dan tipe kategori wajib diisi'
        });
      }

      if (!['Manual', 'Dinamis'].includes(tipe_kategori)) {
        return res.status(400).json({
          success: false,
          message: 'Tipe kategori harus Manual atau Dinamis'
        });
      }

      const category = await prisma.categories.create({
        data: {
          nama_kategori,
          tipe_kategori
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Kategori berhasil dibuat',
        data: category
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Nama kategori sudah ada'
        });
      }

      console.error('Error creating category:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat membuat kategori'
      });
    }
  }

  static async getAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { tipe_kategori } = req.query;

      const where: any = {};
      if (tipe_kategori) where.tipe_kategori = tipe_kategori;

      const categories = await prisma.categories.findMany({
        where,
        orderBy: { nama_kategori: 'asc' }
      });

      return res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data kategori'
      });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const category = await prisma.categories.findUnique({
        where: { id_kategori: parseInt(id) },
        include: {
          _count: {
            select: {
              budgets: true,
              expenses: true
            }
          }
        }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan'
        });
      }

      return res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data kategori'
      });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nama_kategori, tipe_kategori } = req.body;

      const existingCategory = await prisma.categories.findUnique({
        where: { id_kategori: parseInt(id) }
      });

      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan'
        });
      }

      const updateData: any = {};
      if (nama_kategori) updateData.nama_kategori = nama_kategori;
      if (tipe_kategori) {
        if (!['Manual', 'Dinamis'].includes(tipe_kategori)) {
          return res.status(400).json({
            success: false,
            message: 'Tipe kategori harus Manual atau Dinamis'
          });
        }
        updateData.tipe_kategori = tipe_kategori;
      }

      const category = await prisma.categories.update({
        where: { id_kategori: parseInt(id) },
        data: updateData
      });

      return res.status(200).json({
        success: true,
        message: 'Kategori berhasil diupdate',
        data: category
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Nama kategori sudah ada'
        });
      }

      console.error('Error updating category:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate kategori'
      });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const existingCategory = await prisma.categories.findUnique({
        where: { id_kategori: parseInt(id) },
        include: {
          _count: {
            select: {
              budgets: true,
              expenses: true
            }
          }
        }
      });

      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan'
        });
      }

      // Check if category is being used
      if (existingCategory._count.budgets > 0 || existingCategory._count.expenses > 0) {
        return res.status(400).json({
          success: false,
          message: 'Kategori tidak dapat dihapus karena masih digunakan dalam budget atau pengeluaran'
        });
      }

      await prisma.categories.delete({
        where: { id_kategori: parseInt(id) }
      });

      return res.status(200).json({
        success: true,
        message: 'Kategori berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus kategori'
      });
    }
  }
}

// ==================== PAYMENT METHOD CONTROLLER ====================
export class PaymentMethodController {
  static async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { nama_metode } = req.body;

      if (!nama_metode) {
        return res.status(400).json({
          success: false,
          message: 'Nama metode pembayaran wajib diisi'
        });
      }

      const paymentMethod = await prisma.payment_methods.create({
        data: { nama_metode }
      });

      return res.status(201).json({
        success: true,
        message: 'Metode pembayaran berhasil dibuat',
        data: paymentMethod
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Nama metode pembayaran sudah ada'
        });
      }

      console.error('Error creating payment method:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat membuat metode pembayaran'
      });
    }
  }

  static async getAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const paymentMethods = await prisma.payment_methods.findMany({
        orderBy: { nama_metode: 'asc' }
      });

      return res.status(200).json({
        success: true,
        data: paymentMethods
      });
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data metode pembayaran'
      });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const paymentMethod = await prisma.payment_methods.findUnique({
        where: { id_metode: parseInt(id) },
        include: {
          _count: {
            select: {
              expenses: true,
              incomes: true
            }
          }
        }
      });

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Metode pembayaran tidak ditemukan'
        });
      }

      return res.status(200).json({
        success: true,
        data: paymentMethod
      });
    } catch (error) {
      console.error('Error fetching payment method:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data metode pembayaran'
      });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nama_metode } = req.body;

      const existingMethod = await prisma.payment_methods.findUnique({
        where: { id_metode: parseInt(id) }
      });

      if (!existingMethod) {
        return res.status(404).json({
          success: false,
          message: 'Metode pembayaran tidak ditemukan'
        });
      }

      if (!nama_metode) {
        return res.status(400).json({
          success: false,
          message: 'Nama metode pembayaran wajib diisi'
        });
      }

      const paymentMethod = await prisma.payment_methods.update({
        where: { id_metode: parseInt(id) },
        data: { nama_metode }
      });

      return res.status(200).json({
        success: true,
        message: 'Metode pembayaran berhasil diupdate',
        data: paymentMethod
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Nama metode pembayaran sudah ada'
        });
      }

      console.error('Error updating payment method:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate metode pembayaran'
      });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const existingMethod = await prisma.payment_methods.findUnique({
        where: { id_metode: parseInt(id) },
        include: {
          _count: {
            select: {
              expenses: true,
              incomes: true
            }
          }
        }
      });

      if (!existingMethod) {
        return res.status(404).json({
          success: false,
          message: 'Metode pembayaran tidak ditemukan'
        });
      }

      // Check if payment method is being used
      if (existingMethod._count.expenses > 0 || existingMethod._count.incomes > 0) {
        return res.status(400).json({
          success: false,
          message: 'Metode pembayaran tidak dapat dihapus karena masih digunakan'
        });
      }

      await prisma.payment_methods.delete({
        where: { id_metode: parseInt(id) }
      });

      return res.status(200).json({
        success: true,
        message: 'Metode pembayaran berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus metode pembayaran'
      });
    }
  }
}

// ==================== CURRENCY CONTROLLER ====================
export class CurrencyController {
  static async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { kode_mata_uang, nama_mata_uang, nilai_tukar } = req.body;

      if (!kode_mata_uang || !nama_mata_uang) {
        return res.status(400).json({
          success: false,
          message: 'Kode dan nama mata uang wajib diisi'
        });
      }

      const currency = await prisma.currencies.create({
        data: {
          kode_mata_uang: kode_mata_uang.toUpperCase(),
          nama_mata_uang,
          nilai_tukar: nilai_tukar ? parseFloat(nilai_tukar) : null
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Mata uang berhasil dibuat',
        data: currency
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Kode mata uang sudah ada'
        });
      }

      console.error('Error creating currency:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat membuat mata uang'
      });
    }
  }

  static async getAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const currencies = await prisma.currencies.findMany({
        orderBy: { kode_mata_uang: 'asc' }
      });

      return res.status(200).json({
        success: true,
        data: currencies
      });
    } catch (error) {
      console.error('Error fetching currencies:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data mata uang'
      });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const currency = await prisma.currencies.findUnique({
        where: { id_mata_uang: parseInt(id) },
        include: {
          _count: {
            select: {
              expenses: true,
              incomes: true
            }
          }
        }
      });

      if (!currency) {
        return res.status(404).json({
          success: false,
          message: 'Mata uang tidak ditemukan'
        });
      }

      return res.status(200).json({
        success: true,
        data: currency
      });
    } catch (error) {
      console.error('Error fetching currency:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data mata uang'
      });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { kode_mata_uang, nama_mata_uang, nilai_tukar } = req.body;

      const existingCurrency = await prisma.currencies.findUnique({
        where: { id_mata_uang: parseInt(id) }
      });

      if (!existingCurrency) {
        return res.status(404).json({
          success: false,
          message: 'Mata uang tidak ditemukan'
        });
      }

      const updateData: any = {};
      if (kode_mata_uang) updateData.kode_mata_uang = kode_mata_uang.toUpperCase();
      if (nama_mata_uang) updateData.nama_mata_uang = nama_mata_uang;
      if (nilai_tukar !== undefined) updateData.nilai_tukar = nilai_tukar ? parseFloat(nilai_tukar) : null;

      const currency = await prisma.currencies.update({
        where: { id_mata_uang: parseInt(id) },
        data: updateData
      });

      return res.status(200).json({
        success: true,
        message: 'Mata uang berhasil diupdate',
        data: currency
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Kode mata uang sudah ada'
        });
      }

      console.error('Error updating currency:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate mata uang'
      });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const existingCurrency = await prisma.currencies.findUnique({
        where: { id_mata_uang: parseInt(id) },
        include: {
          _count: {
            select: {
              expenses: true,
              incomes: true
            }
          }
        }
      });

      if (!existingCurrency) {
        return res.status(404).json({
          success: false,
          message: 'Mata uang tidak ditemukan'
        });
      }

      // Check if currency is being used
      if (existingCurrency._count.expenses > 0 || existingCurrency._count.incomes > 0) {
        return res.status(400).json({
          success: false,
          message: 'Mata uang tidak dapat dihapus karena masih digunakan'
        });
      }

      await prisma.currencies.delete({
        where: { id_mata_uang: parseInt(id) }
      });

      return res.status(200).json({
        success: true,
        message: 'Mata uang berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting currency:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus mata uang'
      });
    }
  }
}