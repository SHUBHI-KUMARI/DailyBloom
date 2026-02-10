import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as analyticsService from '../services/analytics.service.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/analytics
 * @desc    Get comprehensive analytics for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const analytics = await analyticsService.getAnalytics(req.user.id, { period });

    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/analytics/weekly
 * @desc    Get weekly comparison data
 * @access  Private
 */
router.get('/weekly', async (req, res, next) => {
  try {
    const comparison = await analyticsService.getWeeklyComparison(req.user.id);

    res.json({
      success: true,
      data: { comparison }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
