import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal

OUT = Path(__file__).resolve().parent.parent / "public" / "audio"
RATE = 48000
rng = np.random.default_rng(7)


def t(seconds: float) -> np.ndarray:
    return np.arange(int(seconds * RATE)) / RATE


def bandpass(x: np.ndarray, low: float, high: float, order: int = 4) -> np.ndarray:
    return signal.sosfilt(signal.butter(order, [low, high], btype="band", fs=RATE, output="sos"), x)


def lowpass(x: np.ndarray, cutoff: float, order: int = 4) -> np.ndarray:
    return signal.sosfilt(signal.butter(order, cutoff, btype="low", fs=RATE, output="sos"), x)


def sweep(f0: float, f1: float, seconds: float) -> np.ndarray:
    freq = f0 * (f1 / f0) ** (t(seconds) / seconds)
    return np.sin(2 * np.pi * np.cumsum(freq) / RATE)


def save(name: str, x: np.ndarray, peak: float = 0.9) -> None:
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    fade = min(len(x), int(0.004 * RATE))
    x[-fade:] *= np.linspace(1, 0, fade)
    sf.write(OUT / f"{name}.wav", x.astype(np.float32), RATE)


def pop() -> np.ndarray:
    n = t(0.12)
    body = sweep(950, 420, 0.12) * np.exp(-n / 0.028)
    click = np.zeros_like(n)
    click[: int(0.003 * RATE)] = rng.standard_normal(int(0.003 * RATE)) * 0.3
    return body + bandpass(click, 2000, 8000)


def tick(freq: float = 4200) -> np.ndarray:
    n = t(0.03)
    noise = bandpass(rng.standard_normal(len(n)), 3000, 12000) * np.exp(-n / 0.002)
    return np.sin(2 * np.pi * freq * n) * np.exp(-n / 0.004) * 0.6 + noise * 0.5


def tap() -> np.ndarray:
    n = t(0.09)
    return np.sin(2 * np.pi * 1500 * n) * np.exp(-n / 0.008) * 0.5 + np.sin(2 * np.pi * 170 * n) * np.exp(-n / 0.02)


def shutter() -> np.ndarray:
    n = t(0.16)
    noise = bandpass(rng.standard_normal(len(n)), 900, 7000)
    env = np.exp(-n / 0.008) + 0.8 * np.exp(-np.clip(n - 0.07, 0, None) / 0.012) * (n >= 0.07)
    return noise * env + np.sin(2 * np.pi * 260 * n) * np.exp(-n / 0.015) * 0.4


def whoosh(seconds: float = 0.6, low: float = 350, high: float = 2600) -> np.ndarray:
    noise = rng.standard_normal(int(seconds * RATE))
    freqs, times, spec = signal.stft(noise, fs=RATE, nperseg=1024)
    progress = times / seconds
    center = low * (high / low) ** np.sin(np.pi * np.clip(progress, 0, 1) * 0.85)
    mask = np.exp(-((np.log(freqs[:, None] + 1) - np.log(center[None, :])) ** 2) / 0.35)
    _, x = signal.istft(spec * mask, fs=RATE, nperseg=1024)
    x = x[: int(seconds * RATE)]
    env = np.sin(np.pi * np.clip(t(seconds)[: len(x)] / seconds, 0, 1)) ** 2
    return x * env


def ding() -> np.ndarray:
    n = t(1.3)
    tone = sum(a * np.sin(2 * np.pi * f * n) * np.exp(-n / d) for f, a, d in [(1046.5, 1, 0.45), (2093, 0.3, 0.25), (3139.5, 0.12, 0.15)])
    return tone * np.clip(n / 0.004, 0, 1)


def riser() -> np.ndarray:
    n = t(2.0)
    x = sweep(220, 660, 2.0) * (0.85 + 0.15 * np.sin(2 * np.pi * 9 * n))
    return x * np.clip(n / 1.6, 0, 1) ** 2 * np.exp(-np.clip(n - 1.85, 0, None) / 0.03)


def blip() -> np.ndarray:
    parts = []
    for freq in (660, 990):
        n = t(0.05)
        parts.append(signal.square(2 * np.pi * freq * n) * np.exp(-n / 0.03))
    return np.concatenate(parts) * 0.5


def note(freq: float, seconds: float, attack: float, release: float, detune_cents: float) -> np.ndarray:
    n = t(seconds)
    ratio = 2 ** (detune_cents / 1200)
    tone = sum(np.sin(2 * np.pi * freq * r * n + p) for r, p in [(1, 0), (ratio, 1.3), (1 / ratio, 2.1)])
    tone += 0.25 * np.sin(2 * np.pi * freq * 2 * n)
    env = np.clip(n / attack, 0, 1) * np.clip((seconds - n) / release, 0, 1)
    return tone * env


def hz(midi: int) -> float:
    return 440 * 2 ** ((midi - 69) / 12)


def music(seconds: float = 90) -> np.ndarray:
    bpm = 84
    beat = 60 / bpm
    chord_len = beat * 8
    chords = [[53, 57, 60, 64, 67], [57, 60, 64, 67], [50, 53, 57, 60, 64], [46, 50, 53, 57]]
    total = int(seconds * RATE)
    left = np.zeros(total)
    right = np.zeros(total)
    start = 0.0
    k = 0
    while start < seconds:
        chord = chords[k % len(chords)]
        span = chord_len + 1.6
        i0 = int(start * RATE)
        for m in chord:
            for side, cents in ((left, 5), (right, -5)):
                x = note(hz(m), span, 1.4, 1.6, cents) * 0.12
                side[i0 : i0 + len(x)] += x[: total - i0]
        bass = note(hz(chord[0] - 12), span, 0.6, 1.4, 0) * 0.22
        left[i0 : i0 + len(bass)] += bass[: total - i0]
        right[i0 : i0 + len(bass)] += bass[: total - i0]
        for step in range(8):
            m = chord[(step * 2) % len(chord)] + 12
            at = int((start + step * beat) * RATE)
            if at >= total:
                break
            n = t(0.9)
            pluck = np.sin(2 * np.pi * hz(m) * n) * np.exp(-n / 0.22) * 0.08
            pan = 0.5 + 0.35 * np.sin(step)
            end = min(total, at + len(pluck))
            left[at:end] += pluck[: end - at] * (1 - pan)
            right[at:end] += pluck[: end - at] * pan
        start += chord_len
        k += 1
    stereo = np.stack([lowpass(left, 2200), lowpass(right, 2200)], axis=1)
    delay = int(beat * 0.75 * RATE)
    echo = np.zeros_like(stereo)
    echo[delay:] = stereo[:-delay, ::-1] * 0.25
    stereo += echo
    fade_in = np.clip(t(seconds) / 2.5, 0, 1)[:, None]
    stereo *= fade_in
    return stereo / np.max(np.abs(stereo)) * 0.7


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    save("pop", pop(), 0.8)
    save("tick", tick(), 0.6)
    save("type", tick(2400), 0.4)
    save("tap", tap(), 0.8)
    save("shutter", shutter(), 0.8)
    save("whoosh", whoosh(), 0.7)
    save("swish", whoosh(0.3, 900, 4000), 0.5)
    save("ding", ding(), 0.7)
    save("riser", riser(), 0.5)
    save("blip", blip(), 0.5)
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "music.wav"
        sf.write(wav, music().astype(np.float32), RATE)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-b:a", "160k", str(OUT / "music.mp3")], check=True)
    print("sounds written to", OUT)


if __name__ == "__main__":
    main()
