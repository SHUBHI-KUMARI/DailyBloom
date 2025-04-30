import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { FaSeedling } from 'react-icons/fa';
import '../styles/Login.css';

function Login() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    async function handleGoogleSignIn() {
        try {
            setError('');
            setLoading(true);

            await signInWithGoogle();

            navigate('/');
        } catch (err) {
            setError('Login failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="login-shape"></div>
                <div className="login-shape"></div>
            </div>

            <div className="login-card">
                <div className="login-logo">
                    <FaSeedling className="logo-icon" />
                </div>
                <h1>Welcome to DailyBloom</h1>
                <p className="login-subtitle">Your daily companion for growth and productivity</p>

                {error && <div className="error-message">{error}</div>}

                <div className="login-benefits">
                    <p>Track your habits, journal your thoughts, and monitor your mood in one beautiful, intuitive app.</p>
                </div>

                <button
                    className="google-signin-button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="loading-spinner"></span>
                    ) : (
                        <FcGoogle className="google-icon" />
                    )}
                    {loading ? 'Signing In...' : 'Sign in with Google'}
                </button>

                <p className="login-footer">
                    By signing in, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </p>
            </div>
        </div>
    );
}

export default Login;
