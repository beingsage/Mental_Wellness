export const validateMoodEntry = (req, res, next) => {
  const { moodScore } = req.body;
  if (!moodScore || moodScore < 1 || moodScore > 10) {
    throw new AppError('Invalid mood score', 400);
  }
  next();
};

export const validateUserInput = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: 'Please provide all required fields'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters'
    });
  }

  if (!email.includes('@')) {
    return res.status(400).json({
      message: 'Please provide a valid email'
    });
  }

  next();
};