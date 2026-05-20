import React from "react";

const EMOJI_MAP = {
  angry: "😠", disgust: "🤢", fear: "😨",
  happy: "😊", neutral: "😐", sad: "😢", surprise: "😲",
};

export default function EmotionStats({ allProbs }) {
  if (!allProbs) return null;

  const sorted = Object.entries(allProbs).sort((a, b) => b[1] - a[1]);

  return (
    <div className="card">
      <div className="card-label">Probability</div>
      {sorted.map(([emotion, prob]) => (
        <div key={emotion} className="prob-item">
          <div className="prob-header">
            <span className="prob-label">
              {EMOJI_MAP[emotion]} {emotion}
            </span>
            <span className="prob-value">{prob.toFixed(1)}%</span>
          </div>
          <div className="prob-bar">
            <div
              className="prob-bar__fill"
              style={{ width: `${prob}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
