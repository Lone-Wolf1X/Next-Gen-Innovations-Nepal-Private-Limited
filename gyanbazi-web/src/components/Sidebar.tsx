'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Compass, User, LogOut } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Browse Courses', path: '/courses', icon: Compass },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">NL</div>
        <div>
          <div className="sidebar-name">GyanBazi</div>
          <div className="sidebar-tagline">Exam Preparation</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Main Menu</div>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}

        <div className="sidebar-section-title">Enrolled Courses</div>
        {/* Placeholder for dynamic courses */}
        <div className="sidebar-link" style={{ opacity: 0.5, pointerEvents: 'none' }}>
          No courses enrolled yet
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={() => alert('Logout clicked')}>
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
