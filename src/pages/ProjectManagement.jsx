import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, PlusCircle, Layers, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

const ProjectManagement = () => {
  const { user } = useAuth();
  const location = useLocation();
  const prefilledTopic = location.state || {};

  const [projects, setProjects] = useState([]);
  const [acceptedAdvisors, setAcceptedAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(Boolean(prefilledTopic.topicTitle));

  // Form State
  const [title, setTitle] = useState(prefilledTopic.topicTitle || '');
  const [domain, setDomain] = useState(prefilledTopic.domain || 'Artificial Intelligence');
  const [abstract, setAbstract] = useState('');
  const [description, setDescription] = useState(prefilledTopic.description || '');
  const [keywords, setKeywords] = useState(prefilledTopic.keywords || '');
  const [technologies, setTechnologies] = useState(prefilledTopic.required_skills || '');
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchProjectsAndAdvisors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);

      if (user?.role === 'STUDENT') {
        const advRes = await api.get('/faculty/accepted-advisors');
        setAcceptedAdvisors(advRes.data.accepted_advisors);
      }
    } catch (err) {
      console.error('Error fetching projects and advisors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndAdvisors();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    setFormError('');

    try {
      await api.post('/projects', {
        title,
        domain,
        abstract,
        description,
        keywords,
        technologies,
        faculty_id: selectedFacultyId || None
      });
      setShowCreateModal(false);
      setTitle('');
      setAbstract('');
      setDescription('');
      setKeywords('');
      setTechnologies('');
      setSelectedFacultyId('');
      fetchProjectsAndAdvisors();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error creating project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="glass-card p-4 mb-4 text-white" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-3 bg-white bg-opacity-20 rounded-circle text-white">
              <FolderKanban size={32} />
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-white">Research Project Management</h3>
              <p className="mb-0 text-white-50 small">Track project proposals, submit to accepted faculty advisors, and review feedback</p>
            </div>
          </div>

          {(user?.role === 'STUDENT' || user?.role === 'ADMIN') && (
            <button className="btn btn-light rounded-pill px-4 font-semibold" onClick={() => setShowCreateModal(true)}>
              <PlusCircle size={18} className="me-1" /> Create Research Project
            </button>
          )}
        </div>
      </div>

      {/* Projects Feed */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-warning" /></div>
      ) : (
        <div className="row g-4">
          {projects.length > 0 ? (
            projects.map((p) => (
              <div key={p.id} className="col-md-6 col-lg-4">
                <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between hover-shadow transition">
                  <div>
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <span className="badge bg-light text-dark border"><Layers size={12} className="me-1" />{p.domain}</span>
                      <span className={`badge badge-status status-${p.status}`}>{p.status}</span>
                    </div>

                    <h5 className="fw-bold mb-2 text-dark">{p.title}</h5>
                    <p className="small text-muted mb-3 text-truncate-3" style={{ fontSize: '0.875rem' }}>
                      {p.description}
                    </p>

                    <div className="mb-2">
                      <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>STUDENT CREATOR:</small>
                      <small className="fw-semibold text-dark">{p.student_name}</small>
                    </div>

                    <div className="mb-3">
                      <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>ACCEPTED FACULTY ADVISOR:</small>
                      <small className="fw-semibold text-primary">{p.faculty_name || 'Unassigned (Select Accepted Advisor)'}</small>
                    </div>
                  </div>

                  <div className="pt-3 border-top mt-3">
                    <Link to={`/projects/${p.id}`} className="btn btn-sm btn-outline-secondary w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-1">
                      Open Project Dashboard <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5 text-muted">
              <FolderKanban size={40} className="opacity-50 mb-2" />
              <p className="mb-2">No research projects created yet.</p>
              <button className="btn btn-sm btn-warning rounded-pill px-3" onClick={() => setShowCreateModal(true)}>
                Create First Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="gradient-header p-3 text-white rounded-top-4 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold mb-0">Create New Research Project</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                {formError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                    <AlertCircle size={18} />
                    <div>{formError}</div>
                  </div>
                )}

                <form onSubmit={handleCreateProject}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-semibold text-muted">Project Title</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. NLP-Driven Sentiment Classifier for Student Feedback"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-muted">Research Domain</label>
                      <select className="form-select" value={domain} onChange={(e) => setDomain(e.target.value)}>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="Natural Language Processing">Natural Language Processing</option>
                        <option value="Predictive Analytics">Predictive Analytics</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="Computer Vision">Computer Vision</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Internet of Things">Internet of Things</option>
                        <option value="Cloud Computing">Cloud Computing</option>
                        <option value="Software Engineering">Software Engineering</option>
                      </select>
                    </div>
                  </div>

                  {/* Accepted Advisor Selector Step */}
                  <div className="mb-3 p-3 bg-light rounded-3 border">
                    <label className="form-label small fw-bold text-dark d-flex align-items-center gap-1">
                      <UserCheck size={16} className="text-primary" /> Assign Accepted Faculty Advisor
                    </label>

                    {acceptedAdvisors.length > 0 ? (
                      <select className="form-select" value={selectedFacultyId} onChange={(e) => setSelectedFacultyId(e.target.value)}>
                        <option value="">-- Select Faculty Advisor (Optional now or assign later) --</option>
                        {acceptedAdvisors.map((fa) => (
                          <option key={fa.user_id} value={fa.user_id}>
                            ✓ {fa.full_name} ({fa.department}) - Advisor Request Accepted
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="alert alert-warning mb-0 py-2 small d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div>
                          <strong>No Accepted Faculty Advisor Yet:</strong> Send an Advisor Request to a faculty member first. Once they accept, you can assign them to your project!
                        </div>
                        <Link to="/recommendations/faculty" className="btn btn-sm btn-outline-dark rounded-pill px-3">
                          Find & Request Faculty
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Abstract Summary</label>
                    <textarea 
                      className="form-control" 
                      rows="2"
                      placeholder="Short abstract summary..."
                      value={abstract}
                      onChange={(e) => setAbstract(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Full Description & Research Goals</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      placeholder="Detailed research scope, methodology, datasets, and objectives..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Keywords</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="nlp, sentiment, bert"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Technologies & Libraries</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Python, PyTorch, React, Flask"
                        value={technologies}
                        onChange={(e) => setTechnologies(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary-gradient px-4" disabled={creating}>
                      {creating ? <span className="spinner-border spinner-border-sm me-1" /> : <PlusCircle size={16} className="me-1" />}
                      Create Project
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

export default ProjectManagement;
