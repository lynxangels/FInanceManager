import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id_pengguna: number;
    email: string;
    role: string;
  };
}

export class CalendarController {
  static async getAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const events = await prisma.calendar_events.findMany({
        where: { id_pengguna },
        orderBy: { start_date: 'asc' },
      });
      return res.status(200).json({ success: true, data: events });
    } catch (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil event' });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { title, start_date, end_date, color, all_day } = req.body;

      if (!title || !start_date || !end_date) {
        return res.status(400).json({ success: false, message: 'Judul dan tanggal wajib diisi' });
      }

      const event = await prisma.calendar_events.create({
        data: {
          id_pengguna,
          title,
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          color,
          all_day: Boolean(all_day),
        },
      });
      return res.status(201).json({ success: true, data: event });
    } catch (error) {
      console.error('Error creating event:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menambahkan event' });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { id } = req.params;
      const { title, start_date, end_date, color, all_day } = req.body;

      const existing = await prisma.calendar_events.findFirst({
        where: { id_event: parseInt(id), id_pengguna },
      });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Event tidak ditemukan' });
      }

      const event = await prisma.calendar_events.update({
        where: { id_event: parseInt(id) },
        data: {
          title,
          start_date: start_date ? new Date(start_date) : existing.start_date,
          end_date: end_date ? new Date(end_date) : existing.end_date,
          color,
          all_day: all_day !== undefined ? Boolean(all_day) : existing.all_day,
        },
      });
      return res.status(200).json({ success: true, data: event });
    } catch (error) {
      console.error('Error updating event:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memperbarui event' });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { id } = req.params;

      const existing = await prisma.calendar_events.findFirst({
        where: { id_event: parseInt(id), id_pengguna },
      });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Event tidak ditemukan' });
      }

      await prisma.calendar_events.delete({ where: { id_event: parseInt(id) } });
      return res.status(200).json({ success: true, message: 'Event berhasil dihapus' });
    } catch (error) {
      console.error('Error deleting event:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus event' });
    }
  }
}
