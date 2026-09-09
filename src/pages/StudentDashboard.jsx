import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MatchScoreBadge from '../components/MatchScoreBadge';
import { Sparkles, UserCheck, FolderKanban, Bot, ArrowRight, PlusCircle, BookOpen, Layers } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [topicRecs, setTopicRecs] = useState([]);
  const [facultyRecs, setFacultyRecs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentInterests = user?.profile?.interests || 'Artificial Intelligence, Predictive Analytics, Data Science';

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Load topic recommendations
        const topicRes = await api.post('/recommendations/topics', { interests: studentInterests });
        setTopicRecs(topicRes.data.recommendations.slice(0, 3));

        // Load faculty recommendations
        const facultyRes = await api.post('/recommendations/faculty', { interests: studentInterests });
        setFacultyRecs(facultyRes.data.recommendations.slice(0, 3));

        // Fetch Projects
        const projectRes = await api.get('/projects');
        setProjects(projectRes.data.projects);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [studentInterests]);

  return (
    <div className="container-fluid py-4">
      {/* Welcome Banner */}
      <div className="glass-card p-4 mb-4 gradient-bg text-white border-0">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h3 className="fw-bold mb-1 text-white">Welcome back, {user?.profile?.full_name || 'Student'}!</h3>
            <p className="mb-0 text-white-50 small">
              <strong>Your Listed Interests:</strong> {studentInterests}
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/recommendations/topics" className="btn btn-light btn-sm font-semibold rounded-pill px-3 d-flex align-items-center gap-1">
              <Sparkles size={16} className="text-primary" /> Explore Topics
            </Link>
            <Link to="/ai-assistant" className="btn btn-warning btn-sm font-semibold rounded-pill px-3 d-flex align-items-center gap-1 text-dark">
              <Bot size={16} /> Research Assistant
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted small">Preparing your research workspace...</p>
        </div>
      ) : (
        <div className="row g-4">
          {/* Top topic recommendations preview */}
          <div className="col-lg-8">
            <div className="glass-card p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <Sparkles size={20} className="text-primary" /> Recommended Research Topics
                </h5>
                <Link to="/recommendations/topics" className="small text-primary text-decoration-none fw-bold d-flex align-items-center gap-1">
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              <div className="d-flex flex-column gap-3">
                {topicRecs.length > 0 ? (
                  topicRecs.map((topic, i) => (
                    <div key={i} className="p-3 border rounded-3 bg-white hover-shadow transition">
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <h6 className="fw-bold mb-0 text-dark">{topic.research_topic}</h6>
                        <MatchScoreBadge score={topic.match_score} />
                      </div>
                      <p className="small text-muted mb-2 text-truncate" style={{ maxWidth: '650px' }}>
                        {topic.description}
                      </p>
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <span className="badge bg-light text-dark border">
                          <Layers size={12} className="me-1" /> {topic.domain}
                        </span>
                        <Link 
                          to="/projects" 
                          state={{ topicTitle: topic.research_topic, domain: topic.domain, keywords: topic.keywords, description: topic.description }}
                          className="btn btn-sm btn-outline-primary py-1 px-2.5 rounded-pill"
                        >
                          <PlusCircle size={14} className="me-1" /> Start Project
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small">No topic recommendations found. Try updating your profile interests!</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Faculty Advisors Preview */}
          <div className="col-lg-4">
            <div className="glass-card p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <UserCheck size={20} className="text-info" /> Recommended Advisors
                </h5>
                <Link to="/recommendations/faculty" className="small text-primary text-decoration-none fw-bold d-flex align-items-center gap-1">
                  All <ArrowRight size={14} />
                </Link>
              </div>

              <div className="d-flex flex-column gap-3">
                {facultyRecs.length > 0 ? (
                  facultyRecs.map((fac, i) => (
                    <div key={i} className="p-3 border rounded-3 bg-white">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold small">{fac.full_name}</span>
                        <MatchScoreBadge score={fac.match_score} />
                      </div>
                      <small className="text-muted d-block mb-1">{fac.department} • {fac.designation}</small>
                      <small className="text-muted d-block text-truncate mb-2" style={{ fontSize: '0.75rem' }}>
                        <strong>Expertise:</strong> {fac.expertise}
                      </small>
                      <Link to="/recommendations/faculty" className="btn btn-sm btn-light border w-100 py-1" style={{ fontSize: '0.8rem' }}>
                        View Profile & Request
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small">No faculty matches found.</p>
                )}
              </div>
            </div>
          </div>

          {/* Active Student Projects */}
          <div className="col-12">
            <div className="glass-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <FolderKanban size={20} className="text-warning" /> My Research Projects
                </h5>
                <Link to="/projects" className="btn btn-sm btn-primary-gradient rounded-pill px-3">
                  <PlusCircle size={14} className="me-1" /> New Project
                </Link>
              </div>

              {projects.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Project Title</th>
                        <th>Domain</th>
                        <th>Status</th>
                        <th>Advisor</th>
                        <th>Updated</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((p) => (
                        <tr key={p.id}>
                          <td className="fw-bold">{p.title}</td>
                          <td><span className="badge bg-light text-dark border">{p.domain}</span></td>
                          <td><span className={`badge badge-status status-${p.status}`}>{p.status}</span></td>
                          <td className="small text-muted">{p.faculty_name || 'Unassigned'}</td>
                          <td className="small text-muted">{new Date(p.updated_at).toLocaleDateString()}</td>
                          <td>
                            <Link to={`/projects/${p.id}`} className="btn btn-sm btn-outline-secondary py-1 px-2.5">
                              Open Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <BookOpen size={36} className="text-muted mb-2 opacity-50" />
                  <p className="mb-2">You haven't created any research projects yet.</p>
                  <Link to="/projects" className="btn btn-sm btn-primary rounded-pill px-3">Create First Project</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
