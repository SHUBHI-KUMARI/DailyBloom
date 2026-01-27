/**
 * API Service for DailyBloom
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Store access token in memory
let accessToken = null;

/**
 * Set the access token for API requests
 */
export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

/**
 * Get the access token
 */
export const getAccessToken = () => {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
};

/**
 * Clear access token
 */
export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem('accessToken');
};

/**
 * Make an API request
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for refresh token
    });

    const data = await response.json();

    // Handle token refresh
    if (response.status === 401 && data.message === 'Token expired') {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token
        headers['Authorization'] = `Bearer ${getAccessToken()}`;
        const retryResponse = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        });
        return retryResponse.json();
      } else {
        // Refresh failed, clear tokens and redirect to login
        clearAccessToken();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Refresh the access token
 */
const refreshAccessToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    if (data.success && data.data.accessToken) {
      setAccessToken(data.data.accessToken);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  /**
   * Register a new user
   */
  register: async (email, password, name) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    if (response.data?.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    return response;
  },

  /**
   * Login with email and password
   */
  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.data?.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    return response;
  },

  /**
   * Login with Google
   */
  googleLogin: async (idToken) => {
    const response = await apiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
    if (response.data?.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    return response;
  },

  /**
   * Login with Google using user info (from access token flow)
   */
  googleLoginWithUserInfo: async (userInfo) => {
    const response = await apiRequest('/auth/google/userinfo', {
      method: 'POST',
      body: JSON.stringify(userInfo),
    });
    if (response.data?.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    return response;
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } finally {
      clearAccessToken();
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  /**
   * Update profile
   */
  updateProfile: async (data) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword, newPassword) => {
    return apiRequest('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// ============================================
// JOURNAL API
// ============================================

export const journalAPI = {
  /**
   * Get all journals
   */
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/journals${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get a journal by ID
   */
  getById: async (id) => {
    return apiRequest(`/journals/${id}`);
  },

  /**
   * Create a journal entry
   */
  create: async (data) => {
    return apiRequest('/journals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a journal entry
   */
  update: async (id, data) => {
    return apiRequest(`/journals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a journal entry
   */
  delete: async (id) => {
    return apiRequest(`/journals/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get journals by date range
   */
  getByDateRange: async (startDate, endDate) => {
    return apiRequest(`/journals/range/${startDate}/${endDate}`);
  },
};

// ============================================
// HABIT API
// ============================================

export const habitAPI = {
  /**
   * Get all habits
   */
  getAll: async () => {
    return apiRequest('/habits');
  },

  /**
   * Get a habit by ID
   */
  getById: async (id) => {
    return apiRequest(`/habits/${id}`);
  },

  /**
   * Get habit statistics
   */
  getStats: async (days = 30) => {
    return apiRequest(`/habits/stats?days=${days}`);
  },

  /**
   * Create a habit
   */
  create: async (data) => {
    return apiRequest('/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a habit
   */
  update: async (id, data) => {
    return apiRequest(`/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a habit
   */
  delete: async (id) => {
    return apiRequest(`/habits/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Toggle habit progress for a date
   */
  toggleProgress: async (id, date) => {
    return apiRequest(`/habits/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  },

  /**
   * Bulk update habit progress
   */
  updateProgress: async (id, progress) => {
    return apiRequest(`/habits/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  },
};

// ============================================
// MOOD API
// ============================================

export const moodAPI = {
  /**
   * Get all mood entries
   */
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/moods${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get a mood entry by ID
   */
  getById: async (id) => {
    return apiRequest(`/moods/${id}`);
  },

  /**
   * Get mood statistics
   */
  getStats: async (days = 14) => {
    return apiRequest(`/moods/stats?days=${days}`);
  },

  /**
   * Get all user data for calendar
   */
  getCalendarData: async () => {
    return apiRequest('/moods/calendar');
  },

  /**
   * Create a mood entry
   */
  create: async (data) => {
    return apiRequest('/moods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a mood entry
   */
  update: async (id, data) => {
    return apiRequest(`/moods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a mood entry
   */
  delete: async (id) => {
    return apiRequest(`/moods/${id}`, {
      method: 'DELETE',
    });
  },
};

export default {
  auth: authAPI,
  journal: journalAPI,
  habit: habitAPI,
  mood: moodAPI,
  setAccessToken,
  getAccessToken,
  clearAccessToken,
};
