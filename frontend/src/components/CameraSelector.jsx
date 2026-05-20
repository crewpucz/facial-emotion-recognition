import { useState, useEffect } from "react";

export default function CameraSelector({ selectedDeviceId, onSelect, cameraOn }) {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    async function getDevices() {
      try {
        // Hanya enumerate tanpa getUserMedia dulu
        let allDevices = await navigator.mediaDevices.enumerateDevices();
        let videoDevices = allDevices.filter((d) => d.kind === "videoinput");

        // Kalau label kosong (belum ada permission) dan kamera sedang on, minta permission
        if (cameraOn && videoDevices.length > 0 && !videoDevices[0].label) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          // Stop stream langsung — kita cuma butuh permission untuk dapat label
          stream.getTracks().forEach((track) => track.stop());

          allDevices = await navigator.mediaDevices.enumerateDevices();
          videoDevices = allDevices.filter((d) => d.kind === "videoinput");
        }

        setDevices(videoDevices);

        // Auto-select device pertama jika belum ada yang dipilih
        if (!selectedDeviceId && videoDevices.length > 0) {
          onSelect(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Gagal mengakses kamera:", err);
      }
    }
    getDevices();
  }, [cameraOn]);

  if (devices.length <= 1) return null;

  return (
    <div className="camera-selector">
      <label className="camera-selector__label">Camera</label>
      <select
        className="camera-selector__select"
        value={selectedDeviceId || ""}
        onChange={(e) => onSelect(e.target.value)}
      >
        {devices.map((device, i) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Camera ${i + 1}`}
          </option>
        ))}
      </select>
    </div>
  );
}
