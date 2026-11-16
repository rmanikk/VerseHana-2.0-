
import numpy as np


def normalize_audio(audio: np.ndarray) -> np.ndarray:
    """
    Normalize audio amplitude while preserving silence.
    """

    if audio.size == 0:
        raise ValueError("Audio cannot be empty.")

    if not np.all(np.isfinite(audio)):
        raise ValueError("Audio contains invalid numeric values.")

    peak = float(np.max(np.abs(audio)))

    if peak == 0:
        return audio.copy()

    return (audio / peak).astype(np.float32)


def trim_silence(
    audio: np.ndarray,
    top_db: float = 30.0,
) -> np.ndarray:
    """
    Remove leading and trailing silence.
    """

    import librosa

    if audio.size == 0:
        raise ValueError("Audio cannot be empty.")

    trimmed_audio, _ = librosa.effects.trim(
        audio,
        top_db=top_db,
    )

    return trimmed_audio.astype(np.float32)
