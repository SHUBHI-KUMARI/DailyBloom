import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createJournalValidation,
  updateJournalValidation,
  listJournalsValidation
} from '../validators/data.validators.js';
import * as journalService from '../services/journal.service.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/journals
 * @desc    Get all journal entries for the authenticated user
 * @access  Private
 */
router.get('/', listJournalsValidation, validate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await journalService.getJournals(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      search
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
 * @route   GET /api/journals/:id
 * @desc    Get a single journal entry
 * @access  Private
 */
router.get('/:id', async (req, res, next) => {
  try {
    const journal = await journalService.getJournalById(req.params.id, req.user.id);

    res.json({
      success: true,
      data: { journal }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/journals
 * @desc    Create a new journal entry
 * @access  Private
 */
router.post('/', createJournalValidation, validate, async (req, res, next) => {
  try {
    const { title, content, date } = req.body;
    const journal = await journalService.createJournal(req.user.id, { title, content, date });

    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      data: { journal }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/journals/:id
 * @desc    Update a journal entry
 * @access  Private
 */
router.put('/:id', updateJournalValidation, validate, async (req, res, next) => {
  try {
    const { title, content, date } = req.body;
    const journal = await journalService.updateJournal(req.params.id, req.user.id, { title, content, date });

    res.json({
      success: true,
      message: 'Journal entry updated successfully',
      data: { journal }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/journals/:id
 * @desc    Delete a journal entry
 * @access  Private
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await journalService.deleteJournal(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/journals/range/:startDate/:endDate
 * @desc    Get journals within a date range
 * @access  Private
 */
router.get('/range/:startDate/:endDate', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.params;
    const journals = await journalService.getJournalsByDateRange(req.user.id, startDate, endDate);

    res.json({
      success: true,
      data: { journals }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
