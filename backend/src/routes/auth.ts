import { Router } from 'express';
import { AuthController } from '../controllers';
import { AuthMiddleware } from '../middlewares';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// User Profile Routes
router.get('/profile', AuthMiddleware.verifyToken, AuthController.getProfile);
router.put('/profile', AuthMiddleware.verifyToken, AuthController.updateProfile);
router.put('/change-password', AuthMiddleware.verifyToken, AuthController.changePassword);

// Logout (optional, clear cookie)
router.post('/logout', AuthMiddleware.verifyToken, AuthController.logout);

export default router;