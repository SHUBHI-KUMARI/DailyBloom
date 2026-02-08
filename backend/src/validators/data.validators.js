import { body, query, param } from 'express-validator';

/**
 * Validation rules for creating a journal entry
 */
export const createJournalValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date')
];

/**
 * Validation rules for updating a journal entry
 */
export const updateJournalValidation = [
  param('id')
    .notEmpty()
    .withMessage('Journal ID is required'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('content')
    .optional()
    .trim(),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date')
];

/**
 * Validation rules for journal list query
 */
export const listJournalsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
];

/**
 * Validation rules for creating a habit
 */
export const createHabitValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Habit name is required')
    .isLength({ max: 100 })
    .withMessage('Habit name must be less than 100 characters')
];

/**
 * Validation rules for updating habit progress
 */
export const updateHabitProgressValidation = [
  param('id')
    .notEmpty()
    .withMessage('Habit ID is required'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format')
];

/**
 * Validation rules for bulk update habit progress
 */
export const bulkUpdateHabitProgressValidation = [
  param('id')
    .notEmpty()
    .withMessage('Habit ID is required'),
  body('progress')
    .isObject()
    .withMessage('Progress must be an object with date keys')
];

/**
 * Validation rules for creating a mood entry
 */
export const createMoodValidation = [
  body('mood')
    .trim()
    .notEmpty()
    .withMessage('Mood is required')
    .isIn(['great', 'good', 'neutral', 'bad', 'awful'])
    .withMessage('Mood must be one of: great, good, neutral, bad, awful'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Note must be less than 1000 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date')
];

/**
 * Validation rules for updating a mood entry
 */
export const updateMoodValidation = [
  param('id')
    .notEmpty()
    .withMessage('Mood entry ID is required'),
  body('mood')
    .optional()
    .trim()
    .isIn(['great', 'good', 'neutral', 'bad', 'awful'])
    .withMessage('Mood must be one of: great, good, neutral, bad, awful'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Note must be less than 1000 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date')
];

/**
 * Validation rules for mood stats query
 */
export const moodStatsValidation = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
];

/**
 * Validation rules for creating a goal
 */
export const createGoalValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('category')
    .optional()
    .isIn(['personal', 'health', 'career', 'learning', 'finance'])
    .withMessage('Category must be one of: personal, health, career, learning, finance'),
  body('targetDate')
    .optional()
    .isISO8601()
    .withMessage('Target date must be a valid ISO 8601 date'),
  body('milestones')
    .optional()
    .isArray()
    .withMessage('Milestones must be an array')
];

/**
 * Validation rules for updating a goal
 */
export const updateGoalValidation = [
  param('id')
    .notEmpty()
    .withMessage('Goal ID is required'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('category')
    .optional()
    .isIn(['personal', 'health', 'career', 'learning', 'finance'])
    .withMessage('Category must be one of: personal, health, career, learning, finance'),
  body('targetDate')
    .optional()
    .isISO8601()
    .withMessage('Target date must be a valid ISO 8601 date'),
  body('status')
    .optional()
    .isIn(['active', 'completed', 'archived'])
    .withMessage('Status must be one of: active, completed, archived')
];

/**
 * Validation rules for creating a milestone
 */
export const createMilestoneValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Milestone title is required')
    .isLength({ max: 200 })
    .withMessage('Milestone title must be less than 200 characters')
];
