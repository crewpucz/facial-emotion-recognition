import React, { useCallback, useState } from "react";
import WebcamCapture from "./components/WebcamCapture";
import EmotionStats from "./components/EmotionStats";
import EmotionBadge from "./components/EmotionBadge";
import { useEmotionDetector } from "./hooks/useEmotionDetector";
import "./styles/App.css";

export default function App() {
  const { faces, isDetecting, setIsDetecting, error, fps, detect } = useEmotionDetector();
  const [cameraOn, setCameraOn] = useState(true);

  const handleFrame = useCallback((imageSrc) => {
    detect(imageSrc);
  }, [detect]);

  const toggleDetection = () => setIsDetecting((prev) => !prev);

  const toggleCamera = () => {
    setCameraOn((prev) => {
      if (prev) {
        // Matikan kamera → stop detection juga
        setIsDetecting(false);
      }
      return !prev;
    });
  };

  const primaryFace = faces[0] || null;

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <h1>Emotion Detector</h1>
        <p>Real-time facial emotion recognition</p>
      </div>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Left: Webcam */}
        <div className="webcam-section">
          {cameraOn ? (
            <WebcamCapture
              isDetecting={isDetecting}
              onFrame={handleFrame}
              faces={faces}
            />
          ) : (
            <div className="camera-off">
              <span>Camera Off</span>
            </div>
          )}

          {/* Controls */}
          <div className="controls">
            <button
              onClick={toggleCamera}
              className={`btn-detect ${cameraOn ? "btn-detect--stop" : "btn-detect--start"}`}
            >
              {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
            </button>

            {cameraOn && (
              <button
                onClick={toggleDetection}
                className={`btn-detect ${isDetecting ? "btn-detect--stop" : "btn-detect--start"}`}
              >
                {isDetecting ? "Stop Detection" : "Start Detection"}
              </button>
            )}

            {isDetecting && (
              <span className="fps-badge">{fps} FPS</span>
            )}
          </div>

          {/* Error */}
          {error && <div className="error-msg">⚠ {error}</div>}
        </div>

        {/* Right: Sidebar */}
        <div className="sidebar">
          {/* Status */}
          <div className="card">
            <div className="card-label">Status</div>
            <div className="status-row">
              <div className={`status-dot ${isDetecting ? "status-dot--active" : ""}`} />
              <span className="status-text">
                {isDetecting ? "Detecting" : "Idle"}
              </span>
            </div>
            <div className="faces-count">
              Faces detected: {faces.length}
            </div>
          </div>

          {/* Emotion Result */}
          {primaryFace ? (
            <>
              <div className="card">
                <div className="card-label">Detected Emotion</div>
                <EmotionBadge
                  emotion={primaryFace.emotion}
                  confidence={primaryFace.confidence}
                  emoji={primaryFace.emoji}
                />
              </div>
              <EmotionStats allProbs={primaryFace.all_probs} />
            </>
          ) : (
            <div className="placeholder-card">
              {isDetecting
                ? "Mencari wajah..."
                : "Klik Start Detection lalu hadapkan wajah ke kamera"}
            </div>
          )}

          {/* Multiple faces */}
          {faces.length > 1 && (
            <div className="card">
              <div className="card-label">All Faces</div>
              <div className="faces-list">
                {faces.map((face, i) => (
                  <div key={i} className="face-row">
                    <span>{face.emoji} Face {i + 1}</span>
                    <span>{face.emotion} ({face.confidence.toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        React + FastAPI + TensorFlow CNN
      </div>
    </div>
  );
}
