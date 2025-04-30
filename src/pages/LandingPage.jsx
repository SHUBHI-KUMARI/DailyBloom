import { useNavigate } from 'react-router-dom';
import { FaJournalWhills, FaCheckCircle, FaChartLine, FaCalendarAlt, FaSeedling } from 'react-icons/fa';
import { RiMentalHealthLine } from 'react-icons/ri';
import { BsLightningCharge } from 'react-icons/bs';
import { FiTwitter, FiFacebook, FiInstagram, FiLinkedin } from 'react-icons/fi';
import '../styles/LandingPage.css';

export default function LandingPage() {
    const navigate = useNavigate();

    const handleSignIn = () => {
        navigate('/login');
    };

    const handleSignUp = () => {
        navigate('/login');
    };

    return (
        <div className="landing-page">
            <header className="landing-header">
                <div className="landing-logo">
                    <span className="logo-icon"><FaSeedling /></span>
                    <h1>DailyBloom</h1>
                </div>

                <nav className="landing-nav">
                    <a href="#features" className="landing-nav-link">Features</a>
                    <a href="#testimonials" className="landing-nav-link">Testimonials</a>
                    <a href="#about" className="landing-nav-link">About</a>

                    <div className="auth-buttons">
                        <button className="sign-in-btn" onClick={handleSignIn}>Sign In</button>
                        <button className="sign-up-btn" onClick={handleSignUp}>Get Started</button>
                    </div>
                </nav>
            </header>

            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Bloom in Your Daily Journey</h1>
                    <p className="hero-subtitle">Track habits, journal your thoughts, and monitor your mood in one beautiful, intuitive app designed to help you grow every day.</p>
                    <button className="hero-cta" onClick={handleSignUp}>Start Your Journey</button>
                </div>

                <div className="hero-image">
                    <div className="placeholder-image">
                        <FaSeedling />
                        <p>DailyBloom Dashboard</p>
                    </div>
                </div>
            </section>

            <section className="features-section" id="features">
                <h2 className="section-title">Cultivate Meaningful Habits</h2>
                <p className="section-subtitle">DailyBloom combines journaling, habit tracking, and mood monitoring into one seamless experience.</p>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <FaJournalWhills />
                        </div>
                        <h3 className="feature-title">Thoughtful Journaling</h3>
                        <p className="feature-description">Capture your thoughts, ideas, and reflections with our beautiful rich text editor, helping you process emotions and celebrate victories.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <FaCheckCircle />
                        </div>
                        <h3 className="feature-title">Habit Tracking</h3>
                        <p className="feature-description">Build consistency with easy-to-use habit tracking. Watch your streaks grow as you develop positive routines that last.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <RiMentalHealthLine />
                        </div>
                        <h3 className="feature-title">Mood Monitoring</h3>
                        <p className="feature-description">Track your emotional wellbeing over time to identify patterns and gain insights into what affects your mental health.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <FaCalendarAlt />
                        </div>
                        <h3 className="feature-title">Visual Calendar</h3>
                        <p className="feature-description">See your journey at a glance with our comprehensive calendar view, connecting your habits, journals, and moods.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <FaChartLine />
                        </div>
                        <h3 className="feature-title">Progress Insights</h3>
                        <p className="feature-description">Gain valuable insights with beautiful visualizations that help you understand your patterns and progress.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <BsLightningCharge />
                        </div>
                        <h3 className="feature-title">Daily Streaks</h3>
                        <p className="feature-description">Stay motivated with streak counters that celebrate your consistency and help build lasting habits.</p>
                    </div>
                </div>
            </section>

            <section className="testimonials-section" id="testimonials">
                <h2 className="section-title">What Our Users Say</h2>
                <p className="section-subtitle">DailyBloom has helped thousands of people build better habits and find more joy in their daily lives.</p>

                <div className="testimonials-container">
                    <div className="testimonial-card">
                        <p className="testimonial-quote">"DailyBloom has completely transformed how I track my habits and journal my thoughts. The interface is beautiful and intuitive, making it a joy to use every day. I've never been so consistent with my habits!"</p>
                        <div className="testimonial-author">
                            <div className="author-avatar">SJ</div>
                            <div className="author-details">
                                <h4>Sarah Johnson</h4>
                                <p>Using DailyBloom for 8 months</p>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <p className="testimonial-quote">"As someone who's tried dozens of habit trackers and journaling apps, DailyBloom stands out for how seamlessly it combines both. The mood tracking feature has helped me identify patterns I never noticed before."</p>
                        <div className="testimonial-author">
                            <div className="author-avatar">MR</div>
                            <div className="author-details">
                                <h4>Michael Rodriguez</h4>
                                <p>Using DailyBloom for 6 months</p>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <p className="testimonial-quote">"I love how DailyBloom gives me a complete picture of my wellbeing. Being able to see how my habits, journaling, and mood all connect has been incredibly insightful. It's become an essential part of my daily routine."</p>
                        <div className="testimonial-author">
                            <div className="author-avatar">AP</div>
                            <div className="author-details">
                                <h4>Aisha Patel</h4>
                                <p>Using DailyBloom for 1 year</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="cta-box">
                    <h2 className="cta-title">Start Your Journey Today</h2>
                    <p className="cta-text">Join thousands of others who are transforming their lives one day at a time with DailyBloom.</p>
                    <button className="cta-button" onClick={handleSignUp}>Get Started for Free</button>
                </div>
            </section>

            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <span className="logo-icon"><FaSeedling /></span>
                            <h2>DailyBloom</h2>
                        </div>
                        <p className="footer-text">Cultivate meaningful habits and nurture your well-being with our all-in-one journaling and habit tracking app.</p>
                        <div className="footer-social">
                            <a href="#" className="social-icon"><FiTwitter /></a>
                            <a href="#" className="social-icon"><FiFacebook /></a>
                            <a href="#" className="social-icon"><FiInstagram /></a>
                            <a href="#" className="social-icon"><FiLinkedin /></a>
                        </div>
                    </div>

                    <div className="footer-links-column">
                        <h3 className="footer-links-title">Features</h3>
                        <ul className="footer-links">
                            <li className="footer-link"><a href="#">Journaling</a></li>
                            <li className="footer-link"><a href="#">Habit Tracking</a></li>
                            <li className="footer-link"><a href="#">Mood Monitoring</a></li>
                            <li className="footer-link"><a href="#">Calendar View</a></li>
                            <li className="footer-link"><a href="#">Data Insights</a></li>
                        </ul>
                    </div>

                    <div className="footer-links-column">
                        <h3 className="footer-links-title">Resources</h3>
                        <ul className="footer-links">
                            <li className="footer-link"><a href="#">Help Center</a></li>
                            <li className="footer-link"><a href="#">Blog</a></li>
                            <li className="footer-link"><a href="#">Tutorials</a></li>
                            <li className="footer-link"><a href="#">Contact Support</a></li>
                            <li className="footer-link"><a href="#">FAQs</a></li>
                        </ul>
                    </div>

                    <div className="footer-links-column">
                        <h3 className="footer-links-title">Company</h3>
                        <ul className="footer-links">
                            <li className="footer-link"><a href="#">About Us</a></li>
                            <li className="footer-link"><a href="#">Careers</a></li>
                            <li className="footer-link"><a href="#">Press Kit</a></li>
                            <li className="footer-link"><a href="#">Partners</a></li>
                            <li className="footer-link"><a href="#">Contact Us</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-copyright">
                        © {new Date().getFullYear()} DailyBloom. All rights reserved. Made with ❤️ by <a href="#">Shubhi</a>
                    </div>
                    <div className="footer-legal">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Cookie Policy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
