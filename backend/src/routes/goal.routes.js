import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createGoalValidation,
  updateGoalValidation,
  createMilestoneValidation
} from '../validators/data.validators.js';
import * as goalService from '../services/goal.service.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/goals
 * @desc    Get all goals for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const goals = await goalService.getGoals(req.user.id, { status });

    res.json({
      success: true,
      data: { goals }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/goals/stats
 * @desc    Get goal statistics
 * @access  Private
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await goalService.getGoalStats(req.user.id);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/goals/:id
 * @desc    Get a single goal
 * @access  Private
 */
router.get('/:id', async (req, res, next) => {
  try {
    const goal = await goalService.getGoalById(req.params.id, req.user.id);

    res.json({
      success: true,
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/goals
 * @desc    Create a new goal
 * @access  Private
 */
router.post('/', createGoalValidation, validate, async (req, res, next) => {
  try {
    const { title, description, category, targetDate, milestones } = req.body;
    const goal = await goalService.createGoal(req.user.id, {
      title,
      description,
      category,
      targetDate,
      milestones
    });

    res.status(201).json({
      success: true,
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/goals/:id
 * @desc    Update a goal
 * @access  Private
 */
router.put('/:id', updateGoalValidation, validate, async (req, res, next) => {
  try {
    const { title, description, category, targetDate, status } = req.body;
    const goal = await goalService.updateGoal(req.params.id, req.user.id, {
      title,
      description,
      category,
      targetDate,
      status
    });

    res.json({
      success: true,
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete a goal
 * @access  Private
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await goalService.deleteGoal(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/goals/:id/milestones
 * @desc    Add a milestone to a goal
 * @access  Private
 */
router.post('/:id/milestones', createMilestoneValidation, validate, async (req, res, next) => {
  try {
    const { title } = req.body;
    const milestone = await goalService.addMilestone(req.params.id, req.user.id, { title });

    res.status(201).json({
      success: true,
      data: { milestone }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/goals/milestones/:milestoneId/toggle
 * @desc    Toggle milestone completion
 * @access  Private
 */
router.post('/milestones/:milestoneId/toggle', async (req, res, next) => {
  try {
    const milestone = await goalService.toggleMilestone(req.params.milestoneId, req.user.id);

    res.json({
      success: true,
      data: { milestone }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/goals/milestones/:milestoneId
 * @desc    Delete a milestone
 * @access  Private
 */
router.delete('/milestones/:milestoneId', async (req, res, next) => {
  try {
    await goalService.deleteMilestone(req.params.milestoneId, req.user.id);

    res.json({
      success: true,
      message: 'Milestone deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
