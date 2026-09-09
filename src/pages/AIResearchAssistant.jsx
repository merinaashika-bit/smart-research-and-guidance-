import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, Sparkles, Trash2, History, MessageSquare, Lightbulb } from 'lucide-react';

const AIResearchAssistant = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const chatEndRef = useRef(null);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/chatbot/history');
      setChatHistory(res.data.history);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleAsk = async (userPromptText) => {
    const queryText = userPromptText || prompt;
    if (!queryText.trim()) return;

    setPrompt('');
    setLoading(true);

    // Optimistically add user prompt turn to UI
    const tempUserTurn = { prompt: queryText, response: '', timestamp: new Date().toISOString() };
    setChatHistory((prev) => [...prev, tempUserTurn]);

    try {
      const res = await api.post('/chatbot/ask', { prompt: queryText });
      setChatHistory((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = res.data.chat;
        return updated;
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Error communicating with the research assistant');
      fetchHistory();
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all conversation history?')) return;
    try {
      await api.delete('/chatbot/history');
      setChatHistory([]);
    } catch (err) {
      alert('Error clearing history');
    }
  };

  const suggestedPrompts = [
    "What algorithm can I use for my NLP project?",
    "Explain how research topic matching works in simple terms.",
    "Which dataset can I use for sentiment analysis?",
    "How can I structure my research methodology section?",
    "What is the difference between classification and clustering?"
  ];

  return (
    <div className="container-fluid py-4">
      <div className="glass-card overflow-hidden d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Header */}
        <div className="gradient-header p-3 d-flex justify-content-between align-items-center text-white">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 bg-warning rounded-circle text-dark">
              <Bot size={20} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">Research Assistant</h5>
              <small className="text-white-50">Persistent academic guidance for your research work</small>
            </div>
          </div>

          <button className="btn btn-sm btn-outline-light d-flex align-items-center gap-1 rounded-pill" onClick={handleClearHistory}>
            <Trash2 size={14} /> Clear History
          </button>
        </div>

        {/* Suggested Prompts Banner */}
        <div className="bg-light p-3 border-bottom overflow-auto">
          <div className="d-flex align-items-center gap-2">
            <small className="text-muted fw-semibold text-nowrap d-flex align-items-center gap-1">
              <Lightbulb size={14} className="text-warning" /> Suggested Questions:
            </small>
            <div className="d-flex gap-2">
              {suggestedPrompts.map((sp, i) => (
                <button
                  key={i}
                  className="btn btn-xs btn-white border rounded-pill text-nowrap small hover-shadow py-1 px-3"
                  style={{ fontSize: '0.75rem', background: '#fff' }}
                  onClick={() => handleAsk(sp)}
                  disabled={loading}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Conversation Feed */}
        <div className="flex-fill p-4 overflow-auto bg-light d-flex flex-column gap-4">
          {chatHistory.length > 0 ? (
            chatHistory.map((item, index) => (
              <React.Fragment key={index}>
                {/* User Prompt */}
                <div className="d-flex flex-column align-items-end">
                  <div className="chat-bubble-user">
                    {item.prompt}
                  </div>
                  <small className="text-muted mt-1 px-1" style={{ fontSize: '0.7rem' }}>
                    You • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </div>

                {/* Assistant response */}
                <div className="d-flex flex-column align-items-start">
                  <div className="chat-bubble-ai w-100">
                    <div className="d-flex align-items-center gap-2 mb-2 pb-2 border-bottom">
                      <Bot size={18} className="text-primary" />
                      <span className="fw-bold small text-primary">Research Assistant</span>
                    </div>

                    {item.response ? (
                      <div className="markdown-content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {item.response}
                      </div>
                    ) : (
                      <div className="d-flex align-items-center gap-2 text-muted py-2">
                        <div className="spinner-border spinner-border-sm text-primary" />
                        <span>Analyzing query and composing response...</span>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            ))
          ) : (
            <div className="text-center py-5 text-muted">
              <Bot size={48} className="text-primary opacity-50 mb-3" />
              <h5>Ask Anything About Your Research!</h5>
              <p className="small text-muted mx-auto" style={{ maxWidth: '500px' }}>
                Ask methodology questions, algorithm recommendations, paper structuring advice, or dataset selection tips.
              </p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-top">
          <form onSubmit={(e) => { e.preventDefault(); handleAsk(); }} className="d-flex gap-2">
            <input 
              type="text" 
              className="form-control form-control-lg rounded-pill px-4"
              placeholder="Ask research questions (e.g., 'What algorithm should I use for sentiment classification?')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="btn btn-primary-gradient rounded-circle p-3 d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px' }}
              disabled={loading || !prompt.trim()}
            >
              {loading ? <span className="spinner-border spinner-border-sm" /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIResearchAssistant;
