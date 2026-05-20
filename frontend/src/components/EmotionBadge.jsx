import React from "react";

export default function EmotionBadge({ emotion, confidence, emoji }) {
  return (
    <div className="emotion-badge">
      <span className="emotion-badge__emoji">{emoji}</span>
      <div>
        <div className="emotion-badge__label">{emotion}</div>
        <div className="emotion-badge__confidence">
          {confidence.toFixed(1)}% confidence
        </div>
      </div>
    </div>
  );
}
