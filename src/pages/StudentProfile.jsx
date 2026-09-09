import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Sparkles, Code, BookOpen, Save, CheckCircle2 } from 'lucide-react';

const StudentProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [skills, setSkills] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.profile) {
      setFullName(user.profile.full_name || '');
      setDepartment(user.profile.department || 'Computer Science');
      setAcademicYear(user.profile.academic_year || 'Senior');
      setBio(user.profile.bio || '');
      setInterests(user.profile.interests || '');
      setSkills(user.profile.skills || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put('/students/profile', {
        full_name: fullName,
        department,
        academic_year: academicYear,
        bio,
        interests,
        skills
      });
      updateUserProfile(res.data.profile);
      setMessage('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '800px' }}>
      <div className="glass-card p-4 mb-4 gradient-header text-white">
        <div className="d-flex align-items-center gap-3">
          <div className="p-3 bg-white bg-opacity-20 rounded-circle text-white">
            <User size={32} />
          </div>
          <div>
            <h3 className="fw-bold mb-0 text-white">Student Research Profile</h3>
            <p className="mb-0 text-white-50 small">Configure your academic interests and skills for your research workspace.</p>
          </div>
        </div>
      </div>

      {message && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
          <CheckCircle2 size={18} />
          <div>{message}</div>
        </div>
      )}

      <div className="glass-card p-4">
        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold small text-muted">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small text-muted">Email Address</label>
              <input 
                type="email" 
                className="form-control bg-light" 
                value={user?.email || ''} 
                disabled 
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold small text-muted">Department</label>
              <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="Computer Science">Computer Science</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Data Science">Data Science</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small text-muted">Academic Year</label>
              <select className="form-select" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Graduate / Master">Graduate / Master</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small text-primary d-flex align-items-center gap-1">
              <Sparkles size={16} /> Research Interests
            </label>
            <textarea 
              className="form-control border-primary border-opacity-50" 
              rows="3"
              placeholder="e.g., Natural Language Processing, sentiment analysis, conversational chatbots, text classification, BERT"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            ></textarea>
            <small className="text-muted">Describe your research topics and interest keywords.</small>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small text-muted d-flex align-items-center gap-1">
              <Code size={16} /> Technical Skills & Tools
            </label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Python, PyTorch, TensorFlow, React, Flask, Scikit-learn, OpenCV"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold small text-muted">Academic Bio / Summary</label>
            <textarea 
              className="form-control" 
              rows="3"
              placeholder="Brief overview of your academic background and career aspirations..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary-gradient px-4 py-2 rounded-3 d-flex align-items-center gap-2" disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm" /> : <Save size={18} />}
            Save Profile & Update Recommendations
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
