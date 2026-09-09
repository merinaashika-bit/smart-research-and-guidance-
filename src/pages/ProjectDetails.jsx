import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FolderKanban, UserCheck, Users, Send, CheckCircle2, 
  MessageSquare, PlusCircle, AlertCircle, Clock, ShieldCheck 
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submit to Faculty Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Add Team Member Modal
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  // Faculty Review Form State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [reviewComments, setReviewComments] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.project);

      const facultyRes = await api.get('/faculty');
      setFacultyList(facultyRes.data.faculty);
    } catch (err) {
      console.error('Error loading project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleSubmitToFaculty = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/projects/${id}/submit`, { faculty_id: selectedFacultyId });
      setShowSubmitModal(false);
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting project to faculty');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      setShowMemberModal(false);
      setMemberEmail('');
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding team member');
    } finally {
      setAddingMember(false);
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post(`/projects/${id}/reviews`, {
        status: reviewStatus,
        comments: reviewComments
      });
      setShowReviewModal(false);
      setReviewComments('');
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting faculty review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await api.put(`/projects/${id}`, { status: newStatus });
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;
  }

  if (!project) {
    return <div className="text-center py-5 text-muted">Project not found.</div>;
  }

  const isOwner = user?.id === project.student_id;
  const isAssignedFaculty = user?.id === project.faculty_id || user?.role === 'FACULTY';
  const pipelineStatuses = ['IDEA', 'PROPOSED', 'UNDER_REVIEW', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'];

  return (
    <div className="container-fluid py-4">
      {/* Header Banner */}
      <div className="glass-card p-4 mb-4 gradient-bg text-white border-0">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <span className="badge bg-light text-dark mb-2">{project.domain}</span>
            <h3 className="fw-bold mb-1 text-white">{project.title}</h3>
            <p className="mb-0 text-white-50 small">
              Created by: <strong>{project.student_name}</strong> • Faculty Advisor: <strong>{project.faculty_name || 'Unassigned'}</strong>
            </p>
          </div>

          <div className="d-flex gap-2">
            {isOwner && project.status === 'IDEA' && (
              <button className="btn btn-light rounded-pill px-3 fw-semibold" onClick={() => setShowSubmitModal(true)}>
                <Send size={16} className="me-1" /> Submit to Faculty
              </button>
            )}

            {isAssignedFaculty && (
              <button className="btn btn-warning rounded-pill px-3 fw-semibold text-dark" onClick={() => setShowReviewModal(true)}>
                <ShieldCheck size={16} className="me-1" /> Submit Faculty Review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Pipeline Tracker */}
      <div className="glass-card p-4 mb-4">
        <h6 className="fw-bold mb-3 text-muted text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
          PROJECT STATUS PIPELINE
        </h6>
        <div className="d-flex align-items-center justify-content-between overflow-auto py-2">
          {pipelineStatuses.map((st, idx) => {
            const isCurrent = project.status === st;
            const isPassed = pipelineStatuses.indexOf(project.status) > idx;

            return (
              <div key={st} className="d-flex align-items-center flex-fill text-center px-1">
                <div className={`p-2 rounded-circle border flex-shrink-0 ${isCurrent ? 'bg-primary text-white shadow' : isPassed ? 'bg-success text-white' : 'bg-light text-muted'}`} style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                  {isPassed ? '✓' : idx + 1}
                </div>
                <div className="ms-2 text-start d-none d-md-block">
                  <small className={`d-block fw-bold ${isCurrent ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                    {st.replace('_', ' ')}
                  </small>
                </div>
                {idx < pipelineStatuses.length - 1 && (
                  <div className={`flex-fill mx-2 border-top ${isPassed ? 'border-success border-2' : 'border-secondary opacity-25'}`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="row g-4">
        {/* Main Details */}
        <div className="col-lg-8">
          <div className="glass-card p-4 mb-4">
            <h5 className="fw-bold mb-3">Project Description</h5>
            <p className="text-dark mb-4" style={{ lineHeight: '1.6' }}>{project.description}</p>

            {project.abstract && (
              <>
                <h6 className="fw-bold mb-2">Abstract</h6>
                <p className="small text-muted bg-light p-3 rounded mb-4">{project.abstract}</p>
              </>
            )}

            {project.technologies && (
              <div className="mb-3">
                <h6 className="fw-bold mb-2">Technologies & Libraries</h6>
                <div className="d-flex flex-wrap gap-2">
                  {project.technologies.split(',').map((tech, i) => (
                    <span key={i} className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 px-3 py-1.5 rounded-pill">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Faculty Reviews Timeline */}
          <div className="glass-card p-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <ShieldCheck size={20} className="text-primary" /> Faculty Review & Feedback Timeline
            </h5>

            {project.reviews && project.reviews.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {project.reviews.map((rev) => (
                  <div key={rev.id} className="p-3 border rounded-3 bg-white">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold text-dark">{rev.faculty_name}</span>
                      <span className={`badge badge-status status-${rev.status}`}>{rev.status}</span>
                    </div>
                    <p className="small text-dark mb-2 bg-light p-2.5 rounded">{rev.comments}</p>
                    <small className="text-muted text-end d-block" style={{ fontSize: '0.75rem' }}>
                      {new Date(rev.created_at).toLocaleString()}
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small mb-0">No faculty reviews submitted yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar info & team members */}
        <div className="col-lg-4">
          <div className="glass-card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <Users size={18} className="text-info" /> Team Members
              </h5>
              {isOwner && (
                <button className="btn btn-sm btn-outline-primary rounded-pill py-1 px-2.5" onClick={() => setShowMemberModal(true)}>
                  <PlusCircle size={14} className="me-1" /> Add
                </button>
              )}
            </div>

            <div className="d-flex flex-column gap-2 mb-3">
              <div className="p-2 border rounded bg-light d-flex justify-content-between align-items-center">
                <span className="fw-bold small">{project.student_name}</span>
                <span className="badge bg-primary">Project Lead</span>
              </div>

              {project.members && project.members.map((m) => (
                <div key={m.id} className="p-2 border rounded bg-white d-flex justify-content-between align-items-center">
                  <span className="small">{m.name}</span>
                  <span className="badge bg-secondary">{m.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <h5 className="fw-bold mb-3">Quick Actions</h5>
            {isOwner && project.faculty_id && (
              <Link to={`/messages?user=${project.faculty_id}`} className="btn btn-outline-purple w-100 mb-2 py-2 d-flex align-items-center justify-content-center gap-2" style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}>
                <MessageSquare size={16} /> Message Faculty Advisor
              </Link>
            )}
            <Link to="/projects" className="btn btn-light border w-100 py-2">
              Back to Projects List
            </Link>
          </div>
        </div>
      </div>

      {/* Submit to Faculty Modal */}
      {showSubmitModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="gradient-header p-3 text-white rounded-top-4 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold mb-0">Submit Project to Faculty Advisor</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowSubmitModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSubmitToFaculty}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Select Faculty Advisor</label>
                    <select className="form-select" value={selectedFacultyId} onChange={(e) => setSelectedFacultyId(e.target.value)} required>
                      <option value="">-- Choose Faculty --</option>
                      {facultyList.map((f) => (
                        <option key={f.user_id} value={f.user_id}>{f.full_name} ({f.department})</option>
                      ))}
                    </select>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-light" onClick={() => setShowSubmitModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary-gradient px-4" disabled={submitting}>
                      {submitting ? <span className="spinner-border spinner-border-sm me-1" /> : <Send size={14} className="me-1" />}
                      Submit Project
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="gradient-header p-3 text-white rounded-top-4 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold mb-0">Add Student Collaborator</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowMemberModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleAddMember}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Student Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="alice@university.edu"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-light" onClick={() => setShowMemberModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary-gradient px-4" disabled={addingMember}>
                      Add Member
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Faculty Review Modal */}
      {showReviewModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="gradient-header p-3 text-white rounded-top-4 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold mb-0">Submit Faculty Project Review</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowReviewModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handlePostReview}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Review Decision</label>
                    <select className="form-select" value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)}>
                      <option value="APPROVED">APPROVE PROJECT (Move to Approved)</option>
                      <option value="REVISION_REQUESTED">REQUEST REVISIONS (Return to Proposed)</option>
                      <option value="REJECTED">REJECT PROPOSAL</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Comments & Feedback Suggestions</label>
                    <textarea 
                      className="form-control" 
                      rows="4"
                      placeholder="Provide academic advice, methodology suggestions, or improvement areas..."
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-light" onClick={() => setShowReviewModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary-gradient px-4" disabled={submittingReview}>
                      Submit Faculty Review
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
