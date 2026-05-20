# Emotion Detector

Real-time facial emotion recognition menggunakan CNN (Convolutional Neural Network) dengan dataset FER-2013.

![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green)
![React](https://img.shields.io/badge/React-18-61dafb)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.16-orange)

## Fitur

- Deteksi emosi real-time melalui webcam
- 7 kelas emosi: angry, disgust, fear, happy, neutral, sad, surprise
- Bounding box pada wajah yang terdeteksi
- Probability distribution untuk setiap emosi
- Toggle kamera on/off
- Responsive dark UI

## Struktur Project

```
├── app/
│   └── main.py              # FastAPI backend
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── EmotionBadge.jsx
│       │   ├── EmotionStats.jsx
│       │   └── WebcamCapture.jsx
│       ├── hooks/
│       │   └── useEmotionDetector.js
│       ├── styles/
│       │   └── App.css
│       ├── App.jsx
│       └── index.js
├── model/
│   ├── class_indices.json
│   └── emotion_model.h5
├── .gitignore
├── requirements.txt
├── start-dev.bat
└── README.md
```

## Setup

### 1. Clone repository

```bash
git clone https://github.com/crewpucz/facial-emotion-recognition.git
cd facial-emotion-recognition
```

### 2. Backend

```bash
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

### 3. Frontend

```bash
cd frontend
npm install
```

## Menjalankan

### Opsi 1: Script (Windows)

```bash
.\start-dev.bat
```

### Opsi 2: Manual (2 terminal)

**Terminal 1 — Backend:**
```bash
venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

Buka `http://localhost:3000` di browser.

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/` | Health check |
| GET | `/health` | Status model |
| POST | `/predict` | Upload gambar → prediksi emosi |
| POST | `/predict-base64` | Kirim base64 → prediksi emosi |

API docs (Swagger): `http://localhost:8000/docs`

## Tech Stack

- **Backend:** FastAPI, TensorFlow, OpenCV
- **Frontend:** React, Axios, react-webcam
- **Model:** CNN trained on FER-2013 dataset
