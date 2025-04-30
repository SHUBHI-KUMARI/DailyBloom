import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { getMoodEntries, saveMoodEntry } from '../services/googleDriveService';
import '../styles/MoodTracker.css';

export default function MoodTracker() {
    const { currentUser } = useAuth();
    const [moodEntries, setMoodEntries] = useState([]);
    const [selectedMood, setSelectedMood] = useState('');
    const [moodNote, setMoodNote] = useState('');
    const [loading, setLoading] = useState(true);
    // Add a state to track when entries are updated
    const [entriesUpdated, setEntriesUpdated] = useState(0);

    // Move fetchMoodEntries to useCallback to prevent re-creation
    const fetchMoodEntries = useCallback(async () => {
        try {
            setLoading(true);
            const fetchedEntries = await getMoodEntries(currentUser.uid);
            // Ensure no duplicate entries by using a Map with IDs as keys
            const uniqueEntries = [...new Map(fetchedEntries.map(entry => [entry.id, entry])).values()];
            setMoodEntries(uniqueEntries);
        } catch (error) {
            console.error("Error fetching mood entries:", error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    // Update useEffect to also run when entriesUpdated changes
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
            // Generate a more unique ID
            const entryId = `mood_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

            const now = new Date();
            const entryData = {
                id: entryId,
                mood: selectedMood,
                note: moodNote,
                date: now.toISOString(),
                userId: currentUser.uid
            };

            await saveMoodEntry(entryData);

            // Instead of manually updating the state, trigger a refetch
            setEntriesUpdated(prev => prev + 1);

            // Reset input fields
            setSelectedMood('');
            setMoodNote('');
            alert("Your mood has been logged!");
        } catch (error) {
            console.error("Error saving mood entry:", error);
            alert("Failed to save your mood. Please try again.");
        }
    };

    const moods = [
        { value: 'great', label: 'Great', emoji: '😄' },
        { value: 'good', label: 'Good', emoji: '🙂' },
        { value: 'neutral', label: 'Neutral', emoji: '😐' },
        { value: 'bad', label: 'Bad', emoji: '☹️' },
        { value: 'awful', label: 'Awful', emoji: '😞' }
    ];

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Group entries by date for the mood chart
    const groupEntriesByDate = () => {
        const grouped = {};

        moodEntries.forEach(entry => {
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
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                <div className="mood-tracker-container">
                    <h1>Mood Tracker</h1>

                    <div className="mood-input-section">
                        <h2>How are you feeling today?</h2>
                        <div className="mood-selector">
                            {moods.map(mood => (
                                <button
                                    key={mood.value}
                                    className={`mood-button ${selectedMood === mood.value ? 'selected' : ''}`}
                                    onClick={() => setSelectedMood(mood.value)}
                                >
                                    <span className="mood-emoji">{mood.emoji}</span>
                                    <span className="mood-label">{mood.label}</span>
                                </button>
                            ))}
                        </div>

                        <textarea
                            placeholder="Add a note about your mood (optional)..."
                            value={moodNote}
                            onChange={(e) => setMoodNote(e.target.value)}
                            className="mood-note"
                        />

                        <button
                            onClick={handleMoodSubmit}
                            className="save-mood-btn"
                        >
                            Log My Mood
                        </button>
                    </div>

                    <div className="mood-visualization">
                        <h2>Your Mood History</h2>

                        {loading ? (
                            <p>Loading mood data...</p>
                        ) : moodEntries.length === 0 ? (
                            <div className="empty-state">
                                <p>You haven't logged any moods yet.</p>
                                <p>Start tracking your moods to see your patterns over time.</p>
                            </div>
                        ) : (
                            <>
                                <div className="mood-chart">
                                    <div className="mood-chart-labels">
                                        {moods.map(mood => (
                                            <div key={mood.value} className="mood-level">
                                                {mood.emoji}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mood-chart-grid">
                                        {lastTwoWeeks.map(dateStr => {
                                            const dayEntries = groupedEntries[dateStr] || [];
                                            const averageMood = dayEntries.length > 0
                                                ? dayEntries.reduce((sum, entry) => {
                                                    const moodValue = moods.findIndex(m => m.value === entry.mood);
                                                    return sum + moodValue;
                                                }, 0) / dayEntries.length
                                                : -1;

                                            return (
                                                <div key={dateStr} className="mood-chart-day">
                                                    <div className="chart-day-date">
                                                        {new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                                                    </div>
                                                    {averageMood >= 0 && (
                                                        <div
                                                            className="mood-point"
                                                            style={{
                                                                bottom: `${(averageMood / (moods.length - 1)) * 100}%`,
                                                                backgroundColor: getMoodColor(moods[Math.round(averageMood)].value)
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
                                    {moodEntries.slice(0, 10).map(entry => {
                                        const mood = moods.find(m => m.value === entry.mood);
                                        return (
                                            <div key={entry.id} className="mood-entry-card">
                                                <div className="mood-entry-header">
                                                    <span className="mood-entry-emoji">{mood.emoji}</span>
                                                    <span className="mood-entry-date">{formatDate(entry.date)}</span>
                                                </div>
                                                {entry.note && (
                                                    <p className="mood-entry-note">{entry.note}</p>
                                                )}
                                            </div>
                                        );
                                    })}
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
        great: 'var(--mood-great)',
        good: 'var(--mood-good)',
        neutral: 'var(--mood-neutral)',
        bad: 'var(--mood-bad)',
        awful: 'var(--mood-awful)'
    };
    return colors[mood] || 'var(--neutral-400)';
}
