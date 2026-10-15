import { Router } from 'express';
import { NotesController } from '../controllers';
import { AuthMiddleware } from '../middlewares';

const router = Router();

router.get('/', AuthMiddleware.verifyToken, NotesController.getAll);
router.post('/', AuthMiddleware.verifyToken, NotesController.create);
router.put('/:id', AuthMiddleware.verifyToken, NotesController.update);
router.delete('/:id', AuthMiddleware.verifyToken, NotesController.delete);

export default router;
