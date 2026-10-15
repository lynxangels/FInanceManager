import { Router } from 'express';
import { CategoryController } from '../controllers';
import { AuthMiddleware } from '../middlewares';

const router = Router();

// Category Routes
router.get('/', AuthMiddleware.verifyToken, CategoryController.getAll);
router.get('/:id', AuthMiddleware.verifyToken, CategoryController.getById);
router.post('/', AuthMiddleware.verifyToken, AuthMiddleware.verifyAdmin, CategoryController.create);
router.put('/:id', AuthMiddleware.verifyToken, AuthMiddleware.verifyAdmin, CategoryController.update);
router.delete('/:id', AuthMiddleware.verifyToken, AuthMiddleware.verifyAdmin, CategoryController.delete);

export default router;