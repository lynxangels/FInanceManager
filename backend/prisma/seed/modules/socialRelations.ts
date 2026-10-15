import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedSocialRelations(adminId: number, demoId: number) {
  const list = [
    {
      id_pengguna1: adminId,
      id_pengguna2: demoId,
      status_relasi: "Accepted"
    }
  ];

  for (const item of list) {
    await prisma.social_user_relations.create({ data: item });
  }

  console.log("✔ Social relations seeded");
}
