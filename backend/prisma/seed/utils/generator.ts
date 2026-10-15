import { rand, pick } from "./random";

export function generateDailyExpenses(month: number, year: number, userId: number) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const result = [];

  const categories = [1, 2, 3, 4, 7]; // makanan, transport, belanja, hiburan, tagihan
  const paymentMethods = [1, 2, 3, 4, 5];

  for (let day = 1; day <= daysInMonth; day++) {
    // 60% hari ada transaksi
    if (Math.random() < 0.6) {
      const t = rand(1, 3); // 1–3 transaksi per hari
      for (let i = 0; i < t; i++) {
        result.push({
          id_pengguna: userId,
          id_kategori: pick(categories),
          id_metode: pick(paymentMethods),
          id_mata_uang: 1,
          jumlah: rand(2000000, 7000000),
          tanggal: new Date(year, month - 1, day)
        });
      }
    }
  }

  return result;
}

export function generateMonthlyIncome(month: number, year: number, userId: number) {
  return {
    id_pengguna: userId,
    id_metode: 5,
    id_mata_uang: 1,
    jumlah: rand(15000000, 120000000),
    sumber: "Gaji Bulanan",
    tanggal: new Date(year, month - 1, 1)
  };
}

export function generateBudget(month: number, year: number, userId: number) {
  const categories = [1, 2, 3, 4, 7];
  return categories.map(category => ({
    id_pengguna: userId,
    id_kategori: category,
    bulan: month,
    tahun: year,
    jumlah_anggaran: rand(3000000, 25000000)
  }));
}
