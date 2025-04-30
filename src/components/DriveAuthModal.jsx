import { useState } from 'react';
import '../styles/DriveAuthModal.css';

export default function DriveAuthModal({ onClose }) {
    const [isAuthorizing, setIsAuthorizing] = useState(false);

    const handleAuthorize = () => {
        setIsAuthorizing(true);
        // We don't need to do anything here as the initGoogleDriveAPI function
        // will handle the authorization flow when any Drive function is called.
        onClose();
    };

    return (
        <div className="drive-auth-overlay">
            <div className="drive-auth-modal">
                <h2>Google Drive Authorization Required</h2>
                <p>
                    DailyBloom needs to access your Google Drive to store your journal entries, habit tracking data, and mood records.
                    Your data will be stored securely in your personal Google Drive account.
                </p>
                <p>
                    When you click "Authorize", you'll be prompted to sign in with Google
                    and grant permission for this app to create and manage its own files in your Google Drive.
                </p>
                <div className="drive-auth-buttons">
                    <button
                        className="authorize-button"
                        onClick={handleAuthorize}
                        disabled={isAuthorizing}
                    >
                        {isAuthorizing ? 'Authorizing...' : 'Authorize'}
                    </button>
                    <button
                        className="cancel-button"
                        onClick={onClose}
                        disabled={isAuthorizing}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
