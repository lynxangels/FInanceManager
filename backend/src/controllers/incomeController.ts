// controllers/incomeController.ts
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

// ==================== INCOME CONTROLLER ====================
export class IncomeController {
  static async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id_metode, id_mata_uang, jumlah, sumber, tanggal } = req.body;
      const id_pengguna = req.user!.id_pengguna;

      if (!id_metode || !id_mata_uang || !jumlah || !tanggal) {
        return res.status(400).json({
          success: false,
          message: 'Field wajib harus diisi'
        });
      }

      if (jumlah <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah harus lebih dari 0'
        });
      }

      const income = await prisma.incomes.create({
        data: {
          id_pengguna,
          id_metode: parseInt(id_metode),
          id_mata_uang: parseInt(id_mata_uang),
          jumlah: parseFloat(jumlah),
          sumber,
          tanggal: new Date(tanggal)
        },
        include: {
          payment_method: true,
          currency: true
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Pemasukan berhasil ditambahkan',
        data: income
      });
    } catch (error) {
      console.error('Error creating income:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menambahkan pemasukan'
      });
    }
  }

  static async getAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { start_date, end_date, sumber, limit = '50', offset = '0' } = req.query;

      const where: any = { id_pengguna };

      if (sumber) {
        where.sumber = {
          contains: sumber as string
        };
      }

      if (start_date || end_date) {
        where.tanggal = {};
        if (start_date) where.tanggal.gte = new Date(start_date as string);
        if (end_date) where.tanggal.lte = new Date(end_date as string);
      }

      const [incomes, total] = await Promise.all([
        prisma.incomes.findMany({
          where,
          include: {
            payment_method: true,
            currency: true
          },
          orderBy: { tanggal: 'desc' },
          take: parseInt(limit as string),
          skip: parseInt(offset as string)
        }),
        prisma.incomes.count({ where })
      ]);

      return res.status(200).json({
        success: true,
        data: incomes,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total_pages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Error fetching incomes:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data pemasukan'
      });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const id_pengguna = req.user!.id_pengguna;

      const income = await prisma.incomes.findFirst({
        where: {
          id_pemasukan: parseInt(id),
          id_pengguna
        },
        include: {
          payment_method: true,
          currency: true
        }
      });

      if (!income) {
        return res.status(404).json({
          success: false,
          message: 'Pemasukan tidak ditemukan'
        });
      }

      return res.status(200).json({
        success: true,
        data: income
      });
    } catch (error) {
      console.error('Error fetching income:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data pemasukan'
      });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { id_metode, id_mata_uang, jumlah, sumber, tanggal } = req.body;
      const id_pengguna = req.user!.id_pengguna;

      const existingIncome = await prisma.incomes.findFirst({
        where: {
          id_pemasukan: parseInt(id),
          id_pengguna
        }
      });

      if (!existingIncome) {
        return res.status(404).json({
          success: false,
          message: 'Pemasukan tidak ditemukan'
        });
      }

      if (jumlah && jumlah <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah harus lebih dari 0'
        });
      }

      const updateData: any = {};
      if (id_metode) updateData.id_metode = parseInt(id_metode);
      if (id_mata_uang) updateData.id_mata_uang = parseInt(id_mata_uang);
      if (jumlah) updateData.jumlah = parseFloat(jumlah);
      if (sumber !== undefined) updateData.sumber = sumber;
      if (tanggal) updateData.tanggal = new Date(tanggal);

      const income = await prisma.incomes.update({
        where: { id_pemasukan: parseInt(id) },
        data: updateData,
        include: {
          payment_method: true,
          currency: true
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Pemasukan berhasil diupdate',
        data: income
      });
    } catch (error) {
      console.error('Error updating income:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate pemasukan'
      });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const id_pengguna = req.user!.id_pengguna;

      const existingIncome = await prisma.incomes.findFirst({
        where: {
          id_pemasukan: parseInt(id),
          id_pengguna
        }
      });

      if (!existingIncome) {
        return res.status(404).json({
          success: false,
          message: 'Pemasukan tidak ditemukan'
        });
      }

      await prisma.incomes.delete({
        where: { id_pemasukan: parseInt(id) }
      });

      return res.status(200).json({
        success: true,
        message: 'Pemasukan berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting income:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus pemasukan'
      });
    }
  }

  static async getStatistics(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { start_date, end_date } = req.query;

      const where: any = { id_pengguna };

      if (start_date || end_date) {
        where.tanggal = {};
        if (start_date) where.tanggal.gte = new Date(start_date as string);
        if (end_date) where.tanggal.lte = new Date(end_date as string);
      }

      const totalIncomes = await prisma.incomes.aggregate({
        where,
        _sum: { jumlah: true },
        _count: true,
        _avg: { jumlah: true }
      });

      const incomesBySource = await prisma.incomes.groupBy({
        by: ['sumber'],
        where,
        _sum: { jumlah: true },
        _count: true
      });

      return res.status(200).json({
        success: true,
        data: {
          total_pemasukan: totalIncomes._sum.jumlah || 0,
          jumlah_transaksi: totalIncomes._count,
          rata_rata_per_transaksi: totalIncomes._avg.jumlah || 0,
          per_sumber: incomesBySource.map(item => ({
            sumber: item.sumber || 'Tidak disebutkan',
            total: item._sum.jumlah,
            jumlah_transaksi: item._count
          }))
        }
      });
    } catch (error) {
      console.error('Error fetching income statistics:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil statistik pemasukan'
      });
    }
  }
}

// ==================== DEBT CONTROLLER ====================
export class DebtController {
  static async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { jumlah_utang, tanggal_tenggat, status_utang } = req.body;
      const id_pengguna = req.user!.id_pengguna;

      if (!jumlah_utang || !tanggal_tenggat) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah utang dan tanggal tenggat wajib diisi'
        });
      }

      if (jumlah_utang <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah utang harus lebih dari 0'
        });
      }

      const debt = await prisma.debts.create({
        data: {
          id_pengguna,
          jumlah_utang: parseFloat(jumlah_utang),
          tanggal_tenggat: new Date(tanggal_tenggat),
          status_utang: status_utang || 'Belum_Dibayar'
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Utang berhasil ditambahkan',
        data: debt
      });
    } catch (error) {
      console.error('Error creating debt:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menambahkan utang'
      });
    }
  }

  static async getAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { status_utang } = req.query;

      const where: any = { id_pengguna };
      if (status_utang) where.status_utang = status_utang;

      const debts = await prisma.debts.findMany({
        where,
        orderBy: { tanggal_tenggat: 'asc' }
      });

      const summary = await prisma.debts.aggregate({
        where: { id_pengguna },
        _sum: { jumlah_utang: true },
        _count: true
      });

      return res.status(200).json({
        success: true,
        data: debts,
        summary: {
          total_utang: summary._sum.jumlah_utang || 0,
          jumlah_utang: summary._count
        }
      });
    } catch (error) {
      console.error('Error fetching debts:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data utang'
      });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const id_pengguna = req.user!.id_pengguna;

      const debt = await prisma.debts.findFirst({
        where: {
          id_utang: parseInt(id),
          id_pengguna
        }
      });

      if (!debt) {
        return res.status(404).json({
          success: false,
          message: 'Utang tidak ditemukan'
        });
      }

      return res.status(200).json({
        success: true,
        data: debt
      });
    } catch (error) {
      console.error('Error fetching debt:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data utang'
      });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { jumlah_utang, tanggal_tenggat, status_utang } = req.body;
      const id_pengguna = req.user!.id_pengguna;

      const existingDebt = await prisma.debts.findFirst({
        where: {
          id_utang: parseInt(id),
          id_pengguna
        }
      });

      if (!existingDebt) {
        return res.status(404).json({
          success: false,
          message: 'Utang tidak ditemukan'
        });
      }

      const updateData: any = {};
      if (jumlah_utang) updateData.jumlah_utang = parseFloat(jumlah_utang);
      if (tanggal_tenggat) updateData.tanggal_tenggat = new Date(tanggal_tenggat);
      if (status_utang) updateData.status_utang = status_utang;

      const debt = await prisma.debts.update({
        where: { id_utang: parseInt(id) },
        data: updateData
      });

      return res.status(200).json({
        success: true,
        message: 'Utang berhasil diupdate',
        data: debt
      });
    } catch (error) {
      console.error('Error updating debt:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate utang'
      });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const id_pengguna = req.user!.id_pengguna;

      const existingDebt = await prisma.debts.findFirst({
        where: {
          id_utang: parseInt(id),
          id_pengguna
        }
      });

      if (!existingDebt) {
        return res.status(404).json({
          success: false,
          message: 'Utang tidak ditemukan'
        });
      }

      await prisma.debts.delete({
        where: { id_utang: parseInt(id) }
      });

      return res.status(200).json({
        success: true,
        message: 'Utang berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting debt:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus utang'
      });
    }
  }
}

// ==================== RECEIVABLE CONTROLLER ====================
export class ReceivableController {
  static async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { jumlah_piutang, tanggal_tenggat, status_piutang } = req.body;
      const id_pengguna = req.user!.id_pengguna;

      if (!jumlah_piutang || !tanggal_tenggat) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah piutang dan tanggal tenggat wajib diisi'
        });
      }

      if (jumlah_piutang <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah piutang harus lebih dari 0'
        });
      }

      const receivable = await prisma.receivables.create({
        data: {
          id_pengguna,
          jumlah_piutang: parseFloat(jumlah_piutang),
          tanggal_tenggat: new Date(tanggal_tenggat),
          status_piutang: status_piutang || 'Belum_Diterima'
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Piutang berhasil ditambahkan',
        data: receivable
      });
    } catch (error) {
      console.error('Error creating receivable:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menambahkan piutang'
      });
    }
  }

  static async getAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { status_piutang } = req.query;

      const where: any = { id_pengguna };
      if (status_piutang) where.status_piutang = status_piutang;

      const receivables = await prisma.receivables.findMany({
        where,
        orderBy: { tanggal_tenggat: 'asc' }
      });

      const summary = await prisma.receivables.aggregate({
        where: { id_pengguna },
        _sum: { jumlah_piutang: true },
        _count: true
      });

      return res.status(200).json({
        success: true,
        data: receivables,
        summary: {
          total_piutang: summary._sum.jumlah_piutang || 0,
          jumlah_piutang: summary._count
        }
      });
    } catch (error) {
      console.error('Error fetching receivables:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data piutang'
      });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const id_pengguna = req.user!.id_pengguna;

      const receivable = await prisma.receivables.findFirst({
        where: {
          id_piutang: parseInt(id),
          id_pengguna
        }
      });

      if (!receivable) {
        return res.status(404).json({
          success: false,
          message: 'Piutang tidak ditemukan'
        });
      }

      return res.status(200).json({
        success: true,
        data: receivable
      });
    } catch (error) {
      console.error('Error fetching receivable:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data piutang'
      });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { jumlah_piutang, tanggal_tenggat, status_piutang } = req.body;
      const id_pengguna = req.user!.id_pengguna;

      const existingReceivable = await prisma.receivables.findFirst({
        where: {
          id_piutang: parseInt(id),
          id_pengguna
        }
      });

      if (!existingReceivable) {
        return res.status(404).json({
          success: false,
          message: 'Piutang tidak ditemukan'
        });
      }

      const updateData: any = {};
      if (jumlah_piutang) updateData.jumlah_piutang = parseFloat(jumlah_piutang);
      if (tanggal_tenggat) updateData.tanggal_tenggat = new Date(tanggal_tenggat);
      if (status_piutang) updateData.status_piutang = status_piutang;

      const receivable = await prisma.receivables.update({
        where: { id_piutang: parseInt(id) },
        data: updateData
      });

      return res.status(200).json({
        success: true,
        message: 'Piutang berhasil diupdate',
        data: receivable
      });
    } catch (error) {
      console.error('Error updating receivable:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate piutang'
      });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const id_pengguna = req.user!.id_pengguna;

      const existingReceivable = await prisma.receivables.findFirst({
        where: {
          id_piutang: parseInt(id),
          id_pengguna
        }
      });

      if (!existingReceivable) {
        return res.status(404).json({
          success: false,
          message: 'Piutang tidak ditemukan'
        });
      }

      await prisma.receivables.delete({
        where: { id_piutang: parseInt(id) }
      });

      return res.status(200).json({
        success: true,
        message: 'Piutang berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting receivable:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus piutang'
      });
    }
  }
}