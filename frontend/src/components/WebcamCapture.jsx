import React, { useRef, useEffect } from "react";
import Webcam from "react-webcam";

export default function WebcamCapture({ isDetecting, onFrame, faces, deviceId }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  // Kirim frame ke backend setiap 1000ms
  useEffect(() => {
    if (isDetecting) {
      intervalRef.current = setInterval(() => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) onFrame(imageSrc);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isDetecting, onFrame]);

  // Gambar bounding box di canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isDetecting || faces.length === 0) return;

    faces.forEach(({ box, emotion, confidence, emoji }) => {
      const { x, y, w, h } = box;

      // Bounding box
      ctx.strokeStyle = "#e4e4e7";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Label
      const label = `${emoji} ${emotion} ${confidence.toFixed(0)}%`;
      ctx.font = "600 13px Inter, sans-serif";
      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = "rgba(17, 17, 19, 0.8)";
      ctx.fillRect(x, y - 26, textWidth + 14, 24);

      ctx.fillStyle = "#e4e4e7";
      ctx.fillText(label, x + 7, y - 9);
    });
  }, [faces, isDetecting]);

  const videoConstraints = {
    width: 640,
    height: 480,
    ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "user" }),
  };

  return (
    <div className="webcam-wrapper">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        mirrored={true}
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
      />
    </div>
  );
}
