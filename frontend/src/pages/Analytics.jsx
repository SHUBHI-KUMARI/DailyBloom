import { useState, useEffect } from "react";
import {Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useAuth } from "../contexts/AuthContext";
import { analyticsAPI } from "../services/api";
import {
  HiOutlineChartBar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineCalendar,
  HiOutlineFire,
} from "react-icons/hi";
import "../styles/Analytics.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Analytics() {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [weeklyComparison, setWeeklyComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    if (currentUser) {
      fetchAnalytics();
      fetchWeeklyComparison();
    }
  }, [currentUser, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getAnalytics(period);
      if (response.success && response.data) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyComparison = async () => {
    try {
      const response = await analyticsAPI.getWeeklyComparison();
      if (response.success && response.data) {
        setWeeklyComparison(response.data.comparison);
      }
    } catch (error) {
      console.error("Error fetching weekly comparison:", error);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="analytics-page">
        <div className="loading-state">Loading analytics...</div>
      </div>
    );
  }

  // Prepare mood trend chart data
  const moodTrendData = {
    labels: analytics.moodStats.trend.map((entry) =>
      new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    ).reverse(),
    datasets: [
      {
        label: "Mood Score",
        data: analytics.moodStats.trend.map((entry) => entry.score).reverse(),
        borderColor: "rgb(139, 92, 246)",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Prepare mood distribution chart data
  const moodDistributionData = {
    labels: ["Great", "Good", "Neutral", "Bad", "Awful"],
    datasets: [
      {
        data: [
          analytics.moodStats.distribution.great,
          analytics.moodStats.distribution.good,
          analytics.moodStats.distribution.neutral,
          analytics.moodStats.distribution.bad,
          analytics.moodStats.distribution.awful,
        ],
        backgroundColor: [
          "#10b981",
          "#3b82f6",
          "#f59e0b",
          "#f97316",
          "#ef4444",
        ],
      },
    ],
  };

  // Prepare activity heatmap data
  const activityChartData = {
    labels: analytics.activityHeatmap.slice(-14).map((day) =>
      new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    ),
    datasets: [
      {
        label: "Journals",
        data: analytics.activityHeatmap.slice(-14).map((day) => day.journals),
        backgroundColor: "rgba(139, 92, 246, 0.6)",
      },
      {
        label: "Habits",
        data: analytics.activityHeatmap.slice(-14).map((day) => day.habits),
        backgroundColor: "rgba(59, 130, 246, 0.6)",
      },
      {
        label: "Moods",
        data: analytics.activityHeatmap.slice(-14).map((day) => day.moods),
        backgroundColor: "rgba(245, 158, 11, 0.6)",
      },
    ],
  };

  // Prepare journal weekday data
  const journalWeekdayData = {
    labels: WEEKDAYS,
    datasets: [
      {
        label: "Journal Entries",
        data: WEEKDAYS.map((_, index) => analytics.journalStats.entriesByWeekday[index] || 0),
        backgroundColor: "rgba(139, 92, 246, 0.6)",
      },
    ],
  };

  // Prepare goal categories chart
  const goalCategoriesData = {
    labels: ["Personal", "Health", "Career", "Learning", "Finance"],
    datasets: [
      {
        data: [
          analytics.goalStats.byCategory.personal,
          analytics.goalStats.byCategory.health,
          analytics.goalStats.byCategory.career,
          analytics.goalStats.byCategory.learning,
          analytics.goalStats.byCategory.finance,
        ],
        backgroundColor: [
          "#8b5cf6",
          "#10b981",
          "#3b82f6",
          "#f59e0b",
          "#ef4444",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
    },
  };

  return (
    <div className="analytics-page">
      <main className="analytics-main">
        <div className="analytics-container">
          {/* Header */}
          <div className="page-header">
            <div className="header-content">
              <h1>
                <HiOutlineChartBar /> Analytics
              </h1>
              <p className="page-subtitle">
                Track your progress and insights over time
              </p>
            </div>
            <div className="period-selector">
              <button
                className={`period-btn ${period === "7" ? "active" : ""}`}
                onClick={() => setPeriod("7")}
              >
                7 Days
              </button>
              <button
                className={`period-btn ${period === "30" ? "active" : ""}`}
                onClick={() => setPeriod("30")}
              >
                30 Days
              </button>
              <button
                className={`period-btn ${period === "90" ? "active" : ""}`}
                onClick={() => setPeriod("90")}
              >
                90 Days
              </button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="overview-section">
            <h2>Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon journals">
                  <HiOutlineCalendar />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{analytics.overview.totalJournals}</span>
                  <span className="stat-label">Journal Entries</span>
                  {weeklyComparison && (
                    <span className={`stat-change ${weeklyComparison.comparison.journals.change >= 0 ? "positive" : "negative"}`}>
                      {weeklyComparison.comparison.journals.change >= 0 ? <HiOutlineTrendingUp /> : <HiOutlineTrendingDown />}
                      {Math.abs(weeklyComparison.comparison.journals.percentChange)}% vs last week
                    </span>
                  )}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon habits">
                  <HiOutlineFire />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{analytics.habitStats.totalCompletions}</span>
                  <span className="stat-label">Habit Completions</span>
                  {weeklyComparison && (
                    <span className={`stat-change ${weeklyComparison.comparison.habits.change >= 0 ? "positive" : "negative"}`}>
                      {weeklyComparison.comparison.habits.change >= 0 ? <HiOutlineTrendingUp /> : <HiOutlineTrendingDown />}
                      {Math.abs(weeklyComparison.comparison.habits.percentChange)}% vs last week
                    </span>
                  )}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon moods">
                  <HiOutlineChartBar />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{analytics.moodStats.averageScore.toFixed(1)}/5</span>
                  <span className="stat-label">Average Mood</span>
                  <span className="stat-detail">{analytics.moodStats.averageMood}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon goals">
                  <HiOutlineChartBar />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{analytics.overview.averageGoalProgress}%</span>
                  <span className="stat-label">Avg Goal Progress</span>
                  <span className="stat-detail">{analytics.overview.activeGoals} active goals</span>
                </div>
              </div>
            </div>
          </div>

          {/* Streaks */}
          <div className="streaks-section">
            <h2>
              <HiOutlineFire /> Current Streaks
            </h2>
            <div className="streaks-grid">
              <div className="streak-card">
                <div className="streak-icon">🔥</div>
                <div className="streak-info">
                  <span className="streak-value">{analytics.streaks.journalStreak}</span>
                  <span className="streak-label">Day Journal Streak</span>
                </div>
              </div>
              <div className="streak-card">
                <div className="streak-icon">💪</div>
                <div className="streak-info">
                  <span className="streak-value">{analytics.streaks.habitStreak}</span>
                  <span className="streak-label">Day Habit Streak</span>
                </div>
              </div>
              <div className="streak-card">
                <div className="streak-icon">⭐</div>
                <div className="streak-info">
                  <span className="streak-value">{analytics.streaks.longestStreak}</span>
                  <span className="streak-label">Longest Streak</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            {/* Activity Over Time */}
            <div className="chart-card large">
              <h3>Activity Over Time (Last 14 Days)</h3>
              <div className="chart-container">
                <Bar data={activityChartData} options={chartOptions} />
              </div>
            </div>

            {/* Mood Trend */}
            <div className="chart-card large">
              <h3>Mood Trend</h3>
              <div className="chart-container">
                <Line data={moodTrendData} options={chartOptions} />
              </div>
            </div>

            {/* Mood Distribution */}
            <div className="chart-card">
              <h3>Mood Distribution</h3>
              <div className="chart-container">
                <Doughnut data={moodDistributionData} options={doughnutOptions} />
              </div>
            </div>

            {/* Goal Categories */}
            <div className="chart-card">
              <h3>Goals by Category</h3>
              <div className="chart-container">
                <Doughnut data={goalCategoriesData} options={doughnutOptions} />
              </div>
            </div>

            {/* Journal by Weekday */}
            <div className="chart-card">
              <h3>Journal Entries by Weekday</h3>
              <div className="chart-container">
                <Bar data={journalWeekdayData} options={chartOptions} />
              </div>
            </div>

            {/* Top Habits */}
            <div className="chart-card">
              <h3>Top Performing Habits</h3>
              <div className="habits-list">
                {analytics.habitStats.habitPerformance.slice(0, 5).map((habit, index) => (
                  <div key={habit.habitId} className="habit-performance-item">
                    <div className="habit-rank">#{index + 1}</div>
                    <div className="habit-name">{habit.habitName}</div>
                    <div className="habit-rate">{habit.completionRate}%</div>
                  </div>
                ))}
                {analytics.habitStats.habitPerformance.length === 0 && (
                  <p className="no-data">No habit data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="detailed-stats">
            <div className="detail-section">
              <h3>Journal Insights</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Total Entries</span>
                  <span className="detail-value">{analytics.journalStats.totalEntries}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Avg Words/Entry</span>
                  <span className="detail-value">{analytics.journalStats.averageWordsPerEntry}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Entries/Week</span>
                  <span className="detail-value">{analytics.journalStats.averageEntriesPerWeek}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Most Active Day</span>
                  <span className="detail-value">{WEEKDAYS[analytics.journalStats.mostActiveDay]}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Habit Insights</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Total Habits</span>
                  <span className="detail-value">{analytics.habitStats.totalHabits}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Overall Completion</span>
                  <span className="detail-value">{analytics.habitStats.overallCompletionRate}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Best Habit</span>
                  <span className="detail-value">
                    {analytics.habitStats.bestHabit?.habitName || "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Completions</span>
                  <span className="detail-value">{analytics.habitStats.totalCompletions}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Goal Insights</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Total Goals</span>
                  <span className="detail-value">{analytics.goalStats.totalGoals}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Active</span>
                  <span className="detail-value">{analytics.goalStats.byStatus.active}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Completed</span>
                  <span className="detail-value">{analytics.goalStats.byStatus.completed}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Milestone Rate</span>
                  <span className="detail-value">{analytics.goalStats.milestoneCompletionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
