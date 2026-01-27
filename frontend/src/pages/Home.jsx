import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Home() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error('Logout failed', err);
        }
    }

    return (
        <div className="home-container">
            <header>
                <h1>Welcome to DailyBloom</h1>
                <div className="user-info">
                    {currentUser?.photoURL && (
                        <img
                            src={currentUser.photoURL}
                            alt="Profile"
                            className="profile-pic"
                        />
                    )}
                    <span>{currentUser?.displayName || currentUser?.email}</span>
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </header>

            <main>
                <h2>Your Dashboard</h2>
                <p>This is your personal DailyBloom dashboard. Start your journey to productivity!</p>
            </main>
        </div>
    );
}

export default Home;
