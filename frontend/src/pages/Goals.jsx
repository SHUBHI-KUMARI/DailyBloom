import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { goalAPI } from "../services/api";
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiCheck,
  HiOutlineFlag,
  HiOutlinePencil,
  HiOutlineX,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from "react-icons/hi";
import "../styles/Goals.css";

const CATEGORIES = [
  { value: "personal", label: "Personal", color: "#8b5cf6" },
  { value: "health", label: "Health", color: "#10b981" },
  { value: "career", label: "Career", color: "#3b82f6" },
  { value: "learning", label: "Learning", color: "#f59e0b" },
  { value: "finance", label: "Finance", color: "#ef4444" },
];

export default function Goals() {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [expandedGoals, setExpandedGoals] = useState(new Set());
  const [filter, setFilter] = useState("active");
  const [stats, setStats] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "personal",
    targetDate: "",
    milestones: [],
  });
  const [newMilestone, setNewMilestone] = useState("");

  useEffect(() => {
    fetchGoals();
    fetchStats();
  }, [currentUser, filter]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await goalAPI.getAll(filter);
      if (response.success && response.data) {
        setGoals(response.data.goals || []);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await goalAPI.getStats();
      if (response.success && response.data) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleAddGoal = async () => {
    if (!formData.title.trim()) return;

    try {
      const response = await goalAPI.create({
        ...formData,
        milestones: formData.milestones.filter((m) => m.trim()),
      });
      if (response.success && response.data.goal) {
        setGoals([response.data.goal, ...goals]);
        resetForm();
        setShowAddModal(false);
        fetchStats();
      }
    } catch (error) {
      console.error("Error adding goal:", error);
      alert("Failed to add goal. Please try again.");
    }
  };

  const handleUpdateGoal = async () => {
    if (!formData.title.trim() || !editingGoal) return;

    try {
      const response = await goalAPI.update(editingGoal.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        targetDate: formData.targetDate || null,
      });
      if (response.success && response.data.goal) {
        setGoals(
          goals.map((g) => (g.id === editingGoal.id ? response.data.goal : g))
        );
        resetForm();
        setEditingGoal(null);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error("Error updating goal:", error);
      alert("Failed to update goal. Please try again.");
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      await goalAPI.delete(id);
      setGoals(goals.filter((g) => g.id !== id));
      fetchStats();
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("Failed to delete goal. Please try again.");
    }
  };

  const handleToggleMilestone = async (milestoneId, goalId) => {
    try {
      const response = await goalAPI.toggleMilestone(milestoneId);
      if (response.success) {
        // Refresh to get updated progress
        const updatedGoal = await goalAPI.getById(goalId);
        if (updatedGoal.success && updatedGoal.data.goal) {
          setGoals(
            goals.map((g) => (g.id === goalId ? updatedGoal.data.goal : g))
          );
          fetchStats();
        }
      }
    } catch (error) {
      console.error("Error toggling milestone:", error);
    }
  };

  const handleAddMilestoneToGoal = async (goalId) => {
    const title = prompt("Enter milestone title:");
    if (!title?.trim()) return;

    try {
      const response = await goalAPI.addMilestone(goalId, title);
      if (response.success) {
        const updatedGoal = await goalAPI.getById(goalId);
        if (updatedGoal.success && updatedGoal.data.goal) {
          setGoals(
            goals.map((g) => (g.id === goalId ? updatedGoal.data.goal : g))
          );
        }
      }
    } catch (error) {
      console.error("Error adding milestone:", error);
    }
  };

  const handleDeleteMilestone = async (milestoneId, goalId) => {
    if (!confirm("Delete this milestone?")) return;

    try {
      await goalAPI.deleteMilestone(milestoneId);
      const updatedGoal = await goalAPI.getById(goalId);
      if (updatedGoal.success && updatedGoal.data.goal) {
        setGoals(
          goals.map((g) => (g.id === goalId ? updatedGoal.data.goal : g))
        );
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting milestone:", error);
    }
  };

  const handleStatusChange = async (goalId, newStatus) => {
    try {
      const response = await goalAPI.update(goalId, { status: newStatus });
      if (response.success) {
        fetchGoals();
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const toggleGoalExpand = (goalId) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "personal",
      targetDate: "",
      milestones: [],
    });
    setNewMilestone("");
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || "",
      category: goal.category,
      targetDate: goal.targetDate
        ? new Date(goal.targetDate).toISOString().split("T")[0]
        : "",
      milestones: [],
    });
    setShowAddModal(true);
  };

  const addMilestoneToForm = () => {
    if (!newMilestone.trim()) return;
    setFormData({
      ...formData,
      milestones: [...formData.milestones, newMilestone.trim()],
    });
    setNewMilestone("");
  };

  const removeMilestoneFromForm = (index) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index),
    });
  };

  const getCategoryInfo = (category) => {
    return CATEGORIES.find((c) => c.value === category) || CATEGORIES[0];
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue = (targetDate) => {
    if (!targetDate) return false;
    return new Date(targetDate) < new Date();
  };

  return (
    <div className="goals-page">
      <main className="goals-main">
        <div className="goals-container">
          <div className="page-header">
            <div className="header-content">
              <h1>Goals</h1>
              <p className="page-subtitle">
                Track your long-term goals and milestones
              </p>
            </div>
            <button
              className="add-goal-btn"
              onClick={() => {
                resetForm();
                setEditingGoal(null);
                setShowAddModal(true);
              }}
            >
              <HiOutlinePlus /> New Goal
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-value">{stats.active}</span>
                <span className="stat-label">Active Goals</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.completed}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.averageProgress}%</span>
                <span className="stat-label">Avg Progress</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {stats.completedMilestones}/{stats.totalMilestones}
                </span>
                <span className="stat-label">Milestones</span>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {["active", "completed", "archived", "all"].map((status) => (
              <button
                key={status}
                className={`filter-tab ${filter === status ? "active" : ""}`}
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Goals List */}
          <div className="goals-list">
            {loading ? (
              <div className="loading-state">Loading goals...</div>
            ) : goals.length === 0 ? (
              <div className="empty-state">
                <HiOutlineFlag className="empty-icon" />
                <p>No {filter !== "all" ? filter : ""} goals yet</p>
                <span>Create a goal to start tracking your progress</span>
              </div>
            ) : (
              goals.map((goal) => {
                const categoryInfo = getCategoryInfo(goal.category);
                const isExpanded = expandedGoals.has(goal.id);

                return (
                  <div
                    key={goal.id}
                    className={`goal-card ${goal.status}`}
                    style={{ "--category-color": categoryInfo.color }}
                  >
                    <div className="goal-header" onClick={() => toggleGoalExpand(goal.id)}>
                      <div className="goal-info">
                        <span
                          className="category-badge"
                          style={{ backgroundColor: categoryInfo.color }}
                        >
                          {categoryInfo.label}
                        </span>
                        <h3 className="goal-title">{goal.title}</h3>
                        {goal.targetDate && (
                          <span
                            className={`target-date ${
                              isOverdue(goal.targetDate) && goal.status === "active"
                                ? "overdue"
                                : ""
                            }`}
                          >
                            {isOverdue(goal.targetDate) && goal.status === "active"
                              ? "Overdue: "
                              : "Due: "}
                            {formatDate(goal.targetDate)}
                          </span>
                        )}
                      </div>
                      <div className="goal-actions">
                        <div className="progress-info">
                          <span className="progress-text">{goal.progress}%</span>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>
                        <button className="expand-btn">
                          {isExpanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="goal-details">
                        {goal.description && (
                          <p className="goal-description">{goal.description}</p>
                        )}

                        <div className="milestones-section">
                          <div className="milestones-header">
                            <h4>Milestones</h4>
                            <button
                              className="add-milestone-btn"
                              onClick={() => handleAddMilestoneToGoal(goal.id)}
                            >
                              <HiOutlinePlus /> Add
                            </button>
                          </div>
                          <div className="milestones-list">
                            {goal.milestones?.length === 0 ? (
                              <p className="no-milestones">
                                No milestones yet. Add some to track your progress!
                              </p>
                            ) : (
                              goal.milestones?.map((milestone) => (
                                <div
                                  key={milestone.id}
                                  className={`milestone-item ${
                                    milestone.completed ? "completed" : ""
                                  }`}
                                >
                                  <button
                                    className="milestone-checkbox"
                                    onClick={() =>
                                      handleToggleMilestone(milestone.id, goal.id)
                                    }
                                  >
                                    {milestone.completed && <HiCheck />}
                                  </button>
                                  <span className="milestone-title">
                                    {milestone.title}
                                  </span>
                                  <button
                                    className="delete-milestone-btn"
                                    onClick={() =>
                                      handleDeleteMilestone(milestone.id, goal.id)
                                    }
                                  >
                                    <HiOutlineX />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="goal-footer">
                          <div className="status-actions">
                            {goal.status === "active" && (
                              <>
                                <button
                                  className="status-btn complete"
                                  onClick={() =>
                                    handleStatusChange(goal.id, "completed")
                                  }
                                >
                                  <HiCheck /> Complete
                                </button>
                                <button
                                  className="status-btn archive"
                                  onClick={() =>
                                    handleStatusChange(goal.id, "archived")
                                  }
                                >
                                  Archive
                                </button>
                              </>
                            )}
                            {goal.status === "completed" && (
                              <button
                                className="status-btn reactivate"
                                onClick={() =>
                                  handleStatusChange(goal.id, "active")
                                }
                              >
                                Reactivate
                              </button>
                            )}
                            {goal.status === "archived" && (
                              <button
                                className="status-btn reactivate"
                                onClick={() =>
                                  handleStatusChange(goal.id, "active")
                                }
                              >
                                Restore
                              </button>
                            )}
                          </div>
                          <div className="edit-actions">
                            <button
                              className="edit-btn"
                              onClick={() => openEditModal(goal)}
                            >
                              <HiOutlinePencil />
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteGoal(goal.id)}
                            >
                              <HiOutlineTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Goal Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingGoal ? "Edit Goal" : "Create New Goal"}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingGoal(null);
                  resetForm();
                }}
              >
                <HiOutlineX />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="What do you want to achieve?"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Add more details about your goal..."
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Target Date</label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) =>
                      setFormData({ ...formData, targetDate: e.target.value })
                    }
                  />
                </div>
              </div>

              {!editingGoal && (
                <div className="form-group">
                  <label>Milestones</label>
                  <div className="milestone-input-group">
                    <input
                      type="text"
                      value={newMilestone}
                      onChange={(e) => setNewMilestone(e.target.value)}
                      placeholder="Add a milestone..."
                      onKeyPress={(e) =>
                        e.key === "Enter" && addMilestoneToForm()
                      }
                    />
                    <button
                      type="button"
                      onClick={addMilestoneToForm}
                      className="add-milestone-form-btn"
                    >
                      <HiOutlinePlus />
                    </button>
                  </div>
                  {formData.milestones.length > 0 && (
                    <ul className="milestone-preview-list">
                      {formData.milestones.map((m, i) => (
                        <li key={i}>
                          <span>{m}</span>
                          <button onClick={() => removeMilestoneFromForm(i)}>
                            <HiOutlineX />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingGoal(null);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={editingGoal ? handleUpdateGoal : handleAddGoal}
                disabled={!formData.title.trim()}
              >
                {editingGoal ? "Save Changes" : "Create Goal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
