from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import numpy as np
import cv2
import tensorflow as tf
from PIL import Image
import io
import json
import os
import base64

# ── Load model & config saat startup ─────────────────────────────────────────
MODEL_PATH        = "model/emotion_model.h5"
CLASS_INDICES_PATH = "model/class_indices.json"

model       = None
idx_to_class = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, idx_to_class

    print("Loading emotion model...")
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model tidak ditemukan: {MODEL_PATH}")
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"✅ Model loaded! Input shape: {model.input_shape}")

    print("Loading class indices...")
    if not os.path.exists(CLASS_INDICES_PATH):
        raise FileNotFoundError(f"class_indices.json tidak ditemukan: {CLASS_INDICES_PATH}")
    with open(CLASS_INDICES_PATH, "r") as f:
        idx_to_class = json.load(f)
    # Key dari JSON adalah string, konversi ke int
    idx_to_class = {int(k): v for k, v in idx_to_class.items()}
    print(f"✅ Classes: {idx_to_class}")

    yield  # App berjalan di sini

    print("Shutting down...")


# ── Inisialisasi FastAPI ──────────────────────────────────────────────────────
app = FastAPI(
    title="Emotion Detector API",
    description="Real-time facial emotion detection menggunakan CNN",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Ganti dengan domain React kamu saat production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Face detector (Haar Cascade) ──────────────────────────────────────────────
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# ── Emoji mapping ─────────────────────────────────────────────────────────────
EMOJI_MAP = {
    "angry":    "😠",
    "disgust":  "🤢",
    "fear":     "😨",
    "happy":    "😊",
    "neutral":  "😐",
    "sad":      "😢",
    "surprise": "😲",
}


# ── Helper functions ──────────────────────────────────────────────────────────
def preprocess_face(face_gray: np.ndarray) -> np.ndarray:
    """Resize dan normalisasi wajah untuk dimasukkan ke model."""
    face_resized = cv2.resize(face_gray, (48, 48))
    face_normalized = face_resized.astype("float32") / 255.0
    return face_normalized.reshape(1, 48, 48, 1)


def decode_image(image_bytes: bytes) -> np.ndarray:
    """Decode bytes gambar menjadi numpy array BGR."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Gagal membaca gambar")
    return img


def detect_and_predict(img_bgr: np.ndarray):
    """Deteksi wajah dan prediksi emosi."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.2,
        minNeighbors=8,
        minSize=(80, 80)
    )

    results = []
    for (x, y, w, h) in faces:
        face_roi = gray[y:y+h, x:x+w]
        face_input = preprocess_face(face_roi)

        predictions = model.predict(face_input, verbose=0)[0]
        pred_idx    = int(np.argmax(predictions))
        emotion     = idx_to_class[pred_idx].lower()
        confidence  = float(np.max(predictions))

        # Semua probabilitas per emosi
        all_probs = {
            idx_to_class[i].lower(): round(float(predictions[i]) * 100, 2)
            for i in range(len(predictions))
        }

        results.append({
            "emotion":     emotion,
            "emoji":       EMOJI_MAP.get(emotion, "❓"),
            "confidence":  round(confidence * 100, 2),
            "all_probs":   all_probs,
            "box": {
                "x": int(x), "y": int(y),
                "w": int(w), "h": int(h)
            }
        })

    return results


# ── Endpoints ──────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "message": "Emotion Detector API is running 🚀",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "classes": list(idx_to_class.values()) if idx_to_class else []
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Upload gambar (JPEG/PNG) → deteksi wajah → prediksi emosi.
    Mengembalikan daftar wajah yang terdeteksi beserta emosi & confidence-nya.
    """
    # Validasi tipe file
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(
            status_code=400,
            detail=f"Tipe file tidak didukung: {file.content_type}. Gunakan JPEG atau PNG."
        )

    try:
        image_bytes = await file.read()
        img_bgr     = decode_image(image_bytes)
        results     = detect_and_predict(img_bgr)

        return {
            "success":     True,
            "faces_found": len(results),
            "faces":       results
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.post("/predict-base64")
async def predict_base64(payload: dict):
    """
    Alternatif endpoint — terima gambar sebagai base64 string.
    Cocok untuk streaming webcam dari React (kirim frame sebagai base64).

    Body: { "image": "<base64 string>" }
    """
    if "image" not in payload:
        raise HTTPException(status_code=400, detail="Field 'image' tidak ditemukan")

    try:
        # Hapus prefix data URL jika ada (misal: "data:image/jpeg;base64,...")
        b64_data = payload["image"]
        if "," in b64_data:
            b64_data = b64_data.split(",")[1]

        image_bytes = base64.b64decode(b64_data)
        img_bgr     = decode_image(image_bytes)
        results     = detect_and_predict(img_bgr)

        return {
            "success":     True,
            "faces_found": len(results),
            "faces":       results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
