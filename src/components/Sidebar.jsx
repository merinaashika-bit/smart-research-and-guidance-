import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Sparkles, UserCheck, FolderKanban, 
  Users, MessageSquare, Bot, ShieldCheck, User 
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  return (
    <div className="bg-white border-end shadow-sm d-flex flex-column" style={{ width: '250px', minHeight: 'calc(100vh - 60px)' }}>
      <div className="p-3">
        <small className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
          Navigation
        </small>
        
        <ul className="nav nav-pills flex-column mt-2 gap-1">
          {/* Dashboard */}
          <li className="nav-item">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active gradient-bg text-white' : 'text-dark'}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
          </li>

          {/* Student Specific */}
          {role === 'STUDENT' && (
            <>
              <li className="nav-item">
                <NavLink to="/recommendations/topics" className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active gradient-bg text-white' : 'text-dark'}`}>
                  <Sparkles size={18} className="text-primary" />
                  <span>Topic Recommendations</span>
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink to="/recommendations/faculty" className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active gradient-bg text-white' : 'text-dark'}`}>
                  <UserCheck size={18} className="text-info" />
                  <span>Faculty Advisors</span>
                </NavLink>
              </li>
            </>
          )}

          {/* Common Projects */}
          <li className="nav-item">
            <NavLink to="/projects" className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active gradient-bg text-white' : 'text-dark'}`}>
              <FolderKanban size={18} className="text-warning" />
              <span>Research Projects</span>
            </NavLink>
          </li>

          {/* Student Groups */}
          <li className="nav-item">
            <NavLink to="/groups" className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active gradient-bg text-white' : 'text-dark'}`}>
              <Users size={18} className="text-success" />
              <span>Research Groups</span>
            </NavLink>
          </li>

          {/* Direct Messaging */}
          <li className="nav-item">
            <NavLink to="/messages" className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active gradient-bg text-white' : 'text-dark'}`}>
              <MessageSquare size={18} className="text-secondary" />
              <span>Direct Messages</span>
            </NavLink>
          </li>

          {/* Research Assistant */}
          <li className="nav-item">
            <NavLink to="/ai-assistant" className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active gradient-bg text-white' : 'text-dark'}`}>
              <Bot size={18} className="text-primary" />
              <span>Research Assistant</span>
            </NavLink>
          </li>

          {/* Admin Tools */}
          {role === 'ADMIN' && (
            <>
              <li className="nav-item mt-3">
                <small className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
                  Admin Tools
                </small>
              </li>
              <li className="nav-item">
                <NavLink to="/admin" className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active bg-danger text-white' : 'text-danger'}`}>
                  <ShieldCheck size={18} />
                  <span>Admin Panel</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>

      <div className="mt-auto p-3 border-top bg-light">
        <NavLink to="/profile" className="d-flex align-items-center gap-2 text-decoration-none text-dark">
          <div className="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
            <User size={16} />
          </div>
          <div className="overflow-hidden">
            <div className="fw-semibold text-truncate small">
              {user.profile?.full_name || user.email}
            </div>
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
              Edit Profile
            </div>
          </div>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
