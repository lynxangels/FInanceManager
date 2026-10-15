import { Router } from "express";

import authRoutes from "./auth";
import dashboardRoutes from "./dashboard";
import currencyRoutes from "./currency";
import incomeRoutes from "./incomes";
import expenseRoutes from "./expense";
import receivableRoutes from "./Receivable";
import debtRoutes from "./debts";
import financialGoalRoutes from "./financialGoal";
import categoryRoutes from "./category";
import budgetRoutes from "./budget";
import notesRoutes from "./notes";
import calendarRoutes from "./calendar";
import paymentMethodRoutes from "./paymentMethods";

const router = Router();

// Register all module routes
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/currency", currencyRoutes);
router.use("/incomes", incomeRoutes);
router.use("/expenses", expenseRoutes);
router.use("/receivable", receivableRoutes);
router.use("/debts", debtRoutes);
router.use("/financial-goal", financialGoalRoutes);
router.use("/category", categoryRoutes);
router.use("/budget", budgetRoutes);
router.use("/payment-methods", paymentMethodRoutes);
router.use("/notes", notesRoutes);
router.use("/calendar-events", calendarRoutes);

export default router;
