import { FaBars } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function MobileSidebarToggle({ targetId = 'journal-sidebar', className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    const sidebarElement = document.getElementById(targetId);
    if (sidebarElement) {
      if (isOpen) {
        sidebarElement.classList.remove('mobile-open');
      } else {
        sidebarElement.classList.add('mobile-open');
      }
      setIsOpen(!isOpen);
    }
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      const sidebarElement = document.getElementById(targetId);
      if (sidebarElement && !sidebarElement.contains(event.target) &&
        !event.target.classList.contains('mobile-toggle-btn')) {
        sidebarElement.classList.remove('mobile-open');
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, targetId]);

  // Close sidebar on route change
  useEffect(() => {
    const closeOnRouteChange = () => {
      const sidebarElement = document.getElementById(targetId);
      if (sidebarElement) {
        sidebarElement.classList.remove('mobile-open');
        setIsOpen(false);
      }
    };

    window.addEventListener('popstate', closeOnRouteChange);
    return () => {
      window.removeEventListener('popstate', closeOnRouteChange);
    };
  }, [targetId]);

  // Add common class + any custom classes
  const buttonClass = `mobile-toggle-btn ${className}`.trim();

  return (
    <button
      className={buttonClass}
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <FaBars />
    </button>
  );
}
