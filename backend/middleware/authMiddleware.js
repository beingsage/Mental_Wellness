import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import { catchAsync } from '../utils/errorHandler.js';

export const protect = catchAsync(async (req, res, next) => {
  if (!req.headers.authorization?.startsWith('Bearer')) {
    throw new AppError('No token provided', 401);
  }
  
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw new AppError('User not found', 401);
  }
  
  req.user = user;
  next();
});