import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Bot, LogOut, User as UserIcon, ShieldCheck, UserCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge bg-danger ms-2"><ShieldCheck size={12} className="me-1" />Admin</span>;
      case 'FACULTY':
        return <span className="badge bg-purple ms-2" style={{ backgroundColor: '#8b5cf6' }}><UserCheck size={12} className="me-1" />Faculty</span>;
      default:
        return <span className="badge bg-primary ms-2">Student</span>;
    }
  };

  const profileName = user?.profile?.full_name || user?.email || 'User';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark gradient-header sticky-top px-4 py-2 shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2 brand-font fs-5" to={user ? "/dashboard" : "/"}>
          <div className="p-2 rounded-3 bg-primary bg-gradient d-flex align-items-center justify-content-center text-white">
            <BookOpen size={20} />
          </div>
          <div>
            <span className="fw-bold">SMART RESEARCH</span>
            <small className="d-block text-white-50" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>PLATFORM</small>
          </div>
        </Link>

        {user && (
          <div className="d-flex align-items-center ms-auto gap-3">
            <Link to="/ai-assistant" className="btn btn-sm btn-outline-light d-flex align-items-center gap-1 rounded-pill px-3">
              <Bot size={16} className="text-warning" />
              <span className="d-none d-md-inline">Research Assistant</span>
            </Link>

            <div className="dropdown">
              <button 
                className="btn btn-sm btn-dark bg-opacity-50 border-white-50 text-white dropdown-toggle d-flex align-items-center gap-2 rounded-pill px-3"
                type="button" 
                data-bs-toggle="dropdown"
              >
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                  {profileName.charAt(0).toUpperCase()}
                </div>
                <span className="fw-semibold small text-truncate" style={{ maxWidth: '140px' }}>{profileName}</span>
                {getRoleBadge(user.role)}
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 mt-2">
                <li>
                  <Link className="dropdown-item d-flex align-items-center gap-2" to="/profile">
                    <UserIcon size={16} /> My Profile
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
