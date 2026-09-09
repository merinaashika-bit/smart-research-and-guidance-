import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Brain, UserCheck, FolderKanban, Bot, ArrowRight,
  Zap, Shield, Users, TrendingUp, Star, ChevronRight, Code2,
  Globe, Cpu, Lock, BarChart3, Layers3
} from 'lucide-react';

/* ---- Animated typing effect hook ---- */
const useTypewriter = (words, delay = 100, pause = 2000) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      setTimeout(() => setReverse(true), pause);
      return;
    }
    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }
    const timeout = setTimeout(() => {
      setText(words[index].substring(0, subIndex));
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? delay / 2 : delay);
    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words, delay, pause]);

  return text;
};

/* ---- Counter animation ---- */
const AnimatedCounter = ({ end, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(end / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{count}{suffix}</span>;
};

const domains = [
  { name: 'Artificial Intelligence', icon: <Brain size={16} />, color: '#4f46e5', bg: '#eef2ff' },
  { name: 'Large Language Models', icon: <Cpu size={16} />, color: '#7c3aed', bg: '#f5f3ff' },
  { name: 'Cybersecurity & Privacy', icon: <Lock size={16} />, color: '#dc2626', bg: '#fef2f2' },
  { name: 'Computer Vision', icon: <Layers3 size={16} />, color: '#0891b2', bg: '#ecfeff' },
  { name: 'Data Science & Analytics', icon: <BarChart3 size={16} />, color: '#059669', bg: '#ecfdf5' },
  { name: 'Quantum Computing', icon: <Zap size={16} />, color: '#d97706', bg: '#fffbeb' },
  { name: 'Blockchain & Web3', icon: <Globe size={16} />, color: '#7c3aed', bg: '#f5f3ff' },
  { name: 'Human-Computer Interaction', icon: <Users size={16} />, color: '#0369a1', bg: '#eff6ff' },
];

const topicIdeas = {
  'Artificial Intelligence': 'How can explainable AI improve decision-making in public services?',
  'Large Language Models': 'How can smaller language models become more reliable for education?',
  'Cybersecurity & Privacy': 'How can privacy-preserving systems detect threats without exposing user data?',
  'Computer Vision': 'How can computer vision make accessibility tools more responsive?',
  'Data Science & Analytics': 'How can real-time analytics help communities respond to changing needs?',
  'Quantum Computing': 'Which optimisation problems could benefit from near-term quantum systems?',
  'Blockchain & Web3': 'How can verifiable credentials make digital research collaboration safer?',
  'Human-Computer Interaction': 'How can calm, inclusive interfaces help people work with complex information?',
};

const steps = [
  {
    icon: '🧠',
    label: 'Input Interests',
    desc: 'Share your skills, passions, and areas you want to explore',
    gradient: 'linear-gradient(135deg, #4f46e5, #818cf8)',
  },
  {
    icon: '⚡',
    label: 'Topic Match',
    desc: 'A live matching engine ranks 50+ research topics',
    gradient: 'linear-gradient(135deg, #0891b2, #38bdf8)',
  },
  {
    icon: '👩‍🏫',
    label: 'Find an Advisor',
    desc: 'Relevant faculty experts accept or decline your request',
    gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  },
  {
    icon: '🚀',
    label: 'Launch Project',
    desc: 'Submit live research tasks, get real-time faculty feedback',
    gradient: 'linear-gradient(135deg, #d97706, #fbbf24)',
  },
  {
    icon: '🤝',
    label: 'Collaborate',
    desc: 'Student circles & joint faculty-student research channels',
    gradient: 'linear-gradient(135deg, #059669, #34d399)',
  },
];

const features = [
  {
    icon: <Sparkles size={22} />,
    title: 'Smart Topic Discovery',
    desc: 'Smart recommendations surface relevant live research topics tailored to your unique interests.',
    color: '#4f46e5', bg: '#eef2ff',
  },
  {
    icon: <UserCheck size={22} />,
    title: 'Expert Advisor Matching',
    desc: 'Our matching engine connects you with faculty advisors whose expertise complements your goals.',
    color: '#7c3aed', bg: '#f5f3ff',
  },
  {
    icon: <FolderKanban size={22} />,
    title: 'Live Project Board',
    desc: 'Manage research milestones, receive real-time faculty reviews, and track every project stage on a dynamic kanban board.',
    color: '#d97706', bg: '#fffbeb',
  },
  {
    icon: <Users size={22} />,
    title: 'Research Circles',
    desc: 'Join student-only collaboration hubs or dedicated faculty-student research channels with real-time group messaging.',
    color: '#0891b2', bg: '#ecfeff',
  },
  {
    icon: <Bot size={22} />,
    title: 'Research Assistant',
    desc: 'Ask research questions about methodology, citations, and statistical analysis.',
    color: '#059669', bg: '#ecfdf5',
  },
  {
    icon: <TrendingUp size={22} />,
    title: 'Progress Analytics',
    desc: 'Visualise your research journey: advisor connections, project health scores, and collaboration activity.',
    color: '#dc2626', bg: '#fef2f2',
  },
];

const LandingPage = () => {
  const [selectedDomain, setSelectedDomain] = useState(domains[0].name);
  const [interestWords, setInterestWords] = useState('ethical, useful, human-centred');
  const typed = useTypewriter([
    'Advanced Computing',
    'Cybersecurity Research',
    'Computer Vision',
    'Large Language Models',
    'Quantum Computing',
    'Data Science',
  ]);

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh' }}>

      {/* ======== HERO SECTION ======== */}
      <div className="gradient-header" style={{ paddingTop: '80px', paddingBottom: '100px' }}>
        {/* Background effects */}
        <div className="hero-particles">
          {[...Array(6)].map((_, i) => <div key={i} className={`hero-particle`} />)}
        </div>
        <div className="hero-grid-overlay" />
        <div className="hero-glow-orb hero-glow-orb-1" />
        <div className="hero-glow-orb hero-glow-orb-2" />
        <div className="hero-glow-orb hero-glow-orb-3" />

        <div className="container text-center position-relative" style={{ zIndex: 2 }}>
          {/* Live badge */}
          <div className="d-flex justify-content-center mb-4">
            <div className="hero-badge">
              <div className="hero-badge-dot" />
              Live Research Platform — Expert Advisor Matching
            </div>
          </div>

          {/* Main headline */}
          <h1
            className="text-white mb-3"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            Discover Real Research in
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #67e8f9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {typed}
              <span style={{ animation: 'blink-cursor 1s infinite', WebkitTextFillColor: '#a78bfa' }}>|</span>
            </span>
          </h1>

          <p className="text-white mx-auto mb-5"
            style={{ maxWidth: '680px', fontSize: '1.15rem', opacity: 0.65, lineHeight: 1.7 }}>
            A next-generation platform connecting university students with relevant research topics,
            expert faculty advisors, and collaborative project tools — all in one live workspace.
          </p>

          {/* CTA Buttons */}
          <div className="d-flex justify-content-center gap-3 flex-wrap mb-5">
            <Link to="/register" className="btn-cta-primary">
              Start Exploring Topics <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-cta-secondary">
              Sign In <ChevronRight size={18} />
            </Link>
          </div>

          {/* Stats row */}
          <div className="row g-3 justify-content-center" style={{ maxWidth: '750px', margin: '0 auto' }}>
            {[
              { n: 50, suffix: '+', label: 'Live Research Topics' },
              { n: 8,  suffix: '+', label: 'Research Domains' },
              { n: 98, suffix: '%', label: 'Match Accuracy' },
              { n: 24, suffix: '/7', label: 'Research Assistant' },
            ].map((s, i) => (
              <div className="col-6 col-md-3" key={i}>
                <div className="stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="stat-number">
                    <AnimatedCounter end={s.n} suffix={s.suffix} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontWeight: 600 }}>
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======== HOW IT WORKS ======== */}
      <div style={{ background: 'white', padding: '80px 0' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge px-3 py-2 rounded-pill mb-3"
              style={{ background: '#eef2ff', color: '#4f46e5', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.05em' }}>
              WORKFLOW
            </span>
            <h2 className="fw-bold" style={{ fontSize: '2.2rem', letterSpacing: '-0.02em' }}>
              From Interests to Live Research — <span className="gradient-text">in 5 Steps</span>
            </h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '540px', fontSize: '1.05rem' }}>
              Our end-to-end pipeline takes you from raw curiosity to an approved, active research collaboration.
            </p>
          </div>

          <div className="row g-3 justify-content-center">
            {steps.map((s, i) => (
              <div className="col-sm-6 col-md-4 col-lg-2 slide-up" key={i}
                style={{ animationDelay: `${i * 0.08}s` }}>
                <div style={{
                  background: 'white',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#c7d2fe';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(79,70,229,0.12)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                  {/* Step number */}
                  <span style={{
                    position: 'absolute', top: '12px', right: '14px',
                    fontSize: '0.7rem', fontWeight: 800, color: '#c7d2fe',
                  }}>0{i + 1}</span>
                  {/* Icon */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: s.gradient, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px auto', fontSize: 26,
                  }}>
                    {s.icon}
                  </div>
                  <h6 style={{ fontWeight: 800, marginBottom: 8, fontSize: '0.95rem' }}>{s.label}</h6>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======== PLATFORM FEATURES ======== */}
      <div style={{ background: '#f0f4ff', padding: '80px 0' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge px-3 py-2 rounded-pill mb-3"
              style={{ background: '#f5f3ff', color: '#7c3aed', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.05em' }}>
              PLATFORM FEATURES
            </span>
            <h2 className="fw-bold" style={{ fontSize: '2.2rem', letterSpacing: '-0.02em' }}>
              Everything You Need to <span className="gradient-text">Do Real Research</span>
            </h2>
          </div>

          <div className="row g-4">
            {features.map((f, i) => (
              <div className="col-md-6 col-lg-4 slide-up" key={i}
                style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="glass-card p-4 h-100"
                  style={{ cursor: 'default' }}>
                  <div className="feature-icon-ring mb-3"
                    style={{ background: f.bg, color: f.color }}>
                    {f.icon}
                  </div>
                  <h5 style={{ fontWeight: 800, marginBottom: 8 }}>{f.title}</h5>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======== LIVE TOPIC STUDIO ======== */}
      <div style={{ background: 'white', padding: '80px 0' }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-5">
              <span className="badge px-3 py-2 rounded-pill mb-3"
                style={{ background: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.05em' }}>
                LIVE TOPIC STUDIO
              </span>
              <h2 className="fw-bold" style={{ fontSize: '2.2rem', letterSpacing: '-0.02em' }}>
                Turn one curiosity into a <span className="gradient-text">research direction</span>
              </h2>
              <p className="text-muted" style={{ lineHeight: 1.7 }}>
                Pick a domain and shape the words that matter to you. ResearchHub turns that signal into a focused starting point for a real project.
              </p>
              <div className="topic-word-input mt-4">
                <label htmlFor="interest-words" className="form-label small fw-bold text-muted mb-2">
                  YOUR RESEARCH SIGNAL
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0"><Sparkles size={16} className="text-primary" /></span>
                  <input
                    id="interest-words"
                    className="form-control border-start-0"
                    value={interestWords}
                    onChange={(event) => setInterestWords(event.target.value)}
                    placeholder="e.g. accessible, sustainable, practical"
                  />
                </div>
                <small className="text-muted">Separate ideas with commas to personalise the preview.</small>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="topic-studio-panel">
                <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                  <div>
                    <div className="small text-uppercase fw-bold text-muted">Choose a field</div>
                    <div className="fw-bold mt-1">What do you want to explore?</div>
                  </div>
                  <div className="topic-live-indicator"><span /> Updating live</div>
                </div>
                <div className="topic-domain-grid mb-4">
                  {domains.map((domain) => (
                    <button
                      key={domain.name}
                      type="button"
                      className={`topic-domain-button ${selectedDomain === domain.name ? 'active' : ''}`}
                      onClick={() => setSelectedDomain(domain.name)}
                      style={{ '--topic-color': domain.color, '--topic-bg': domain.bg }}
                    >
                      {domain.icon}
                      <span>{domain.name}</span>
                    </button>
                  ))}
                </div>
                <div className="topic-preview">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="topic-preview-dot" />
                    <span className="small fw-bold text-uppercase text-muted">Live topic preview</span>
                  </div>
                  <h4>{topicIdeas[selectedDomain]}</h4>
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    {(interestWords || 'your interests').split(',').map((word) => word.trim()).filter(Boolean).slice(0, 4).map((word) => (
                      <span className="topic-keyword" key={word}>#{word}</span>
                    ))}
                  </div>
                  <Link to="/register" className="btn-cta-primary mt-4">
                    Build this topic <ArrowRight size={17} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======== BOTTOM CTA ======== */}
      <div className="gradient-header" style={{ padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-grid-overlay" />
        <div className="hero-glow-orb" style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          position: 'absolute', borderRadius: '50%', filter: 'blur(60px)'
        }} />
        <div className="container text-center position-relative" style={{ zIndex: 2 }}>
          <Star size={36} style={{ color: '#fbbf24', marginBottom: 16 }} />
          <h2 className="text-white fw-bold mb-3" style={{ fontSize: '2.4rem', letterSpacing: '-0.03em' }}>
            Ready to Launch Your Research Journey?
          </h2>
          <p className="text-white mb-5" style={{ opacity: 0.6, maxWidth: 480, margin: '0 auto 36px auto', fontSize: '1.05rem' }}>
            Join students and faculty already collaborating on cutting-edge research projects.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/register" className="btn-cta-primary">
              <Code2 size={18} /> Create Free Account
            </Link>
            <Link to="/login" className="btn-cta-secondary">
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* ======== FOOTER ======== */}
      <footer style={{ background: '#0a0f1e', color: 'rgba(255,255,255,0.4)', padding: '32px 0', textAlign: 'center' }}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <Sparkles size={16} style={{ color: '#818cf8' }} />
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>
              ResearchHub
            </span>
          </div>
          <small>© 2026 Smart Research Guidance & Recommendation Platform · Built for Academic Excellence</small>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
