import { Router } from 'express';
import { ExpenseController } from '../controllers';
import { AuthMiddleware } from '../middlewares';

const router = Router();

// Expense Routes
router.post('/', AuthMiddleware.verifyToken, ExpenseController.create);
router.get('/', AuthMiddleware.verifyToken, ExpenseController.getAll);
router.get('/statistics', AuthMiddleware.verifyToken, ExpenseController.getStatistics);
router.get('/recent', AuthMiddleware.verifyToken, ExpenseController.getRecent);
router.get('/:id', AuthMiddleware.verifyToken, ExpenseController.getById);
router.put('/:id', AuthMiddleware.verifyToken, ExpenseController.update);
router.delete('/:id', AuthMiddleware.verifyToken, ExpenseController.delete);

export default router;