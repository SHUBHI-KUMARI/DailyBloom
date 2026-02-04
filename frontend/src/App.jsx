import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import AppLayout from "./components/AppLayout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import HabitTracker from "./pages/HabitTracker";
import MoodTracker from "./pages/MoodTracker";
import Calendar from "./pages/Calendar";
import "./App.css";

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function PublicRoute({ children }) {
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="app">
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/journal"
            element={
              <PrivateRoute>
                <Journal />
              </PrivateRoute>
            }
          />
          <Route
            path="/habits"
            element={
              <PrivateRoute>
                <HabitTracker />
              </PrivateRoute>
            }
          />
          <Route
            path="/mood"
            element={
              <PrivateRoute>
                <MoodTracker />
              </PrivateRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <Calendar />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
