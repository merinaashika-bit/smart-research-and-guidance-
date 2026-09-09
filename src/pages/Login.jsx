import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, BookOpen, AlertCircle, KeyRound, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== selectedRole && user.role !== 'ADMIN') {
        logout();
        throw new Error(`This account is registered as ${user.role === 'FACULTY' ? 'faculty' : 'student'}. Choose the matching login.`);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="gradient-header p-4 text-center">
          <div className="p-3 rounded-circle bg-white bg-opacity-20 d-inline-block mb-2">
            <BookOpen size={32} className="text-white" />
          </div>
          <h4 className="fw-bold mb-1">Welcome Back</h4>
          <p className="small text-white-50 mb-0">Sign in to Smart Research Platform</p>
        </div>

        <div className="card-body p-4">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 small p-2">
              <AlertCircle size={16} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Sign in as</label>
              <div className="role-switcher mb-3" role="group" aria-label="Choose account type">
                <button type="button" className={`role-option ${selectedRole === 'STUDENT' ? 'active' : ''}`} onClick={() => setSelectedRole('STUDENT')}>
                  Student
                </button>
                <button type="button" className={`role-option ${selectedRole === 'FACULTY' ? 'active' : ''}`} onClick={() => setSelectedRole('FACULTY')}>
                  Faculty
                </button>
              </div>
              <label className="form-label small fw-semibold text-muted">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><Mail size={16} className="text-muted" /></span>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-muted">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><KeyRound size={16} className="text-muted" /></span>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary-gradient w-100 py-2.5 mb-3 rounded-3" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <LogIn size={16} className="me-2" />}
              Sign In
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="small text-muted">Don't have an account? </span>
            <Link to="/register" className="small fw-bold text-primary text-decoration-none">Register Here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
