import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UserCheck, Sparkles, Clock, Save, CheckCircle2 } from 'lucide-react';

const FacultyProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState('');
  const [interests, setInterests] = useState('');
  const [officeHours, setOfficeHours] = useState('');
  const [availableForAdvising, setAvailableForAdvising] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.profile) {
      setFullName(user.profile.full_name || '');
      setDepartment(user.profile.department || 'Computer Science');
      setDesignation(user.profile.designation || 'Associate Professor');
      setBio(user.profile.bio || '');
      setExpertise(user.profile.expertise || '');
      setInterests(user.profile.interests || '');
      setOfficeHours(user.profile.office_hours || '');
      setAvailableForAdvising(user.profile.available_for_advising !== false);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put('/faculty/profile', {
        full_name: fullName,
        department,
        designation,
        bio,
        expertise,
        interests,
        office_hours: officeHours,
        available_for_advising: availableForAdvising
      });
      updateUserProfile(res.data.profile);
      setMessage('Faculty profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating faculty profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '800px' }}>
      <div className="glass-card p-4 mb-4 text-white" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="p-3 bg-white bg-opacity-20 rounded-circle text-white">
            <UserCheck size={32} />
          </div>
          <div>
            <h3 className="fw-bold mb-0 text-white">Faculty Advisor Profile</h3>
            <p className="mb-0 text-white-50 small">Manage your research expertise and advising availability for student matching</p>
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
              <label className="form-label fw-semibold small text-muted">Designation</label>
              <input 
                type="text" 
                className="form-control" 
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
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
                <option value="Cybersecurity & Networks">Cybersecurity & Networks</option>
                <option value="Data Science & Analytics">Data Science & Analytics</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small text-muted d-flex align-items-center gap-1">
                <Clock size={16} /> Office Hours
              </label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Mon/Wed 2:00 PM - 4:00 PM"
                value={officeHours}
                onChange={(e) => setOfficeHours(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small text-primary d-flex align-items-center gap-1">
              <Sparkles size={16} /> Core Expertise Areas
            </label>
            <textarea 
              className="form-control border-primary border-opacity-50" 
              rows="3"
              placeholder="e.g. Natural Language Processing, Predictive Analytics, Conversational Agents, Deep Learning"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
            ></textarea>
            <small className="text-muted">Keywords and descriptions of your core academic domains.</small>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small text-muted">Detailed Research Interests</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Sentiment analysis, static code analysis, medical vision transformers"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold small text-muted">Faculty Bio</label>
            <textarea 
              className="form-control" 
              rows="3"
              placeholder="Short bio regarding lab publications and research focus..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            ></textarea>
          </div>

          <div className="form-check form-switch mb-4">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="advisingSwitch"
              checked={availableForAdvising}
              onChange={(e) => setAvailableForAdvising(e.target.checked)}
            />
            <label className="form-check-label fw-semibold small" htmlFor="advisingSwitch">
              Currently Available to Accept New Student Project Advising Requests
            </label>
          </div>

          <button type="submit" className="btn btn-primary-gradient px-4 py-2 rounded-3 d-flex align-items-center gap-2" disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm" /> : <Save size={18} />}
            Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default FacultyProfile;
