import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import { catchAsync } from '../utils/errorHandler.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// User Controllers
export const userController = {
  // Register User
  register: catchAsync(async (req, res) => {
    const { username, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  }),

  // Login User
  login: catchAsync(async (req, res) => {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  }),

  // Get User Profile with Mood Data
  getProfile: catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('journals')
      .populate('triggers')
      .populate('remedies');
    
    res.json(user);
  }),

  // Add Mood Entry
  addMood: catchAsync(async (req, res) => {
    const { score, description, triggers } = req.body;
    
    const user = await User.findById(req.user.id);
    user.moods.push({ score, description, triggers });
    await user.save();

    res.status(201).json(user.moods[user.moods.length - 1]);
  }),

  // Get User's Mood History
  getMoodHistory: catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json(user.moods);
  }),

  // Get User's Recent Mood Analytics
  getMoodAnalytics: catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id);
    const recentMoods = user.moods.slice(-7); // Last 7 entries
    
    const analytics = {
      average: recentMoods.reduce((acc, mood) => acc + mood.score, 0) / recentMoods.length,
      highest: Math.max(...recentMoods.map(mood => mood.score)),
      lowest: Math.min(...recentMoods.map(mood => mood.score)),
      commonTriggers: getMostFrequentTriggers(recentMoods)
    };

    res.json(analytics);
  })
};

// Helper function for trigger analysis
function getMostFrequentTriggers(moods) {
  const triggerCount = {};
  moods.forEach(mood => {
    mood.triggers.forEach(trigger => {
      triggerCount[trigger] = (triggerCount[trigger] || 0) + 1;
    });
  });
  return Object.entries(triggerCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([trigger]) => trigger);
}