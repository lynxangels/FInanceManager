import { Router } from 'express';
import { CurrencyController } from '../controllers';
import { AuthMiddleware } from '../middlewares';

const router = Router();

// Currency Routes
router.get('/', AuthMiddleware.verifyToken, CurrencyController.getAll);
router.get('/:id', AuthMiddleware.verifyToken, CurrencyController.getById);
router.post('/', AuthMiddleware.verifyToken, AuthMiddleware.verifyAdmin, CurrencyController.create);
router.put('/:id', AuthMiddleware.verifyToken, AuthMiddleware.verifyAdmin, CurrencyController.update);
router.delete('/:id', AuthMiddleware.verifyToken, AuthMiddleware.verifyAdmin, CurrencyController.delete);

export default router;
