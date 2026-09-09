import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';

import StudentProfile from './pages/StudentProfile';
import FacultyProfile from './pages/FacultyProfile';

import ResearchRecommendations from './pages/ResearchRecommendations';
import FacultyRecommendations from './pages/FacultyRecommendations';
import ProjectManagement from './pages/ProjectManagement';
import ProjectDetails from './pages/ProjectDetails';

import GroupsPage from './pages/GroupsPage';
import GroupChat from './pages/GroupChat';
import MessagesPage from './pages/MessagesPage';
import AIResearchAssistant from './pages/AIResearchAssistant';

// Role-aware Dashboard Dispatcher
const DashboardDispatcher = () => {
  const { user } = useAuth();
  if (user?.role === 'FACULTY') {
    return <FacultyDashboard />;
  } else if (user?.role === 'ADMIN') {
    return <AdminDashboard />;
  }
  return <StudentDashboard />;
};

// Role-aware Profile Dispatcher
const ProfileDispatcher = () => {
  const { user } = useAuth();
  if (user?.role === 'FACULTY') {
    return <FacultyProfile />;
  }
  return <StudentProfile />;
};

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="app-container flex-fill">
        {user && <Sidebar />}
        <main className="main-content flex-fill">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Core Routes */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardDispatcher /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfileDispatcher /></PrivateRoute>} />

            {/* Recommendations */}
            <Route path="/recommendations/topics" element={<PrivateRoute><ResearchRecommendations /></PrivateRoute>} />
            <Route path="/recommendations/faculty" element={<PrivateRoute><FacultyRecommendations /></PrivateRoute>} />

            {/* Projects */}
            <Route path="/projects" element={<PrivateRoute><ProjectManagement /></PrivateRoute>} />
            <Route path="/projects/:id" element={<PrivateRoute><ProjectDetails /></PrivateRoute>} />

            {/* Groups */}
            <Route path="/groups" element={<PrivateRoute><GroupsPage /></PrivateRoute>} />
            <Route path="/groups/:id/chat" element={<PrivateRoute><GroupChat /></PrivateRoute>} />

            {/* Messages */}
            <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />

            {/* Research Assistant */}
            <Route path="/ai-assistant" element={<PrivateRoute><AIResearchAssistant /></PrivateRoute>} />

            {/* Admin Panel */}
            <Route path="/admin" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminDashboard /></PrivateRoute>} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;
