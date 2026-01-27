import prisma from '../config/database.js';
import { ApiError } from '../middleware/error.middleware.js';

const VALID_MOODS = ['great', 'good', 'neutral', 'bad', 'awful'];

/**
 * Get all mood entries for a user
 */
export const getMoodEntries = async (userId, { page = 1, limit = 50, startDate, endDate }) => {
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(startDate && endDate && {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    })
  };

  const [entries, total] = await Promise.all([
    prisma.moodEntry.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit
    }),
    prisma.moodEntry.count({ where })
  ]);

  return {
    entries,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get a single mood entry by ID
 */
export const getMoodEntryById = async (id, userId) => {
  const entry = await prisma.moodEntry.findFirst({
    where: { id, userId }
  });

  if (!entry) {
    throw new ApiError(404, 'Mood entry not found');
  }

  return entry;
};

/**
 * Create a new mood entry
 */
export const createMoodEntry = async (userId, { mood, note, date }) => {
  if (!VALID_MOODS.includes(mood)) {
    throw new ApiError(400, `Invalid mood. Must be one of: ${VALID_MOODS.join(', ')}`);
  }

  const entry = await prisma.moodEntry.create({
    data: {
      mood,
      note,
      date: date ? new Date(date) : new Date(),
      userId
    }
  });

  return entry;
};

/**
 * Update a mood entry
 */
export const updateMoodEntry = async (id, userId, { mood, note, date }) => {
  // Check if entry exists and belongs to user
  const existing = await prisma.moodEntry.findFirst({
    where: { id, userId }
  });

  if (!existing) {
    throw new ApiError(404, 'Mood entry not found');
  }

  if (mood && !VALID_MOODS.includes(mood)) {
    throw new ApiError(400, `Invalid mood. Must be one of: ${VALID_MOODS.join(', ')}`);
  }

  const entry = await prisma.moodEntry.update({
    where: { id },
    data: {
      ...(mood !== undefined && { mood }),
      ...(note !== undefined && { note }),
      ...(date !== undefined && { date: new Date(date) })
    }
  });

  return entry;
};

/**
 * Delete a mood entry
 */
export const deleteMoodEntry = async (id, userId) => {
  // Check if entry exists and belongs to user
  const existing = await prisma.moodEntry.findFirst({
    where: { id, userId }
  });

  if (!existing) {
    throw new ApiError(404, 'Mood entry not found');
  }

  await prisma.moodEntry.delete({
    where: { id }
  });

  return { message: 'Mood entry deleted successfully' };
};

/**
 * Get mood statistics for a time period
 */
export const getMoodStats = async (userId, days = 14) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const entries = await prisma.moodEntry.findMany({
    where: {
      userId,
      date: {
        gte: startDate
      }
    },
    orderBy: { date: 'asc' }
  });

  // Calculate mood distribution
  const moodCounts = VALID_MOODS.reduce((acc, mood) => {
    acc[mood] = entries.filter(e => e.mood === mood).length;
    return acc;
  }, {});

  // Calculate average mood score (great=4, good=3, neutral=2, bad=1, awful=0)
  const moodScores = { great: 4, good: 3, neutral: 2, bad: 1, awful: 0 };
  const totalScore = entries.reduce((sum, e) => sum + moodScores[e.mood], 0);
  const averageScore = entries.length > 0 ? totalScore / entries.length : null;

  // Group by date for chart data
  const byDate = entries.reduce((acc, entry) => {
    const dateStr = entry.date.toISOString().split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(entry);
    return acc;
  }, {});

  return {
    totalEntries: entries.length,
    moodCounts,
    averageScore,
    averageMood: averageScore !== null ? getMoodFromScore(averageScore) : null,
    byDate,
    entries
  };
};

/**
 * Get mood label from numeric score
 */
const getMoodFromScore = (score) => {
  if (score >= 3.5) return 'great';
  if (score >= 2.5) return 'good';
  if (score >= 1.5) return 'neutral';
  if (score >= 0.5) return 'bad';
  return 'awful';
};

/**
 * Get all user data for calendar view
 */
export const getAllUserData = async (userId) => {
  const [journals, habits, moods] = await Promise.all([
    prisma.journal.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    }),
    prisma.habit.findMany({
      where: { userId },
      include: {
        progress: true
      }
    }),
    prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    })
  ]);

  // Transform habits progress
  const transformedHabits = habits.map(habit => ({
    ...habit,
    progress: habit.progress.reduce((acc, p) => {
      acc[p.date] = p.completed;
      return acc;
    }, {})
  }));

  return {
    journals,
    habits: transformedHabits,
    moods
  };
};
