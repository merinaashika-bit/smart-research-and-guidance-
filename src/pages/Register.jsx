import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, BookOpen, AlertCircle, User, Mail, KeyRound, Building, GraduationCap, Sparkles } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('STUDENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [academicYear, setAcademicYear] = useState('Senior');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [interests, setInterests] = useState('');
  const [skills, setSkills] = useState('');
  const [expertise, setExpertise] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = {
      role,
      full_name: fullName,
      email,
      password,
      department,
      academic_year: academicYear,
      designation,
      interests,
      skills,
      expertise
    };

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '520px', width: '100%' }}>
        <div className="gradient-header p-4 text-center">
          <div className="p-3 rounded-circle bg-white bg-opacity-20 d-inline-block mb-2">
            <BookOpen size={32} className="text-white" />
          </div>
          <h4 className="fw-bold mb-1">Create Account</h4>
          <p className="small text-white-50 mb-0">Join the Smart Research Guidance Platform</p>
        </div>

        <div className="card-body p-4">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 small p-2">
              <AlertCircle size={16} />
              <div>{error}</div>
            </div>
          )}

          {/* Role Toggle Selector */}
          <div className="btn-group w-100 mb-4" role="group">
            <button
              type="button"
              className={`btn py-2 fw-semibold ${role === 'STUDENT' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setRole('STUDENT')}
            >
              <GraduationCap size={18} className="me-1" /> Student Role
            </button>
            <button
              type="button"
              className={`btn py-2 fw-semibold ${role === 'FACULTY' ? 'btn-purple text-white' : 'btn-outline-secondary'}`}
              style={{ backgroundColor: role === 'FACULTY' ? '#8b5cf6' : '' }}
              onClick={() => setRole('FACULTY')}
            >
              <Sparkles size={18} className="me-1" /> Faculty / Advisor
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Full Name</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><User size={16} className="text-muted" /></span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={role === 'STUDENT' ? "John Doe" : "Dr. Alan Turing"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><Mail size={16} className="text-muted" /></span>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="your.name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><KeyRound size={16} className="text-muted" /></span>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Department</label>
                <div className="input-group">
                  <span className="input-group-text bg-white"><Building size={16} className="text-muted" /></span>
                  <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">
                  {role === 'STUDENT' ? 'Academic Year' : 'Designation'}
                </label>
                {role === 'STUDENT' ? (
                  <select className="form-select" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate / Master">Graduate / Master</option>
                  </select>
                ) : (
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Associate Professor"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                  />
                )}
              </div>
            </div>

            {/* Dynamic Role Inputs */}
            {role === 'STUDENT' ? (
              <>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Research Interests</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. NLP, chatbots, sentiment analysis, predictive analytics"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-muted">Skills & Technologies</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Python, PyTorch, React, Flask, Scikit-learn"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">Areas of Expertise</label>
                <textarea 
                  className="form-control" 
                  rows="2"
                    placeholder="e.g. Natural Language Processing, Predictive Analytics, Conversational Systems"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                ></textarea>
              </div>
            )}

            <button type="submit" className="btn btn-primary-gradient w-100 py-2.5 mb-3 rounded-3" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <UserPlus size={16} className="me-2" />}
              Create Account
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="small text-muted">Already registered? </span>
            <Link to="/login" className="small fw-bold text-primary text-decoration-none">Sign In Here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
