import mongoose from "mongoose";
import { User } from './userModel.js';

// 1. Sentiment Analysis Schema
const sentimentAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  journalEntry: { type: String, required: true },
  moodScore: { type: Number, min: 1, max: 10, required: true },
  context: [{ type: String }],
  sentimentScore: { type: Number },
});

// 2. Time-Series Forecasting Schema
const timeSeriesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  moodScore: { type: Number, min: 1, max: 10, required: true },
  sleepHours: { type: Number },
  exercise: { type: Boolean },
  weather: { type: String },
});

// 3. Mood Triggers Schema
const moodTriggerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  triggerDescription: { type: String, required: true },
  moodBefore: { type: Number, min: 1, max: 10, required: true },
  moodAfter: { type: Number, min: 1, max: 10, required: true },
  context: [{ type: String }],
});

// 4. Mood Remedies Schema
const moodRemedySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  remedyName: { type: String, required: true },
  moodBefore: { type: Number, min: 1, max: 10, required: true },
  moodAfter: { type: Number, min: 1, max: 10, required: true },
  userFeedback: { type: Boolean },
  userPreference: { type: String },
});

// 5. User Schema (Merged with Additional Metrics and Methods)
const userSchema = new mongoose.Schema({
  // Basic User Information
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password

  // References to Other Models
  moodHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "SentimentAnalysis" }],
  timeSeriesData: [{ type: mongoose.Schema.Types.ObjectId, ref: "TimeSeries" }],
  moodTriggers: [{ type: mongoose.Schema.Types.ObjectId, ref: "MoodTrigger" }],
  moodRemedies: [{ type: mongoose.Schema.Types.ObjectId, ref: "MoodRemedy" }],

  // Engagement Metrics
  sessionTime: { type: Number, default: 0 }, // Total time spent in sessions (in minutes)
  sessionsCompleted: { type: Number, default: 0 }, // Number of sessions completed
  totalSessions: { type: Number, default: 12 }, // Total sessions offered (e.g., 12 sessions)

  // Symptom Scores
  phq9Scores: [{ type: Number }], // Array of PHQ-9 scores (depression)
  gad7Scores: [{ type: Number }], // Array of GAD-7 scores (anxiety)
  symptomImprovement: { type: Number, default: 0 }, // Percentage improvement in symptoms

  // Mood Data
  moodScores: [{ type: Number }], // Array of daily mood scores (1-10)
  moodStabilityIndex: { type: Number, default: 0 }, // Calculated mood stability

  // Peer Support Metrics
  peerSupportMessages: [{ type: String }], // Array of peer messages
  socialBenefitScore: { type: Number, default: 0 }, // Calculated social benefit

  // Reinforcement Learning Metrics
  symptomReward: { type: Number, default: 0 }, // Reward for symptom reduction
  engagementReward: { type: Number, default: 0 }, // Reward for session completion
  totalReward: { type: Number, default: 0 }, // Total reinforcement learning reward

  // Polygenic Risk Score (PRS)
  prs: { type: Number, default: 0 }, // Polygenic risk score for mental health

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Methods to Calculate Fields for User Schema

// 1. Logistic Adherence Prediction
userSchema.methods.calculateAdherence = function () {
  const { sessionsCompleted, totalSessions, symptomImprovement } = this;
  const beta0 = 1.0; // Baseline adherence probability
  const beta1 = 0.5; // Weight of engagement
  const beta2 = 0.3; // Weight of symptom improvement

  const adherenceProbability =
    1 / (1 + Math.exp(-(beta0 + beta1 * sessionsCompleted + beta2 * symptomImprovement)));
  return adherenceProbability;
};

// 2. Dose-Response for CBT Sessions
userSchema.methods.calculateEffectSize = function () {
  const { sessionsCompleted } = this;
  const EMax = 50; // Maximum achievable effect (50% symptom reduction)
  const ED50 = 8; // Sessions needed for 50% of max effect

  const effectSize = (EMax * sessionsCompleted) / (sessionsCompleted + ED50);
  return effectSize;
};

// 3. Linear Symptom Reduction
userSchema.methods.calculateSymptomReduction = function () {
  const { phq9Scores } = this;
  const alpha = 10; // Baseline symptom score
  const beta = -2.1; // Rate of improvement (points/week)
  const timeInWeeks = phq9Scores.length;

  const symptomReduction = alpha + beta * timeInWeeks;
  return symptomReduction;
};

// 4. Cognitive Load Model
userSchema.methods.calculateFatigue = function (timeInHours) {
  const F0 = 100; // Initial cognitive load
  const lambda = 0.3; // Recovery rate

  const fatigue = F0 * Math.exp(-lambda * timeInHours);
  return fatigue;
};

// 5. Peer Support Network Effect
userSchema.methods.calculateSocialBenefit = function () {
  const { peerSupportMessages } = this;
  const sentimentScores = peerSupportMessages.map((message) => analyzeSentiment(message)); // Placeholder for NLP function
  const totalBenefit = sentimentScores.reduce((sum, score) => sum + score, 0);

  return totalBenefit;
};

// 6. Reinforcement Learning Reward
userSchema.methods.calculateTotalReward = function () {
  const { symptomReward, engagementReward } = this;
  const gamma = 0.9; // Discount factor

  const totalReward = symptomReward + gamma * engagementReward;
  return totalReward;
};

// 7. Sentiment Analysis Score
userSchema.methods.calculatePositivity = function (text) {
  const positiveWords = countPositiveWords(text); // Placeholder for lexicon-based function
  const negativeWords = countNegativeWords(text); // Placeholder for lexicon-based function
  const totalWords = text.split(" ").length;

  const positivity = (positiveWords - negativeWords) / totalWords;
  return positivity;
};

// 8. Autoregressive Mood Model
userSchema.methods.calculateMoodStability = function () {
  const { moodScores } = this;
  const phi = 0.6; // Lag-1 autocorrelation

  const moodStability = moodScores.reduce((sum, score, index) => {
    if (index > 0) {
      return sum + phi * moodScores[index - 1];
    }
    return sum;
  }, 0);

  return moodStability / moodScores.length || 0; // Avoid division by zero
};

// 9. Behavioral Activation Energy
userSchema.methods.calculateActivityEnergy = function (stepCount, moodScore) {
  const activityEnergy = Math.log(stepCount + 1) * moodScore;
  return activityEnergy;
};

// 10. Polygenic Risk Score (PRS)
userSchema.methods.calculatePRS = function (snps) {
  const effectSizes = snps.map((snp) => getEffectSize(snp)); // Placeholder for GWAS-based function
  const prs = effectSizes.reduce((sum, effectSize) => sum + effectSize, 0);
  return prs;
};

// Define Models
const SentimentAnalysis = mongoose.model("SentimentAnalysis", sentimentAnalysisSchema);
const TimeSeries = mongoose.model("TimeSeries", timeSeriesSchema);
const MoodTrigger = mongoose.model("MoodTrigger", moodTriggerSchema);
const MoodRemedy = mongoose.model("MoodRemedy", moodRemedySchema);

// Export All Models
export {
  SentimentAnalysis,
  TimeSeries,
  MoodTrigger,
  MoodRemedy,
};

// At the bottom of the file:
export const models = {
  SentimentAnalysis,
  TimeSeries,
  MoodTrigger,
  MoodRemedy,
  User
};