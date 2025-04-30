import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { setAccessToken, initializeWithToken } from '../services/googleDriveService';

// make a context for auth stuff
const AuthContext = createContext();

// hook to use auth context anywhere
export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    // user state
    const [currentUser, setCurrentUser] = useState(null);
    // loading state
    const [loading, setLoading] = useState(true);

    // login with google - also sets up drive access
    async function signInWithGoogle() {
        try {
            // tell app we're doing auth stuff
            window.DAILYBLOOM_EXPLICIT_AUTH_REQUESTED = true;

            // need to make a provider for google login
            const provider = new GoogleAuthProvider();

            // ask for drive access too
            provider.addScope('https://www.googleapis.com/auth/drive.file');

            // make sure user picks the right account
            provider.setCustomParameters({
                prompt: 'select_account'
            });

            // do the actual login with popup
            const result = await signInWithPopup(auth, provider);

            // grab token from result
            const credential = GoogleAuthProvider.credentialFromResult(result);

            if (credential && credential.accessToken) {
                // got access token - yay!
                console.log('Got access token!');

                // save token for later
                setAccessToken(credential.accessToken);

                // setup drive with this token
                await initializeWithToken(credential.accessToken);

                console.log('Drive is ready!');
            } else {
                // uh oh - no token!
                console.error('No token - something went wrong');
            }

            return result;
        } catch (err) {
            // oops login failed
            console.error('Login failed:', err);
            throw err;
        } finally {
            // reset auth flag either way
            window.DAILYBLOOM_EXPLICIT_AUTH_REQUESTED = false;
        }
    }

    // logout function
    async function logout() {
        // clear tokens from session
        sessionStorage.removeItem('gapi_access_token');
        sessionStorage.removeItem('gapi_token_expiry');
        // logout from firebase
        return signOut(auth);
    }

    // setup auth listener when component mounts
    useEffect(() => {
        // init flag to false
        window.DAILYBLOOM_EXPLICIT_AUTH_REQUESTED = false;

        // listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            // update user state
            setCurrentUser(user);

            // if logged in, try to setup drive
            if (user) {
                const token = sessionStorage.getItem('gapi_access_token');
                if (token) {
                    try {
                        // try to init drive with stored token
                        await initializeWithToken(token);
                        console.log('Drive initialized with saved token');
                    } catch (err) {
                        // didn't work but that's ok
                        console.warn("Couldn't init drive:", err);
                    }
                }
            }

            // done loading
            setLoading(false);
        });

        // cleanup listener on unmount
        return unsubscribe;
    }, []);

    // what we share with other components
    const value = {
        currentUser,
        signInWithGoogle,
        logout
    };

    // provide auth context to children
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
