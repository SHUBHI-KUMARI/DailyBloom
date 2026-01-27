import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  authAPI,
  setAccessToken,
  getAccessToken,
  clearAccessToken,
} from "../services/api";

// Create the auth context
const AuthContext = createContext();

// Hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Google Client ID from environment
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Google Identity Services
  const initializeGoogleAuth = useCallback(() => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: false,
      });
    }
  }, []);

  // Handle Google sign-in callback
  const handleGoogleCallback = async (response) => {
    try {
      setError(null);
      const result = await authAPI.googleLogin(response.credential);
      if (result.success && result.data.user) {
        setCurrentUser(result.data.user);
      }
    } catch (err) {
      console.error("Google login failed:", err);
      setError(err.message || "Google login failed");
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getAccessToken();
        if (token) {
          const result = await authAPI.getCurrentUser();
          if (result.success && result.data.user) {
            setCurrentUser(result.data.user);
          } else {
            clearAccessToken();
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        clearAccessToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    initializeGoogleAuth();

    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleAuth;
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, [initializeGoogleAuth]);

  // Register with email and password
  const register = async (email, password, name) => {
    try {
      setError(null);
      const result = await authAPI.register(email, password, name);
      if (result.success && result.data.user) {
        setCurrentUser(result.data.user);
        return result;
      }
      throw new Error(result.message || "Registration failed");
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      setError(null);
      const result = await authAPI.login(email, password);
      if (result.success && result.data.user) {
        setCurrentUser(result.data.user);
        return result;
      }
      throw new Error(result.message || "Login failed");
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null);

      if (!window.google || !window.google.accounts) {
        throw new Error("Google Sign-In is not loaded yet. Please try again.");
      }

      // Use token client for access token - most reliable approach
      return new Promise((resolve, reject) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "email profile openid",
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setError(tokenResponse.error);
              reject(new Error(tokenResponse.error));
              return;
            }
            
            if (tokenResponse.access_token) {
              try {
                // Get user info from Google using access token
                const userInfoRes = await fetch(
                  "https://www.googleapis.com/oauth2/v3/userinfo",
                  {
                    headers: {
                      Authorization: `Bearer ${tokenResponse.access_token}`,
                    },
                  }
                );
                
                if (!userInfoRes.ok) {
                  throw new Error("Failed to get user info from Google");
                }
                
                const userInfo = await userInfoRes.json();

                // Send user info to our backend
                const result = await authAPI.googleLoginWithUserInfo({
                  googleId: userInfo.sub,
                  email: userInfo.email,
                  name: userInfo.name,
                  avatar: userInfo.picture,
                });

                if (result.success && result.data.user) {
                  setCurrentUser(result.data.user);
                  resolve(result);
                } else {
                  throw new Error(result.message || "Google authentication failed");
                }
              } catch (err) {
                console.error("Google auth error:", err);
                setError(err.message);
                reject(err);
              }
            }
          },
        });
        
        tokenClient.requestAccessToken({ prompt: "select_account" });
      });
    } catch (err) {
      console.error("Google sign-in failed:", err);
      setError(err.message || "Google sign-in failed");
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setCurrentUser(null);
      clearAccessToken();

      // Sign out from Google if available
      if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
      }
    }
  };

  // Update user profile
  const updateProfile = async (data) => {
    try {
      setError(null);
      const result = await authAPI.updateProfile(data);
      if (result.success && result.data.user) {
        setCurrentUser(result.data.user);
        return result;
      }
      throw new Error(result.message || "Profile update failed");
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const result = await authAPI.changePassword(currentPassword, newPassword);
      if (result.success) {
        // User needs to login again after password change
        await logout();
        return result;
      }
      throw new Error(result.message || "Password change failed");
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    signInWithGoogle,
    logout,
    updateProfile,
    changePassword,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
