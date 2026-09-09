import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, Users, FolderKanban, BookOpen, PlusCircle, Trash2, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [topics, setTopics] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  // New Topic Form
  const [newTitle, setNewTitle] = useState('');
  const [newDomain, setNewDomain] = useState('Artificial Intelligence');
  const [newKeywords, setNewKeywords] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSkills, setNewSkills] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);

      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data.users);

      const topicsRes = await api.get('/admin/topics');
      setTopics(topicsRes.data.topics);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUser = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { is_active: !currentStatus });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user status');
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/topics', {
        title: newTitle,
        domain: newDomain,
        keywords: newKeywords,
        description: newDescription,
        required_skills: newSkills
      });
      setNewTitle('');
      setNewKeywords('');
      setNewDescription('');
      setNewSkills('');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding topic');
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Delete this research topic from dataset?')) return;
    try {
      await api.delete(`/admin/topics/${topicId}`);
      fetchAdminData();
    } catch (err) {
      alert('Error deleting topic');
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="glass-card p-4 mb-4 bg-danger text-white border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="p-3 bg-white bg-opacity-20 rounded-circle">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h3 className="fw-bold mb-0 text-white">System Admin Panel</h3>
            <p className="mb-0 text-white-50 small">Manage users, faculty expertise, research topics dataset, and platform activity</p>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-sm-6">
            <div className="p-3 bg-white border rounded-3 text-center">
              <div className="h3 fw-bold text-primary mb-0">{stats.total_students}</div>
              <small className="text-muted fw-semibold">Registered Students</small>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="p-3 bg-white border rounded-3 text-center">
              <div className="h3 fw-bold text-purple mb-0" style={{ color: '#8b5cf6' }}>{stats.total_faculty}</div>
              <small className="text-muted fw-semibold">Faculty Advisors</small>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="p-3 bg-white border rounded-3 text-center">
              <div className="h3 fw-bold text-warning mb-0">{stats.total_projects}</div>
              <small className="text-muted fw-semibold">Total Projects</small>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="p-3 bg-white border rounded-3 text-center">
              <div className="h3 fw-bold text-success mb-0">{stats.total_topics}</div>
              <small className="text-muted fw-semibold">Research Topics</small>
            </div>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link fw-semibold ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} className="me-1" /> User Management
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link fw-semibold ${activeTab === 'topics' ? 'active' : ''}`}
            onClick={() => setActiveTab('topics')}
          >
            <BookOpen size={16} className="me-1" /> Dataset Topics Manager
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
      ) : (
        <>
          {activeTab === 'users' && (
            <div className="glass-card p-4">
              <h5 className="fw-bold mb-3">All Platform Users</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td className="fw-semibold">{u.email}</td>
                        <td>{u.profile?.full_name || 'N/A'}</td>
                        <td><span className={`badge bg-${u.role === 'ADMIN' ? 'danger' : u.role === 'FACULTY' ? 'purple' : 'primary'}`} style={{ backgroundColor: u.role === 'FACULTY' ? '#8b5cf6' : '' }}>{u.role}</span></td>
                        <td>{u.profile?.department || 'N/A'}</td>
                        <td>
                          {u.is_active ? (
                            <span className="badge bg-success"><CheckCircle size={12} className="me-1" /> Active</span>
                          ) : (
                            <span className="badge bg-secondary"><XCircle size={12} className="me-1" /> Deactivated</span>
                          )}
                        </td>
                        <td>
                          {u.role !== 'ADMIN' && (
                            <button 
                              className={`btn btn-sm ${u.is_active ? 'btn-outline-danger' : 'btn-outline-success'} py-1 px-2`}
                              onClick={() => handleToggleUser(u.id, u.is_active)}
                            >
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'topics' && (
            <div className="row g-4">
              <div className="col-lg-5">
                <div className="glass-card p-4">
                  <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <PlusCircle size={20} className="text-primary" /> Add Research Topic
                  </h5>
                  <form onSubmit={handleAddTopic}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Topic Title</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="NLP Sentiment Classification"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Domain</label>
                      <select className="form-select" value={newDomain} onChange={(e) => setNewDomain(e.target.value)}>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="Natural Language Processing">Natural Language Processing</option>
                        <option value="Predictive Analytics">Predictive Analytics</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="Computer Vision">Computer Vision</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Internet of Things">Internet of Things</option>
                        <option value="Cloud Computing">Cloud Computing</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Keywords (comma-separated)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="nlp, sentiment analysis, text mining"
                        value={newKeywords}
                        onChange={(e) => setNewKeywords(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Description</label>
                      <textarea 
                        className="form-control" 
                        rows="3"
                        placeholder="Detailed topic description..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary-gradient w-100">
                      Save Topic to Dataset
                    </button>
                  </form>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="glass-card p-4">
                  <h5 className="fw-bold mb-3">Dataset Topics ({topics.length})</h5>
                  <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '550px' }}>
                    {topics.map((t) => (
                      <div key={t.id} className="p-3 border rounded-3 bg-white d-flex justify-content-between align-items-start gap-2">
                        <div>
                          <h6 className="fw-bold mb-1">{t.title}</h6>
                          <span className="badge bg-light text-dark border mb-1">{t.domain}</span>
                          <p className="small text-muted mb-0">{t.description}</p>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-danger p-1 text-danger"
                          onClick={() => handleDeleteTopic(t.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
