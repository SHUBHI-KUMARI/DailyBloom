import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { getHabits, saveHabit, updateHabitProgress, deleteHabit } from '../services/googleDriveService';
import '../styles/HabitTracker.css';

export default function HabitTracker() {
    const { currentUser } = useAuth();
    const [habits, setHabits] = useState([]);
    const [newHabit, setNewHabit] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const fetchedHabits = await getHabits(currentUser.uid);
                setHabits(fetchedHabits);
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
            const habitData = {
                id: Date.now().toString(),
                name: newHabit,
                created: new Date().toISOString(),
                userId: currentUser.uid,
                progress: {}
            };

            await saveHabit(habitData);
            setHabits([...habits, habitData]);
            setNewHabit('');
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
            await deleteHabit(id, currentUser.uid);
            setHabits(habits.filter(habit => habit.id !== id));
        } catch (error) {
            console.error("Error deleting habit:", error);
            alert("Failed to delete habit. Please try again.");
        }
    };

    const toggleHabitForDay = async (habitId, date) => {
        try {
            // Find the habit to update
            const habitToUpdate = habits.find(h => h.id === habitId);
            if (!habitToUpdate) return;

            // Create a copy of the progress or initialize if it doesn't exist
            const updatedProgress = { ...(habitToUpdate.progress || {}) };

            // Toggle the completion status for this date
            updatedProgress[date] = !updatedProgress[date];

            // Update in the database
            await updateHabitProgress(habitId, updatedProgress, currentUser.uid);

            // Update local state
            setHabits(habits.map(habit =>
                habit.id === habitId
                    ? { ...habit, progress: updatedProgress }
                    : habit
            ));
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
                formatted: d.toISOString().split('T')[0]
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
                    <h1>Habit Tracker</h1>

                    <div className="add-habit-form">
                        <input
                            type="text"
                            placeholder="Add a new habit..."
                            value={newHabit}
                            onChange={(e) => setNewHabit(e.target.value)}
                            className="habit-input"
                        />
                        <button
                            onClick={handleAddHabit}
                            className="add-habit-btn"
                        >
                            Add Habit
                        </button>
                    </div>

                    {loading ? (
                        <p>Loading habits...</p>
                    ) : habits.length === 0 ? (
                        <div className="empty-state">
                            <p>You haven't added any habits yet.</p>
                            <p>Add a habit above to get started!</p>
                        </div>
                    ) : (
                        <div className="habits-grid">
                            <div className="habit-row header-row">
                                <div className="habit-name">Habit</div>
                                {last7Days.map(day => (
                                    <div key={day.formatted} className="habit-day">
                                        <div className="day-name">{day.date.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                                        <div className="day-date">{day.date.getDate()}</div>
                                    </div>
                                ))}
                                <div className="habit-actions">Actions</div>
                            </div>

                            {habits.map(habit => (
                                <div key={habit.id} className="habit-row">
                                    <div className="habit-name">{habit.name}</div>

                                    {last7Days.map(day => (
                                        <div
                                            key={day.formatted}
                                            className={`habit-day ${habit.progress?.[day.formatted] ? 'completed' : ''}`}
                                            onClick={() => toggleHabitForDay(habit.id, day.formatted)}
                                        >
                                            {habit.progress?.[day.formatted] ? '✓' : ''}
                                        </div>
                                    ))}

                                    <div className="habit-actions">
                                        <button
                                            onClick={() => handleDeleteHabit(habit.id)}
                                            className="delete-habit-btn"
                                        >
                                            Delete
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
