import { useState, useCallback, useRef } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 15000;

export function useEmotionDetector() {
  const [faces, setFaces]           = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError]           = useState(null);
  const [fps, setFps]               = useState(0);
  const lastCallTime                = useRef(Date.now());
  const requestInFlight             = useRef(false);

  const detect = useCallback(async (imageSrc) => {
    if (!imageSrc || requestInFlight.current) return;

    requestInFlight.current = true;

    try {
      const response = await axios.post(
        `${API_URL}/predict-base64`,
        { image: imageSrc },
        { timeout: REQUEST_TIMEOUT_MS }
      );

      if (response.data.success) {
        setError(null);
        setFaces(response.data.faces);

        // Hitung FPS
        const now = Date.now();
        const elapsed = now - lastCallTime.current;
        setFps(Math.round(1000 / elapsed));
        lastCallTime.current = now;
      }
    } catch (err) {
      if (err.code === "ECONNABORTED") {
        setError("Backend merespons terlalu lama. Coba kurangi gerakan kamera atau tunggu beberapa detik.");
      } else if (err.response) {
        setError(`Backend mengembalikan error ${err.response.status}: ${err.response.data?.detail || "request gagal"}`);
      } else {
        setError("Tidak bisa terhubung ke backend. Pastikan server berjalan di port 8000.");
      }
      setFaces([]);
    } finally {
      requestInFlight.current = false;
    }
  }, []);

  return { faces, isDetecting, setIsDetecting, error, fps, detect };
}
