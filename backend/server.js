import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import moodTrackerRoutes from './routes/moodTrackerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import auxRoutes from './routes/auxRoutes.js';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.RATE_LIMIT || 100
});

app.use('/api/', limiter);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/aux', auxRoutes);
app.use('/api/mood', moodTrackerRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Handle unhandled routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.originalUrl} on this server`
  });
});

// Global error handler
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default server;