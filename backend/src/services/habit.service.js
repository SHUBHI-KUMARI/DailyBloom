import prisma from '../config/database.js';
import { ApiError } from '../middleware/error.middleware.js';

/**
 * Get all habits for a user with progress
 */
export const getHabits = async (userId) => {
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      progress: {
        orderBy: { date: 'desc' },
        take: 30 // Last 30 days of progress
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Transform progress array to object for easier frontend use
  return habits.map(habit => ({
    ...habit,
    progress: habit.progress.reduce((acc, p) => {
      acc[p.date] = p.completed;
      return acc;
    }, {})
  }));
};

/**
 * Get a single habit by ID
 */
export const getHabitById = async (id, userId) => {
  const habit = await prisma.habit.findFirst({
    where: { id, userId },
    include: {
      progress: {
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!habit) {
    throw new ApiError(404, 'Habit not found');
  }

  return {
    ...habit,
    progress: habit.progress.reduce((acc, p) => {
      acc[p.date] = p.completed;
      return acc;
    }, {})
  };
};

/**
 * Create a new habit
 */
export const createHabit = async (userId, { name }) => {
  const habit = await prisma.habit.create({
    data: {
      name,
      userId
    },
    include: {
      progress: true
    }
  });

  return {
    ...habit,
    progress: {}
  };
};

/**
 * Update a habit
 */
export const updateHabit = async (id, userId, { name }) => {
  // Check if habit exists and belongs to user
  const existing = await prisma.habit.findFirst({
    where: { id, userId }
  });

  if (!existing) {
    throw new ApiError(404, 'Habit not found');
  }

  const habit = await prisma.habit.update({
    where: { id },
    data: { name },
    include: {
      progress: true
    }
  });

  return {
    ...habit,
    progress: habit.progress.reduce((acc, p) => {
      acc[p.date] = p.completed;
      return acc;
    }, {})
  };
};

/**
 * Delete a habit
 */
export const deleteHabit = async (id, userId) => {
  // Check if habit exists and belongs to user
  const existing = await prisma.habit.findFirst({
    where: { id, userId }
  });

  if (!existing) {
    throw new ApiError(404, 'Habit not found');
  }

  await prisma.habit.delete({
    where: { id }
  });

  return { message: 'Habit deleted successfully' };
};

/**
 * Toggle habit progress for a specific date
 */
export const toggleHabitProgress = async (habitId, userId, date) => {
  // Check if habit exists and belongs to user
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId }
  });

  if (!habit) {
    throw new ApiError(404, 'Habit not found');
  }

  // Check if progress exists for this date
  const existingProgress = await prisma.habitProgress.findUnique({
    where: {
      habitId_date: {
        habitId,
        date
      }
    }
  });

  let progress;
  if (existingProgress) {
    // Toggle the completion status
    progress = await prisma.habitProgress.update({
      where: { id: existingProgress.id },
      data: { completed: !existingProgress.completed }
    });
  } else {
    // Create new progress entry (marked as completed)
    progress = await prisma.habitProgress.create({
      data: {
        habitId,
        date,
        completed: true
      }
    });
  }

  return progress;
};

/**
 * Update habit progress for multiple dates
 */
export const updateHabitProgress = async (habitId, userId, progressData) => {
  // Check if habit exists and belongs to user
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId }
  });

  if (!habit) {
    throw new ApiError(404, 'Habit not found');
  }

  // Process each date in the progress data
  const updates = Object.entries(progressData).map(async ([date, completed]) => {
    return prisma.habitProgress.upsert({
      where: {
        habitId_date: {
          habitId,
          date
        }
      },
      update: { completed },
      create: {
        habitId,
        date,
        completed
      }
    });
  });

  await Promise.all(updates);

  // Return updated habit with progress
  return getHabitById(habitId, userId);
};

/**
 * Get habit statistics
 */
export const getHabitStats = async (userId, days = 30) => {
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      progress: {
        where: {
          completed: true,
          createdAt: {
            gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          }
        }
      }
    }
  });

  return habits.map(habit => ({
    id: habit.id,
    name: habit.name,
    completedDays: habit.progress.length,
    totalDays: days,
    completionRate: Math.round((habit.progress.length / days) * 100)
  }));
};
