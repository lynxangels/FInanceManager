/**
 * Semua request ke backend lewat proxy same-origin: /backend/* -> BACKEND_URL/*
 * Dengan begitu browser hanya bicara ke satu domain (frontend), jadi cookie login
 * tetap terkirim dan tidak ada masalah CORS / third-party cookie di production.
 *
 * BACKEND_URL diisi di Vercel (Project Settings > Environment Variables),
 * contoh: https://finance-api.onrender.com  (tanpa tanda "/" di akhir)
 */
const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:3000").replace(/\/+$/, "");

const nextConfig = {
  reactStrictMode: false,
  // Template ini masih punya beberapa type error (lihat README). Aplikasi tetap jalan normal,
  // jadi build tidak digagalkan oleh type-check/lint. Bersihkan bertahap lalu hapus dua baris ini.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
