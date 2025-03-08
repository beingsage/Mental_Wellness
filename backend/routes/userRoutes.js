import express from 'express';
import { userController } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateUserInput } from '../middleware/validateRequest.js';

const router = express.Router();

// Public routes
router.post('/register', validateUserInput, userController.register);
router.post('/login', userController.login);

// Protected routes
router.use(protect); // Apply authentication middleware

router.get('/profile', userController.getProfile);
router.post('/mood', userController.addMood);
router.get('/mood/history', userController.getMoodHistory);
router.get('/mood/analytics', userController.getMoodAnalytics);

export default router;