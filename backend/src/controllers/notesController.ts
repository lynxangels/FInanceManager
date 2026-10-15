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

export class NotesController {
  static async getAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const notes = await prisma.notes.findMany({
        where: { id_pengguna },
        orderBy: { created_at: 'desc' },
      });
      return res.status(200).json({ success: true, data: notes });
    } catch (error) {
      console.error('Error fetching notes:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil catatan' });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { title, content, color } = req.body;

      if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Judul dan konten wajib diisi' });
      }

      const note = await prisma.notes.create({
        data: { id_pengguna, title, content, color },
      });
      return res.status(201).json({ success: true, data: note });
    } catch (error) {
      console.error('Error creating note:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menambahkan catatan' });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { id } = req.params;
      const { title, content, color } = req.body;

      const existing = await prisma.notes.findFirst({
        where: { id_note: parseInt(id), id_pengguna },
      });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Catatan tidak ditemukan' });
      }

      const note = await prisma.notes.update({
        where: { id_note: parseInt(id) },
        data: { title, content, color },
      });
      return res.status(200).json({ success: true, data: note });
    } catch (error) {
      console.error('Error updating note:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memperbarui catatan' });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id_pengguna = req.user!.id_pengguna;
      const { id } = req.params;

      const existing = await prisma.notes.findFirst({
        where: { id_note: parseInt(id), id_pengguna },
      });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Catatan tidak ditemukan' });
      }

      await prisma.notes.delete({ where: { id_note: parseInt(id) } });
      return res.status(200).json({ success: true, message: 'Catatan berhasil dihapus' });
    } catch (error) {
      console.error('Error deleting note:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus catatan' });
    }
  }
}
