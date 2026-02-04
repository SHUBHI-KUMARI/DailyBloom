import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { moodAPI } from "../services/api";
import {
  HiOutlineEmojiHappy,
  HiOutlineEmojiSad,
  HiOutlineMinus,
  HiOutlineHeart,
  HiOutlineCalendar,
} from "react-icons/hi";
import {
  BsEmojiLaughing,
  BsEmojiSmile,
  BsEmojiNeutral,
  BsEmojiFrown,
  BsEmojiAngry,
} from "react-icons/bs";
import "../styles/MoodTracker.css";

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

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Group entries by date for the mood chart
  const groupEntriesByDate = () => {
    const grouped = {};

    moodEntries.forEach((entry) => {
      const dateStr = new Date(entry.date).toLocaleDateString();
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(entry);
    });

    return grouped;
  };

  const groupedEntries = groupEntriesByDate();
  const lastTwoWeeks = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString();
  }).reverse();

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
                <HiOutlineEmojiHappy className="empty-icon" />
                <p>You haven't logged any moods yet.</p>
                <span>
                  Start tracking your moods to see your patterns over time.
                </span>
              </div>
            ) : (
              <>
                <div className="mood-chart">
                  <div className="mood-chart-labels">
                    {moods.map((mood) => {
                      const IconComponent = mood.icon;
                      return (
                        <div key={mood.value} className="mood-level">
                          <IconComponent style={{ color: mood.color }} />
                        </div>
                      );
                    })}
                  </div>

                  <div className="mood-chart-grid">
                    {lastTwoWeeks.map((dateStr) => {
                      const dayEntries = groupedEntries[dateStr] || [];
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
                        <div key={dateStr} className="mood-chart-day">
                          <div className="chart-day-date">
                            {new Date(dateStr).toLocaleDateString(undefined, {
                              weekday: "short",
                              day: "numeric",
                            })}
                          </div>
                          {averageMood >= 0 && (
                            <div
                              className="mood-point"
                              style={{
                                bottom: `${(1 - averageMood / (moods.length - 1)) * 100}%`,
                                backgroundColor:
                                  moods[Math.round(averageMood)].color,
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
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
                            <IconComponent
                              className="mood-entry-icon"
                              style={{ color: mood?.color }}
                            />
                            <span className="mood-entry-date">
                              <HiOutlineCalendar />
                              {formatDate(entry.date)}
                            </span>
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

function getMoodColor(mood) {
  const colors = {
    great: "var(--mood-great)",
    good: "var(--mood-good)",
    neutral: "var(--mood-neutral)",
    bad: "var(--mood-bad)",
    awful: "var(--mood-awful)",
  };
  return colors[mood] || "var(--neutral-400)";
}
