import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { user, organisation, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h2>HRMS</h2>
        <span>{organisation?.name}</span>
      </div>
      
      <div className="nav-links">
        <Link 
          to="/" 
          className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
        >
          Dashboard
        </Link>
        <Link 
          to="/employees" 
          className={location.pathname === '/employees' ? 'nav-link active' : 'nav-link'}
        >
          Employees
        </Link>
        <Link 
          to="/teams" 
          className={location.pathname === '/teams' ? 'nav-link active' : 'nav-link'}
        >
          Teams
        </Link>
        <Link 
          to="/logs" 
          className={location.pathname === '/logs' ? 'nav-link active' : 'nav-link'}
        >
          Audit Logs
        </Link>
      </div>

      <div className="nav-user">
        <span>Welcome, {user?.name}</span>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navigation;