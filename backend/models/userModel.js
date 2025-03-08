import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  bio: { type: String },
  createdAt: { type: Date, default: Date.now },
  
  // Mood Tracking Integration
  moods: [{
    score: { type: Number, required: true, min: 1, max: 10 },
    description: String,
    triggers: [String],
    timestamp: { type: Date, default: Date.now }
  }],
  
  // References to detailed mood tracking
  journals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Journal' }],
  triggers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MoodTrigger' }],
  remedies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MoodRemedy' }]
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);