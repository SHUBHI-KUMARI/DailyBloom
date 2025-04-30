import { useState } from 'react';
import '../styles/DriveAuthPopup.css';

export default function DriveAuthPopup({ onAuthorize, onCancel }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleAuthorize = async () => {
        setIsLoading(true);
        try {
            await onAuthorize();
        } catch (error) {
            console.error("Error authorizing with Google Drive:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="drive-auth-overlay">
            <div className="drive-auth-modal">
                <h2>Google Drive Access Required</h2>
                <p>
                    DailyBloom needs permission to access your Google Drive to save your journal entries, habits, and mood data.
                    Your data will be stored securely in your own Google Drive account.
                </p>
                <div className="drive-auth-buttons">
                    <button
                        className="drive-auth-button"
                        onClick={handleAuthorize}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Connecting...' : 'Connect to Google Drive'}
                    </button>
                    <button
                        className="drive-cancel-button"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
