import pickle
import re
from pathlib import Path
import os

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences

# locate model directory: allow MODEL_DIR env var, or support both 'model' and 'models' folders
MODEL_DIR = None
if os.environ.get("MODEL_DIR"):
    MODEL_DIR = Path(os.environ["MODEL_DIR"]).expanduser()
else:
    for candidate in (Path(__file__).parent / "model", Path(__file__).parent / "models"):
        if candidate.exists():
            MODEL_DIR = candidate
            break
# fallback to the original path (will produce a clear error later if missing)
if MODEL_DIR is None:
    MODEL_DIR = Path(__file__).parent / "model"

MAXLEN = 200  # must match the padding length used during training

app = FastAPI(title="Sentiment Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # fine for a local demo, lock this down for real deployments
    allow_methods=["*"],
    allow_headers=["*"],
)

# load model and tokenizer with helpful error messages
model_path = MODEL_DIR / "sentiment_model.keras"
tokenizer_path = MODEL_DIR / "tokenizer.pkl"

try:
    model = load_model(model_path)
except Exception as e:
    raise RuntimeError(f"Failed to load model from {model_path!s}: {e}\n\nExpected a .keras file (zip) or a SavedModel directory. If your file is named differently, either set the MODEL_DIR environment variable or place the model under Backend\\model or Backend\\models.")

try:
    with open(tokenizer_path, "rb") as f:
        tokenizer = pickle.load(f)
except Exception as e:
    raise RuntimeError(f"Failed to load tokenizer from {tokenizer_path!s}: {e}\n\nMake sure tokenizer.pkl exists in the same model folder as the model.")


class ReviewInput(BaseModel):
    text: str


def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"<.*?>", " ", text)          # strip stray html tags
    text = re.sub(r"[^a-z0-9'\s]", " ", text)    # drop punctuation
    text = re.sub(r"\s+", " ", text).strip()
    return text


@app.get("/")
def root():
    return {"status": "sentiment API is running"}


@app.post("/predict")
def predict(review: ReviewInput):
    text = review.text.strip()

    if not text:
        raise HTTPException(status_code=400, detail="text field is empty")

    cleaned = clean_text(text)
    sequence = tokenizer.texts_to_sequences([cleaned])
    padded = pad_sequences(sequence, maxlen=MAXLEN, padding="post", truncating="post")

    raw_score = float(model.predict(padded, verbose=0)[0][0])

    sentiment = "positive" if raw_score >= 0.5 else "negative"
    confidence = raw_score if sentiment == "positive" else 1 - raw_score

    return {
        "sentiment": sentiment,
        "confidence": round(confidence, 4),
        "raw_score": round(raw_score, 4),
    }