import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { MessageSquare, Send, User, Search, Circle } from 'lucide-react';

const MessagesPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get('user');

  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputContent, setInputContent] = useState('');
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  const fetchContactsAndFaculty = async () => {
    setLoading(true);
    try {
      // Fetch active direct contacts
      const convRes = await api.get('/messages/conversations');
      let contactList = convRes.data.contacts;

      // Fetch all faculty and students to allow starting new conversations
      const facultyRes = await api.get('/faculty');
      const studentRes = await api.get('/students');

      const existingIds = new Set(contactList.map((c) => c.user_id));

      // Append available faculty & students not yet in recent contacts
      facultyRes.data.faculty.forEach((f) => {
        if (f.user_id !== user.id && !existingIds.has(f.user_id)) {
          contactList.push({
            user_id: f.user_id,
            full_name: f.full_name,
            role: 'FACULTY',
            department: f.department,
            last_message: 'Start conversation'
          });
        }
      });

      studentRes.data.students.forEach((s) => {
        if (s.user_id !== user.id && !existingIds.has(s.user_id)) {
          contactList.push({
            user_id: s.user_id,
            full_name: s.full_name,
            role: 'STUDENT',
            department: s.department,
            last_message: 'Start conversation'
          });
        }
      });

      setContacts(contactList);

      // Auto-select target user from query param if provided
      if (initialUserId) {
        const target = contactList.find((c) => c.user_id === parseInt(initialUserId));
        if (target) {
          selectContact(target);
        } else if (contactList.length > 0) {
          selectContact(contactList[0]);
        }
      } else if (contactList.length > 0) {
        selectContact(contactList[0]);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectContact = async (contact) => {
    setSelectedUser(contact);
    try {
      const res = await api.get(`/messages/direct/${contact.user_id}`);
      setMessages(res.data.messages);
    } catch (err) {
      console.error('Error fetching direct messages:', err);
    }
  };

  useEffect(() => {
    fetchContactsAndFaculty();

    const socket = getSocket();
    socket.emit('join_room', { room: `user_${user.id}` });

    socket.on('new_direct_message', (newMsg) => {
      if (selectedUser && (newMsg.sender_id === selectedUser.user_id || newMsg.receiver_id === selectedUser.user_id)) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    return () => {
      socket.off('new_direct_message');
    };
  }, [selectedUser?.user_id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputContent.trim() || !selectedUser) return;

    const content = inputContent.trim();
    setInputContent('');

    try {
      const res = await api.post('/messages/direct', {
        receiver_id: selectedUser.user_id,
        content: content
      });
      setMessages((prev) => [...prev, res.data.data]);
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending message');
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
        <div className="row g-0 h-100">
          {/* Contacts Sidebar */}
          <div className="col-md-4 border-end bg-white d-flex flex-column h-100">
            <div className="p-3 border-bottom gradient-header text-white">
              <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                <MessageSquare size={20} /> Direct Messages
              </h5>
            </div>

            <div className="flex-fill overflow-auto">
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
              ) : (
                contacts.map((c) => (
                  <div
                    key={c.user_id}
                    className={`p-3 border-bottom d-flex align-items-center justify-content-between cursor-pointer ${selectedUser?.user_id === c.user_id ? 'bg-primary bg-opacity-10 border-primary' : 'hover-bg-light'}`}
                    onClick={() => selectContact(c)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center gap-2 overflow-hidden">
                      <div className="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                        {c.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <div className="fw-bold text-dark small text-truncate">{c.full_name}</div>
                        <small className="text-muted text-truncate d-block" style={{ fontSize: '0.75rem' }}>
                          {c.role === 'FACULTY' ? '👨‍🏫 Faculty Advisor' : '🎓 Student'} • {c.last_message || ''}
                        </small>
                      </div>
                    </div>
                    {c.unread_count > 0 && (
                      <span className="badge bg-danger rounded-pill">{c.unread_count}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Main Area */}
          <div className="col-md-8 d-flex flex-column h-100 bg-light">
            {selectedUser ? (
              <>
                <div className="p-3 bg-white border-bottom d-flex align-items-center justify-content-between shadow-sm">
                  <div>
                    <h6 className="fw-bold mb-0">{selectedUser.full_name}</h6>
                    <small className="text-muted">{selectedUser.role} • {selectedUser.department || ''}</small>
                  </div>
                </div>

                <div className="flex-fill p-4 overflow-auto d-flex flex-column gap-3">
                  {messages.length > 0 ? (
                    messages.map((m, i) => {
                      const isMine = m.sender_id === user.id;
                      return (
                        <div key={i} className={`d-flex flex-column ${isMine ? 'align-items-end' : 'align-items-start'}`}>
                          <small className="text-muted mb-1 px-1" style={{ fontSize: '0.75rem' }}>
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </small>
                          <div className={isMine ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                            {m.content}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <MessageSquare size={36} className="opacity-50 mb-2" />
                      <p>Start a conversation with {selectedUser.full_name}!</p>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-3 bg-white border-top">
                  <form onSubmit={handleSendMessage} className="d-flex gap-2">
                    <input 
                      type="text" 
                      className="form-control rounded-pill px-3"
                      placeholder={`Send direct message to ${selectedUser.full_name}...`}
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary-gradient rounded-circle p-2.5 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                Select a contact to view conversation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
