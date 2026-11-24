'use client';

import { Menu, ChevronDown, Bell } from 'lucide-react';
import './Topbar.css';

export default function Topbar() {
  const toggleMobileSidebar = () => {
    document.querySelector('.sidebar')?.classList.toggle('mobile-open');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={toggleMobileSidebar}>
          <Menu size={24} />
        </button>
        <div>
          <h2 className="page-title">Dashboard</h2>
          <div className="page-subtitle">Welcome back 👋</div>
        </div>
      </div>

      <div className="topbar-right">
        <button className="btn btn-primary btn-sm practice-btn">Practice Now →</button>
        
        <button className="notification-btn">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>

        <div className="user-dropdown-trigger">
          <div className="avatar-placeholder">U</div>
          <div className="user-info">
            <span className="user-name">User</span>
          </div>
          <ChevronDown size={16} className="dropdown-icon" />
        </div>
      </div>
    </header>
  );
}
