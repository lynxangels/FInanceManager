import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedCalendar(userId: number) {
  const now = new Date();
  const events = [
    {
      title: "Review Bulanan",
      start_date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0),
      end_date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0),
      color: "default",
    },
    {
      title: "Bayar Tagihan",
      start_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 12, 0, 0),
      end_date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 13, 0, 0),
      color: "red",
    },
  ];

  for (const ev of events) {
    await prisma.calendar_events.create({
      data: {
        id_pengguna: userId,
        title: ev.title,
        start_date: ev.start_date,
        end_date: ev.end_date,
        color: ev.color,
      },
    });
  }

  console.log("✔ Calendar events seeded");
}
