import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MatchScoreBadge from '../components/MatchScoreBadge';
import { Sparkles, Search, Layers, PlusCircle, CheckCircle, Code } from 'lucide-react';

const ResearchRecommendations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [interestsText, setInterestsText] = useState(user?.profile?.interests || 'NLP, sentiment analysis, chatbots, text classification');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async (queryText = interestsText, domain = selectedDomain) => {
    setLoading(true);
    try {
      const res = await api.post('/recommendations/topics', {
        interests: queryText,
        domain: domain
      });
      setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error('Error fetching topic recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(interestsText, selectedDomain);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecommendations(interestsText, selectedDomain);
  };

  const handleDomainChange = (domain) => {
    setSelectedDomain(domain);
    fetchRecommendations(interestsText, domain);
  };

  const handleCreateProjectFromTopic = (topic) => {
    navigate('/projects', {
      state: {
        topicTitle: topic.research_topic,
        domain: topic.domain,
        keywords: topic.keywords,
        description: topic.description,
        required_skills: topic.required_skills
      }
    });
  };

  const domains = [
    'ALL',
    'Artificial Intelligence',
    'Natural Language Processing',
    'Predictive Analytics',
    'Cybersecurity',
    'Computer Vision',
    'Data Science',
    'Internet of Things',
    'Cloud Computing',
    'Software Engineering'
  ];

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="glass-card p-4 mb-4 gradient-bg text-white border-0">
        <div className="d-flex align-items-center gap-3">
          <div className="p-3 bg-white bg-opacity-20 rounded-circle text-white">
            <Sparkles size={32} />
          </div>
          <div>
            <h3 className="fw-bold mb-0 text-white">Research Topic Recommendations</h3>
            <p className="mb-0 text-white-50 small">
              Explore university research topics matched to your interests
            </p>
          </div>
        </div>
      </div>

      {/* Interest Input & Search Form */}
      <div className="glass-card p-4 mb-4">
        <form onSubmit={handleSearch}>
          <label className="form-label fw-semibold small text-muted">
            Describe what you want to research:
          </label>
          <div className="input-group mb-3">
            <span className="input-group-text bg-white"><Search size={18} className="text-muted" /></span>
            <input 
              type="text" 
              className="form-control form-control-lg border-start-0" 
              placeholder="e.g. I am interested in NLP, sentiment analysis, chatbots and text classification"
              value={interestsText}
              onChange={(e) => setInterestsText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary-gradient px-4">
              <Sparkles size={16} className="me-1" /> Find My Topics
            </button>
          </div>
        </form>

        {/* Domain Filter Pills */}
        <div className="d-flex align-items-center gap-2 overflow-auto py-1">
          <small className="text-muted fw-semibold me-2">Domain Filter:</small>
          {domains.map((d) => (
            <button
              key={d}
              className={`btn btn-sm rounded-pill px-3 text-nowrap ${selectedDomain === d ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => handleDomainChange(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation Results Feed */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted small">Finding relevant research topics...</p>
        </div>
      ) : (
        <div className="row g-4">
          {recommendations.length > 0 ? (
            recommendations.map((topic, i) => (
              <div key={i} className="col-md-6 col-lg-4">
                <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between hover-shadow transition">
                  <div>
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <span className="badge bg-light text-dark border">
                        <Layers size={12} className="me-1" /> {topic.domain}
                      </span>
                      <MatchScoreBadge score={topic.match_score} />
                    </div>

                    <h5 className="fw-bold mb-2 text-dark" style={{ lineHeight: '1.3' }}>
                      {topic.research_topic}
                    </h5>

                    <p className="small text-muted mb-3" style={{ fontSize: '0.875rem' }}>
                      {topic.description}
                    </p>

                    {topic.keywords && (
                      <div className="mb-3">
                        <small className="text-muted d-block fw-semibold mb-1" style={{ fontSize: '0.75rem' }}>KEYWORDS:</small>
                        <div className="d-flex flex-wrap gap-1">
                          {topic.keywords.split(',').map((k, idx) => (
                            <span key={idx} className="badge bg-secondary bg-opacity-10 text-secondary" style={{ fontSize: '0.7rem' }}>
                              #{k.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {topic.required_skills && (
                      <div className="mb-3">
                        <small className="text-muted d-block fw-semibold mb-1" style={{ fontSize: '0.75rem' }}>REQUIRED SKILLS:</small>
                        <span className="small text-dark fw-semibold" style={{ fontSize: '0.8rem' }}>
                          <Code size={14} className="me-1 text-primary" /> {topic.required_skills}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-top mt-3">
                    <button 
                      className="btn btn-sm btn-primary-gradient w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-1"
                      onClick={() => handleCreateProjectFromTopic(topic)}
                    >
                      <PlusCircle size={16} /> Create Research Project
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5 text-muted">
              <p className="mb-0">No matching research topics found for query. Try broadening your interest text!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResearchRecommendations;
