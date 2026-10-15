import { generateDailyExpenses } from "../utils/generator";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedExpenses(userId: number) {
  const months = 18;
  const now = new Date();

  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const data = generateDailyExpenses(d.getMonth() + 1, d.getFullYear(), userId);

    for (const item of data) {
      await prisma.expenses.create({ data: item });
    }
  }

  console.log("✔ Expenses seeded for 18 months");
}
