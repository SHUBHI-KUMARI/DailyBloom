import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { getDashboardData, requestAuthentication } from '../services/googleDriveService';
import '../styles/Dashboard.css';

export default function Dashboard() {
    // grab current user from auth context
    const { currentUser } = useAuth();
    // states for dashboard data and stuff
    const [dashboardData, setDashboardData] = useState({
        journalCount: 0,
        completedHabits: 0,
        streakCount: 0,
        moodAverage: 'Neutral',
        needsAuth: false
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // get all dashboard data from google drive
    const fetchDashboardData = async () => {
        try {
            // show loading spinner when fetching
            setLoading(true);

            // get data from the drive API
            let data = await getDashboardData(currentUser.uid);
            setDashboardData(data);

            // need to auth again? let's try that
            if (data.needsAuth) {
                try {
                    await requestAuthentication();
                    // get fresh data after auth
                    let newData = await getDashboardData(currentUser.uid);
                    setDashboardData(newData);
                } catch (err) {
                    // oops, auth failed but whatever
                    console.warn('Auth failed:', err);
                }
            }

            // all good, no errors
            setError(null);
        } catch (err) {
            console.error("Failed to get dashboard data:", err);
            setError("Something went wrong. Try again?");
        } finally {
            // done loading either way
            setLoading(false);
        }
    };

    // fetch data when component loads
    useEffect(() => {
        if (currentUser) {
            fetchDashboardData();
        }
    }, [currentUser]);

    // format today's date nicely
    const formatDate = () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString(undefined, options);
    };

    // render the dashboard
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                {loading ? (
                    <div className="loading-spinner">Loading your dashboard...</div>
                ) : error ? (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={fetchDashboardData}>Retry</button>
                    </div>
                ) : (
                    <>
                        <div className="welcome-banner">
                            <h1>Welcome back, {currentUser.displayName}</h1>
                            <p>{formatDate()}</p>
                        </div>

                        <section className="dashboard-overview">
                            <h2>Overview</h2>
                            <div className="stats-grid">
                                <div className="stat-card journal-stat">
                                    <h3>Journal Entries</h3>
                                    <p className="stat-number">{dashboardData.journalCount}</p>
                                    <p>Total entries</p>
                                </div>

                                <div className="stat-card habit-stat">
                                    <h3>Habits</h3>
                                    <p className="stat-number">{dashboardData.completedHabits}</p>
                                    <p>Completed today</p>
                                </div>

                                <div className="stat-card streak-stat">
                                    <h3>Current Streak</h3>
                                    <p className="stat-number">{dashboardData.streakCount}</p>
                                    <p>Days in a row</p>
                                </div>

                                <div className="stat-card mood-stat">
                                    <h3>Average Mood</h3>
                                    <p className="stat-number mood-indicator">{dashboardData.moodAverage}</p>
                                    <p>This week</p>
                                </div>
                            </div>
                        </section>

                        <section className="quick-actions">
                            <h2>Quick Actions</h2>
                            <div className="action-buttons">
                                <button className="action-button journal-action">
                                    Write in Journal
                                </button>
                                <button className="action-button habit-action">
                                    Track Today's Habits
                                </button>
                                <button className="action-button mood-action">
                                    Log Your Mood
                                </button>
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
