import { PrismaClient } from "@prisma/client";
import { userSeed } from "./data/users";
import { categories } from "./data/categories";
import { paymentMethods } from "./data/paymentMethods";
import { currencies } from "./data/currencies";

import { seedBudgets } from "./modules/budgets";
import { seedExpenses } from "./modules/expenses";
import { seedIncomes } from "./modules/incomes";
import { seedDebts } from "./modules/debts";
import { seedReceivables } from "./modules/receivables";
import { seedFinancialGoals } from "./modules/financialGoals";
import { seedFinancialPredictions } from "./modules/financialPredictions";
import { seedSocialRelations } from "./modules/socialRelations";
import { seedNotes } from "./modules/notes";
import { seedCalendar } from "./modules/calendar";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Modular Ultra Seed...");

  // USERS
  const users = await userSeed();
  const createdUsers = [];
  for (const u of users) {
    createdUsers.push(await prisma.users.create({ data: u }));
  }

  const demoUser = createdUsers.find(u => u.email === "demo@financial.com")!;
  const adminUser = createdUsers.find(u => u.email === "admin@financial.com")!;

  console.log("✔ Users created");

  // STATIC DATA
  for (const c of categories) await prisma.categories.create({ data: c });
  for (const c of paymentMethods) await prisma.payment_methods.create({ data: c });
  for (const c of currencies) await prisma.currencies.create({ data: c });

  console.log("✔ Static categories, payments, currencies seeded");

  // DYNAMIC DATA
  await seedBudgets(demoUser.id_pengguna);
  await seedExpenses(demoUser.id_pengguna);
  await seedIncomes(demoUser.id_pengguna);
  await seedDebts(demoUser.id_pengguna);
  await seedReceivables(demoUser.id_pengguna);
  await seedFinancialGoals(demoUser.id_pengguna);
  await seedFinancialPredictions(demoUser.id_pengguna);
  await seedSocialRelations(adminUser.id_pengguna, demoUser.id_pengguna);
  await seedNotes(demoUser.id_pengguna);
  await seedCalendar(demoUser.id_pengguna);

  console.log("🎉 ULTRA MODULAR SEED COMPLETED!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
