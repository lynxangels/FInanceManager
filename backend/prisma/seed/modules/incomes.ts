import { generateMonthlyIncome } from "../utils/generator";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedIncomes(userId: number) {
  const months = 18;
  const now = new Date();

  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    await prisma.incomes.create({
      data: generateMonthlyIncome(d.getMonth() + 1, d.getFullYear(), userId)
    });
  }

  console.log("✔ Incomes seeded for 18 months");
}
