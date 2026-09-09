import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { MessageSquare, Send, Users, ArrowLeft } from 'lucide-react';

const GroupChat = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputContent, setInputContent] = useState('');
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  const fetchGroupAndMessages = async () => {
    setLoading(true);
    try {
      const gRes = await api.get(`/groups/${id}`);
      setGroup(gRes.data.group);

      const mRes = await api.get(`/messages/group/${id}`);
      setMessages(mRes.data.messages);
    } catch (err) {
      console.error('Error fetching group chat:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupAndMessages();

    // Connect to WebSocket room
    const socket = getSocket();
    const roomName = `group_${id}`;
    socket.emit('join_room', { room: roomName });

    socket.on('new_group_message', (newMsg) => {
      if (newMsg.group_id === parseInt(id)) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    return () => {
      socket.emit('leave_room', { room: roomName });
      socket.off('new_group_message');
    };
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    const content = inputContent.trim();
    setInputContent('');

    try {
      // Emit via SocketIO or POST via REST
      const socket = getSocket();
      socket.emit('send_group_message', {
        group_id: parseInt(id),
        sender_id: user.id,
        content: content
      });
    } catch (err) {
      // Fallback to REST API
      await api.post('/messages/group', { group_id: id, content });
      fetchGroupAndMessages();
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;
  }

  return (
    <div className="container-fluid py-4">
      <div className="glass-card overflow-hidden d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Chat Header */}
        <div className="gradient-header p-3 d-flex justify-content-between align-items-center text-white">
          <div className="d-flex align-items-center gap-3">
            <Link to="/groups" className="btn btn-sm btn-outline-light rounded-circle p-2 d-flex align-items-center">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h5 className="fw-bold mb-0 text-white">{group?.name}</h5>
              <small className="text-white-50">{group?.member_count} Members • Topic: {group?.topic}</small>
            </div>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-fill p-4 overflow-auto bg-light d-flex flex-column gap-3">
          {messages.length > 0 ? (
            messages.map((m, i) => {
              const isMine = m.sender_id === user.id;
              return (
                <div key={i} className={`d-flex flex-column ${isMine ? 'align-items-end' : 'align-items-start'}`}>
                  <small className="text-muted mb-1 px-1" style={{ fontSize: '0.75rem' }}>
                    {m.sender_name} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              <p>No messages in this research group yet. Start the conversation!</p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input Bar */}
        <div className="p-3 bg-white border-top">
          <form onSubmit={handleSendMessage} className="d-flex gap-2">
            <input 
              type="text" 
              className="form-control rounded-pill px-3"
              placeholder="Type message to group..."
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
            />
            <button type="submit" className="btn btn-primary-gradient rounded-circle p-2.5 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
