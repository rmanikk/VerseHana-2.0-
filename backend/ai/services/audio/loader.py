
from pathlib import Path

import librosa
import numpy as np


TARGET_SAMPLE_RATE = 22050


def load_audio(file_path: str) -> tuple[np.ndarray, int]:
    """
    Load an audio file as mono audio at the target sample rate.
    """

    audio_path = Path(file_path)

    if not audio_path.exists():
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    if not audio_path.is_file():
        raise ValueError("The provided path is not a file.")

    audio, sample_rate = librosa.load(
        str(audio_path),
        sr=TARGET_SAMPLE_RATE,
        mono=True,
    )

    if audio.size == 0:
        raise ValueError("Audio file contains no readable audio.")

    if not np.all(np.isfinite(audio)):
        raise ValueError("Audio contains invalid numeric values.")

    return audio, sample_rate
