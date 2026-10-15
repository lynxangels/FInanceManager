// controllers/expenseController.ts
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

export class ExpenseController {
  // Create new expense
  static async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id_kategori, id_metode, id_mata_uang, jumlah, tanggal } = req.body;
      const id_pengguna = req.user!.id_pengguna;

      // Validation
      if (!id_kategori || !id_metode || !id_mata_uang || !jumlah || !tanggal) {
        return res.status(400).json({
          success: false,
          message: 'Semua field wajib diisi'
        });
      }

      if (jumlah <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah harus lebih dari 0'
        });
      }

      // Verify related entities exist
      const [category, paymentMethod, currency] = await Promise.all([
        prisma.categories.findUnique({ where: { id_kategori: parseInt(id_kategori) } }),
        prisma.payment_methods.findUnique({ where: { id_metode: parseInt(id_metode) } }),
        prisma.currencies.findUnique({ where: { id_mata_uang: parseInt(id_mata_uang) } })
      ]);

      if (!category || !paymentMethod || !currency) {
        return res.status(404).json({
          success: false,
          message: 'Kategori, metode pembayaran, atau mata uang tidak ditemukan'
        });
      }

      // Create expense
      const expense = await prisma.expenses.create({
        data: {
          id_pengguna,
          id_kategori: parseInt(id_kategori),
          id_metode: parseInt(id_metode),
          id_mata_uang: parseInt(id_mata_uang),
          jumlah: parseFloat(jumlah),
          tanggal: new Date(tanggal)
        },
        include: {
          category: true,
          payment_method: true,
          currency: true
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Pengeluaran berhasil ditambahkan',
        data: expense
      });
    } catch (error) {
      console.error('Error creating expense:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menambahkan pengeluaran'
      });
    }
  }

  // Get all expenses for current user
  static async getAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { 
        id_kategori, 
        id_metode, 
        start_date, 
        end_date, 
        limit = '50', 
        offset = '0',
        sort_by = 'tanggal',
        sort_order = 'desc'
      } = req.query;

      const where: any = { id_pengguna };

      if (id_kategori) where.id_kategori = parseInt(id_kategori as string);
      if (id_metode) where.id_metode = parseInt(id_metode as string);
      
      if (start_date || end_date) {
        where.tanggal = {};
        if (start_date) where.tanggal.gte = new Date(start_date as string);
        if (end_date) where.tanggal.lte = new Date(end_date as string);
      }

      const [expenses, total] = await Promise.all([
        prisma.expenses.findMany({
          where,
          include: {
            category: true,
            payment_method: true,
            currency: true
          },
          orderBy: { [sort_by as string]: sort_order },
          take: parseInt(limit as string),
          skip: parseInt(offset as string)
        }),
        prisma.expenses.count({ where })
      ]);

      return res.status(200).json({
        success: true,
        data: expenses,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total_pages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data pengeluaran'
      });
    }
  }

  // Get expense by ID
  static async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const id_pengguna = req.user!.id_pengguna;

      const expense = await prisma.expenses.findFirst({
        where: {
          id_pengeluaran: parseInt(id),
          id_pengguna
        },
        include: {
          category: true,
          payment_method: true,
          currency: true,
          user: {
            select: {
              id_pengguna: true,
              nama: true,
              email: true
            }
          }
        }
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Pengeluaran tidak ditemukan'
        });
      }

      return res.status(200).json({
        success: true,
        data: expense
      });
    } catch (error) {
      console.error('Error fetching expense:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data pengeluaran'
      });
    }
  }

  // Update expense
  static async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { id_kategori, id_metode, id_mata_uang, jumlah, tanggal } = req.body;
      const id_pengguna = req.user!.id_pengguna;

      // Check if expense exists and belongs to user
      const existingExpense = await prisma.expenses.findFirst({
        where: {
          id_pengeluaran: parseInt(id),
          id_pengguna
        }
      });

      if (!existingExpense) {
        return res.status(404).json({
          success: false,
          message: 'Pengeluaran tidak ditemukan'
        });
      }

      // Validation
      if (jumlah && jumlah <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah harus lebih dari 0'
        });
      }

      const updateData: any = {};
      if (id_kategori) updateData.id_kategori = parseInt(id_kategori);
      if (id_metode) updateData.id_metode = parseInt(id_metode);
      if (id_mata_uang) updateData.id_mata_uang = parseInt(id_mata_uang);
      if (jumlah) updateData.jumlah = parseFloat(jumlah);
      if (tanggal) updateData.tanggal = new Date(tanggal);

      const expense = await prisma.expenses.update({
        where: { id_pengeluaran: parseInt(id) },
        data: updateData,
        include: {
          category: true,
          payment_method: true,
          currency: true
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Pengeluaran berhasil diupdate',
        data: expense
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate pengeluaran'
      });
    }
  }

  // Delete expense
  static async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const id_pengguna = req.user!.id_pengguna;

      // Check if expense exists and belongs to user
      const existingExpense = await prisma.expenses.findFirst({
        where: {
          id_pengeluaran: parseInt(id),
          id_pengguna
        }
      });

      if (!existingExpense) {
        return res.status(404).json({
          success: false,
          message: 'Pengeluaran tidak ditemukan'
        });
      }

      await prisma.expenses.delete({
        where: { id_pengeluaran: parseInt(id) }
      });

      return res.status(200).json({
        success: true,
        message: 'Pengeluaran berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus pengeluaran'
      });
    }
  }

  // Get expense statistics
  static async getStatistics(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { start_date, end_date, group_by = 'category' } = req.query;

      const where: any = { id_pengguna };

      if (start_date || end_date) {
        where.tanggal = {};
        if (start_date) where.tanggal.gte = new Date(start_date as string);
        if (end_date) where.tanggal.lte = new Date(end_date as string);
      }

      // Total expenses
      const totalExpenses = await prisma.expenses.aggregate({
        where,
        _sum: { jumlah: true },
        _count: true,
        _avg: { jumlah: true }
      });

      // Group by category
      const expensesByCategory = await prisma.expenses.groupBy({
        by: ['id_kategori'],
        where,
        _sum: { jumlah: true },
        _count: true
      });

      const categoryDetails = await Promise.all(
        expensesByCategory.map(async (item) => {
          const category = await prisma.categories.findUnique({
            where: { id_kategori: item.id_kategori }
          });
          return {
            kategori: category?.nama_kategori,
            total: item._sum.jumlah,
            jumlah_transaksi: item._count,
            persentase: totalExpenses._sum.jumlah 
              ? (parseFloat(item._sum.jumlah?.toString() || '0') / parseFloat(totalExpenses._sum.jumlah?.toString() || '1')) * 100 
              : 0
          };
        })
      );

      // Group by payment method
      const expensesByMethod = await prisma.expenses.groupBy({
        by: ['id_metode'],
        where,
        _sum: { jumlah: true },
        _count: true
      });

      const methodDetails = await Promise.all(
        expensesByMethod.map(async (item) => {
          const method = await prisma.payment_methods.findUnique({
            where: { id_metode: item.id_metode }
          });
          return {
            metode: method?.nama_metode,
            total: item._sum.jumlah,
            jumlah_transaksi: item._count
          };
        })
      );

      // Monthly trend (if date range spans multiple months)
      const monthlyExpenses = await prisma.$queryRaw<Array<{month: number, year: number, total: number}>>`
        SELECT 
          MONTH(tanggal) as month,
          YEAR(tanggal) as year,
          SUM(jumlah) as total
        FROM expenses
        WHERE id_pengguna = ${id_pengguna}
        ${start_date ? prisma.$queryRaw`AND tanggal >= ${new Date(start_date as string)}` : prisma.$queryRaw``}
        ${end_date ? prisma.$queryRaw`AND tanggal <= ${new Date(end_date as string)}` : prisma.$queryRaw``}
        GROUP BY YEAR(tanggal), MONTH(tanggal)
        ORDER BY YEAR(tanggal), MONTH(tanggal)
      `;

      return res.status(200).json({
        success: true,
        data: {
          ringkasan: {
            total_pengeluaran: totalExpenses._sum.jumlah || 0,
            jumlah_transaksi: totalExpenses._count,
            rata_rata_per_transaksi: totalExpenses._avg.jumlah || 0
          },
          per_kategori: categoryDetails,
          per_metode_pembayaran: methodDetails,
          tren_bulanan: monthlyExpenses
        }
      });
    } catch (error) {
      console.error('Error fetching expense statistics:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil statistik pengeluaran'
      });
    }
  }

  // Get recent expenses
  static async getRecent(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { limit = '10' } = req.query;

      const expenses = await prisma.expenses.findMany({
        where: { id_pengguna },
        include: {
          category: true,
          payment_method: true,
          currency: true
        },
        orderBy: { created_at: 'desc' },
        take: parseInt(limit as string)
      });

      return res.status(200).json({
        success: true,
        data: expenses
      });
    } catch (error) {
      console.error('Error fetching recent expenses:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil pengeluaran terbaru'
      });
    }
  }
}