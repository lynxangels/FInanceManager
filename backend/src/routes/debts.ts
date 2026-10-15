import { Router } from 'express';
import { DebtController } from '../controllers';
import { AuthMiddleware } from '../middlewares';

const router = Router();

// Debt Routes
router.post('/', AuthMiddleware.verifyToken, DebtController.create);
router.get('/', AuthMiddleware.verifyToken, DebtController.getAll);
router.get('/:id', AuthMiddleware.verifyToken, DebtController.getById);
router.put('/:id', AuthMiddleware.verifyToken, DebtController.update);
router.delete('/:id', AuthMiddleware.verifyToken, DebtController.delete);


export default router;