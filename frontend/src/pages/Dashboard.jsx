import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import { journalAPI, habitAPI, moodAPI } from "../services/api";
import {
  HiOutlineBookOpen,
  HiOutlineClipboardCheck,
  HiOutlineLightningBolt,
  HiOutlineHeart,
  HiArrowRight,
  HiOutlineRefresh,
} from "react-icons/hi";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    journalCount: 0,
    completedHabits: 0,
    totalHabits: 0,
    streakCount: 0,
    moodAverage: "Neutral",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [journalsRes, habitsRes, moodStatsRes] = await Promise.all([
        journalAPI.getAll({ limit: 1 }),
        habitAPI.getAll(),
        moodAPI.getStats(7),
      ]);

      // Process journal count
      const journalCount = journalsRes.data?.pagination?.total || 0;

      // Process habits
      const habits = habitsRes.data?.habits || [];
      const today = new Date().toISOString().split("T")[0];
      const completedHabits = habits.filter((h) => h.progress?.[today]).length;

      // Calculate streak (simplified - consecutive days with at least one habit completed)
      let streakCount = 0;
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const hasCompletion = habits.some((h) => h.progress?.[dateStr]);
        if (hasCompletion) {
          streakCount++;
        } else if (i > 0) {
          break;
        }
      }

      // Process mood average
      const moodStats = moodStatsRes.data?.stats;
      const moodMap = {
        great: "Great",
        good: "Good",
        neutral: "Neutral",
        bad: "Bad",
        awful: "Awful",
      };
      const moodAverage = moodStats?.averageMood
        ? moodMap[moodStats.averageMood] || "Neutral"
        : "Neutral";

      setDashboardData({
        journalCount,
        completedHabits,
        totalHabits: habits.length,
        streakCount,
        moodAverage,
      });

      setError(null);
    } catch (err) {
      console.error("Failed to get dashboard data:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  // Format today's date
  const formatDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString(undefined, options);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchDashboardData} className="retry-btn">
              <HiOutlineRefresh />
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="welcome-banner">
              <div className="welcome-content">
                <h1>Welcome back, {currentUser?.name || "there"}</h1>
                <p className="welcome-date">{formatDate()}</p>
              </div>
            </div>

            <section className="dashboard-overview">
              <div className="section-header">
                <h2>Overview</h2>
              </div>
              <div className="stats-grid">
                <div className="stat-card journal-stat">
                  <div className="stat-icon">
                    <HiOutlineBookOpen />
                  </div>
                  <div className="stat-info">
                    <p className="stat-number">{dashboardData.journalCount}</p>
                    <h3>Journal Entries</h3>
                    <p className="stat-label">Total entries</p>
                  </div>
                </div>

                <div className="stat-card habit-stat">
                  <div className="stat-icon">
                    <HiOutlineClipboardCheck />
                  </div>
                  <div className="stat-info">
                    <p className="stat-number">
                      {dashboardData.completedHabits}/
                      {dashboardData.totalHabits}
                    </p>
                    <h3>Habits</h3>
                    <p className="stat-label">Completed today</p>
                  </div>
                </div>

                <div className="stat-card streak-stat">
                  <div className="stat-icon">
                    <HiOutlineLightningBolt />
                  </div>
                  <div className="stat-info">
                    <p className="stat-number">{dashboardData.streakCount}</p>
                    <h3>Current Streak</h3>
                    <p className="stat-label">Days in a row</p>
                  </div>
                </div>

                <div className="stat-card mood-stat">
                  <div className="stat-icon">
                    <HiOutlineHeart />
                  </div>
                  <div className="stat-info">
                    <p className="stat-number mood-indicator">
                      {dashboardData.moodAverage}
                    </p>
                    <h3>Average Mood</h3>
                    <p className="stat-label">This week</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="quick-actions">
              <div className="section-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="action-buttons">
                <Link to="/journal" className="action-button journal-action">
                  <HiOutlineBookOpen className="action-icon" />
                  <span>Write in Journal</span>
                  <HiArrowRight className="arrow-icon" />
                </Link>
                <Link to="/habits" className="action-button habit-action">
                  <HiOutlineClipboardCheck className="action-icon" />
                  <span>Track Today's Habits</span>
                  <HiArrowRight className="arrow-icon" />
                </Link>
                <Link to="/mood" className="action-button mood-action">
                  <HiOutlineHeart className="action-icon" />
                  <span>Log Your Mood</span>
                  <HiArrowRight className="arrow-icon" />
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
