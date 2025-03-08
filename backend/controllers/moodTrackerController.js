import { models } from '../models/MoodTracker.model.js';
const { SentimentAnalysis, TimeSeries, MoodTrigger, MoodRemedy } = models;

// 1. Add a Journal Entry (Sentiment Analysis)
export const addJournalEntry = async (req, res) => {
  try {
    const { journalEntry, moodScore, context } = req.body;
    const newEntry = new SentimentAnalysis({
      userId: req.userId,
      journalEntry,
      moodScore,
      context,
    });
    await newEntry.save();
    res.status(201).json({ message: 'Journal entry added', data: newEntry });
  } catch (error) {
    res.status(500).json({ message: 'Error adding journal entry', error: error.message });
  }
};

// 2. Add Time-Series Data (Mood Tracking)
export const addTimeSeriesData = async (req, res) => {
  try {
    const { moodScore, sleepHours, exercise, weather } = req.body;
    const newTimeSeries = new TimeSeries({
      userId: req.userId,
      moodScore,
      sleepHours,
      exercise,
      weather,
    });
    await newTimeSeries.save();
    res.status(201).json({ message: 'Time-series data added', data: newTimeSeries });
  } catch (error) {
    res.status(500).json({ message: 'Error adding time-series data', error: error.message });
  }
};

// 3. Add a Mood Trigger
export const addMoodTrigger = async (req, res) => {
  try {
    const { triggerDescription, moodBefore, moodAfter, context } = req.body;
    const newTrigger = new MoodTrigger({
      userId: req.userId,
      triggerDescription,
      moodBefore,
      moodAfter,
      context,
    });
    await newTrigger.save();
    res.status(201).json({ message: 'Mood trigger added', data: newTrigger });
  } catch (error) {
    res.status(500).json({ message: 'Error adding mood trigger', error: error.message });
  }
};

// 4. Add a Mood Remedy
export const addMoodRemedy = async (req, res) => {
  try {
    const { remedyName, moodBefore, moodAfter, userFeedback, userPreference } = req.body;
    const newRemedy = new MoodRemedy({
      userId: req.userId,
      remedyName,
      moodBefore,
      moodAfter,
      userFeedback,
      userPreference,
    });
    await newRemedy.save();
    res.status(201).json({ message: 'Mood remedy added', data: newRemedy });
  } catch (error) {
    res.status(500).json({ message: 'Error adding mood remedy', error: error.message });
  }
};

// 5. Get All Journal Entries for a User
export const getJournalEntries = async (req, res) => {
  try {
    const entries = await SentimentAnalysis.find({ userId: req.userId });
    res.status(200).json({ message: 'Journal entries retrieved', data: entries });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving journal entries', error: error.message });
  }
};

// 6. Get All Time-Series Data for a User
export const getTimeSeriesData = async (req, res) => {
  try {
    const timeSeriesData = await TimeSeries.find({ userId: req.userId });
    res.status(200).json({ message: 'Time-series data retrieved', data: timeSeriesData });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving time-series data', error: error.message });
  }
};

// 7. Get All Mood Triggers for a User
export const getMoodTriggers = async (req, res) => {
  try {
    const triggers = await MoodTrigger.find({ userId: req.userId });
    res.status(200).json({ message: 'Mood triggers retrieved', data: triggers });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving mood triggers', error: error.message });
  }
};

// 8. Get All Mood Remedies for a User
export const getMoodRemedies = async (req, res) => {
  try {
    const remedies = await MoodRemedy.find({ userId: req.userId });
    res.status(200).json({ message: 'Mood remedies retrieved', data: remedies });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving mood remedies', error: error.message });
  }
};

// 9. Delete a Journal Entry
export const deleteJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;
    await SentimentAnalysis.findByIdAndDelete(id);
    res.status(200).json({ message: 'Journal entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting journal entry', error: error.message });
  }
};

// 10. Delete a Mood Trigger
export const deleteMoodTrigger = async (req, res) => {
  try {
    const { id } = req.params;
    await MoodTrigger.findByIdAndDelete(id);
    res.status(200).json({ message: 'Mood trigger deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting mood trigger', error: error.message });
  }
};

// 11. Delete a Mood Remedy
export const deleteMoodRemedy = async (req, res) => {
  try {
    const { id } = req.params;
    await MoodRemedy.findByIdAndDelete(id);
    res.status(200).json({ message: 'Mood remedy deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting mood remedy', error: error.message });
  }
};