import { PrismaClient } from "@prisma/client";
import { rand, pick } from "../utils/random";

const prisma = new PrismaClient();

export async function seedReceivables(userId: number) {
  const items = [];

  for (let i = 0; i < 10; i++) {
    items.push({
      id_pengguna: userId,
      jumlah_piutang: rand(3000000, 60000000),
      tanggal_tenggat: new Date(Date.now() + rand(5, 180) * 24 * 60 * 60 * 1000),
      status_piutang: pick(["Belum_Diterima", "Diterima_Sebagian", "Lunas"])
    });
  }

  for (const item of items) {
    await prisma.receivables.create({ data: item });
  }

  console.log("✔ Receivables seeded");
}
