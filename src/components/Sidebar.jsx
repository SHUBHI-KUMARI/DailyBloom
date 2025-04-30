import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaHome, FaBook, FaCheckSquare, FaSmile, FaCalendarAlt, FaBars, FaTimes } from 'react-icons/fa';
import { FiLogOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import '../styles/Sidebar.css';

export default function Sidebar() {
    const { currentUser, logout } = useAuth();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth < 1024 && window.innerWidth >= 768) {
                setCollapsed(true);
            } else if (window.innerWidth >= 1024) {
                setCollapsed(false);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const closeMobileSidebar = () => {
        if (windowWidth < 768) {
            setMobileOpen(false);
        }
    };

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    const toggleMobileSidebar = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const getUserInitials = () => {
        if (currentUser?.displayName) {
            return currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        return currentUser?.email?.substring(0, 2).toUpperCase() || 'DU';
    };

    const sidebarClass = `sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`;

    return (
        <>
            <button className="mobile-menu-button" onClick={toggleMobileSidebar}>
                {mobileOpen ? <FaTimes /> : <FaBars />}
            </button>

            <aside className={sidebarClass}>
                <div className="sidebar-header">
                    <div className="logo-container">
                        <span className="logo">🌱</span>
                        <span className="logo-text">DailyBloom</span>
                    </div>
                    <button className="collapse-btn" onClick={toggleSidebar}>
                        {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
                    </button>
                </div>

                <div className="user-profile">
                    {currentUser?.photoURL ? (
                        <img src={currentUser.photoURL} alt="Profile" className="profile-pic" />
                    ) : (
                        <div className="profile-pic" style={{ background: 'var(--primary-600)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
                            {getUserInitials()}
                        </div>
                    )}
                    <div className="user-info">
                        <p className="user-name">{currentUser?.displayName || 'User'}</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link
                        to="/dashboard"
                        className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                        onClick={closeMobileSidebar}
                    >
                        <span className="nav-icon"><FaHome /></span>
                        <span className="nav-text">Dashboard</span>
                    </Link>
                    <Link
                        to="/journal"
                        className={`nav-link ${location.pathname === '/journal' ? 'active' : ''}`}
                        onClick={closeMobileSidebar}
                    >
                        <span className="nav-icon"><FaBook /></span>
                        <span className="nav-text">Journal</span>
                    </Link>
                    <Link
                        to="/habits"
                        className={`nav-link ${location.pathname === '/habits' ? 'active' : ''}`}
                        onClick={closeMobileSidebar}
                    >
                        <span className="nav-icon"><FaCheckSquare /></span>
                        <span className="nav-text">Habits</span>
                    </Link>
                    <Link
                        to="/mood"
                        className={`nav-link ${location.pathname === '/mood' ? 'active' : ''}`}
                        onClick={closeMobileSidebar}
                    >
                        <span className="nav-icon"><FaSmile /></span>
                        <span className="nav-text">Mood</span>
                    </Link>
                    <Link
                        to="/calendar"
                        className={`nav-link ${location.pathname === '/calendar' ? 'active' : ''}`}
                        onClick={closeMobileSidebar}
                    >
                        <span className="nav-icon"><FaCalendarAlt /></span>
                        <span className="nav-text">Calendar</span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <span className="logout-icon"><FiLogOut /></span>
                        <span className="logout-text">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
