import { Router } from 'express';
import { FinancialGoalController } from '../controllers';
import { AuthMiddleware } from '../middlewares';

const router = Router();

// Financial Goal Routes
router.post('/', AuthMiddleware.verifyToken, FinancialGoalController.create);
router.get('/', AuthMiddleware.verifyToken, FinancialGoalController.getAll);
router.get('/:id', AuthMiddleware.verifyToken, FinancialGoalController.getById);
router.put('/:id', AuthMiddleware.verifyToken, FinancialGoalController.update);
router.delete('/:id', AuthMiddleware.verifyToken, FinancialGoalController.delete);

export default router;