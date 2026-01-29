import { useNavigate } from "react-router-dom";
import {
  HiOutlineBookOpen,
  HiOutlineCheckCircle,
  HiOutlineChartBar,
  HiOutlineCalendar,
  HiOutlineSparkles,
  HiOutlineLightningBolt,
  HiOutlineHeart,
  HiOutlineStar,
  HiArrowRight,
} from "react-icons/hi";
import {
  FiTwitter,
  FiFacebook,
  FiInstagram,
  FiLinkedin,
  FiArrowRight,
} from "react-icons/fi";
import { RiLeafLine, RiMentalHealthLine } from "react-icons/ri";
import "../styles/LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/login");
  };

  const features = [
    {
      icon: <HiOutlineBookOpen />,
      title: "Rich Journaling",
      description:
        "Capture your thoughts with our beautiful rich text editor. Add formatting, images, and create meaningful reflections.",
      color: "journal",
    },
    {
      icon: <HiOutlineCheckCircle />,
      title: "Habit Tracking",
      description:
        "Build lasting habits with visual progress tracking. See your streaks grow and stay motivated every day.",
      color: "habit",
    },
    {
      icon: <RiMentalHealthLine />,
      title: "Mood Insights",
      description:
        "Track your emotional patterns over time. Understand what affects your wellbeing with data-driven insights.",
      color: "mood",
    },
    {
      icon: <HiOutlineCalendar />,
      title: "Calendar View",
      description:
        "See your complete journey at a glance. Connect habits, journals, and moods in one unified timeline.",
      color: "calendar",
    },
    {
      icon: <HiOutlineChartBar />,
      title: "Visual Analytics",
      description:
        "Beautiful charts and statistics that help you understand your patterns and celebrate your progress.",
      color: "analytics",
    },
    {
      icon: <HiOutlineLightningBolt />,
      title: "Daily Streaks",
      description:
        "Stay motivated with streak counters. Build momentum and watch your consistency compound over time.",
      color: "streak",
    },
  ];

  const testimonials = [
    {
      quote:
        "DailyBloom transformed how I approach my daily routines. The habit tracking combined with journaling creates a powerful self-improvement system.",
      author: "Sarah Johnson",
      role: "Product Designer",
      duration: "8 months",
    },
    {
      quote:
        "Finally, an app that combines everything I need. The mood tracking has helped me identify patterns I never noticed before.",
      author: "Michael Rodriguez",
      role: "Software Engineer",
      duration: "6 months",
    },
    {
      quote:
        "The visual calendar showing my habits, journals, and moods together is incredible. It's become an essential part of my morning routine.",
      author: "Aisha Patel",
      role: "Marketing Manager",
      duration: "1 year",
    },
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <header className="landing-header">
        <div className="landing-container">
          <div className="landing-logo">
            <RiLeafLine className="logo-icon" />
            <span className="logo-text">DailyBloom</span>
          </div>

          <nav className="landing-nav">
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#testimonials" className="nav-link">
              Testimonials
            </a>
            <a href="#about" className="nav-link">
              About
            </a>
          </nav>

          <div className="auth-buttons">
            <button className="btn-ghost" onClick={handleSignIn}>
              Sign In
            </button>
            <button className="btn-primary" onClick={handleSignUp}>
              Get Started
              <FiArrowRight className="btn-icon" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <HiOutlineSparkles className="badge-icon" />
              <span>Your personal growth companion</span>
            </div>
            <h1 className="hero-title">
              Cultivate Better Habits,
              <span className="text-gradient"> One Day at a Time</span>
            </h1>
            <p className="hero-subtitle">
              Track habits, journal your thoughts, and monitor your mood in one
              beautiful app designed to help you grow and thrive every single
              day.
            </p>
            <div className="hero-actions">
              <button className="btn-primary btn-lg" onClick={handleSignUp}>
                Start Your Journey Free
                <HiArrowRight className="btn-icon" />
              </button>
              <button
                className="btn-outline btn-lg"
                onClick={() => (window.location.href = "#features")}
              >
                Learn More
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">500k+</span>
                <span className="stat-label">Habits Tracked</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">4.9</span>
                <span className="stat-label">User Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-card">
              <div className="visual-header">
                <RiLeafLine className="visual-logo" />
                <span>Dashboard Preview</span>
              </div>
              <div className="visual-content">
                <div className="visual-stat-grid">
                  <div className="visual-stat journal-stat">
                    <HiOutlineBookOpen />
                    <span>12 Entries</span>
                  </div>
                  <div className="visual-stat habit-stat">
                    <HiOutlineCheckCircle />
                    <span>8 Habits</span>
                  </div>
                  <div className="visual-stat mood-stat">
                    <HiOutlineHeart />
                    <span>Good Mood</span>
                  </div>
                  <div className="visual-stat streak-stat">
                    <HiOutlineLightningBolt />
                    <span>14 Day Streak</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="features-container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Everything You Need to Grow</h2>
            <p className="section-subtitle">
              Powerful tools designed to help you build habits, reflect on your
              journey, and understand your emotional patterns.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-card feature-${feature.color}`}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section" id="testimonials">
        <div className="testimonials-container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">Loved by Thousands</h2>
            <p className="section-subtitle">
              Join our community of people transforming their lives one day at a
              time.
            </p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <HiOutlineStar key={i} className="star-icon" />
                  ))}
                </div>
                <p className="testimonial-quote">"{testimonial.quote}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="author-info">
                    <span className="author-name">{testimonial.author}</span>
                    <span className="author-role">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Your Journey?</h2>
            <p className="cta-subtitle">
              Join thousands of others who are building better habits and living
              more intentionally.
            </p>
            <button className="btn-primary btn-lg" onClick={handleSignUp}>
              Get Started for Free
              <HiArrowRight className="btn-icon" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" id="about">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-logo">
                <RiLeafLine className="logo-icon" />
                <span className="logo-text">DailyBloom</span>
              </div>
              <p className="footer-description">
                Your personal companion for building meaningful habits,
                journaling your thoughts, and understanding your emotions.
              </p>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Twitter">
                  <FiTwitter />
                </a>
                <a href="#" className="social-link" aria-label="Facebook">
                  <FiFacebook />
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <FiInstagram />
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <FiLinkedin />
                </a>
              </div>
            </div>

            <div className="footer-links-group">
              <div className="footer-links-column">
                <h4 className="footer-links-title">Product</h4>
                <ul className="footer-links">
                  <li>
                    <a href="#">Features</a>
                  </li>
                  <li>
                    <a href="#">Pricing</a>
                  </li>
                  <li>
                    <a href="#">Integrations</a>
                  </li>
                  <li>
                    <a href="#">Updates</a>
                  </li>
                </ul>
              </div>
              <div className="footer-links-column">
                <h4 className="footer-links-title">Resources</h4>
                <ul className="footer-links">
                  <li>
                    <a href="#">Help Center</a>
                  </li>
                  <li>
                    <a href="#">Blog</a>
                  </li>
                  <li>
                    <a href="#">Tutorials</a>
                  </li>
                  <li>
                    <a href="#">FAQs</a>
                  </li>
                </ul>
              </div>
              <div className="footer-links-column">
                <h4 className="footer-links-title">Company</h4>
                <ul className="footer-links">
                  <li>
                    <a href="#">About Us</a>
                  </li>
                  <li>
                    <a href="#">Careers</a>
                  </li>
                  <li>
                    <a href="#">Contact</a>
                  </li>
                  <li>
                    <a href="#">Press</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">
              2024 DailyBloom. All rights reserved. Made with{" "}
              <HiOutlineHeart className="heart-icon" /> by Shubhi
            </p>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
