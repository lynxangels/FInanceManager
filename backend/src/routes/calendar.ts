import { Router } from 'express';
import { CalendarController } from '../controllers';
import { AuthMiddleware } from '../middlewares';

const router = Router();

router.get('/', AuthMiddleware.verifyToken, CalendarController.getAll);
router.post('/', AuthMiddleware.verifyToken, CalendarController.create);
router.put('/:id', AuthMiddleware.verifyToken, CalendarController.update);
router.delete('/:id', AuthMiddleware.verifyToken, CalendarController.delete);

export default router;
