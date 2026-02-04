import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "../styles/AppLayout.css";

export default function AppLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Listen for sidebar collapse changes (can be enhanced with context if needed)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setSidebarCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setSidebarCollapsed(false);
      }

      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const layoutClass = `app-layout${sidebarCollapsed ? " sidebar-collapsed" : ""}${mobileMenuOpen ? " mobile-menu-open" : ""}`;

  return (
    <div className={layoutClass}>
      <Sidebar
        onCollapseChange={setSidebarCollapsed}
        onMobileMenuChange={setMobileMenuOpen}
      />
      <main className="main-content">{children}</main>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
