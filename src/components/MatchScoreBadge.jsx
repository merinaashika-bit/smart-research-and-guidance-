import React from 'react';
import { Sparkles } from 'lucide-react';

const MatchScoreBadge = ({ score }) => {
  const numScore = parseFloat(score) || 0;
  let scoreClass = 'match-low';
  if (numScore >= 75) {
    scoreClass = 'match-high';
  } else if (numScore >= 40) {
    scoreClass = 'match-medium';
  }

  return (
    <span className={`match-score-badge ${scoreClass}`}>
      <Sparkles size={14} />
      {numScore}% Match
    </span>
  );
};

export default MatchScoreBadge;
