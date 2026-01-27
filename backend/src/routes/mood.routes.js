import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createMoodValidation,
  updateMoodValidation,
  moodStatsValidation
} from '../validators/data.validators.js';
import * as moodService from '../services/mood.service.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/moods
 * @desc    Get all mood entries for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, startDate, endDate } = req.query;
    const result = await moodService.getMoodEntries(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/moods/stats
 * @desc    Get mood statistics
 * @access  Private
 */
router.get('/stats', moodStatsValidation, validate, async (req, res, next) => {
  try {
    const { days = 14 } = req.query;
    const stats = await moodService.getMoodStats(req.user.id, parseInt(days));

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/moods/calendar
 * @desc    Get all user data for calendar view
 * @access  Private
 */
router.get('/calendar', async (req, res, next) => {
  try {
    const data = await moodService.getAllUserData(req.user.id);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/moods/:id
 * @desc    Get a single mood entry
 * @access  Private
 */
router.get('/:id', async (req, res, next) => {
  try {
    const entry = await moodService.getMoodEntryById(req.params.id, req.user.id);

    res.json({
      success: true,
      data: { entry }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/moods
 * @desc    Create a new mood entry
 * @access  Private
 */
router.post('/', createMoodValidation, validate, async (req, res, next) => {
  try {
    const { mood, note, date } = req.body;
    const entry = await moodService.createMoodEntry(req.user.id, { mood, note, date });

    res.status(201).json({
      success: true,
      message: 'Mood entry created successfully',
      data: { entry }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/moods/:id
 * @desc    Update a mood entry
 * @access  Private
 */
router.put('/:id', updateMoodValidation, validate, async (req, res, next) => {
  try {
    const { mood, note, date } = req.body;
    const entry = await moodService.updateMoodEntry(req.params.id, req.user.id, { mood, note, date });

    res.json({
      success: true,
      message: 'Mood entry updated successfully',
      data: { entry }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/moods/:id
 * @desc    Delete a mood entry
 * @access  Private
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await moodService.deleteMoodEntry(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Mood entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
