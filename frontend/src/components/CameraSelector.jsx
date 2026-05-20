import React, { useState, useEffect } from "react";

export default function CameraSelector({ selectedDeviceId, onSelect }) {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    async function getDevices() {
      try {
        // Minta permission dulu supaya label muncul
        await navigator.mediaDevices.getUserMedia({ video: true });
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((d) => d.kind === "videoinput");
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
  }, []);

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
