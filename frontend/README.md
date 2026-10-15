# Frontend — Personal Finance Manager

Next.js 14 + MUI (template Modernize). Semua request ke API memakai prefix `/backend`
yang diteruskan (proxy) ke `BACKEND_URL` lewat `rewrites` di `next.config.mjs`.

```bash
cp .env.example .env      # isi BACKEND_URL
npm install
npm run dev -- -p 3001    # http://localhost:3001
```

Warna tema ada di `src/utils/theme/DefaultColors.tsx`.
