
import { GoogleAuthProvider } from 'firebase/auth';

// Base folder for app data in Google Drive
const APP_FOLDER_NAME = 'DailyBloom';

// Store access token
let accessToken = null;
// Add a flag to track if we're already trying to authenticate
let isAuthenticating = false;
// Add a cache for data to reduce API calls
const dataCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Initialize global auth flag if not already set
if (typeof window !== 'undefined' && window.DAILYBLOOM_EXPLICIT_AUTH_REQUESTED === undefined) {
  window.DAILYBLOOM_EXPLICIT_AUTH_REQUESTED = false;
}

/**
 * Set the access token for Google Drive operations
 */
export const setAccessToken = (token) => {
  if (!token) {
    console.warn('Attempted to set null or undefined access token');
    return;
  }
  
  accessToken = token;
  // Store token in session storage for persistence
  sessionStorage.setItem('gapi_access_token', token);
  console.log('Access token set for Google Drive API:', token.substring(0, 10) + '...');
};

// Also export a function to check if we have a valid token
export const hasValidToken = () => {
  // Try to get token from storage if we don't have one in memory
  if (!accessToken) {
    accessToken = sessionStorage.getItem('gapi_access_token');
  }
  return !!accessToken && typeof accessToken === 'string' && accessToken.length > 20;
};

// Load the Google API client and Identity Services
const loadGoogleAPIs = async () => {
  if (!window.gapi) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  if (!window.google) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  // Load the GAPI client
  if (!window.gapi.client) {
    await new Promise((resolve) => {
      window.gapi.load('client', resolve);
    });
  }
};

// Initialize the Google Drive API
const initGoogleDriveAPI = async () => {
  try {
    // Don't try to initialize if we're already in the process
    if (isAuthenticating) {
      throw new Error('Authentication already in progress');
    }

    await loadGoogleAPIs();
    
    // Initialize the GAPI client without API key initially
    await window.gapi.client.init({
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
    });
    
    // Check if we already have a valid token
    const token = sessionStorage.getItem('gapi_access_token');
    const expiry = sessionStorage.getItem('gapi_token_expiry');
    
    if (token && expiry && new Date().getTime() < parseInt(expiry)) {
      window.gapi.client.setToken({ access_token: token });
      return true;
    }
    
    // If this is not an explicit auth request, don't proceed with authentication
    if (!window.DAILYBLOOM_EXPLICIT_AUTH_REQUESTED) {
      // This is expected behavior, not an error
      const authRequiredError = new Error('Authentication required but not explicitly requested');
      authRequiredError.isExpected = true; // Mark as expected error
      throw authRequiredError;
    }
    
    // Otherwise, request a new token with GIS
    isAuthenticating = true;
    try {
      return await getAccessToken();
    } finally {
      isAuthenticating = false;
    }
  } catch (error) {
    // Only log unexpected errors
    if (!error.isExpected) {
      console.error('Error initializing Google Drive API:', error);
    }
    throw error;
  }
};

/**
 * Initialize Google Drive API with a token from Firebase Auth
 * This is used to automatically connect after login
 */
export const initializeWithToken = async (token) => {
  try {
    if (!token) {
      throw new Error('No token provided for Google Drive initialization');
    }
    
    // Set the token in our service
    setAccessToken(token);
    
    // Allow access during this initialization
    window.DAILYBLOOM_EXPLICIT_AUTH_REQUESTED = true;
    
    try {
      // Load the Google APIs
      await loadGoogleAPIs();
      
      // Initialize GAPI client
      await window.gapi.client.init({
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
      });
      
      // Set the token from Firebase Auth
      window.gapi.client.setToken({ access_token: token });
      
      // Store token expiry (assuming 1 hour from now, typical for Google tokens)
      const expiryTime = new Date().getTime() + (3600 * 1000);
      sessionStorage.setItem('gapi_token_expiry', expiryTime.toString());
      
      // Test the token with a simple API call
      await window.gapi.client.drive.about.get({
        fields: 'user'
      });
      
      console.log('Google Drive API successfully initialized with token');
      return true;
    } catch (error) {
      console.error('Error initializing Google Drive with token:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to initialize Google Drive with token:', error);
    throw error;
  } finally {
    // Always reset the flag
    window.DAILYBLOOM_EXPLICIT_AUTH_REQUESTED = false;
  }
};

// Add a helper function to explicitly request authentication
export const requestAuthentication = async () => {
  // Set the flag to allow authentication popup
  window.DAILYBLOOM_EXPLICIT_AUTH_REQUESTED = true;
  try {
    return await initGoogleDriveAPI();
  } finally {
    // Reset the flag after attempt
    window.DAILYBLOOM_EXPLICIT_AUTH_REQUESTED = false;
  }
};

// Get access token using Google Identity Services
const getAccessToken = async () => {
  try {
    // Ensure Google APIs are loaded
    await loadGoogleAPIs();
    
    // First try to use the stored token if we have one
    const storedToken = sessionStorage.getItem('gapi_access_token');
    const expiry = sessionStorage.getItem('gapi_token_expiry');
    
    if (storedToken && expiry && new Date().getTime() < parseInt(expiry)) {
      accessToken = storedToken;
      window.gapi.client.setToken({ access_token: storedToken });
      return true;
    }
    
    // Don't try Firebase re-auth automatically - it causes infinite popups
    // Instead, use the Google Identity Services API directly
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        reject(new Error('Google Identity Services not loaded'));
        return;
      }
      
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_FIREBASE_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            reject(tokenResponse);
            return;
          }
          
          // Store the token and expiry in session storage
          sessionStorage.setItem('gapi_access_token', tokenResponse.access_token);
          const expiryTime = new Date().getTime() + (tokenResponse.expires_in * 1000);
          sessionStorage.setItem('gapi_token_expiry', expiryTime.toString());
          
          // Set the token for later use
          accessToken = tokenResponse.access_token;
          
          // Set token for GAPI
          window.gapi.client.setToken({
            access_token: tokenResponse.access_token
          });
          
          resolve(true);
        }
      });
      
      // Request token with explicit consent to fix permission issues
      tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

// Get or create the app folder in Google Drive
const getAppFolder = async () => {
  try {
    await initGoogleDriveAPI();
    
    // Verify we have a token before proceeding
    const token = window.gapi.client.getToken();
    if (!token || !token.access_token) {
      throw new Error('No access token available for Drive operations');
    }
    
    // Check if the app folder exists
    const response = await window.gapi.client.drive.files.list({
      q: `name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)'
    });
    
    const files = response.result.files;
    
    if (files && files.length > 0) {
      return files[0].id;
    }
    
    // If folder doesn't exist, create it
    const folderMetadata = {
      name: APP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder'
    };
    
    const folder = await window.gapi.client.drive.files.create({
      resource: folderMetadata,
      fields: 'id'
    });
    
    return folder.result.id;
  } catch (error) {
    console.error('Error getting app folder:', error);
    throw error;
  }
};

// Get or create a subfolder inside the app folder
const getSubfolder = async (name) => {
  try {
    const appFolderId = await getAppFolder();
    
    // Check if subfolder exists
    const response = await window.gapi.client.drive.files.list({
      q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${appFolderId}' in parents and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)'
    });
    
    const files = response.result.files;
    
    if (files && files.length > 0) {
      return files[0].id;
    }
    
    // Create subfolder
    const folderMetadata = {
      name: name,
      parents: [appFolderId],
      mimeType: 'application/vnd.google-apps.folder'
    };
    
    const folder = await window.gapi.client.drive.files.create({
      resource: folderMetadata,
      fields: 'id'
    });
    
    return folder.result.id;
  } catch (error) {
    console.error(`Error getting subfolder ${name}:`, error);
    throw error;
  }
};

// Add caching to the read file function
const readFile = async (folderId, fileName) => {
  // Check if we have a cached version
  const cacheKey = `${folderId}_${fileName}`;
  const cachedData = dataCache.get(cacheKey);
  
  if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
    console.log(`Using cached data for ${fileName}`);
    return cachedData.data;
  }
  
  try {
    await initGoogleDriveAPI();
    
    // Find the file
    const response = await window.gapi.client.drive.files.list({
      q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)'
    });
    
    const files = response.result.files;
    
    if (!files || files.length === 0) {
      return null;
    }
    
    // Get file content
    const fileId = files[0].id;
    const getResponse = await window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });
    
    const data = JSON.parse(getResponse.body);
    
    // Cache the data
    dataCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    // If authentication is required, return empty data instead of triggering popups
    if (error.message.includes('Authentication required')) {
      console.warn('Authentication required to read file. Returning empty data.');
      return null;
    }
    
    // If file not found, return null
    if (error.status === 404) {
      return null;
    }
    
    console.error(`Error reading file ${fileName}:`, error);
    throw error;
  }
};

// Update caching when writing files
const writeFile = async (folderId, fileName, data) => {
  try {
    await initGoogleDriveAPI();
    
    // Check if file exists
    const response = await window.gapi.client.drive.files.list({
      q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)'
    });
    
    const files = response.result.files;
    const fileContent = JSON.stringify(data);
    
    const contentBlob = new Blob([fileContent], { type: 'application/json' });
    
    if (files && files.length > 0) {
      // Update existing file
      const fileId = files[0].id;
      
      // Get the current token
      const token = window.gapi.client.getToken();
      if (!token) {
        throw new Error('No access token available');
      }
      
      // Use the Files.update endpoint with uploadType=media
      await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: new Headers({ 'Authorization': 'Bearer ' + token.access_token }),
        body: contentBlob
      });
      
      return fileId;
    } else {
      // Create new file
      const fileMetadata = {
        name: fileName,
        parents: [folderId]
      };
      
      // Get the current token
      const token = window.gapi.client.getToken();
      if (!token) {
        throw new Error('No access token available');
      }
      
      // Create FormData
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      form.append('file', contentBlob);
      
      // Use multipart upload
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + token.access_token }),
        body: form
      });
      
      const responseData = await response.json();
      return responseData.id;
    }
  } catch (error) {
    console.error(`Error writing file ${fileName}:`, error);
    throw error;
  }
};

// Delete a file from Google Drive
// const deleteFile = async (folderId, fileName) => {
//   try {
//     await initGoogleDriveAPI();
    
//     // Find the file
//     const response = await window.gapi.client.drive.files.list({
//       q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
//       spaces: 'drive',
//       fields: 'files(id, name)'
//     });
    
//     const files = response.result.files;
    
//     if (!files || files.length === 0) {
//       return;
//     }
    
//     // Delete file
//     await window.gapi.client.drive.files.delete({
//       fileId: files[0].id
//     });
//   } catch (error) {
//     console.error(`Error deleting file ${fileName}:`, error);
//     throw error;
//   }
// };

// Journal service functions
export const getJournalEntries = async (userId) => {
  try {
    // Skip initialize if not authenticated and return empty data
    // This prevents automatic auth popups
    if (!hasValidToken() && !window.DAILYBLOOM_EXPLICIT_AUTH_REQUESTED) {
      console.log('No valid token and no explicit auth requested. Returning empty journal entries.');
      return [];
    }
    
    await initGoogleDriveAPI();
    const folderId = await getSubfolder('Journals');
    const entriesFile = await readFile(folderId, `${userId}_journals.json`);
    return entriesFile || [];
  } catch (error) {
    // If authentication required error, return empty array rather than propagating error
    if (error.message.includes('Authentication required')) {
      console.warn('Authentication required for journal entries. Returning empty array.');
      return [];
    }
    console.error('Error getting journal entries:', error);
    throw error;
  }
};

export const saveJournalEntry = async (entry) => {
  try {
    await initGoogleDriveAPI();
    const folderId = await getSubfolder('Journals');
    
    // Get existing entries
    let entries = await readFile(folderId, `${entry.userId}_journals.json`) || [];
    
    // Check if entry already exists
    const existingIndex = entries.findIndex(e => e.id === entry.id);
    
    if (existingIndex >= 0) {
      // Update existing entry
      entries[existingIndex] = entry;
    } else {
      // Add new entry
      entries.unshift(entry);
    }
    
    // Save back to file
    await writeFile(folderId, `${entry.userId}_journals.json`, entries);
    return entry;
  } catch (error) {
    console.error('Error saving journal entry:', error);
    throw error;
  }
};

export const deleteJournalEntry = async (entryId, userId) => {
  try {
    await initGoogleDriveAPI();
    const folderId = await getSubfolder('Journals');
    
    // Get existing entries
    let entries = await readFile(folderId, `${userId}_journals.json`) || [];
    
    // Filter out the entry to delete
    entries = entries.filter(e => e.id !== entryId);
    
    // Save back to file
    await writeFile(folderId, `${userId}_journals.json`, entries);
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

// Habit service functions
export const getHabits = async (userId) => {
  try {
    // Skip initialize if not authenticated and return empty data
    if (!hasValidToken() && !window.DAILYBLOOM_EXPLICIT_AUTH_REQUESTED) {
      console.log('No valid token and no explicit auth requested. Returning empty habits.');
      return [];
    }
    
    await initGoogleDriveAPI();
    const folderId = await getSubfolder('Habits');
    const habitsFile = await readFile(folderId, `${userId}_habits.json`);
    return habitsFile || [];
  } catch (error) {
    if (error.message.includes('Authentication required')) {
      console.warn('Authentication required for habits. Returning empty array.');
      return [];
    }
    console.error('Error getting habits:', error);
    throw error;
  }
};

export const saveHabit = async (habit) => {
  try {
    // For save operations, we need authentication
    if (!hasValidToken()) {
      throw new Error('Authentication required to save data');
    }
    
    await initGoogleDriveAPI();
    const folderId = await getSubfolder('Habits');
    
    // Get existing habits
    let habits = await readFile(folderId, `${habit.userId}_habits.json`) || [];
    
    // Check if habit already exists
    const existingIndex = habits.findIndex(h => h.id === habit.id);
    
    if (existingIndex >= 0) {
      // Update existing habit
      habits[existingIndex] = habit;
    } else {
      // Add new habit
      habits.push(habit);
    }
    
    // Save back to file
    await writeFile(folderId, `${habit.userId}_habits.json`, habits);
    return habit;
  } catch (error) {
    console.error('Error saving habit:', error);
    throw error;
  }
};

export const updateHabitProgress = async (habitId, progress, userId) => {
  try {
    // For save operations, we need authentication
    if (!hasValidToken()) {
      throw new Error('Authentication required to update data');
    }
    
    await initGoogleDriveAPI();
    const folderId = await getSubfolder('Habits');
    
    // Get existing habits
    let habits = await readFile(folderId, `${userId}_habits.json`) || [];
    
    // Find the habit to update
    const habitIndex = habits.findIndex(h => h.id === habitId);
    
    if (habitIndex >= 0) {
      // Update progress
      habits[habitIndex].progress = progress;
      
      // Save back to file
      await writeFile(folderId, `${userId}_habits.json`, habits);
      return habits[habitIndex];
    }
    
    throw new Error('Habit not found');
  } catch (error) {
    console.error('Error updating habit progress:', error);
    throw error;
  }
};

export const deleteHabit = async (habitId, userId) => {
  try {
    await initGoogleDriveAPI();
    const folderId = await getSubfolder('Habits');
    
    // Get existing habits
    let habits = await readFile(folderId, `${userId}_habits.json`) || [];
    
    // Filter out the habit to delete
    habits = habits.filter(h => h.id !== habitId);
    
    // Save back to file
    await writeFile(folderId, `${userId}_habits.json`, habits);
  } catch (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
};

// Mood service functions
export const getMoodEntries = async (userId) => {
  try {
    // Skip initialize if not authenticated and return empty data
    if (!hasValidToken() && !window.DAILYBLOOM_EXPLICIT_AUTH_REQUESTED) {
      console.log('No valid token and no explicit auth requested. Returning empty mood entries.');
      return [];
    }
    
    await initGoogleDriveAPI();
    const folderId = await getSubfolder('Moods');
    const moodsFile = await readFile(folderId, `${userId}_moods.json`);
    return moodsFile || [];
  } catch (error) {
    if (error.message.includes('Authentication required')) {
      console.warn('Authentication required for moods. Returning empty array.');
      return [];
    }
    console.error('Error getting mood entries:', error);
    throw error;
  }
};

export const saveMoodEntry = async (entry) => {
  try {
    await initGoogleDriveAPI();
    const folderId = await getSubfolder('Moods');
    
    // Get existing entries
    let entries = await readFile(folderId, `${entry.userId}_moods.json`) || [];
    
    // Add new entry (mood entries are not edited, just added)
    entries.unshift(entry);
    
    // Save back to file
    await writeFile(folderId, `${entry.userId}_moods.json`, entries);
    return entry;
  } catch (error) {
    console.error('Error saving mood entry:', error);
    throw error;
  }
};

// Dashboard data
export const getDashboardData = async (userId) => {
  try {
    // Skip initialization if not authenticated and return empty data
    if (!hasValidToken() && !window.DAILYBLOOM_EXPLICIT_AUTH_REQUESTED) {
      // Don't log as this is expected for users who aren't logged in yet
      return {
        journalCount: 0,
        completedHabits: 0,
        streakCount: 0,
        moodAverage: 'Neutral',
        needsAuth: true // Add flag to indicate auth is needed
      };
    }
    
    await initGoogleDriveAPI();
    
    // Get journal entries
    const journals = await getJournalEntries(userId);
    
    // Get habits
    const habits = await getHabits(userId);
    
    // Get mood entries
    const moods = await getMoodEntries(userId);
    
    // Calculate dashboard metrics
    const today = new Date().toISOString().split('T')[0];
    
    // Count completed habits for today
    const completedHabits = habits.filter(habit => 
      habit.progress && habit.progress[today]
    ).length;
    
    // Calculate streak
    let streakCount = 0;
    for (let i = 0; i < 30; i++) { // Check last 30 days max
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasCompletedHabit = habits.some(habit => 
        habit.progress && habit.progress[dateStr]
      );
      
      if (hasCompletedHabit) {
        streakCount++;
      } else if (i > 0) { // Skip today for streak calculation
        break;
      }
    }
    
    // Calculate mood average for the week
    const moodValues = {
      'great': 4,
      'good': 3,
      'neutral': 2,
      'bad': 1,
      'awful': 0
    };
    const moodLabels = ['Awful', 'Bad', 'Neutral', 'Good', 'Great'];
    
    // Get mood entries from the last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekMoods = moods.filter(mood => new Date(mood.date) >= weekAgo);
    
    let moodAverage = 'Neutral';
    if (weekMoods.length > 0) {
      const avgValue = weekMoods.reduce((sum, mood) => sum + (moodValues[mood.mood] || 2), 0) / weekMoods.length;
      moodAverage = moodLabels[Math.round(avgValue)];
    }
    
    return {
      journalCount: journals.length,
      completedHabits,
      streakCount,
      moodAverage,
      needsAuth: false
    };
  } catch (error) {
    if (error.isExpected || error.message.includes('Authentication required')) {
      // This is expected behavior, not an error
      return {
        journalCount: 0,
        completedHabits: 0,
        streakCount: 0,
        moodAverage: 'Neutral',
        needsAuth: true // Add flag to indicate auth is needed
      };
    }
    console.error('Error getting dashboard data:', error);
    throw error;
  }
};

// Update getAllUserData to handle auth needs better
export const getAllUserData = async (userId) => {
  try {
    // Skip init if no token and not explicitly authorized
    if (!hasValidToken() && !window.DAILYBLOOM_EXPLICIT_AUTH_REQUESTED) {
      return { 
        journals: [], 
        habits: [], 
        moods: [],
        needsAuth: true
      };
    }
    
    await initGoogleDriveAPI();
    const journals = await getJournalEntries(userId);
    const habits = await getHabits(userId);
    const moods = await getMoodEntries(userId);
    
    return { 
      journals, 
      habits, 
      moods,
      needsAuth: false
    };
  } catch (error) {
    if (error.isExpected || error.message.includes('Authentication required')) {
      return { 
        journals: [], 
        habits: [], 
        moods: [],
        needsAuth: true
      };
    }
    console.error('Error getting all user data:', error);
    throw error;
  }
};
