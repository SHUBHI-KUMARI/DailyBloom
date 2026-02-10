import prisma from '../config/database.js';

/**
 * Get comprehensive analytics for a user
 */
export const getAnalytics = async (userId, { period = '30' } = {}) => {
  const days = parseInt(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Parallel data fetching for better performance
  const [journals, habits, habitsWithProgress, moods, goals] = await Promise.all([
    // Journals
    prisma.journal.findMany({
      where: {
        userId,
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'desc' }
    }),

    // Habits (all)
    prisma.habit.findMany({
      where: { userId }
    }),

    // Habits with progress
    prisma.habit.findMany({
      where: { userId },
      include: {
        progress: {
          where: {
            createdAt: { gte: startDate }
          }
        }
      }
    }),

    // Moods
    prisma.moodEntry.findMany({
      where: {
        userId,
        date: { gte: startDate }
      },
      orderBy: { date: 'desc' }
    }),

    // Goals
    prisma.goal.findMany({
      where: { userId },
      include: {
        milestones: true
      }
    })
  ]);

  // Calculate analytics
  const analytics = {
    period: days,
    overview: calculateOverview(journals, habits, moods, goals),
    journalStats: calculateJournalStats(journals, days),
    habitStats: calculateHabitStats(habitsWithProgress, days),
    moodStats: calculateMoodStats(moods, days),
    goalStats: calculateGoalStats(goals),
    activityHeatmap: calculateActivityHeatmap(journals, habitsWithProgress, moods, days),
    streaks: calculateStreaks(journals, habitsWithProgress, days)
  };

  return analytics;
};

/**
 * Calculate overview statistics
 */
const calculateOverview = (journals, habits, moods, goals) => {
  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  
  let totalProgress = 0;
  if (activeGoals.length > 0) {
    totalProgress = Math.round(
      activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length
    );
  }

  return {
    totalJournals: journals.length,
    totalHabits: habits.length,
    totalMoodEntries: moods.length,
    totalGoals: goals.length,
    activeGoals: activeGoals.length,
    completedGoals: completedGoals.length,
    averageGoalProgress: totalProgress
  };
};

/**
 * Calculate journal statistics
 */
const calculateJournalStats = (journals, days) => {
  const entriesByDate = {};
  const entriesByWeekday = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  let totalWords = 0;

  journals.forEach(journal => {
    const date = new Date(journal.createdAt).toISOString().split('T')[0];
    entriesByDate[date] = (entriesByDate[date] || 0) + 1;
    
    const weekday = new Date(journal.createdAt).getDay();
    entriesByWeekday[weekday]++;

    // Estimate word count
    const wordCount = journal.content.split(/\s+/).filter(w => w.length > 0).length;
    totalWords += wordCount;
  });

  const avgWordsPerEntry = journals.length > 0 ? Math.round(totalWords / journals.length) : 0;
  const avgEntriesPerWeek = journals.length > 0 ? (journals.length / (days / 7)).toFixed(1) : 0;

  return {
    totalEntries: journals.length,
    averageWordsPerEntry: avgWordsPerEntry,
    averageEntriesPerWeek: parseFloat(avgEntriesPerWeek),
    entriesByWeekday,
    mostActiveDay: Object.keys(entriesByWeekday).reduce((a, b) => 
      entriesByWeekday[a] > entriesByWeekday[b] ? a : b
    )
  };
};

/**
 * Calculate habit statistics
 */
const calculateHabitStats = (habits, days) => {
  let totalCompletions = 0;
  let possibleCompletions = habits.length * days;
  const habitPerformance = [];

  habits.forEach(habit => {
    const completions = habit.progress.filter(p => p.completed).length;
    totalCompletions += completions;
    
    const completionRate = days > 0 ? ((completions / days) * 100).toFixed(1) : 0;
    
    habitPerformance.push({
      habitId: habit.id,
      habitName: habit.name,
      completions,
      completionRate: parseFloat(completionRate)
    });
  });

  const overallCompletionRate = possibleCompletions > 0 
    ? ((totalCompletions / possibleCompletions) * 100).toFixed(1) 
    : 0;

  // Sort by completion rate
  habitPerformance.sort((a, b) => b.completionRate - a.completionRate);

  return {
    totalHabits: habits.length,
    totalCompletions,
    overallCompletionRate: parseFloat(overallCompletionRate),
    habitPerformance: habitPerformance.slice(0, 10), // Top 10
    bestHabit: habitPerformance[0] || null,
    worstHabit: habitPerformance[habitPerformance.length - 1] || null
  };
};

/**
 * Calculate mood statistics
 */
const calculateMoodStats = (moods, days) => {
  const moodCounts = {
    great: 0,
    good: 0,
    neutral: 0,
    bad: 0,
    awful: 0
  };

  const moodScores = {
    great: 5,
    good: 4,
    neutral: 3,
    bad: 2,
    awful: 1
  };

  let totalScore = 0;
  const moodTrend = [];

  moods.forEach(mood => {
    moodCounts[mood.mood]++;
    totalScore += moodScores[mood.mood];
    
    moodTrend.push({
      date: mood.date,
      mood: mood.mood,
      score: moodScores[mood.mood]
    });
  });

  const averageScore = moods.length > 0 ? (totalScore / moods.length).toFixed(2) : 0;
  
  // Calculate average mood label
  let averageMood = 'neutral';
  if (averageScore >= 4.5) averageMood = 'great';
  else if (averageScore >= 3.5) averageMood = 'good';
  else if (averageScore >= 2.5) averageMood = 'neutral';
  else if (averageScore >= 1.5) averageMood = 'bad';
  else averageMood = 'awful';

  return {
    totalEntries: moods.length,
    averageScore: parseFloat(averageScore),
    averageMood,
    distribution: moodCounts,
    mostCommonMood: Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b
    ),
    trend: moodTrend.slice(0, 30) // Last 30 entries
  };
};

/**
 * Calculate goal statistics
 */
const calculateGoalStats = (goals) => {
  const goalsByCategory = {
    personal: 0,
    health: 0,
    career: 0,
    learning: 0,
    finance: 0
  };

  const goalsByStatus = {
    active: 0,
    completed: 0,
    archived: 0
  };

  let totalProgress = 0;
  let totalMilestones = 0;
  let completedMilestones = 0;

  goals.forEach(goal => {
    goalsByCategory[goal.category]++;
    goalsByStatus[goal.status]++;
    totalProgress += goal.progress;
    totalMilestones += goal.milestones.length;
    completedMilestones += goal.milestones.filter(m => m.completed).length;
  });

  const averageProgress = goals.length > 0 
    ? Math.round(totalProgress / goals.length) 
    : 0;

  const milestoneCompletionRate = totalMilestones > 0
    ? ((completedMilestones / totalMilestones) * 100).toFixed(1)
    : 0;

  return {
    totalGoals: goals.length,
    byStatus: goalsByStatus,
    byCategory: goalsByCategory,
    averageProgress,
    totalMilestones,
    completedMilestones,
    milestoneCompletionRate: parseFloat(milestoneCompletionRate),
    mostPopularCategory: Object.keys(goalsByCategory).reduce((a, b) => 
      goalsByCategory[a] > goalsByCategory[b] ? a : b
    )
  };
};

/**
 * Calculate activity heatmap data
 */
const calculateActivityHeatmap = (journals, habits, moods, days) => {
  const heatmap = {};
  const today = new Date();

  // Initialize all dates
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    heatmap[dateStr] = {
      date: dateStr,
      journals: 0,
      habits: 0,
      moods: 0,
      total: 0
    };
  }

  // Count journals
  journals.forEach(journal => {
    const dateStr = new Date(journal.createdAt).toISOString().split('T')[0];
    if (heatmap[dateStr]) {
      heatmap[dateStr].journals++;
      heatmap[dateStr].total++;
    }
  });

  // Count habit completions
  habits.forEach(habit => {
    habit.progress.forEach(progress => {
      if (progress.completed && heatmap[progress.date]) {
        heatmap[progress.date].habits++;
        heatmap[progress.date].total++;
      }
    });
  });

  // Count moods
  moods.forEach(mood => {
    const dateStr = new Date(mood.date).toISOString().split('T')[0];
    if (heatmap[dateStr]) {
      heatmap[dateStr].moods++;
      heatmap[dateStr].total++;
    }
  });

  return Object.values(heatmap).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
};

/**
 * Calculate streaks
 */
const calculateStreaks = (journals, habits, days) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Journal streak
  let journalStreak = 0;
  for (let i = 0; i < days; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    const hasJournal = journals.some(j => {
      const jDate = new Date(j.createdAt).toISOString().split('T')[0];
      return jDate === dateStr;
    });
    
    if (hasJournal) {
      journalStreak++;
    } else if (i > 0) {
      break; // Streak broken
    }
  }

  // Habit streak (at least one habit completed)
  let habitStreak = 0;
  for (let i = 0; i < days; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    const hasHabitCompletion = habits.some(habit =>
      habit.progress.some(p => p.date === dateStr && p.completed)
    );
    
    if (hasHabitCompletion) {
      habitStreak++;
    } else if (i > 0) {
      break;
    }
  }

  return {
    journalStreak,
    habitStreak,
    longestStreak: Math.max(journalStreak, habitStreak)
  };
};

/**
 * Get weekly comparison
 */
export const getWeeklyComparison = async (userId) => {
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setSeconds(lastWeekEnd.getSeconds() - 1);

  const [thisWeekData, lastWeekData] = await Promise.all([
    getWeekData(userId, thisWeekStart, new Date()),
    getWeekData(userId, lastWeekStart, lastWeekEnd)
  ]);

  return {
    thisWeek: thisWeekData,
    lastWeek: lastWeekData,
    comparison: {
      journals: {
        change: thisWeekData.journals - lastWeekData.journals,
        percentChange: calculatePercentChange(lastWeekData.journals, thisWeekData.journals)
      },
      habits: {
        change: thisWeekData.habitCompletions - lastWeekData.habitCompletions,
        percentChange: calculatePercentChange(lastWeekData.habitCompletions, thisWeekData.habitCompletions)
      },
      moods: {
        change: thisWeekData.moodEntries - lastWeekData.moodEntries,
        percentChange: calculatePercentChange(lastWeekData.moodEntries, thisWeekData.moodEntries)
      }
    }
  };
};

const getWeekData = async (userId, startDate, endDate) => {
  const [journals, habits, moods] = await Promise.all([
    prisma.journal.count({
      where: { userId, createdAt: { gte: startDate, lte: endDate } }
    }),
    prisma.habit.findMany({
      where: { userId },
      include: {
        progress: {
          where: {
            createdAt: { gte: startDate, lte: endDate },
            completed: true
          }
        }
      }
    }),
    prisma.moodEntry.count({
      where: { userId, date: { gte: startDate, lte: endDate } }
    })
  ]);

  const habitCompletions = habits.reduce((sum, habit) => sum + habit.progress.length, 0);

  return {
    journals,
    habitCompletions,
    moodEntries: moods
  };
};

const calculatePercentChange = (oldValue, newValue) => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return Math.round(((newValue - oldValue) / oldValue) * 100);
};
