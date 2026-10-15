import { Router } from 'express';
import { ReceivableController } from '../controllers';
import { AuthMiddleware } from '../middlewares';

const router = Router();

// Receivable Routes
router.post('/', AuthMiddleware.verifyToken, ReceivableController.create);
router.get('/', AuthMiddleware.verifyToken, ReceivableController.getAll);
router.get('/:id', AuthMiddleware.verifyToken, ReceivableController.getById);
router.put('/:id', AuthMiddleware.verifyToken, ReceivableController.update);
router.delete('/:id', AuthMiddleware.verifyToken, ReceivableController.delete);

export default router;