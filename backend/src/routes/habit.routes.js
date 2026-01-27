import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createHabitValidation,
  updateHabitProgressValidation,
  bulkUpdateHabitProgressValidation
} from '../validators/data.validators.js';
import * as habitService from '../services/habit.service.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/habits
 * @desc    Get all habits for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res, next) => {
  try {
    const habits = await habitService.getHabits(req.user.id);

    res.json({
      success: true,
      data: { habits }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/habits/stats
 * @desc    Get habit statistics
 * @access  Private
 */
router.get('/stats', async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const stats = await habitService.getHabitStats(req.user.id, parseInt(days));

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/habits/:id
 * @desc    Get a single habit
 * @access  Private
 */
router.get('/:id', async (req, res, next) => {
  try {
    const habit = await habitService.getHabitById(req.params.id, req.user.id);

    res.json({
      success: true,
      data: { habit }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/habits
 * @desc    Create a new habit
 * @access  Private
 */
router.post('/', createHabitValidation, validate, async (req, res, next) => {
  try {
    const { name } = req.body;
    const habit = await habitService.createHabit(req.user.id, { name });

    res.status(201).json({
      success: true,
      message: 'Habit created successfully',
      data: { habit }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/habits/:id
 * @desc    Update a habit
 * @access  Private
 */
router.put('/:id', createHabitValidation, validate, async (req, res, next) => {
  try {
    const { name } = req.body;
    const habit = await habitService.updateHabit(req.params.id, req.user.id, { name });

    res.json({
      success: true,
      message: 'Habit updated successfully',
      data: { habit }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/habits/:id
 * @desc    Delete a habit
 * @access  Private
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await habitService.deleteHabit(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Habit deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/habits/:id/toggle
 * @desc    Toggle habit progress for a specific date
 * @access  Private
 */
router.post('/:id/toggle', updateHabitProgressValidation, validate, async (req, res, next) => {
  try {
    const { date } = req.body;
    const progress = await habitService.toggleHabitProgress(req.params.id, req.user.id, date);

    res.json({
      success: true,
      message: 'Habit progress updated',
      data: { progress }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/habits/:id/progress
 * @desc    Bulk update habit progress
 * @access  Private
 */
router.put('/:id/progress', bulkUpdateHabitProgressValidation, validate, async (req, res, next) => {
  try {
    const { progress } = req.body;
    const habit = await habitService.updateHabitProgress(req.params.id, req.user.id, progress);

    res.json({
      success: true,
      message: 'Habit progress updated',
      data: { habit }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
