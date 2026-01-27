import React from 'react';
import { requestAuthentication } from '../services/googleDriveService';
import '../styles/AuthPrompt.css';

function AuthPrompt({ onAuthenticated }) {
    // state to track if auth is happening
    const [isAuthenticating, setIsAuthenticating] = React.useState(false);

    // handle auth button click
    const handleAuth = async () => {
        // don't let user click twice
        setIsAuthenticating(true);

        try {
            // do the auth stuff
            await requestAuthentication();

            // tell parent component it worked
            if (onAuthenticated) onAuthenticated();
        } catch (err) {
            // oops it failed
            console.error('Auth failed:', err);
        } finally {
            // reset state either way
            setIsAuthenticating(false);
        }
    };

    // the auth prompt UI
    return (
        <div className="auth-prompt">
            <div className="auth-prompt-content">
                <h3>Connect to Google Drive</h3>
                <p>To view your full dashboard, please connect to Google Drive to access your data.</p>
                <button
                    className="auth-prompt-button"
                    onClick={handleAuth}
                    disabled={isAuthenticating}
                >
                    {isAuthenticating ? 'Connecting...' : 'Connect Now'}
                </button>
            </div>
        </div>
    );
}

export default AuthPrompt;
