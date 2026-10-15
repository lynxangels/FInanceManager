import { generateBudget } from "../utils/generator";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedBudgets(userId: number) {
  const months = 18;
  const now = new Date();

  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const list = generateBudget(d.getMonth() + 1, d.getFullYear(), userId);
    for (const item of list) {
      await prisma.budgets.create({ data: item });
    }
  }

  console.log("✔ Budgets seeded for 18 months");
}
