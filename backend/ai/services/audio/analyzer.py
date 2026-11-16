
from pathlib import Path

from services.audio.loader import load_audio
from services.audio.preprocessing import normalize_audio
from services.audio.features import extract_audio_features


def analyze_audio(file_path: str) -> dict:
    """
    Load audio and extract musical features.
    """

    audio_path = Path(file_path)

    audio, sample_rate = load_audio(file_path)
    audio = normalize_audio(audio)

    features = extract_audio_features(audio, sample_rate)

    return {
        "file_name": audio_path.name,
        "sample_rate": sample_rate,
        **features,
    }
