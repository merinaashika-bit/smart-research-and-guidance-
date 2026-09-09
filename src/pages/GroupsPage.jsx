import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, PlusCircle, MessageSquare, UserCheck, Layers, LogIn, LogOut, GraduationCap, ShieldCheck, Send } from 'lucide-react';

const GroupsPage = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('Natural Language Processing');
  const [groupType, setGroupType] = useState(user?.role === 'FACULTY' ? 'FACULTY_STUDENT' : 'STUDENT_ONLY');
  const [creating, setCreating] = useState(false);
  const [students, setStudents] = useState([]);
  const [inviteStudentId, setInviteStudentId] = useState('');
  const [invitingGroupId, setInvitingGroupId] = useState(null);
  const canCreateGroup = (user?.role === 'STUDENT' && activeTab === 'STUDENT_ONLY')
    || (user?.role === 'FACULTY' && activeTab === 'FACULTY_STUDENT');

  const fetchGroups = async (filterType = activeTab) => {
    setLoading(true);
    try {
      const typeParam = filterType !== 'ALL' ? `?type=${filterType}` : '';
      const res = await api.get(`/groups${typeParam}`);
      setGroups(res.data.groups);
    } catch (err) {
      console.error('Error loading research groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups(activeTab);
    if (user?.role === 'FACULTY') {
      api.get('/students').then((res) => setStudents(res.data.students || [])).catch((err) => console.error('Error loading students:', err));
    }
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchGroups(tab);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/groups', {
        name,
        description,
        topic,
        group_type: groupType
      });
      setShowCreateModal(false);
      setName('');
      setDescription('');
      fetchGroups(activeTab);
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating group');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinLeave = async (groupId, isMember) => {
    try {
      if (isMember) {
        await api.post(`/groups/${groupId}/leave`);
      } else {
        await api.post(`/groups/${groupId}/join`);
      }
      fetchGroups(activeTab);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating membership');
    }
  };

  const handleInviteStudent = async (groupId) => {
    if (!inviteStudentId) return;
    setInvitingGroupId(groupId);
    try {
      await api.post(`/groups/${groupId}/invite`, { student_id: Number(inviteStudentId) });
      setInviteStudentId('');
      fetchGroups(activeTab);
    } catch (err) {
      alert(err.response?.data?.message || 'Error inviting student');
    } finally {
      setInvitingGroupId(null);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="glass-card p-4 mb-4 text-white" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-3 bg-white bg-opacity-20 rounded-circle text-white">
              <Users size={32} />
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-white">Research Group Collaboration</h3>
              <p className="mb-0 text-white-50 small">Separate Student-Only collaboration groups and joint Faculty-Student research groups</p>
            </div>
          </div>
          {canCreateGroup && (
            <button className="btn btn-light rounded-pill px-4 font-semibold" onClick={() => setShowCreateModal(true)}>
              <PlusCircle size={18} className="me-1" /> Create Research Group
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <ul className="nav nav-pills gap-2">
          <li className="nav-item">
            <button 
              className={`nav-link rounded-pill px-3 fw-semibold ${activeTab === 'ALL' ? 'active gradient-bg text-white' : 'btn-light border text-dark'}`}
              onClick={() => handleTabChange('ALL')}
            >
              All Groups
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link rounded-pill px-3 fw-semibold ${activeTab === 'STUDENT_ONLY' ? 'active bg-primary text-white' : 'btn-light border text-dark'}`}
              onClick={() => handleTabChange('STUDENT_ONLY')}
            >
              🎓 Student-Only Groups
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link rounded-pill px-3 fw-semibold ${activeTab === 'FACULTY_STUDENT' ? 'active text-white' : 'btn-light border text-dark'}`}
              style={{ backgroundColor: activeTab === 'FACULTY_STUDENT' ? '#8b5cf6' : '' }}
              onClick={() => handleTabChange('FACULTY_STUDENT')}
            >
              👨‍🏫 Faculty-Student Joint Groups
            </button>
          </li>
        </ul>
      </div>

      {/* Group Cards Grid */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-success" /></div>
      ) : (
        <div className="row g-4">
          {groups.length > 0 ? (
            groups.map((g) => {
              const isStudentOnly = g.group_type === 'STUDENT_ONLY';

              return (
                <div key={g.id} className="col-md-6 col-lg-4">
                  <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between hover-shadow transition">
                    <div>
                      {/* Group Type Badge */}
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        {isStudentOnly ? (
                          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20">
                            🎓 Student-Only Group
                          </span>
                        ) : (
                          <span className="badge text-white" style={{ backgroundColor: '#8b5cf6' }}>
                            👨‍🏫 Faculty-Student Joint Group
                          </span>
                        )}

                        <span className="badge bg-light text-dark border">
                          <Users size={12} className="me-1" /> {g.member_count} Members
                        </span>
                      </div>

                      <h5 className="fw-bold mb-2 text-dark">{g.name}</h5>
                      <p className="small text-muted mb-3">{g.description}</p>
                      
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Topic: <strong className="text-dark">{g.topic}</strong>
                        </small>
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                          By: {g.creator_name}
                        </small>
                      </div>
                    </div>

                    <div className="pt-3 border-top d-flex gap-2">
                      {g.group_type === 'FACULTY_STUDENT' && user?.role === 'STUDENT' && !g.is_member ? (
                        <span className="small text-muted flex-fill d-flex align-items-center justify-content-center text-center">
                          Faculty invitation required
                        </span>
                      ) : (
                        <button 
                          className={`btn btn-sm flex-fill ${g.is_member ? 'btn-outline-danger' : 'btn-outline-success'} py-2 rounded-3 d-flex align-items-center justify-content-center gap-1`}
                          onClick={() => handleJoinLeave(g.id, g.is_member)}
                        >
                          {g.is_member ? <><LogOut size={14} /> Leave Group</> : <><LogIn size={14} /> Join Group</>}
                        </button>
                      )}

                      {g.is_member && (
                        <Link to={`/groups/${g.id}/chat`} className="btn btn-sm btn-primary-gradient px-3 py-2 rounded-3 d-flex align-items-center gap-1">
                          <MessageSquare size={16} /> Group Chat
                        </Link>
                      )}
                    </div>

                    {user?.role === 'FACULTY' && g.group_type === 'FACULTY_STUDENT' && g.is_member && (
                      <div className="pt-3 mt-3 border-top d-flex gap-2">
                        <select className="form-select form-select-sm" value={inviteStudentId} onChange={(e) => setInviteStudentId(e.target.value)}>
                          <option value="">Select student to invite</option>
                          {students.map((student) => <option key={student.user_id} value={student.user_id}>{student.full_name}</option>)}
                        </select>
                        <button className="btn btn-sm btn-outline-primary text-nowrap" onClick={() => handleInviteStudent(g.id)} disabled={!inviteStudentId || invitingGroupId === g.id}>
                          {invitingGroupId === g.id ? <span className="spinner-border spinner-border-sm" /> : <><Send size={14} /> Invite</>}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-12 text-center py-5 text-muted">
              <Users size={40} className="opacity-50 mb-2" />
              <p>No research groups found for this category.</p>
              {canCreateGroup && (
                <button className="btn btn-sm btn-success rounded-pill px-3" onClick={() => setShowCreateModal(true)}>Create First Group</button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && canCreateGroup && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="gradient-header p-3 text-white rounded-top-4 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold mb-0">Create Research Group</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleCreateGroup}>
                  {/* Select Group Type */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Group Type & Audience</label>
                    <div className="btn-group w-100" role="group">
                      {user?.role === 'STUDENT' && (
                        <button
                          type="button"
                          className="btn py-2 text-nowrap btn-primary"
                          disabled
                        >
                          🎓 Student-Only Group
                        </button>
                      )}
                      {user?.role === 'FACULTY' && (
                        <button
                          type="button"
                          className="btn py-2 text-nowrap btn-purple text-white"
                          style={{ backgroundColor: '#8b5cf6' }}
                          disabled
                        >
                          👨‍🏫 Faculty-Student Group
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Group Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. NLP & Conversational AI Interest Group"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Research Topic / Domain</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Natural Language Processing"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Group Description</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      placeholder="Objectives and scope of group discussion..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary-gradient px-4" disabled={creating}>
                      {creating ? <span className="spinner-border spinner-border-sm me-1" /> : <PlusCircle size={16} className="me-1" />}
                      Create Group
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

export default GroupsPage;
