import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { RiLeafLine } from "react-icons/ri";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiArrowRight,
} from "react-icons/hi";
import { FiAlertCircle } from "react-icons/fi";
import "../styles/Login.css";

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signInWithGoogle, login, register } = useAuth();
  const navigate = useNavigate();

  async function handleGoogleSignIn() {
    try {
      setError("");
      setLoading(true);
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      setError("Google login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all required fields");
      return;
    }

    if (isRegister && password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setError("");
      setLoading(true);

      if (isRegister) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.message || (isRegister ? "Registration failed" : "Login failed"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <Link to="/" className="login-logo">
          <RiLeafLine className="logo-icon" />
          <span className="logo-text">DailyBloom</span>
        </Link>

        <div className="login-card">
          <div className="login-header">
            <h1>{isRegister ? "Create account" : "Welcome back"}</h1>
            <p>
              {isRegister
                ? "Start your journey with DailyBloom"
                : "Sign in to continue to your dashboard"}
            </p>
          </div>

          {error && (
            <div className="error-alert">
              <FiAlertCircle className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {isRegister && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <HiOutlineUser className="input-icon" />
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <HiOutlineMail className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <HiOutlineLockClosed className="input-icon" />
                <input
                  id="password"
                  type="password"
                  placeholder={
                    isRegister ? "Create a password" : "Enter your password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={isRegister ? 8 : undefined}
                />
              </div>
              {isRegister && (
                <span className="input-hint">
                  Must be at least 8 characters
                </span>
              )}
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  {isRegister ? "Create Account" : "Sign In"}
                  <HiArrowRight className="btn-icon" />
                </>
              )}
            </button>
          </form>

          <div className="divider">
            <span>or continue with</span>
          </div>

          <button
            type="button"
            className="btn-google"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <FcGoogle className="google-icon" />
            <span>Google</span>
          </button>

          <p className="auth-toggle">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setIsRegister(false);
                    setError("");
                  }}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setIsRegister(true);
                    setError("");
                  }}
                >
                  Create account
                </button>
              </>
            )}
          </p>
        </div>

        <p className="login-footer">
          By continuing, you agree to our <a href="#">Terms of Service</a> and{" "}
          <a href="#">Privacy Policy</a>
        </p>
      </div>

      <div className="login-right">
        <div className="login-right-content">
          <div className="feature-highlight">
            <RiLeafLine className="feature-icon" />
            <h2>Grow every day</h2>
            <p>
              Track your habits, journal your thoughts, and understand your
              emotional patterns with our beautiful, intuitive tools.
            </p>
          </div>
          <div className="testimonial-mini">
            <p>
              "DailyBloom helped me build consistency in my daily routines. I've
              never felt more organized and mindful."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">SK</div>
              <div className="author-info">
                <span className="author-name">Sarah K.</span>
                <span className="author-role">Product Designer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
