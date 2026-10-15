// controllers/authController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
interface AuthRequest extends Request {
  user?: {
    id_pengguna: number;
    email: string;
    role: string;
  };
}

export class DashboardController {
  static async getOverview(req: AuthRequest, res: Response): Promise<Response> {
      try {
        const id_pengguna = req.user!.id_pengguna;
        const { bulan, tahun } = req.query;
  
        const currentDate = new Date();
        const targetMonth = bulan ? parseInt(bulan as string) : currentDate.getMonth() + 1;
        const targetYear = tahun ? parseInt(tahun as string) : currentDate.getFullYear();
  
        // Date range for current month
        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 1);
  
        // Get total income
        const totalIncome = await prisma.incomes.aggregate({
          where: {
            id_pengguna,
            tanggal: {
              gte: startDate,
              lt: endDate
            }
          },
          _sum: { jumlah: true }
        });
  
        // Get total expenses
        const totalExpense = await prisma.expenses.aggregate({
          where: {
            id_pengguna,
            tanggal: {
              gte: startDate,
              lt: endDate
            }
          },
          _sum: { jumlah: true }
        });
  
        // Get total budget
        const totalBudget = await prisma.budgets.aggregate({
          where: {
            id_pengguna,
            bulan: targetMonth,
            tahun: targetYear
          },
          _sum: { jumlah_anggaran: true }
        });
  
        // Get total debts
        const totalDebt = await prisma.debts.aggregate({
          where: {
            id_pengguna,
            status_utang: {
              not: 'Lunas'
            }
          },
          _sum: { jumlah_utang: true }
        });
  
        // Get total receivables
        const totalReceivable = await prisma.receivables.aggregate({
          where: {
            id_pengguna,
            status_piutang: {
              not: 'Lunas'
            }
          },
          _sum: { jumlah_piutang: true }
        });
  
        // Get financial goals progress
        const financialGoals = await prisma.financial_goals.count({
          where: {
            id_pengguna,
            status: 'Belum_Tercapai'
          }
        });
  
        const income = parseFloat(totalIncome._sum.jumlah?.toString() || '0');
        const expense = parseFloat(totalExpense._sum.jumlah?.toString() || '0');
        const budget = parseFloat(totalBudget._sum.jumlah_anggaran?.toString() || '0');
        const balance = income - expense;
  
        // Get recent transactions
        const recentExpenses = await prisma.expenses.findMany({
          where: { id_pengguna },
          include: {
            category: true,
            payment_method: true
          },
          orderBy: { created_at: 'desc' },
          take: 5
        });
  
        const recentIncomes = await prisma.incomes.findMany({
          where: { id_pengguna },
          include: {
            payment_method: true
          },
          orderBy: { tanggal: 'desc' },
          take: 5
        });
  
        return res.status(200).json({
          success: true,
          data: {
            periode: {
              bulan: targetMonth,
              tahun: targetYear
            },
            ringkasan: {
              total_pemasukan: income,
              total_pengeluaran: expense,
              total_anggaran: budget,
              saldo: balance,
              persentase_budget_terpakai: budget > 0 ? (expense / budget) * 100 : 0,
              total_utang: parseFloat(totalDebt._sum.jumlah_utang?.toString() || '0'),
              total_piutang: parseFloat(totalReceivable._sum.jumlah_piutang?.toString() || '0'),
              tujuan_finansial_aktif: financialGoals
            },
            transaksi_terbaru: {
              pengeluaran: recentExpenses,
              pemasukan: recentIncomes
            }
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard overview:', error);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan saat mengambil data dashboard'
        });
      }
    }
  
    static async getFinancialHealth(req: AuthRequest, res: Response): Promise<Response> {
      try {
        const id_pengguna = req.user!.id_pengguna;
  
        // Last 6 months data
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
        const [totalIncome, totalExpense, totalDebt, totalSavings] = await Promise.all([
          prisma.incomes.aggregate({
            where: {
              id_pengguna,
              tanggal: { gte: sixMonthsAgo }
            },
            _sum: { jumlah: true }
          }),
          prisma.expenses.aggregate({
            where: {
              id_pengguna,
              tanggal: { gte: sixMonthsAgo }
            },
            _sum: { jumlah: true }
          }),
          prisma.debts.aggregate({
            where: {
              id_pengguna,
              status_utang: { not: 'Lunas' }
            },
            _sum: { jumlah_utang: true }
          }),
          prisma.incomes.aggregate({
            where: { id_pengguna },
            _sum: { jumlah: true }
          })
        ]);
  
        const income = parseFloat(totalIncome._sum.jumlah?.toString() || '0');
        const expense = parseFloat(totalExpense._sum.jumlah?.toString() || '0');
        const debt = parseFloat(totalDebt._sum.jumlah_utang?.toString() || '0');
        const savings = parseFloat(totalSavings._sum.jumlah?.toString() || '0') - expense;
  
        const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
        const debtToIncomeRatio = income > 0 ? (debt / income) * 100 : 0;
  
        let healthScore = 100;
        let recommendations = [];
  
        // Calculate health score
        if (savingsRate < 10) {
          healthScore -= 30;
          recommendations.push('Tingkatkan tingkat tabungan Anda hingga minimal 10% dari pendapatan');
        } else if (savingsRate < 20) {
          healthScore -= 15;
          recommendations.push('Coba tingkatkan tabungan hingga 20% dari pendapatan');
        }
  
        if (debtToIncomeRatio > 50) {
          healthScore -= 40;
          recommendations.push('Rasio utang terhadap pendapatan terlalu tinggi, prioritaskan pembayaran utang');
        } else if (debtToIncomeRatio > 30) {
          healthScore -= 20;
          recommendations.push('Kurangi utang untuk meningkatkan kesehatan finansial');
        }
  
        if (expense > income) {
          healthScore -= 30;
          recommendations.push('Pengeluaran melebihi pendapatan, segera kurangi pengeluaran');
        }
  
        return res.status(200).json({
          success: true,
          data: {
            skor_kesehatan: Math.max(0, healthScore),
            status: healthScore >= 80 ? 'Sangat Baik' : 
                    healthScore >= 60 ? 'Baik' : 
                    healthScore >= 40 ? 'Cukup' : 'Perlu Perbaikan',
            indikator: {
              tingkat_tabungan: savingsRate,
              rasio_utang_pendapatan: debtToIncomeRatio,
              total_tabungan: savings,
              total_utang: debt
            },
            rekomendasi: recommendations.length > 0 ? recommendations : ['Kesehatan finansial Anda baik, pertahankan kebiasaan ini']
          }
        });
      } catch (error) {
        console.error('Error calculating financial health:', error);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan saat menghitung kesehatan finansial'
        });
      }
    }
    // ==================== RECENT INCOMES ====================
    static async getRecentIncomes(req: AuthRequest, res: Response): Promise<Response> {
      try {
        const id_pengguna = req.user!.id_pengguna;
        const { limit = '10' } = req.query;
  
        const incomes = await prisma.incomes.findMany({
          where: { id_pengguna },
          include: {
            payment_method: true,
            currency: true
          },
          orderBy: { tanggal: 'desc' },
          take: parseInt(limit as string)
        });
  
        return res.status(200).json({
          success: true,
          data: incomes
        });
      } catch (error) {
        console.error('Error fetching recent incomes:', error);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan saat mengambil pemasukan terbaru'
        });
      }
    }
  
    // ==================== CASHFLOW CHART ====================
    static async getCashflowChart(req: AuthRequest, res: Response): Promise<Response> {
      try {
        const id_pengguna = req.user!.id_pengguna;
        const { months = "6", end_year, end_month } = req.query;

        const monthsToShow = parseInt(months as string);
        const now = new Date();
        const endYear = end_year ? parseInt(end_year as string) : now.getFullYear();
        const endMonth = end_month ? parseInt(end_month as string) : now.getMonth() + 1;

        // RANGE DATA
        const startDate = new Date(endYear, endMonth - monthsToShow, 1);
        const endDate = new Date(endYear, endMonth, 1);

        // ================================
        // AMBIL PEMASUKAN
        // ================================
        const monthlyIncomes = await prisma.$queryRaw<Array<{
          month: number;
          year: number;
          total: number;
        }>>`
          SELECT 
            MONTH(tanggal) AS month,
            YEAR(tanggal) AS year,
            SUM(jumlah) AS total
          FROM incomes
          WHERE id_pengguna = ${id_pengguna}
          AND tanggal >= ${startDate}
          AND tanggal < ${endDate}
          GROUP BY YEAR(tanggal), MONTH(tanggal)
          ORDER BY YEAR(tanggal), MONTH(tanggal)
        `;
        

        // ================================
        // AMBIL PENGELUARAN
        // ================================
        const monthlyExpenses = await prisma.$queryRaw<Array<{
          month: number;
          year: number;
          total: number;
        }>>`
          SELECT 
            MONTH(tanggal) AS month,
            YEAR(tanggal) AS year,
            SUM(jumlah) AS total
          FROM expenses
          WHERE id_pengguna = ${id_pengguna}
          AND tanggal >= ${startDate}
          AND tanggal < ${endDate}
          GROUP BY YEAR(tanggal), MONTH(tanggal)
          ORDER BY YEAR(tanggal), MONTH(tanggal)
        `;

        // ================================
        // SUSUN FORMAT EXACT UNTUK FE
        // ================================
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

        const cashflow_per_bulan = [];
        const asNumber = (value: unknown) =>
          typeof value === "number" ? value : Number(value);

        for (let i = monthsToShow - 1; i >= 0; i--) {
          const d = new Date(endYear, endMonth - 1 - i, 1);
          const month = d.getMonth() + 1;
          const year = d.getFullYear();

          const incomeEntry = monthlyIncomes.find(
            (x) => asNumber(x.month) === month && asNumber(x.year) === year
          );
          const expenseEntry = monthlyExpenses.find(
            (x) => asNumber(x.month) === month && asNumber(x.year) === year
          );

          const income = incomeEntry ? asNumber(incomeEntry.total) : 0;
          const expense = expenseEntry ? asNumber(expenseEntry.total) : 0;

          const netCashflow = income - expense;
          const savingsRate = income > 0 ? ((netCashflow / income) * 100).toFixed(2) : "0.00";

          cashflow_per_bulan.push({
            periode: `${monthNames[month - 1]} ${year}`,
            bulan: month,
            tahun: year,
            pemasukan: income,
            pengeluaran: expense,
            net_cashflow: netCashflow,
            savings_rate: savingsRate,
          });
        }

        // ================================
        // RINGKASAN
        // ================================
        const totalIncome = cashflow_per_bulan.reduce(
          (a, x) => a + Number(x.pemasukan),
          0
        );
        const totalExpense = cashflow_per_bulan.reduce(
          (a, x) => a + Number(x.pengeluaran),
          0
        );
        const totalNet = totalIncome - totalExpense;

        const avgIncome = Number((totalIncome / monthsToShow).toFixed(2));
        const avgExpense = Number((totalExpense / monthsToShow).toFixed(2));
        const avgNet = Number((avgIncome - avgExpense).toFixed(2));
        const avgSavingsRate =
          avgIncome > 0 ? ((avgNet / avgIncome) * 100).toFixed(2) : "0.00";

        return res.status(200).json({
          success: true,
          data: {
            cashflow_per_bulan,
            ringkasan: {
              total_pemasukan: totalIncome,
              total_pengeluaran: totalExpense,
              total_net_cashflow: totalNet,
              rata_rata_pemasukan_bulanan: avgIncome,
              rata_rata_pengeluaran_bulanan: avgExpense,
              rata_rata_net_cashflow_bulanan: avgNet,
              rata_rata_savings_rate: avgSavingsRate,
            },
          },
        });
      } catch (error) {
        console.error("Error fetching cashflow chart:", error);
        return res.status(500).json({
          success: false,
          message: "Terjadi kesalahan saat mengambil data cashflow",
        });
      }
    }

  
    // ==================== EXPENSE BY CATEGORY (PIE CHART) ====================
    static async getExpensesByCategory(req: AuthRequest, res: Response): Promise<Response> {
      try {
        const id_pengguna = req.user!.id_pengguna;
        const { bulan, tahun } = req.query;
  
        const currentDate = new Date();
        const targetMonth = bulan ? parseInt(bulan as string) : currentDate.getMonth() + 1;
        const targetYear = tahun ? parseInt(tahun as string) : currentDate.getFullYear();
  
        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 1);
  
        const expensesByCategory = await prisma.expenses.groupBy({
          by: ['id_kategori'],
          where: {
            id_pengguna,
            tanggal: {
              gte: startDate,
              lt: endDate
            }
          },
          _sum: {
            jumlah: true
          },
          _count: true
        });
  
        const totalExpense = expensesByCategory.reduce(
          (sum, item) => sum + parseFloat(item._sum.jumlah?.toString() || '0'), 
          0
        );
  
        const categoryDetails = await Promise.all(
          expensesByCategory.map(async (item) => {
            const category = await prisma.categories.findUnique({
              where: { id_kategori: item.id_kategori }
            });
  
            const amount = parseFloat(item._sum.jumlah?.toString() || '0');
            const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
  
            return {
              id_kategori: item.id_kategori,
              nama_kategori: category?.nama_kategori || 'Unknown',
              total: amount,
              jumlah_transaksi: item._count,
              persentase: parseFloat(percentage.toFixed(2))
            };
          })
        );
  
        // Sort by total (descending)
        categoryDetails.sort((a, b) => b.total - a.total);
  
        return res.status(200).json({
          success: true,
          data: {
            periode: {
              bulan: targetMonth,
              tahun: targetYear
            },
            total_pengeluaran: totalExpense,
            per_kategori: categoryDetails
          }
        });
      } catch (error) {
        console.error('Error fetching expenses by category:', error);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan saat mengambil data pengeluaran per kategori'
        });
      }
    }
  
    // ==================== TOP EXPENSES ====================
    static async getTopExpenses(req: AuthRequest, res: Response): Promise<Response> {
      try {
        const id_pengguna = req.user!.id_pengguna;
        const { limit = '10', bulan, tahun } = req.query;
  
        const currentDate = new Date();
        const targetMonth = bulan ? parseInt(bulan as string) : currentDate.getMonth() + 1;
        const targetYear = tahun ? parseInt(tahun as string) : currentDate.getFullYear();
  
        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 1);
  
        const topExpenses = await prisma.expenses.findMany({
          where: {
            id_pengguna,
            tanggal: {
              gte: startDate,
              lt: endDate
            }
          },
          include: {
            category: true,
            payment_method: true,
            currency: true
          },
          orderBy: {
            jumlah: 'desc'
          },
          take: parseInt(limit as string)
        });
  
        return res.status(200).json({
          success: true,
          data: topExpenses
        });
      } catch (error) {
        console.error('Error fetching top expenses:', error);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan saat mengambil pengeluaran terbesar'
        });
      }
    }
  
    // ==================== BUDGET ALERTS ====================
    static async getBudgetAlerts(req: AuthRequest, res: Response): Promise<Response> {
      try {
        const id_pengguna = req.user!.id_pengguna;
        const { bulan, tahun } = req.query;
  
        const currentDate = new Date();
        const targetMonth = bulan ? parseInt(bulan as string) : currentDate.getMonth() + 1;
        const targetYear = tahun ? parseInt(tahun as string) : currentDate.getFullYear();
  
        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 1);
  
        // Get all budgets for the period
        const budgets = await prisma.budgets.findMany({
          where: {
            id_pengguna,
            bulan: targetMonth,
            tahun: targetYear
          },
          include: {
            category: true
          }
        });
  
        const alerts = await Promise.all(
          budgets.map(async (budget) => {
            // Get total expenses for this category
            const expenses = await prisma.expenses.aggregate({
              where: {
                id_pengguna,
                id_kategori: budget.id_kategori,
                tanggal: {
                  gte: startDate,
                  lt: endDate
                }
              },
              _sum: {
                jumlah: true
              }
            });
  
            const totalExpense = parseFloat(expenses._sum.jumlah?.toString() || '0');
            const budgetAmount = parseFloat(budget.jumlah_anggaran.toString());
            const percentage = (totalExpense / budgetAmount) * 100;
            const remaining = budgetAmount - totalExpense;
  
            let alertLevel: 'safe' | 'warning' | 'danger' | 'exceeded' = 'safe';
            let message = '';
  
            if (percentage >= 100) {
              alertLevel = 'exceeded';
              message = `Budget ${budget.category.nama_kategori} telah melebihi ${percentage.toFixed(1)}%`;
            } else if (percentage >= 90) {
              alertLevel = 'danger';
              message = `Budget ${budget.category.nama_kategori} hampir habis (${percentage.toFixed(1)}%)`;
            } else if (percentage >= 75) {
              alertLevel = 'warning';
              message = `Budget ${budget.category.nama_kategori} sudah terpakai ${percentage.toFixed(1)}%`;
            } else {
              alertLevel = 'safe';
              message = `Budget ${budget.category.nama_kategori} masih aman`;
            }
  
            return {
              id_anggaran: budget.id_anggaran,
              kategori: budget.category.nama_kategori,
              jumlah_anggaran: budgetAmount,
              total_pengeluaran: totalExpense,
              sisa: remaining,
              persentase_terpakai: parseFloat(percentage.toFixed(2)),
              alert_level: alertLevel,
              message
            };
          })
        );
  
        // Filter and sort by alert level
        const priorityOrder = { exceeded: 0, danger: 1, warning: 2, safe: 3 };
        const sortedAlerts = alerts.sort(
          (a, b) => priorityOrder[a.alert_level] - priorityOrder[b.alert_level]
        );
  
        const criticalAlerts = sortedAlerts.filter(
          a => a.alert_level === 'exceeded' || a.alert_level === 'danger'
        );
  
        return res.status(200).json({
          success: true,
          data: {
            semua_budget: sortedAlerts,
            peringatan_kritis: criticalAlerts,
            jumlah_peringatan: criticalAlerts.length
          }
        });
      } catch (error) {
        console.error('Error fetching budget alerts:', error);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan saat mengambil peringatan budget'
        });
      }
    }
  
    // ==================== UPCOMING BILLS (Debts & Receivables) ====================
    static async getUpcomingBills(req: AuthRequest, res: Response): Promise<Response> {
      try {
        const id_pengguna = req.user!.id_pengguna;
        const { days = '30' } = req.query;
  
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + parseInt(days as string));
  
        // Get upcoming debts
        const upcomingDebts = await prisma.debts.findMany({
          where: {
            id_pengguna,
            status_utang: {
              not: 'Lunas'
            },
            tanggal_tenggat: {
              gte: today,
              lte: futureDate
            }
          },
          orderBy: {
            tanggal_tenggat: 'asc'
          }
        });
  
        // Get upcoming receivables
        const upcomingReceivables = await prisma.receivables.findMany({
          where: {
            id_pengguna,
            status_piutang: {
              not: 'Lunas'
            },
            tanggal_tenggat: {
              gte: today,
              lte: futureDate
            }
          },
          orderBy: {
            tanggal_tenggat: 'asc'
          }
        });
  
        // Get overdue debts
        const overdueDebts = await prisma.debts.findMany({
          where: {
            id_pengguna,
            status_utang: {
              not: 'Lunas'
            },
            tanggal_tenggat: {
              lt: today
            }
          },
          orderBy: {
            tanggal_tenggat: 'asc'
          }
        });
  
        // Get overdue receivables
        const overdueReceivables = await prisma.receivables.findMany({
          where: {
            id_pengguna,
            status_piutang: {
              not: 'Lunas'
            },
            tanggal_tenggat: {
              lt: today
            }
          },
          orderBy: {
            tanggal_tenggat: 'asc'
          }
        });
  
        const totalUpcomingDebt = upcomingDebts.reduce(
          (sum, debt) => sum + parseFloat(debt.jumlah_utang.toString()),
          0
        );
  
        const totalUpcomingReceivable = upcomingReceivables.reduce(
          (sum, rec) => sum + parseFloat(rec.jumlah_piutang.toString()),
          0
        );
  
        const totalOverdueDebt = overdueDebts.reduce(
          (sum, debt) => sum + parseFloat(debt.jumlah_utang.toString()),
          0
        );
  
        const totalOverdueReceivable = overdueReceivables.reduce(
          (sum, rec) => sum + parseFloat(rec.jumlah_piutang.toString()),
          0
        );
  
        return res.status(200).json({
          success: true,
          data: {
            upcoming: {
              utang: upcomingDebts,
              piutang: upcomingReceivables,
              total_utang: totalUpcomingDebt,
              total_piutang: totalUpcomingReceivable
            },
            overdue: {
              utang: overdueDebts,
              piutang: overdueReceivables,
              total_utang: totalOverdueDebt,
              total_piutang: totalOverdueReceivable
            },
            ringkasan: {
              jumlah_tagihan_mendatang: upcomingDebts.length,
              jumlah_piutang_mendatang: upcomingReceivables.length,
              jumlah_tagihan_terlambat: overdueDebts.length,
              jumlah_piutang_terlambat: overdueReceivables.length
            }
          }
        });
      } catch (error) {
        console.error('Error fetching upcoming bills:', error);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan saat mengambil tagihan mendatang'
        });
      }
    }
  
    // ==================== FINANCIAL GOALS PROGRESS ====================
    static async getFinancialGoalsProgress(req: AuthRequest, res: Response): Promise<Response> {
      try {
        const id_pengguna = req.user!.id_pengguna;
  
        const goals = await prisma.financial_goals.findMany({
          where: { id_pengguna },
          orderBy: { tanggal_target: 'asc' }
        });
  
        // Calculate current savings (total income - total expense)
        const [totalIncome, totalExpense] = await Promise.all([
          prisma.incomes.aggregate({
            where: { id_pengguna },
            _sum: { jumlah: true }
          }),
          prisma.expenses.aggregate({
            where: { id_pengguna },
            _sum: { jumlah: true }
          })
        ]);
  
        const currentSavings = parseFloat(totalIncome._sum.jumlah?.toString() || '0') - 
                              parseFloat(totalExpense._sum.jumlah?.toString() || '0');
  
        const goalsWithProgress = goals.map(goal => {
          const targetAmount = parseFloat(goal.total_target.toString());
          const progress = (currentSavings / targetAmount) * 100;
          const remaining = targetAmount - currentSavings;
          
          const today = new Date();
          const targetDate = new Date(goal.tanggal_target);
          const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          const monthlyTarget = daysRemaining > 0 ? remaining / (daysRemaining / 30) : 0;
  
          return {
            ...goal,
            tabungan_saat_ini: currentSavings,
            progress_persentase: parseFloat(progress.toFixed(2)),
            sisa_target: remaining,
            hari_tersisa: Math.max(0, daysRemaining),
            target_bulanan_diperlukan: monthlyTarget > 0 ? parseFloat(monthlyTarget.toFixed(2)) : 0,
            status_pencapaian: progress >= 100 ? 'Tercapai' : 
                              progress >= 75 ? 'Hampir Tercapai' :
                              progress >= 50 ? 'Setengah Jalan' :
                              progress >= 25 ? 'Dalam Progress' : 'Baru Dimulai'
          };
        });
  
        return res.status(200).json({
          success: true,
          data: {
            tabungan_saat_ini: currentSavings,
            tujuan_finansial: goalsWithProgress,
            ringkasan: {
              total_tujuan: goals.length,
              tercapai: goalsWithProgress.filter(g => g.status === 'Tercapai').length,
              dalam_progress: goalsWithProgress.filter(g => g.status === 'Belum_Tercapai').length
            }
          }
        });
      } catch (error) {
        console.error('Error fetching financial goals progress:', error);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan saat mengambil progress tujuan finansial'
        });
      }
    }
  
    // ==================== SPENDING TRENDS ====================
    static async getSpendingTrends(req: AuthRequest, res: Response): Promise<Response> {
      try {
        const id_pengguna = req.user!.id_pengguna;
        const { months = '6' } = req.query;
  
        const monthsToShow = parseInt(months as string);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsToShow);
  
        const rawExpenses = await prisma.$queryRaw<Array<any>>`
          SELECT 
            MONTH(e.tanggal) as month,
            YEAR(e.tanggal) as year,
            e.id_kategori as category_id,
            c.nama_kategori as category_name,
            SUM(e.jumlah) as total
          FROM expenses e
          JOIN categories c ON e.id_kategori = c.id_kategori
          WHERE e.id_pengguna = ${id_pengguna}
          AND e.tanggal >= ${startDate}
          AND e.tanggal <= ${endDate}
          GROUP BY YEAR(e.tanggal), MONTH(e.tanggal), e.id_kategori, c.nama_kategori
          ORDER BY YEAR(e.tanggal), MONTH(e.tanggal)
        `;

        const expenses = rawExpenses.map(e => ({
          month: Number(e.month),
          year: Number(e.year),
          category_id: Number(e.category_id),
          category_name: e.category_name,
          total: Number(e.total) // ← FIX
        }));
  
        // Get unique categories
        const categories = [...new Set(expenses.map(e => e.category_name))];
  
        // Group by month
        const monthlyData: any = {};
        expenses.forEach(expense => {
          const key = `${expense.year}-${expense.month}`;
          if (!monthlyData[key]) {
            monthlyData[key] = {
              bulan: expense.month,
              tahun: expense.year,
              total: 0,
              per_kategori: {}
            };
          }
          monthlyData[key].total += parseFloat(expense.total.toString());
          monthlyData[key].per_kategori[expense.category_name] = parseFloat(expense.total.toString());
        });
  
        const trends = Object.values(monthlyData);
  
        return res.status(200).json({
          success: true,
          data: {
            kategori_list: categories,
            tren_pengeluaran: trends
          }
        });
      } catch (error) {
        console.error('Error fetching spending trends:', error);
        return res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan saat mengambil tren pengeluaran'
        });
      }
    }
}
