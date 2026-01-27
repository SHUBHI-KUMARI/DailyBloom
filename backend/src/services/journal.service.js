import prisma from '../config/database.js';
import { ApiError } from '../middleware/error.middleware.js';

/**
 * Get all journals for a user
 */
export const getJournals = async (userId, { page = 1, limit = 20, search = '' }) => {
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  const [journals, total] = await Promise.all([
    prisma.journal.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit
    }),
    prisma.journal.count({ where })
  ]);

  return {
    journals,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get a single journal by ID
 */
export const getJournalById = async (id, userId) => {
  const journal = await prisma.journal.findFirst({
    where: { id, userId }
  });

  if (!journal) {
    throw new ApiError(404, 'Journal entry not found');
  }

  return journal;
};

/**
 * Create a new journal entry
 */
export const createJournal = async (userId, { title, content, date }) => {
  const journal = await prisma.journal.create({
    data: {
      title,
      content,
      date: date ? new Date(date) : new Date(),
      userId
    }
  });

  return journal;
};

/**
 * Update a journal entry
 */
export const updateJournal = async (id, userId, { title, content, date }) => {
  // Check if journal exists and belongs to user
  const existing = await prisma.journal.findFirst({
    where: { id, userId }
  });

  if (!existing) {
    throw new ApiError(404, 'Journal entry not found');
  }

  const journal = await prisma.journal.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(date !== undefined && { date: new Date(date) })
    }
  });

  return journal;
};

/**
 * Delete a journal entry
 */
export const deleteJournal = async (id, userId) => {
  // Check if journal exists and belongs to user
  const existing = await prisma.journal.findFirst({
    where: { id, userId }
  });

  if (!existing) {
    throw new ApiError(404, 'Journal entry not found');
  }

  await prisma.journal.delete({
    where: { id }
  });

  return { message: 'Journal entry deleted successfully' };
};

/**
 * Get journals by date range
 */
export const getJournalsByDateRange = async (userId, startDate, endDate) => {
  const journals = await prisma.journal.findMany({
    where: {
      userId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    },
    orderBy: { date: 'desc' }
  });

  return journals;
};
