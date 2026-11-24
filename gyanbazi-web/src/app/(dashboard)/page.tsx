'use client';

import { Target, TrendingUp, Zap, Calendar, Play } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      {/* Freemium Banner */}
      <div className="card card-padded premium-banner">
        <div>
          <h3>Unlock Unlimited Practice 🚀</h3>
          <p>Get access to all premium model sets, detailed analytics, and remove daily test limits.</p>
        </div>
        <div className="premium-actions">
          <div className="free-limit">2 Free Tests Left Today</div>
          <button className="btn btn-primary premium-btn">Go Premium</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">💎</div>
          <div className="stat-content">
            <div className="stat-label">Total Points</div>
            <div className="stat-value">0</div>
            <div className="stat-sub"><span style={{ color: 'var(--success)', fontWeight: 600 }}>+0 today</span></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-orange">🔥</div>
          <div className="stat-content">
            <div className="stat-label">Daily Streak</div>
            <div className="stat-value">0 Days</div>
            <div className="stat-sub">Keep it up!</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">📈</div>
          <div className="stat-content">
            <div className="stat-label">Avg. Score</div>
            <div className="stat-value">0%</div>
            <div className="stat-sub">Overall accuracy</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">🎯</div>
          <div className="stat-content">
            <div className="stat-label">Tests Taken</div>
            <div className="stat-value">0</div>
            <div className="stat-sub">Total mock tests</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        <div className="main-feed">
          <div className="card card-padded">
            <h3 style={{ marginBottom: '16px' }}>Daily Updates & Feeds</h3>
            <div className="feed-item">
              <h4>Welcome to the new Multi-Course Dashboard! 🎉</h4>
              <p>You can now enroll in multiple courses from the "Browse Courses" tab. Navigate to your enrolled courses using the sidebar.</p>
            </div>
            {/* Dynamic Feeds will go here */}
            <div className="skeleton" style={{ height: '120px', marginTop: '16px' }}></div>
          </div>
        </div>

        <div className="sidebar-widgets">
          {/* Daily Check-in */}
          <div className="card card-padded checkin-card">
            <span className="widget-icon">🎯</span>
            <strong>Daily Check-in</strong>
            <p>Check in daily to earn 50 points and maintain your streak!</p>
            <button className="btn btn-primary" style={{ width: '100%' }}>Claim 50 Points</button>
          </div>

          {/* Daily Live Exam */}
          <div className="card card-padded live-exam-card">
            <span className="widget-icon">⏱️</span>
            <strong>Daily Live Exam</strong>
            <p>Compete with others in the daily sprint.</p>
            <button className="btn" style={{ width: '100%', background: 'white', color: 'var(--primary)', fontWeight: 'bold' }}>
              Join Live Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
