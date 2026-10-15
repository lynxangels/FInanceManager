# Personal Finance Manager

Aplikasi pencatatan keuangan pribadi (pemasukan, pengeluaran, anggaran, utang/piutang,
tujuan keuangan, kalender, catatan). Tugas AOL **COMP6852004 – Database Technology**, BINUS @Malang.

```
finance-manager/
├── backend/    Express + Prisma + MySQL (REST API)
├── frontend/   Next.js 14 + MUI (dashboard)
└── database/   Dump MySQL (opsional, sebagai referensi)
```

## Arsitektur deploy

```
Browser ──► Vercel (frontend) ──/backend/*──► Render (backend API) ──► Aiven (MySQL)
```

Browser hanya bicara ke domain Vercel. Request ke `/backend/*` diteruskan Vercel ke backend,
jadi cookie login tidak terblokir dan tidak perlu mengatur CORS.

---

## Menjalankan di komputer sendiri

Butuh Node.js 18+ dan MySQL (XAMPP/Laragon/MySQL Server juga bisa).

**1. Backend**
```bash
cd backend
cp .env.example .env        # lalu isi DATABASE_URL dan JWT_SECRET
npm install                 # otomatis menjalankan prisma generate
npx prisma migrate deploy   # membuat semua tabel
npm run seed                # (opsional) isi data contoh
npm run dev                 # http://localhost:3000
```

**2. Frontend** (terminal baru)
```bash
cd frontend
cp .env.example .env        # BACKEND_URL=http://localhost:3000
npm install
npm run dev -- -p 3001      # http://localhost:3001
```

Akun contoh dari seed: `demo@financial.com` / `demo123` (user) dan `admin@financial.com` / `admin123` (admin).
Ganti atau hapus akun ini kalau aplikasinya dipakai sungguhan.

---

## Environment variables

| Di mana | Nama | Isi |
|---|---|---|
| Backend | `DATABASE_URL` | URL koneksi MySQL |
| Backend | `JWT_SECRET` | String acak panjang (wajib di production) |
| Backend | `NODE_ENV` | `production` |
| Backend | `CORS_ORIGIN` | Opsional (tidak dibutuhkan lewat proxy Vercel) |
| Frontend | `BACKEND_URL` | URL backend, tanpa `/` di akhir |

Buat `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Deploy

Urutannya: **database → backend → frontend**.

### 1) Database (Aiven MySQL, gratis)
1. Daftar di aiven.io, buat service **MySQL** dengan plan **Free**.
2. Setelah status *Running*, salin **Service URI** (bentuknya `mysql://avnadmin:...@host:port/defaultdb?ssl-mode=REQUIRED`).
3. Ubah menjadi format Prisma: ganti `?ssl-mode=REQUIRED` dengan `?sslaccept=accept_invalid_certs`.
   Hasil akhirnya dipakai sebagai `DATABASE_URL`.
4. Dari komputermu, isi `backend/.env` dengan `DATABASE_URL` itu, lalu:
   ```bash
   cd backend
   npm install
   npx prisma migrate deploy
   npm run seed        # opsional
   ```

### 2) Backend (Render)
1. render.com → **New → Web Service** → pilih repo GitHub-mu.
2. **Root Directory**: `backend`
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. **Environment**: isi `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`.
6. Setelah live, buka `https://NAMA-APP.onrender.com/` — harus muncul
   `{"success":true,"message":"Money Management API is running",...}`. Salin URL ini.

Catatan: web service gratis biasanya "tidur" saat tidak dipakai, jadi request pertama bisa lambat.
Buka URL backend di browser dulu untuk membangunkannya sebelum demo.

### 3) Frontend (Vercel)
1. vercel.com → **Add New → Project** → import repo yang sama.
2. **Root Directory**: `frontend` (Framework otomatis terdeteksi Next.js).
3. **Environment Variables**: `BACKEND_URL` = URL backend dari langkah 2.
4. **Deploy**. Selesai, login dengan akun seed.

Setiap `git push` ke branch `main` akan men-deploy ulang otomatis.

---

## Catatan teknis

- `frontend/next.config.mjs` mengabaikan error type-check dan lint saat build. Template masih punya
  19 type error (prop wajib yang tidak diberikan di `dashboards/modern`, `page.tsx`, `widgets/cards`,
  tipe `DebtRecord`/`ReceivableRecord` di `finance/management`, dan `components/apps/calendar`).
  Aplikasi tetap jalan; bersihkan bertahap lalu hapus opsi `ignoreBuildErrors`.
  Cek daftar terbarunya dengan `npx tsc --noEmit` di folder `frontend`.
- Backend dijalankan dengan `tsx` (tanpa langkah compile). `npm run typecheck` menjalankan pemeriksaan tipe.
- Jangan pernah commit file `.env`; sudah masuk `.gitignore`.
