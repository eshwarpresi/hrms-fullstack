import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, organisation } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>HRMS Dashboard</h1>
        <p>Welcome to your Human Resource Management System</p>
      </header>
      
      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Hello, {user?.name}! 👋</h2>
          <p>You are managing <strong>{organisation?.name}</strong></p>
          
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <a href="/employees" className="action-btn primary">
                  Manage Employees
                </a>
                <a href="/teams" className="action-btn secondary">
                  Manage Teams
                </a>
                <a href="/logs" className="action-btn tertiary">
                  View Audit Logs
                </a>
              </div>
            </div>
            
            <div className="stat-card">
              <h3>System Status</h3>
              <div className="status-list">
                <div className="status-item">
                  <span className="status-indicator online"></span>
                  <span>Backend API</span>
                </div>
                <div className="status-item">
                  <span className="status-indicator online"></span>
                  <span>Database</span>
                </div>
                <div className="status-item">
                  <span className="status-indicator online"></span>
                  <span>Authentication</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;