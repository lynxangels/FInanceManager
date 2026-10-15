import { Router } from 'express';
import { BudgetController } from '../controllers';
import { AuthMiddleware } from '../middlewares';

const router = Router();

// Budget Routes
router.post('/', AuthMiddleware.verifyToken, BudgetController.create);
router.get('/', AuthMiddleware.verifyToken, BudgetController.getAll);
router.get('/summary', AuthMiddleware.verifyToken, BudgetController.getSummary);
router.get('/:id', AuthMiddleware.verifyToken, BudgetController.getById);
router.put('/:id', AuthMiddleware.verifyToken, BudgetController.update);
router.delete('/:id', AuthMiddleware.verifyToken, BudgetController.delete);

export default router;