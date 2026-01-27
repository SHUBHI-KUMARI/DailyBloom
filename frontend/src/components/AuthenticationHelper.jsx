import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hasValidToken, requestAuthentication } from '../services/googleDriveService';
import '../styles/AuthenticationHelper.css';

function AuthenticationHelper() {
    // should we show the auth prompt?
    const [showPrompt, setShowPrompt] = useState(false);
    // get current user
    const { currentUser } = useAuth();

    // check auth state when component mounts
    useEffect(() => {
        // only show prompt if not authenticated
        function checkAuth() {
            if (currentUser && !hasValidToken()) {
                setShowPrompt(true);
            } else {
                setShowPrompt(false);
            }
        }

        // wait a bit after page loads to check
        // this prevents annoying popups right away
        const timer = setTimeout(checkAuth, 2000);

        // cleanup timer when component unmounts
        return () => clearTimeout(timer);
    }, [currentUser]);

    // handle connect button
    const handleAuthenticate = async () => {
        try {
            // try to auth with google
            await requestAuthentication();
            // hide prompt if successful
            setShowPrompt(false);
        } catch (err) {
            // oops something went wrong
            console.error('Auth failed:', err);
        }
    };

    // handle "later" button
    const handleDismiss = () => {
        // hide the prompt
        setShowPrompt(false);

        // check again in 5 mins
        setTimeout(() => {
            if (currentUser && !hasValidToken()) {
                setShowPrompt(true);
            }
        }, 5 * 60 * 1000);
    };

    // don't render anything if we don't need to show prompt
    if (!showPrompt) return null;

    // the auth helper UI
    return (
        <div className="auth-helper-container">
            <div className="auth-helper-content">
                <h3>Google Drive Access Required</h3>
                <p>
                    DailyBloom needs access to Google Drive to save your journals, habits, and mood data.
                </p>
                <div className="auth-helper-buttons">
                    <button
                        className="auth-helper-authenticate"
                        onClick={handleAuthenticate}
                    >
                        Connect to Google Drive
                    </button>
                    <button
                        className="auth-helper-dismiss"
                        onClick={handleDismiss}
                    >
                        Later
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AuthenticationHelper;
