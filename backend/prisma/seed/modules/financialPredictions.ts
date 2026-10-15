import { PrismaClient } from "@prisma/client";
import { rand } from "../utils/random";

const prisma = new PrismaClient();

export async function seedFinancialPredictions(userId: number) {
  const list = [];

  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() + i);

    list.push({
      id_pengguna: userId,
      bulan_prediksi: d.getMonth() + 1,
      estimasi_pemasukan: rand(20000000, 120000000),
      estimasi_pengeluaran: rand(12000000, 90000000),
      prediksi_saldo_akhir: rand(0, 30000000)
    });
  }

  for (const item of list) {
    await prisma.financial_predictions.create({ data: item });
  }

  console.log("✔ Financial predictions seeded");
}
