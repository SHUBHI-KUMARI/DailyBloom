import prisma from '../config/database.js';
import { ApiError } from '../middleware/error.middleware.js';

const VALID_CATEGORIES = ['personal', 'health', 'career', 'learning', 'finance'];
const VALID_STATUSES = ['active', 'completed', 'archived'];

/**
 * Get all goals for a user
 */
export const getGoals = async (userId, { status = 'active' } = {}) => {
  const where = { userId };
  
  if (status && status !== 'all') {
    where.status = status;
  }

  const goals = await prisma.goal.findMany({
    where,
    include: {
      milestones: {
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return goals;
};

/**
 * Get a single goal by ID
 */
export const getGoalById = async (id, userId) => {
  const goal = await prisma.goal.findFirst({
    where: { id, userId },
    include: {
      milestones: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!goal) {
    throw new ApiError(404, 'Goal not found');
  }

  return goal;
};

/**
 * Create a new goal
 */
export const createGoal = async (userId, { title, description, category, targetDate, milestones = [] }) => {
  // Validate category
  if (category && !VALID_CATEGORIES.includes(category)) {
    throw new ApiError(400, `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  const goal = await prisma.goal.create({
    data: {
      title,
      description,
      category: category || 'personal',
      targetDate: targetDate ? new Date(targetDate) : null,
      userId,
      milestones: {
        create: milestones.map(m => ({ title: m.title || m }))
      }
    },
    include: {
      milestones: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  return goal;
};

/**
 * Update a goal
 */
export const updateGoal = async (id, userId, { title, description, category, targetDate, status }) => {
  // Check if goal exists and belongs to user
  const existing = await prisma.goal.findFirst({
    where: { id, userId }
  });

  if (!existing) {
    throw new ApiError(404, 'Goal not found');
  }

  // Validate category
  if (category && !VALID_CATEGORIES.includes(category)) {
    throw new ApiError(400, `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Validate status
  if (status && !VALID_STATUSES.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (category !== undefined) updateData.category = category;
  if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;
  if (status !== undefined) updateData.status = status;

  const goal = await prisma.goal.update({
    where: { id },
    data: updateData,
    include: {
      milestones: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  return goal;
};

/**
 * Delete a goal
 */
export const deleteGoal = async (id, userId) => {
  const existing = await prisma.goal.findFirst({
    where: { id, userId }
  });

  if (!existing) {
    throw new ApiError(404, 'Goal not found');
  }

  await prisma.goal.delete({
    where: { id }
  });

  return { message: 'Goal deleted successfully' };
};

/**
 * Add a milestone to a goal
 */
export const addMilestone = async (goalId, userId, { title }) => {
  // Check if goal exists and belongs to user
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId }
  });

  if (!goal) {
    throw new ApiError(404, 'Goal not found');
  }

  const milestone = await prisma.milestone.create({
    data: {
      title,
      goalId
    }
  });

  // Recalculate progress
  await recalculateProgress(goalId);

  return milestone;
};

/**
 * Toggle milestone completion
 */
export const toggleMilestone = async (milestoneId, userId) => {
  // Find milestone and verify ownership through goal
  const milestone = await prisma.milestone.findFirst({
    where: { id: milestoneId },
    include: { goal: true }
  });

  if (!milestone || milestone.goal.userId !== userId) {
    throw new ApiError(404, 'Milestone not found');
  }

  const updatedMilestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      completed: !milestone.completed,
      completedAt: !milestone.completed ? new Date() : null
    }
  });

  // Recalculate goal progress
  await recalculateProgress(milestone.goalId);

  return updatedMilestone;
};

/**
 * Delete a milestone
 */
export const deleteMilestone = async (milestoneId, userId) => {
  // Find milestone and verify ownership through goal
  const milestone = await prisma.milestone.findFirst({
    where: { id: milestoneId },
    include: { goal: true }
  });

  if (!milestone || milestone.goal.userId !== userId) {
    throw new ApiError(404, 'Milestone not found');
  }

  await prisma.milestone.delete({
    where: { id: milestoneId }
  });

  // Recalculate goal progress
  await recalculateProgress(milestone.goalId);

  return { message: 'Milestone deleted successfully' };
};

/**
 * Recalculate goal progress based on completed milestones
 */
const recalculateProgress = async (goalId) => {
  const milestones = await prisma.milestone.findMany({
    where: { goalId }
  });

  let progress = 0;
  if (milestones.length > 0) {
    const completedCount = milestones.filter(m => m.completed).length;
    progress = Math.round((completedCount / milestones.length) * 100);
  }

  await prisma.goal.update({
    where: { id: goalId },
    data: { progress }
  });

  return progress;
};

/**
 * Get goal statistics
 */
export const getGoalStats = async (userId) => {
  const goals = await prisma.goal.findMany({
    where: { userId },
    include: {
      milestones: true
    }
  });

  const stats = {
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    archived: goals.filter(g => g.status === 'archived').length,
    averageProgress: 0,
    totalMilestones: 0,
    completedMilestones: 0
  };

  if (goals.length > 0) {
    const activeGoals = goals.filter(g => g.status === 'active');
    if (activeGoals.length > 0) {
      stats.averageProgress = Math.round(
        activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length
      );
    }

    goals.forEach(goal => {
      stats.totalMilestones += goal.milestones.length;
      stats.completedMilestones += goal.milestones.filter(m => m.completed).length;
    });
  }

  return stats;
};
