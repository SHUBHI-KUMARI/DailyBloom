import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import RichTextEditor from '../components/RichTextEditor';
import DriveAuthPopup from '../components/DriveAuthPopup';
import MobileSidebarToggle from '../components/MobileSidebarToggle';
import { getJournalEntries, saveJournalEntry, deleteJournalEntry } from '../services/googleDriveService';
import '../styles/Journal.css';

export default function Journal() {
    const { currentUser } = useAuth();
    const [entries, setEntries] = useState([]);
    const [currentEntry, setCurrentEntry] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [needsAuth, setNeedsAuth] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    // Add state to track when to refresh entries
    const [entriesUpdated, setEntriesUpdated] = useState(0);

    // Use useCallback to memoize fetchEntries function
    const fetchEntries = useCallback(async () => {
        try {
            setLoading(true);
            const fetchedEntries = await getJournalEntries(currentUser.uid);

            // Ensure no duplication by using a Map with entry IDs as keys
            const entriesMap = new Map();
            fetchedEntries.forEach(entry => {
                if (entry && entry.id) {
                    entriesMap.set(entry.id, entry);
                }
            });

            // Convert map back to array and sort by date (newest first)
            const uniqueEntries = Array.from(entriesMap.values())
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            setEntries(uniqueEntries);
        } catch (error) {
            if (error?.error === 'idpiframe_initialization_failed' ||
                error?.details?.includes('user authentication or authorization')) {
                setNeedsAuth(true);
            } else {
                console.error("Error fetching journal entries:", error);
            }
        } finally {
            setLoading(false);
        }
    }, [currentUser.uid]);

    // Update useEffect to also respond to entriesUpdated state
    useEffect(() => {
        fetchEntries();
    }, [fetchEntries, entriesUpdated]);

    const handleAuthorize = async () => {
        try {
            // This will trigger the Google auth flow
            await getJournalEntries(currentUser.uid);
            setNeedsAuth(false);

            // Execute any pending action after authorization
            if (pendingAction === 'save') {
                handleSave();
            } else if (pendingAction === 'delete') {
                handleDelete();
            } else {
                // Refresh entries
                setEntriesUpdated(prev => prev + 1);
            }

            setPendingAction(null);
        } catch (error) {
            console.error("Error during authorization:", error);
        }
    };

    const handleCancelAuth = () => {
        setNeedsAuth(false);
        setPendingAction(null);
    };

    const handleNewEntry = () => {
        setCurrentEntry(null);
        setTitle('');
        setContent('');
    };

    const handleSelectEntry = (entry) => {
        setCurrentEntry(entry.id);
        setTitle(entry.title);
        setContent(entry.content);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            alert("Please add a title for your journal entry.");
            return;
        }

        setSaving(true);
        try {
            // Create a unique ID for new entries using timestamp and random string
            const entryId = currentEntry || `journal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

            const entryData = {
                id: entryId,
                title,
                content,
                date: new Date().toISOString(),
                userId: currentUser.uid
            };

            await saveJournalEntry(entryData);

            // Instead of manually updating the entries array, 
            // trigger a refresh to get the updated list from the server
            setEntriesUpdated(prev => prev + 1);

            // Set the current entry to the newly saved entry
            setCurrentEntry(entryId);
            alert("Journal entry saved successfully!");
        } catch (error) {
            if (error?.error === 'idpiframe_initialization_failed' ||
                error?.details?.includes('user authentication or authorization')) {
                setPendingAction('save');
                setNeedsAuth(true);
            } else {
                console.error("Error saving journal entry:", error);
                alert("Failed to save journal entry. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!currentEntry) return;

        if (!confirm("Are you sure you want to delete this journal entry?")) {
            return;
        }

        try {
            await deleteJournalEntry(currentEntry, currentUser.uid);

            // Trigger a refresh to get the updated entries list
            setEntriesUpdated(prev => prev + 1);
            handleNewEntry();
            alert("Journal entry deleted successfully!");
        } catch (error) {
            if (error?.error === 'idpiframe_initialization_failed' ||
                error?.details?.includes('user authentication or authorization')) {
                setPendingAction('delete');
                setNeedsAuth(true);
            } else {
                console.error("Error deleting journal entry:", error);
                alert("Failed to delete journal entry. Please try again.");
            }
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                {needsAuth ? (
                    <DriveAuthPopup
                        onAuthorize={handleAuthorize}
                        onCancel={handleCancelAuth}
                    />
                ) : null}

                <div className="journal-container">
                    <div className="journal-sidebar" id="journal-sidebar">
                        <div className="journal-header">
                            <h2>My Journal</h2>
                            <button
                                className="new-entry-btn"
                                onClick={handleNewEntry}
                            >
                                New Entry
                            </button>
                        </div>

                        <div className="entries-list">
                            {loading ? (
                                <p>Loading entries...</p>
                            ) : entries.length === 0 ? (
                                <p>No entries yet. Start writing!</p>
                            ) : (
                                entries.map(entry => (
                                    <div
                                        key={entry.id || `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}
                                        className={`entry-item ${currentEntry === entry.id ? 'active' : ''}`}
                                        onClick={() => handleSelectEntry(entry)}
                                    >
                                        <h3>{entry.title}</h3>
                                        <p className="entry-date">{formatDate(entry.date)}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <MobileSidebarToggle targetId="journal-sidebar" className="toggle-journal-sidebar" />

                    <div className="journal-editor">
                        <div className="editor-header">
                            <input
                                type="text"
                                placeholder="Entry Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="entry-title-input"
                            />
                            <div className="editor-actions">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="save-btn"
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                {currentEntry && (
                                    <button
                                        onClick={handleDelete}
                                        className="delete-btn"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>

                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}