import { PrismaClient } from "@prisma/client";
import { rand, pick } from "../utils/random";

const prisma = new PrismaClient();

export async function seedDebts(userId: number) {
  const items = [];

  for (let i = 0; i < 10; i++) {
    items.push({
      id_pengguna: userId,
      jumlah_utang: rand(5000000, 75000000),
      tanggal_tenggat: new Date(Date.now() + rand(5, 180) * 24 * 60 * 60 * 1000),
      status_utang: pick(["Belum_Dibayar", "Dibayar_Sebagian", "Lunas"])
    });
  }

  for (const item of items) {
    await prisma.debts.create({ data: item });
  }

  console.log("✔ Debts seeded");
}
