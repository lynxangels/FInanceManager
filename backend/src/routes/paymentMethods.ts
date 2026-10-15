import { Router } from 'express';
import { PaymentMethodController } from '../controllers';
import { AuthMiddleware } from '../middlewares';

const router = Router();

// Payment Method Routes
router.get('/', AuthMiddleware.verifyToken, PaymentMethodController.getAll);
router.get('/:id', AuthMiddleware.verifyToken, PaymentMethodController.getById);
router.post('/', AuthMiddleware.verifyToken, AuthMiddleware.verifyAdmin, PaymentMethodController.create);
router.put('/:id', AuthMiddleware.verifyToken, AuthMiddleware.verifyAdmin, PaymentMethodController.update);
router.delete('/:id', AuthMiddleware.verifyToken, AuthMiddleware.verifyAdmin, PaymentMethodController.delete);

export default router;