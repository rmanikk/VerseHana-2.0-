
import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile

from services.audio.analyzer import analyze_audio


app = FastAPI(
    title="VerseFlow AI",
    description="Music Intelligence Engine for VerseHana",
    version="1.0.0",
)


ALLOWED_EXTENSIONS = {
    ".wav",
    ".mp3",
    ".flac",
    ".ogg",
    ".m4a",
}


@app.get("/")
async def root():
    return {
        "service": "VerseFlow AI",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "verseflow-ai",
    }


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    extension = Path(file.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported audio format.",
        )

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            suffix=extension,
            delete=False,
        ) as temp_file:
            temp_path = temp_file.name

            while chunk := await file.read(1024 * 1024):
                temp_file.write(chunk)

        result = analyze_audio(temp_path)

        return {
            "status": "success",
            "features": result,
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=422,
            detail="Audio analysis failed. Check the uploaded audio file.",
        )

    finally:
        await file.close()

        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
