import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

// Di production JWT_SECRET WAJIB diisi (jangan pakai nilai default)
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET belum di-set di environment variables.');
  process.exit(1);
}

// Daftar origin yang boleh akses API (pisahkan dengan koma).
// Default untuk development: frontend di http://localhost:3001
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3001')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Money Management API is running',
    version: '1.0.0',
  });
});

// API Routes
app.use('/', routes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error Handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ⭐ SERVER START ⭐
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/`);
  console.log('=================================');
});

export default app;
