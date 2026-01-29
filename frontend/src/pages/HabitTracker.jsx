import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import { habitAPI } from "../services/api";
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiCheck,
  HiOutlineClipboardList,
} from "react-icons/hi";
import "../styles/HabitTracker.css";

export default function HabitTracker() {
  const { currentUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await habitAPI.getAll();
        if (response.success && response.data) {
          setHabits(response.data.habits || []);
        }
      } catch (error) {
        console.error("Error fetching habits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, [currentUser]);

  const handleAddHabit = async () => {
    if (!newHabit.trim()) return;

    try {
      const response = await habitAPI.create({ name: newHabit });
      if (response.success && response.data.habit) {
        setHabits([...habits, response.data.habit]);
        setNewHabit("");
      }
    } catch (error) {
      console.error("Error adding habit:", error);
      alert("Failed to add habit. Please try again.");
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!confirm("Are you sure you want to delete this habit?")) {
      return;
    }

    try {
      await habitAPI.delete(id);
      setHabits(habits.filter((habit) => habit.id !== id));
    } catch (error) {
      console.error("Error deleting habit:", error);
      alert("Failed to delete habit. Please try again.");
    }
  };

  const toggleHabitForDay = async (habitId, date) => {
    try {
      const response = await habitAPI.toggleProgress(habitId, date);
      if (response.success) {
        // Update local state
        setHabits(
          habits.map((habit) => {
            if (habit.id === habitId) {
              const updatedProgress = { ...(habit.progress || {}) };
              updatedProgress[date] = !updatedProgress[date];
              return { ...habit, progress: updatedProgress };
            }
            return habit;
          }),
        );
      }
    } catch (error) {
      console.error("Error updating habit progress:", error);
      alert("Failed to update habit progress. Please try again.");
    }
  };

  // Generate last 7 days for the habit tracker
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push({
        date: d,
        formatted: d.toISOString().split("T")[0],
      });
    }
    return dates;
  };

  const last7Days = getLast7Days();

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <div className="habit-tracker-container">
          <div className="page-header">
            <h1>Habit Tracker</h1>
            <p className="page-subtitle">
              Build consistency, one day at a time
            </p>
          </div>

          <div className="add-habit-form">
            <input
              type="text"
              placeholder="Add a new habit..."
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddHabit()}
              className="habit-input"
            />
            <button onClick={handleAddHabit} className="add-habit-btn">
              <HiOutlinePlus />
              <span>Add Habit</span>
            </button>
          </div>

          {loading ? (
            <div className="loading-state">Loading habits...</div>
          ) : habits.length === 0 ? (
            <div className="empty-state">
              <HiOutlineClipboardList className="empty-icon" />
              <p>You haven't added any habits yet.</p>
              <span>Add a habit above to get started!</span>
            </div>
          ) : (
            <div className="habits-grid">
              <div className="habit-row header-row">
                <div className="habit-name">Habit</div>
                {last7Days.map((day) => (
                  <div key={day.formatted} className="habit-day">
                    <div className="day-name">
                      {day.date.toLocaleDateString(undefined, {
                        weekday: "short",
                      })}
                    </div>
                    <div className="day-date">{day.date.getDate()}</div>
                  </div>
                ))}
                <div className="habit-actions">Actions</div>
              </div>

              {habits.map((habit) => (
                <div key={habit.id} className="habit-row">
                  <div className="habit-name">{habit.name}</div>

                  {last7Days.map((day) => (
                    <div
                      key={day.formatted}
                      className={`habit-day clickable ${habit.progress?.[day.formatted] ? "completed" : ""}`}
                      onClick={() => toggleHabitForDay(habit.id, day.formatted)}
                    >
                      {habit.progress?.[day.formatted] && (
                        <HiCheck className="check-icon" />
                      )}
                    </div>
                  ))}

                  <div className="habit-actions">
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="delete-habit-btn"
                      title="Delete habit"
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
