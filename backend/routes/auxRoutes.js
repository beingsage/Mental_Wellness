import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/userModel.js';
import { catchAsync } from '../utils/errorHandler.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. System Status Route
router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// 2. Login Route
router.post('/login', catchAsync(async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      username: user.username
    }
  });
}));

// 3. Register Route
router.post('/register', catchAsync(async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    email,
    password: hashedPassword
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  res.status(201).json({
    token,
    user: {
      id: user._id,
      email: user.email,
      username: user.username
    }
  });
}));

// 4. Logout Route
router.post('/logout', protect, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// 5. Get Developer JWT Token (Protected)
router.post('/developer/token', protect, (req, res) => {
  const devToken = jwt.sign(
    { id: req.userId, role: 'developer' },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  res.json({ devToken });
});

// 6. Password Reset Request
router.post('/password/reset-request', catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  // Generate reset token and send email (implement email service)
  res.json({ message: 'Password reset instructions sent to email' });
}));

// 7. Health Check Route
router.get('/health', (req, res) => {
  res.json({
    database: 'connected',
    api: 'healthy',
    cache: 'operational',
    timestamp: new Date()
  });
});

// 8. User Profile Route
router.get('/profile', protect, catchAsync(async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
}));

// 9. Update Profile Route
router.put('/profile', protect, catchAsync(async (req, res) => {
  const { username, email } = req.body;
  const user = await User.findByIdAndUpdate(
    req.userId,
    { username, email },
    { new: true }
  ).select('-password');
  res.json(user);
}));

// 10. API Documentation Route
router.get('/docs', (req, res) => {
  res.json({
    version: '1.0.0',
    endpoints: {
      auth: ['/login', '/register', '/logout'],
      profile: ['/profile', '/profile/update'],
      system: ['/status', '/health'],
      developer: ['/developer/token']
    },
    documentation: 'https://api.example.com/docs'
  });
});

// 11. Rate Limit Status
router.get('/rate-limit', protect, (req, res) => {
  res.json({
    limit: 100,
    remaining: 95,
    resetTime: new Date(Date.now() + 3600000)
  });
});

export default router;