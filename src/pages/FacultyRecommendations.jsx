import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MatchScoreBadge from '../components/MatchScoreBadge';
import { UserCheck, Sparkles, Send, Clock, Building, MessageSquare, CheckCircle } from 'lucide-react';

const FacultyRecommendations = () => {
  const { user } = useAuth();
  const [interestsText, setInterestsText] = useState(user?.profile?.interests || 'NLP, chatbot, sentiment analysis, predictive analytics');
  const [facultyMatches, setFacultyMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  // Advisor Request Modal State
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const fetchFacultyMatches = async (queryText = interestsText) => {
    setLoading(true);
    try {
      const res = await api.post('/recommendations/faculty', { interests: queryText });
      setFacultyMatches(res.data.recommendations);
    } catch (err) {
      console.error('Error fetching faculty recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyMatches(interestsText);
  }, []);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedFaculty) return;
    setSending(true);
    try {
      await api.post('/faculty/advisor-requests', {
        faculty_id: selectedFaculty.user_id,
        message: requestMessage
      });
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        setSelectedFaculty(null);
        setRequestMessage('');
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending request');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="glass-card p-4 mb-4 text-white" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #4f46e5 100%)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="p-3 bg-white bg-opacity-20 rounded-circle text-white">
            <UserCheck size={32} />
          </div>
          <div>
            <h3 className="fw-bold mb-0 text-white">Faculty Advisor Matching</h3>
            <p className="mb-0 text-white-50 small">
              Comparing student interests against faculty research expertise
            </p>
          </div>
        </div>
      </div>

      {/* Query Bar */}
      <div className="glass-card p-4 mb-4">
        <label className="form-label fw-semibold small text-muted">Filter Student Interests Vector:</label>
        <div className="input-group">
          <input 
            type="text" 
            className="form-control"
            value={interestsText}
            onChange={(e) => setInterestsText(e.target.value)}
          />
          <button 
            className="btn btn-primary-gradient px-4"
            onClick={() => fetchFacultyMatches(interestsText)}
          >
            <Sparkles size={16} className="me-1" /> Re-Calculate Faculty Matches
          </button>
        </div>
      </div>

      {/* Faculty Cards Feed */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status"></div>
          <p className="mt-2 text-muted small">Computing similarity vectors against faculty profiles...</p>
        </div>
      ) : (
        <div className="row g-4">
          {facultyMatches.length > 0 ? (
            facultyMatches.map((fac, i) => (
              <div key={i} className="col-md-6 col-lg-4">
                <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="fw-bold mb-0 text-dark">{fac.full_name}</h5>
                        <small className="text-muted"><Building size={14} className="me-1" />{fac.department}</small>
                      </div>
                      <MatchScoreBadge score={fac.match_score} />
                    </div>

                    <div className="badge bg-purple text-white mb-3" style={{ backgroundColor: '#8b5cf6' }}>
                      {fac.designation || 'Faculty Member'}
                    </div>

                    <div className="mb-3">
                      <small className="text-muted d-block fw-semibold" style={{ fontSize: '0.75rem' }}>EXPERTISE AREAS:</small>
                      <p className="small fw-semibold text-dark mb-0">{fac.expertise}</p>
                    </div>

                    {fac.interests && (
                      <div className="mb-3">
                        <small className="text-muted d-block fw-semibold" style={{ fontSize: '0.75rem' }}>RESEARCH INTERESTS:</small>
                        <p className="small text-muted mb-0">{fac.interests}</p>
                      </div>
                    )}

                    {fac.office_hours && (
                      <div className="mb-3">
                        <small className="text-muted d-block fw-semibold" style={{ fontSize: '0.75rem' }}>OFFICE HOURS:</small>
                        <small className="text-dark"><Clock size={12} className="me-1" />{fac.office_hours}</small>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-top mt-3">
                    <button 
                      className="btn btn-sm btn-outline-primary w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-1"
                      onClick={() => { setSelectedFaculty(fac); setRequestMessage(`Dear ${fac.full_name},\n\nI am interested in your research in ${fac.expertise}. I would like to request you to serve as my research advisor.`); }}
                    >
                      <Send size={14} /> Send Advisor Request
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5 text-muted">
              <p>No faculty matches found.</p>
            </div>
          )}
        </div>
      )}

      {/* Advisor Request Modal */}
      {selectedFaculty && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="gradient-header p-3 text-white rounded-top-4 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold mb-0">Request Advisor: {selectedFaculty.full_name}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedFaculty(null)}></button>
              </div>
              <div className="modal-body p-4">
                {sentSuccess ? (
                  <div className="alert alert-success text-center py-4 mb-0">
                    <CheckCircle size={36} className="text-success mb-2" />
                    <h6>Advisor Request Sent Successfully!</h6>
                    <small>Faculty member will receive your proposal in their queue.</small>
                  </div>
                ) : (
                  <form onSubmit={handleSendRequest}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">Proposal Message to Advisor</label>
                      <textarea 
                        className="form-control" 
                        rows="4"
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        required
                      ></textarea>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <button type="button" className="btn btn-light" onClick={() => setSelectedFaculty(null)}>Cancel</button>
                      <button type="submit" className="btn btn-primary-gradient px-4" disabled={sending}>
                        {sending ? <span className="spinner-border spinner-border-sm me-1" /> : <Send size={14} className="me-1" />}
                        Send Advisor Request
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyRecommendations;
