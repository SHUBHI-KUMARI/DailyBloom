import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { journalAPI, habitAPI, moodAPI } from "../services/api";
import {
  HiOutlineBookOpen,
  HiOutlineClipboardCheck,
  HiOutlineLightningBolt,
  HiOutlineHeart,
  HiArrowRight,
  HiOutlineRefresh,
  HiFire,
} from "react-icons/hi";
import {
  BsEmojiLaughing,
  BsEmojiSmile,
  BsEmojiNeutral,
  BsEmojiFrown,
  BsEmojiTear,
} from "react-icons/bs";
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
    <div className="dashboard-page">
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
                {/* Journal Card */}
                <div className="stat-card journal-card-redesign">
                  <div className="card-header">
                    <HiOutlineBookOpen className="card-icon" />
                    <span className="card-title">Journal Entries</span>
                    <span className="card-period">Total</span>
                  </div>
                  <div className="card-content">
                    <div className="card-visual journal-visual">
                      <span className="visual-number">
                        {dashboardData.journalCount}
                      </span>
                    </div>
                    <div className="card-text">
                      <span className="card-value">
                        {dashboardData.journalCount === 1 ? "Entry" : "Entries"}
                      </span>
                      <span className="card-sublabel">written so far</span>
                    </div>
                  </div>
                </div>

                {/* Habits Card */}
                <div className="stat-card habit-card-redesign">
                  <div className="card-header">
                    <HiOutlineClipboardCheck className="card-icon" />
                    <span className="card-title">Daily Habits</span>
                    <span className="card-period">Today</span>
                  </div>
                  <div className="card-content">
                    <div className="card-visual habit-visual">
                      <div className="habit-progress-ring">
                        <span className="progress-text">
                          {dashboardData.totalHabits > 0
                            ? Math.round(
                                (dashboardData.completedHabits /
                                  dashboardData.totalHabits) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="card-text">
                      <span className="card-value">
                        {dashboardData.completedHabits}/
                        {dashboardData.totalHabits}
                      </span>
                      <span className="card-sublabel">completed today</span>
                    </div>
                  </div>
                </div>

                {/* Streak Card */}
                <div className="stat-card streak-card-redesign">
                  <div className="card-header">
                    <HiOutlineLightningBolt className="card-icon" />
                    <span className="card-title">Current Streak</span>
                    <span className="card-period">Active</span>
                  </div>
                  <div className="card-content">
                    <div className="card-visual streak-visual">
                      <HiFire className="streak-fire-icon" />
                    </div>
                    <div className="card-text">
                      <span className="card-value">
                        {dashboardData.streakCount}{" "}
                        {dashboardData.streakCount === 1 ? "Day" : "Days"}
                      </span>
                      <span className="card-sublabel">in a row</span>
                    </div>
                  </div>
                </div>

                {/* Mood Card */}
                <div className="stat-card mood-card-redesign">
                  <div className="card-header">
                    <HiOutlineHeart className="card-icon" />
                    <span className="card-title">Average Mood</span>
                    <span className="card-period">This week</span>
                  </div>
                  <div className="card-content">
                    <div
                      className={`card-visual mood-visual mood-${dashboardData.moodAverage.toLowerCase()}`}
                    >
                      {getMoodIcon(dashboardData.moodAverage)}
                    </div>
                    <div className="card-text">
                      <span className="card-value">
                        {dashboardData.moodAverage}
                      </span>
                      <span className="card-sublabel">overall feeling</span>
                    </div>
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

// Helper function to get mood icon
function getMoodIcon(mood) {
  const moodIcons = {
    great: <BsEmojiLaughing className="mood-icon" />,
    good: <BsEmojiSmile className="mood-icon" />,
    neutral: <BsEmojiNeutral className="mood-icon" />,
    bad: <BsEmojiFrown className="mood-icon" />,
    awful: <BsEmojiTear className="mood-icon" />,
  };
  return (
    moodIcons[mood?.toLowerCase()] || <BsEmojiNeutral className="mood-icon" />
  );
}
