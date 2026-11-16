
import librosa
import numpy as np


def extract_audio_features(
    audio: np.ndarray,
    sample_rate: int,
) -> dict:
    """
    Extract low-level musical features from audio.
    """

    if audio.size == 0:
        raise ValueError("Audio cannot be empty.")

    if sample_rate <= 0:
        raise ValueError("Sample rate must be positive.")

    rms = librosa.feature.rms(y=audio)

    zero_crossing_rate = librosa.feature.zero_crossing_rate(
        y=audio
    )

    spectral_centroid = librosa.feature.spectral_centroid(
        y=audio,
        sr=sample_rate,
    )

    tempo, _ = librosa.beat.beat_track(
        y=audio,
        sr=sample_rate,
    )

    return {
        "duration_seconds": round(
            float(librosa.get_duration(y=audio, sr=sample_rate)), 2
        ),
        "tempo_bpm": round(
            float(np.asarray(tempo).reshape(-1)[0]), 2
        ),
        "rms_energy": round(float(np.mean(rms)), 5),
        "zero_crossing_rate": round(
            float(np.mean(zero_crossing_rate)), 5
        ),
        "spectral_centroid_hz": round(
            float(np.mean(spectral_centroid)), 2
        ),
    }
