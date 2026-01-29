import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineClipboardCheck,
  HiOutlineHeart,
  HiOutlineCalendar,
  HiOutlineLogout,
  HiOutlineMenuAlt2,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import { RiLeafLine } from "react-icons/ri";
import "../styles/Sidebar.css";

const navItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: HiOutlineHome,
  },
  {
    path: "/journal",
    label: "Journal",
    icon: HiOutlineBookOpen,
  },
  {
    path: "/habits",
    label: "Habits",
    icon: HiOutlineClipboardCheck,
  },
  {
    path: "/mood",
    label: "Mood",
    icon: HiOutlineHeart,
  },
  {
    path: "/calendar",
    label: "Calendar",
    icon: HiOutlineCalendar,
  },
];

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      // Auto-collapse on tablet
      if (width < 1024 && width >= 768) {
        setCollapsed(true);
      } else if (width >= 1024) {
        setCollapsed(false);
      }

      // Close mobile sidebar on resize to desktop
      if (width >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile sidebar when clicking on a link
  const handleNavClick = () => {
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
    if (currentUser?.name) {
      return currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return currentUser?.email?.substring(0, 2).toUpperCase() || "U";
  };

  const getUserDisplayName = () => {
    if (currentUser?.name) {
      return currentUser.name;
    }
    if (currentUser?.email) {
      return currentUser.email.split("@")[0];
    }
    return "User";
  };

  const sidebarClass = `sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`;

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-button"
        onClick={toggleMobileSidebar}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? <HiOutlineX /> : <HiOutlineMenuAlt2 />}
      </button>

      <aside className={sidebarClass}>
        {/* Header */}
        <div className="sidebar-header">
          <Link to="/dashboard" className="logo-container">
            <RiLeafLine className="logo-icon" />
            <span className="logo-text">DailyBloom</span>
          </Link>
          <button
            className="collapse-btn"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
          </button>
        </div>

        {/* User Profile */}
        <div className="user-profile">
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt="Profile"
              className="profile-pic"
            />
          ) : (
            <div className="profile-pic profile-initials">
              {getUserInitials()}
            </div>
          )}
          <div className="user-info">
            <p className="user-name">{getUserDisplayName()}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link${isActive ? " active" : ""}`}
                onClick={handleNavClick}
                data-tooltip={item.label}
              >
                <span className="nav-icon">
                  <Icon />
                </span>
                <span className="nav-text">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={handleLogout}
            data-tooltip="Logout"
          >
            <span className="logout-icon">
              <HiOutlineLogout />
            </span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
