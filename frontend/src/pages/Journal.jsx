import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import RichTextEditor from "../components/RichTextEditor";
import { journalAPI } from "../services/api";
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineSave,
  HiOutlineDocumentText,
  HiOutlineCalendar,
} from "react-icons/hi";
import "../styles/Journal.css";

export default function Journal() {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [entriesUpdated, setEntriesUpdated] = useState(0);

  // Fetch journal entries
  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await journalAPI.getAll();
      if (response.success && response.data) {
        setEntries(response.data.journals || []);
      }
    } catch (error) {
      console.error("Error fetching journal entries:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries, entriesUpdated]);

  const handleNewEntry = () => {
    setCurrentEntry(null);
    setTitle("");
    setContent("");
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
      const entryData = {
        title,
        content,
        date: new Date().toISOString(),
      };

      if (currentEntry) {
        // Update existing entry
        await journalAPI.update(currentEntry, entryData);
      } else {
        // Create new entry
        const response = await journalAPI.create(entryData);
        if (response.success && response.data.journal) {
          setCurrentEntry(response.data.journal.id);
        }
      }

      setEntriesUpdated((prev) => prev + 1);
      alert("Journal entry saved successfully!");
    } catch (error) {
      console.error("Error saving journal entry:", error);
      alert("Failed to save journal entry. Please try again.");
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
      await journalAPI.delete(currentEntry);
      setEntriesUpdated((prev) => prev + 1);
      handleNewEntry();
      alert("Journal entry deleted successfully!");
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      alert("Failed to delete journal entry. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="journal-page">
      <main className="journal-main">
        <div className="journal-container">
          <div className="journal-sidebar" id="journal-sidebar">
            <div className="journal-header">
              <h2>My Journal</h2>
              <button className="new-entry-btn" onClick={handleNewEntry}>
                <HiOutlinePlus />
                <span>New Entry</span>
              </button>
            </div>

            <div className="entries-list">
              {loading ? (
                <div className="entries-loading">Loading entries...</div>
              ) : entries.length === 0 ? (
                <div className="entries-empty">
                  <HiOutlineDocumentText className="empty-icon" />
                  <p>No entries yet</p>
                  <span>Start writing!</span>
                </div>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`entry-item ${currentEntry === entry.id ? "active" : ""}`}
                    onClick={() => handleSelectEntry(entry)}
                  >
                    <h3>{entry.title}</h3>
                    <p className="entry-date">
                      <HiOutlineCalendar />
                      {formatDate(entry.date)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

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
                  <HiOutlineSave />
                  {saving ? "Saving..." : "Save"}
                </button>
                {currentEntry && (
                  <button onClick={handleDelete} className="delete-btn">
                    <HiOutlineTrash />
                    Delete
                  </button>
                )}
              </div>
            </div>

            <RichTextEditor value={content} onChange={setContent} />
          </div>
        </div>
      </main>
    </div>
  );
}
