import { Router } from 'express';
import { IncomeController } from '../controllers';
import { AuthMiddleware } from '../middlewares';

const router = Router();

// Income Routes
router.post('/', AuthMiddleware.verifyToken, IncomeController.create);
router.get('/', AuthMiddleware.verifyToken, IncomeController.getAll);
router.get('/statistics', AuthMiddleware.verifyToken, IncomeController.getStatistics);
router.get('/:id', AuthMiddleware.verifyToken, IncomeController.getById);
router.put('/:id', AuthMiddleware.verifyToken, IncomeController.update);
router.delete('/:id', AuthMiddleware.verifyToken, IncomeController.delete);

export default router;