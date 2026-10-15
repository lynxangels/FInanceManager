import bcrypt from "bcryptjs";

export async function userSeed() {
  return [
    {
      nama: "Demo User",
      email: "demo@financial.com",
      kata_sandi: await bcrypt.hash("demo123", 10),
      role: "user",
      status_akun: "Aktif",
      tanggal_daftar: new Date("2024-01-01")
    },
    {
      nama: "Administrator",
      email: "admin@financial.com",
      kata_sandi: await bcrypt.hash("admin123", 10),
      role: "admin",
      status_akun: "Aktif",
      tanggal_daftar: new Date("2024-01-01")
    }
  ];
}
