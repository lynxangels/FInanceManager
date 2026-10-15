import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedNotes(userId: number) {
  const samples = [
    {
      title: "Catatan Bulanan",
      content: "Review cashflow dan budget bulan ini.",
      color: "default",
    },
    {
      title: "Rencana Investasi",
      content: "Cek ulang alokasi dana ke reksa dana dan deposito.",
      color: "green",
    },
  ];

  for (const note of samples) {
    await prisma.notes.create({
      data: { id_pengguna: userId, ...note },
    });
  }

  console.log("✔ Notes seeded");
}
