import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UserCheck, FolderKanban, Check, X, MessageSquare, Clock, AlertCircle } from 'lucide-react';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [advisorRequests, setAdvisorRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFacultyData = async () => {
    setLoading(true);
    try {
      const reqRes = await api.get('/faculty/advisor-requests');
      setAdvisorRequests(reqRes.data.requests);

      const projRes = await api.get('/projects');
      setProjects(projRes.data.projects);
    } catch (err) {
      console.error('Error fetching faculty dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const handleResponse = async (reqId, status) => {
    try {
      await api.put(`/faculty/advisor-requests/${reqId}`, { status });
      fetchFacultyData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating request status');
    }
  };

  const pendingRequests = advisorRequests.filter((r) => r.status === 'PENDING');
  const reviewProjects = projects.filter((p) => p.status === 'UNDER_REVIEW' || p.status === 'PROPOSED');

  return (
    <div className="container-fluid py-4">
      {/* Faculty Header */}
      <div className="glass-card p-4 mb-4 text-white" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h3 className="fw-bold mb-1 text-white">Faculty Dashboard</h3>
            <p className="mb-0 text-white-50 small">
              Welcome, {user?.profile?.full_name || 'Dr.'} ({user?.profile?.department || 'Faculty'})
            </p>
          </div>
          <Link to="/profile" className="btn btn-light btn-sm font-semibold rounded-pill px-3">
            Edit Expertise & Office Hours
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Pending Advisor Requests */}
          <div className="col-lg-6">
            <div className="glass-card p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <UserCheck size={20} className="text-info" /> Advisor Requests Queue
                </h5>
                <span className="badge bg-primary rounded-pill">{pendingRequests.length} Pending</span>
              </div>

              {pendingRequests.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="p-3 border rounded-3 bg-white">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="fw-bold mb-0">{req.student_name}</h6>
                          {req.project_title && (
                            <small className="text-primary d-block fw-semibold">Project: {req.project_title}</small>
                          )}
                        </div>
                        <span className="badge bg-warning text-dark"><Clock size={12} className="me-1" /> Pending</span>
                      </div>
                      
                      {req.message && (
                        <p className="small text-muted bg-light p-2 rounded mb-3" style={{ fontSize: '0.825rem' }}>
                          "{req.message}"
                        </p>
                      )}

                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm btn-success flex-fill d-flex align-items-center justify-content-center gap-1 py-1"
                          onClick={() => handleResponse(req.id, 'ACCEPTED')}
                        >
                          <Check size={14} /> Accept Request
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger flex-fill d-flex align-items-center justify-content-center gap-1 py-1"
                          onClick={() => handleResponse(req.id, 'REJECTED')}
                        >
                          <X size={14} /> Reject
                        </button>
                        <Link to={`/messages?user=${req.student_id}`} className="btn btn-sm btn-outline-secondary py-1 px-2.5">
                          <MessageSquare size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted small">
                  <Check size={32} className="text-success mb-2 opacity-50" />
                  <p className="mb-0">No pending advisor requests right now.</p>
                </div>
              )}
            </div>
          </div>

          {/* Student Projects Awaiting Review */}
          <div className="col-lg-6">
            <div className="glass-card p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <FolderKanban size={20} className="text-warning" /> Projects Submitted for Review
                </h5>
                <span className="badge bg-warning text-dark rounded-pill">{reviewProjects.length} Submitted</span>
              </div>

              {reviewProjects.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {reviewProjects.map((p) => (
                    <div key={p.id} className="p-3 border rounded-3 bg-white">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="fw-bold mb-0">{p.title}</h6>
                        <span className={`badge badge-status status-${p.status}`}>{p.status}</span>
                      </div>
                      <small className="text-muted d-block mb-2">Student: {p.student_name} • Domain: {p.domain}</small>
                      <p className="small text-muted mb-3 text-truncate">{p.description}</p>
                      
                      <Link to={`/projects/${p.id}`} className="btn btn-sm btn-primary-gradient w-100 py-1">
                        Review Project & Provide Feedback
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted small">
                  <FolderKanban size={32} className="text-muted mb-2 opacity-50" />
                  <p className="mb-0">No pending student projects waiting for review.</p>
                </div>
              )}
            </div>
          </div>

          {/* All Advised Student Projects List */}
          <div className="col-12">
            <div className="glass-card p-4">
              <h5 className="fw-bold mb-3">All Assigned / Advised Projects</h5>
              {projects.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Project Title</th>
                        <th>Student</th>
                        <th>Domain</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((p) => (
                        <tr key={p.id}>
                          <td className="fw-bold">{p.title}</td>
                          <td>{p.student_name}</td>
                          <td><span className="badge bg-light text-dark border">{p.domain}</span></td>
                          <td><span className={`badge badge-status status-${p.status}`}>{p.status}</span></td>
                          <td>
                            <Link to={`/projects/${p.id}`} className="btn btn-sm btn-outline-secondary py-1 px-2.5">
                              View Project
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted small mb-0">No projects currently assigned.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
