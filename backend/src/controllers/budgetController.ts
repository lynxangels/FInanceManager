// controllers/budgetController.ts
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

export class BudgetController {
  // Create new budget
  static async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id_kategori, jumlah_anggaran, bulan, tahun } = req.body;
      const id_pengguna = req.user!.id_pengguna;

      // Validation
      if (!id_kategori || !jumlah_anggaran || !bulan || !tahun) {
        return res.status(400).json({
          success: false,
          message: 'Semua field wajib diisi'
        });
      }

      if (bulan < 1 || bulan > 12) {
        return res.status(400).json({
          success: false,
          message: 'Bulan harus antara 1-12'
        });
      }

      if (jumlah_anggaran <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah anggaran harus lebih dari 0'
        });
      }

      // Check if category exists
      const category = await prisma.categories.findUnique({
        where: { id_kategori: parseInt(id_kategori) }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan'
        });
      }

      // Create budget
      const budget = await prisma.budgets.create({
        data: {
          id_pengguna,
          id_kategori: parseInt(id_kategori),
          jumlah_anggaran: parseFloat(jumlah_anggaran),
          bulan: parseInt(bulan),
          tahun: parseInt(tahun)
        },
        include: {
          category: true
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Budget berhasil dibuat',
        data: budget
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Budget untuk kategori, bulan, dan tahun ini sudah ada'
        });
      }

      console.error('Error creating budget:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat membuat budget'
      });
    }
  }

  // Get all budgets for current user
  static async getAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { bulan, tahun, id_kategori } = req.query;

      const where: any = { id_pengguna };

      if (bulan) where.bulan = parseInt(bulan as string);
      if (tahun) where.tahun = parseInt(tahun as string);
      if (id_kategori) where.id_kategori = parseInt(id_kategori as string);

      const budgets = await prisma.budgets.findMany({
        where,
        include: {
          category: true
        },
        orderBy: [
          { tahun: 'desc' },
          { bulan: 'desc' }
        ]
      });

      return res.status(200).json({
        success: true,
        data: budgets
      });
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data budget'
      });
    }
  }

  // Get budget by ID
  static async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const id_pengguna = req.user!.id_pengguna;

      const budget = await prisma.budgets.findFirst({
        where: {
          id_anggaran: parseInt(id),
          id_pengguna
        },
        include: {
          category: true,
          user: {
            select: {
              id_pengguna: true,
              nama: true,
              email: true
            }
          }
        }
      });

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: 'Budget tidak ditemukan'
        });
      }

      // Get total expenses for this budget
      const totalExpenses = await prisma.expenses.aggregate({
        where: {
          id_pengguna,
          id_kategori: budget.id_kategori,
          tanggal: {
            gte: new Date(budget.tahun, budget.bulan - 1, 1),
            lt: new Date(budget.tahun, budget.bulan, 1)
          }
        },
        _sum: {
          jumlah: true
        }
      });

      const budgetWithStats = {
        ...budget,
        total_pengeluaran: totalExpenses._sum.jumlah || 0,
        sisa_anggaran: parseFloat(budget.jumlah_anggaran.toString()) - parseFloat(totalExpenses._sum.jumlah?.toString() || '0'),
        persentase_terpakai: totalExpenses._sum.jumlah 
          ? (parseFloat(totalExpenses._sum.jumlah.toString()) / parseFloat(budget.jumlah_anggaran.toString())) * 100 
          : 0
      };

      return res.status(200).json({
        success: true,
        data: budgetWithStats
      });
    } catch (error) {
      console.error('Error fetching budget:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data budget'
      });
    }
  }

  // Update budget
  static async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { jumlah_anggaran, bulan, tahun } = req.body;
      const id_pengguna = req.user!.id_pengguna;

      // Check if budget exists and belongs to user
      const existingBudget = await prisma.budgets.findFirst({
        where: {
          id_anggaran: parseInt(id),
          id_pengguna
        }
      });

      if (!existingBudget) {
        return res.status(404).json({
          success: false,
          message: 'Budget tidak ditemukan'
        });
      }

      // Validation
      if (jumlah_anggaran && jumlah_anggaran <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah anggaran harus lebih dari 0'
        });
      }

      if (bulan && (bulan < 1 || bulan > 12)) {
        return res.status(400).json({
          success: false,
          message: 'Bulan harus antara 1-12'
        });
      }

      const updateData: any = {};
      if (jumlah_anggaran) updateData.jumlah_anggaran = parseFloat(jumlah_anggaran);
      if (bulan) updateData.bulan = parseInt(bulan);
      if (tahun) updateData.tahun = parseInt(tahun);

      const budget = await prisma.budgets.update({
        where: { id_anggaran: parseInt(id) },
        data: updateData,
        include: {
          category: true
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Budget berhasil diupdate',
        data: budget
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Budget untuk kategori, bulan, dan tahun ini sudah ada'
        });
      }

      console.error('Error updating budget:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate budget'
      });
    }
  }

  // Delete budget
  static async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const id_pengguna = req.user!.id_pengguna;

      // Check if budget exists and belongs to user
      const existingBudget = await prisma.budgets.findFirst({
        where: {
          id_anggaran: parseInt(id),
          id_pengguna
        }
      });

      if (!existingBudget) {
        return res.status(404).json({
          success: false,
          message: 'Budget tidak ditemukan'
        });
      }

      await prisma.budgets.delete({
        where: { id_anggaran: parseInt(id) }
      });

      return res.status(200).json({
        success: true,
        message: 'Budget berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting budget:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus budget'
      });
    }
  }

  // Get budget summary
  static async getSummary(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { bulan, tahun } = req.query;

      if (!bulan || !tahun) {
        return res.status(400).json({
          success: false,
          message: 'Bulan dan tahun harus diisi'
        });
      }

      const budgets = await prisma.budgets.findMany({
        where: {
          id_pengguna,
          bulan: parseInt(bulan as string),
          tahun: parseInt(tahun as string)
        },
        include: {
          category: true
        }
      });

      // Get expenses for each budget
      const budgetSummary = await Promise.all(
        budgets.map(async (budget) => {
          const expenses = await prisma.expenses.aggregate({
            where: {
              id_pengguna,
              id_kategori: budget.id_kategori,
              tanggal: {
                gte: new Date(parseInt(tahun as string), parseInt(bulan as string) - 1, 1),
                lt: new Date(parseInt(tahun as string), parseInt(bulan as string), 1)
              }
            },
            _sum: {
              jumlah: true
            }
          });

          const totalExpenses = parseFloat(expenses._sum.jumlah?.toString() || '0');
          const budgetAmount = parseFloat(budget.jumlah_anggaran.toString());
          const remaining = budgetAmount - totalExpenses;
          const percentage = (totalExpenses / budgetAmount) * 100;

          return {
            id_anggaran: budget.id_anggaran,
            kategori: budget.category.nama_kategori,
            jumlah_anggaran: budgetAmount,
            total_pengeluaran: totalExpenses,
            sisa_anggaran: remaining,
            persentase_terpakai: percentage,
            status: percentage > 100 ? 'over_budget' : percentage > 80 ? 'warning' : 'safe'
          };
        })
      );

      const totalBudget = budgetSummary.reduce((sum, b) => sum + b.jumlah_anggaran, 0);
      const totalSpent = budgetSummary.reduce((sum, b) => sum + b.total_pengeluaran, 0);
      const totalRemaining = budgetSummary.reduce((sum, b) => sum + b.sisa_anggaran, 0);

      return res.status(200).json({
        success: true,
        data: {
          bulan: parseInt(bulan as string),
          tahun: parseInt(tahun as string),
          total_anggaran: totalBudget,
          total_pengeluaran: totalSpent,
          total_sisa: totalRemaining,
          persentase_total: (totalSpent / totalBudget) * 100,
          detail_per_kategori: budgetSummary
        }
      });
    } catch (error) {
      console.error('Error fetching budget summary:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil ringkasan budget'
      });
    }
  }
}