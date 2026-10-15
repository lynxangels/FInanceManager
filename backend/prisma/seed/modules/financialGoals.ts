import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedFinancialGoals(userId: number) {
  const list = [
    {
      id_pengguna: userId,
      nama_tujuan: "Dana Darurat",
      total_target: 60000000,
      tanggal_target: new Date("2025-12-31"),
      status: "Belum_Tercapai"
    },
    {
      id_pengguna: userId,
      nama_tujuan: "Liburan Jepang",
      total_target: 45000000,
      tanggal_target: new Date("2025-07-15"),
      status: "Belum_Tercapai"
    },
    {
      id_pengguna: userId,
      nama_tujuan: "Upgrade Laptop",
      total_target: 30000000,
      tanggal_target: new Date("2024-12-31"),
      status: "Belum_Tercapai"
    }
  ];

  for (const item of list) {
    await prisma.financial_goals.create({ data: item });
  }

  console.log("✔ Financial goals seeded");
}
