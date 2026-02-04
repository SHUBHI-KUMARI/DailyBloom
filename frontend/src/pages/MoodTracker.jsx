import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { moodAPI } from "../services/api";
import {
  HiOutlineHeart,
  HiOutlineCalendar,
  HiOutlineTrash,
} from "react-icons/hi";
import {
  BsEmojiLaughing,
  BsEmojiSmile,
  BsEmojiNeutral,
  BsEmojiFrown,
  BsEmojiAngry,
} from "react-icons/bs";
import "../styles/MoodTracker.css";

// Helper function to format date as YYYY-MM-DD in local timezone
const formatDateLocal = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to format date for display
const formatDateDisplay = (date) => {
  if (!date) return "Unknown date";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Unknown date";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to format date for chart labels
const formatChartDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
  });
};

// Get relative time string
const getRelativeTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateDisplay(date);
};

export default function MoodTracker() {
  const { currentUser } = useAuth();
  const [moodEntries, setMoodEntries] = useState([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [moodNote, setMoodNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [entriesUpdated, setEntriesUpdated] = useState(0);

  // Fetch mood entries
  const fetchMoodEntries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await moodAPI.getAll();
      if (response.success && response.data) {
        setMoodEntries(response.data.entries || []);
      }
    } catch (error) {
      console.error("Error fetching mood entries:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchMoodEntries();
    }
  }, [currentUser, fetchMoodEntries, entriesUpdated]);

  const handleMoodSubmit = async () => {
    if (!selectedMood) {
      alert("Please select a mood first.");
      return;
    }

    try {
      const entryData = {
        mood: selectedMood,
        note: moodNote,
        date: new Date().toISOString(),
      };

      await moodAPI.create(entryData);
      setEntriesUpdated((prev) => prev + 1);
      setSelectedMood("");
      setMoodNote("");
      alert("Your mood has been logged!");
    } catch (error) {
      console.error("Error saving mood entry:", error);
      alert("Failed to save your mood. Please try again.");
    }
  };

  const moods = [
    {
      value: "great",
      label: "Great",
      icon: BsEmojiLaughing,
      color: "var(--mood-great)",
    },
    {
      value: "good",
      label: "Good",
      icon: BsEmojiSmile,
      color: "var(--mood-good)",
    },
    {
      value: "neutral",
      label: "Neutral",
      icon: BsEmojiNeutral,
      color: "var(--mood-neutral)",
    },
    {
      value: "bad",
      label: "Bad",
      icon: BsEmojiFrown,
      color: "var(--mood-bad)",
    },
    {
      value: "awful",
      label: "Awful",
      icon: BsEmojiAngry,
      color: "var(--mood-awful)",
    },
  ];

  // Group entries by date for the mood chart (using YYYY-MM-DD keys)
  const groupEntriesByDate = () => {
    const grouped = {};

    moodEntries.forEach((entry) => {
      const dateKey = formatDateLocal(entry.date);
      if (dateKey) {
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(entry);
      }
    });

    return grouped;
  };

  const groupedEntries = groupEntriesByDate();

  // Generate last 14 days as YYYY-MM-DD strings
  const lastTwoWeeks = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i)); // Start from 13 days ago to today
    return formatDateLocal(date);
  });

  // Delete mood entry
  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm("Are you sure you want to delete this mood entry?")) {
      return;
    }
    try {
      await moodAPI.delete(entryId);
      setEntriesUpdated((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting mood entry:", error);
      alert("Failed to delete mood entry. Please try again.");
    }
  };

  return (
    <div className="mood-tracker-page">
      <main className="mood-tracker-main">
        <div className="mood-tracker-container">
          <div className="page-header">
            <h1>Mood Tracker</h1>
            <p className="page-subtitle">Understand your emotional patterns</p>
          </div>

          <div className="mood-input-section">
            <h2>How are you feeling today?</h2>
            <div className="mood-selector">
              {moods.map((mood) => {
                const IconComponent = mood.icon;
                return (
                  <button
                    key={mood.value}
                    className={`mood-button ${selectedMood === mood.value ? "selected" : ""}`}
                    onClick={() => setSelectedMood(mood.value)}
                    style={{ "--mood-color": mood.color }}
                  >
                    <IconComponent className="mood-icon" />
                    <span className="mood-label">{mood.label}</span>
                  </button>
                );
              })}
            </div>

            <textarea
              placeholder="Add a note about your mood (optional)..."
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              className="mood-note"
            />

            <button onClick={handleMoodSubmit} className="save-mood-btn">
              <HiOutlineHeart />
              Log My Mood
            </button>
          </div>

          <div className="mood-visualization">
            <h2>Your Mood History</h2>

            {loading ? (
              <div className="loading-state">Loading mood data...</div>
            ) : moodEntries.length === 0 ? (
              <div className="empty-state">
                <BsEmojiSmile className="empty-icon" />
                <p>You haven't logged any moods yet.</p>
                <span>
                  Start tracking your moods to see your patterns over time.
                </span>
              </div>
            ) : (
              <>
                <div className="mood-chart-wrapper">
                  <div className="mood-chart-title">Last 14 Days</div>
                  <div className="mood-chart">
                    <div className="mood-chart-y-axis">
                      {moods.map((mood) => {
                        const IconComponent = mood.icon;
                        return (
                          <div
                            key={mood.value}
                            className="mood-level"
                            title={mood.label}
                          >
                            <IconComponent style={{ color: mood.color }} />
                          </div>
                        );
                      })}
                    </div>

                    <div className="mood-chart-area">
                      <div className="mood-chart-grid">
                        {lastTwoWeeks.map((dateKey) => {
                          const dayEntries = groupedEntries[dateKey] || [];
                          const averageMood =
                            dayEntries.length > 0
                              ? dayEntries.reduce((sum, entry) => {
                                  const moodValue = moods.findIndex(
                                    (m) => m.value === entry.mood,
                                  );
                                  return sum + moodValue;
                                }, 0) / dayEntries.length
                              : -1;

                          return (
                            <div key={dateKey} className="mood-chart-day">
                              {averageMood >= 0 && (
                                <div
                                  className="mood-point"
                                  style={{
                                    bottom: `${(1 - averageMood / (moods.length - 1)) * 100}%`,
                                    backgroundColor:
                                      moods[Math.round(averageMood)].color,
                                    color: moods[Math.round(averageMood)].color,
                                  }}
                                  title={`${formatChartDate(dateKey)}: ${moods[Math.round(averageMood)].label}`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mood-chart-x-axis">
                        {lastTwoWeeks.map((dateKey) => (
                          <div key={dateKey} className="x-axis-label">
                            {formatChartDate(dateKey)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mood-entries-list">
                  <h3>Recent Entries</h3>
                  <div className="mood-entry-cards">
                    {moodEntries.slice(0, 10).map((entry) => {
                      const mood = moods.find((m) => m.value === entry.mood);
                      const IconComponent = mood?.icon || BsEmojiNeutral;
                      return (
                        <div key={entry.id} className="mood-entry-card">
                          <div className="mood-entry-header">
                            <div className="mood-entry-left">
                              <div
                                className="mood-entry-icon-wrapper"
                                style={{ backgroundColor: `${mood?.color}20` }}
                              >
                                <IconComponent
                                  className="mood-entry-icon"
                                  style={{ color: mood?.color }}
                                />
                              </div>
                              <div className="mood-entry-info">
                                <span className="mood-entry-label">
                                  {mood?.label || "Unknown"}
                                </span>
                                <span className="mood-entry-time">
                                  {getRelativeTime(entry.date)}
                                </span>
                              </div>
                            </div>
                            <button
                              className="mood-entry-delete"
                              onClick={() => handleDeleteEntry(entry.id)}
                              title="Delete entry"
                            >
                              <HiOutlineTrash />
                            </button>
                          </div>
                          {entry.note && (
                            <p className="mood-entry-note">{entry.note}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
