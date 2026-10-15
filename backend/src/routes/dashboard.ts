import { Router } from 'express';
import { DashboardController } from '../controllers';
import { AuthMiddleware } from '../middlewares';

const router = Router();

// Dashboard Routes
router.get('/overview', AuthMiddleware.verifyToken, DashboardController.getOverview);
router.get('/financial-health', AuthMiddleware.verifyToken, DashboardController.getFinancialHealth);

// ==================== DASHBOARD ROUTES ====================

// Recent Data
router.get('/recent-incomes', AuthMiddleware.verifyToken, DashboardController.getRecentIncomes);
router.get('/top-expenses', AuthMiddleware.verifyToken, DashboardController.getTopExpenses);

// Charts & Analytics
router.get('/cashflow-chart', AuthMiddleware.verifyToken, DashboardController.getCashflowChart);
router.get('/expenses-by-category', AuthMiddleware.verifyToken, DashboardController.getExpensesByCategory);
router.get('/spending-trends', AuthMiddleware.verifyToken, DashboardController.getSpendingTrends);

// Alerts & Notifications
router.get('/budget-alerts', AuthMiddleware.verifyToken, DashboardController.getBudgetAlerts);
router.get('/upcoming-bills', AuthMiddleware.verifyToken, DashboardController.getUpcomingBills);

// Goals Progress
router.get('/financial-goals-progress', AuthMiddleware.verifyToken, DashboardController.getFinancialGoalsProgress);

export default router;