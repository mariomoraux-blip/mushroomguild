#!/usr/bin/env python3
"""Audio P0 (cambio 049): de las tomas de assets/audio/source/ a public/assets/audio/.

Sin dependencias: afconvert (macOS) decodifica el MP3 y codifica el AAC; lo demás es Python puro.
Proceso por toma: paso alto a 80 Hz, recorte al largo del catálogo, fundidos de 10 ms y normalización
(efectos y cortinas a -18 LUFS de máximo momentáneo, ambiente a -30 LUFS integrado), con el pico en -1 dBFS o menos.
El ambiente cierra el loop con un cruce de 1 s. Las tomas elegidas están en assets/audio/takes.json.

Uso: python3 scripts/build-audio.py
"""
import array
import json
import math
import os
import subprocess
import sys
import tempfile
import wave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, 'assets', 'audio', 'source')
TAKES = os.path.join(ROOT, 'assets', 'audio', 'takes.json')
OUT = os.path.join(ROOT, 'public', 'assets', 'audio')

# Largo del catálogo (docs/sound-design.md) en segundos.
SPRITE = {
    'ui-tap': 0.08,
    'ui-tap-primary': 0.15,
    'ui-select': 0.08,
    'ui-sheet-open': 0.25,
    'ui-sheet-close': 0.2,
    'sfx-weave': 0.5,
    'sfx-decompose': 0.6,
    'sfx-revive': 0.9,
    'sfx-awaken': 1.5,
    'sfx-spores': 0.8,
    'sfx-recruit': 0.7,
    'sfx-month-end': 0.9,
    'sfx-invalid': 0.2,
}
STINGERS = {'stg-victory': 4.0, 'stg-defeat': 3.5}
AMBIENCE = 'amb-clearing'

SFX_LUFS = -18.0
AMB_LUFS = -30.0
PEAK = 10 ** (-1.0 / 20)
FADE = 0.010
GAP = 0.25
LEAD = 0.10
LOOP_XFADE = 1.0


# ─── Lectura y escritura ──────────────────────────────────────────────────────
def decode(path):
    """MP3 → canales de floats en [-1, 1] y frecuencia de muestreo."""
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, 'a.wav')
        subprocess.run(['afconvert', '-f', 'WAVE', '-d', 'LEI16', path, wav], check=True)
        with wave.open(wav) as w:
            n, ch, sr = w.getnframes(), w.getnchannels(), w.getframerate()
            data = array.array('h', w.readframes(n))
    return [[data[i] / 32768 for i in range(c, len(data), ch)] for c in range(ch)], sr


def write_wav(path, chans, sr):
    n = len(chans[0])
    out = array.array('h', bytes(2 * n * len(chans)))
    for c, x in enumerate(chans):
        for i, v in enumerate(x):
            out[i * len(chans) + c] = max(-32767, min(32767, round(v * 32767)))
    with wave.open(path, 'wb') as w:
        w.setnchannels(len(chans))
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(out.tobytes())


def encode(chans, sr, path, bitrate):
    """WAV temporal → AAC en .m4a con afconvert."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, 'a.wav')
        write_wav(wav, chans, sr)
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', str(bitrate), '-q', '127', wav, path], check=True)


# ─── Filtros ──────────────────────────────────────────────────────────────────
def biquad(x, b, a):
    b0, b1, b2 = (v / a[0] for v in b)
    a1, a2 = a[1] / a[0], a[2] / a[0]
    y = [0.0] * len(x)
    x1 = x2 = y1 = y2 = 0.0
    for i, v in enumerate(x):
        o = b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        x2, x1, y2, y1 = x1, v, y1, o
        y[i] = o
    return y


def high_pass(sr, fc, q):
    w = 2 * math.pi * fc / sr
    cw, alpha = math.cos(w), math.sin(w) / (2 * q)
    return ((1 + cw) / 2, -(1 + cw), (1 + cw) / 2), (1 + alpha, -2 * cw, 1 - alpha)


def high_shelf(sr, fc, q, gain_db):
    A = 10 ** (gain_db / 40)
    w = 2 * math.pi * fc / sr
    cw, alpha = math.cos(w), math.sin(w) / (2 * q)
    s = 2 * math.sqrt(A) * alpha
    b = (A * ((A + 1) + (A - 1) * cw + s), -2 * A * ((A - 1) + (A + 1) * cw), A * ((A + 1) + (A - 1) * cw - s))
    a = ((A + 1) - (A - 1) * cw + s, 2 * ((A - 1) - (A + 1) * cw), (A + 1) - (A - 1) * cw - s)
    return b, a


def k_weight(x, sr):
    """Ponderación K de BS.1770 (las dos etapas, como pyloudnorm)."""
    x = biquad(x, *high_shelf(sr, 1681.974450955533, 0.7071752369554196, 3.999843853973347))
    return biquad(x, *high_pass(sr, 38.13547087602444, 0.5003270373238773))


# ─── Sonoridad ────────────────────────────────────────────────────────────────
def block_powers(chans, sr, size, hop):
    """Potencia media (suma de canales) de bloques de `size` s cada `hop` s; rellena con silencio si es corto."""
    ks = [k_weight(c, sr) for c in chans]
    n, bs, hs = len(ks[0]), round(size * sr), round(hop * sr)
    squares = [[v * v for v in k] for k in ks]
    prefix = []
    for sq in squares:
        p, acc = [0.0], 0.0
        for v in sq:
            acc += v
            p.append(acc)
        prefix.append(p)
    starts = range(0, max(1, n - bs + 1), hs)
    return [sum(p[min(s + bs, n)] - p[s] for p in prefix) / bs for s in starts]


def lufs(power):
    return -0.691 + 10 * math.log10(power) if power > 0 else -120.0


def momentary_max(chans, sr):
    return max(lufs(p) for p in block_powers(chans, sr, 0.4, 0.1))


def integrated(chans, sr):
    blocks = [p for p in block_powers(chans, sr, 0.4, 0.1) if lufs(p) > -70]
    rel = lufs(sum(blocks) / len(blocks)) - 10
    gated = [p for p in blocks if lufs(p) > rel]
    return lufs(sum(gated) / len(gated))


def normalize(chans, measured, target):
    gain = 10 ** ((target - measured) / 20)
    peak = max(max(abs(v) for v in c) for c in chans) * gain
    if peak > PEAK:
        gain *= PEAK / peak
    return [[v * gain for v in c] for c in chans], 20 * math.log10(gain)


# ─── Edición ──────────────────────────────────────────────────────────────────
def trim(chans, sr, length):
    """Desde el primer instante sobre -40 dB del pico (menos 5 ms) hasta `length` s, sin la cola en silencio."""
    env = [max(abs(c[i]) for c in chans) for i in range(len(chans[0]))]
    peak = max(env) or 1.0
    on = next(i for i, v in enumerate(env) if v > peak * 0.01)
    start = max(0, on - round(0.005 * sr))
    end = min(len(env), start + round(length * sr))
    while end > start + 1 and env[end - 1] < peak * 0.001:
        end -= 1
    return [c[start:end] for c in chans]


def fade(chans, sr, seconds=FADE):
    n = round(seconds * sr)
    for c in chans:
        m = min(n, len(c) // 2)
        for i in range(m):
            g = i / m
            c[i] *= g
            c[-1 - i] *= g
    return chans


def loop(chans, sr, xfade=LOOP_XFADE):
    """Cierra el loop: el último segundo se cruza (igual potencia) con el inicio y el corte cae en un cruce por cero."""
    x = chans[0]
    L = round(xfade * sr)
    cut = len(x) - L
    # Corte en el cruce por cero más cercano (±10 ms).
    window = range(max(L, cut - round(0.01 * sr)), min(len(x) - 1, cut + round(0.01 * sr)))
    cut = min(window, key=lambda i: abs(x[i]), default=cut)
    L = len(x) - cut
    out = x[:cut]
    for i in range(L):
        t = i / L
        out[i] = x[i] * math.sin(t * math.pi / 2) + x[cut + i] * math.cos(t * math.pi / 2)
    return [out]


def mono(chans):
    if len(chans) == 1:
        return chans
    return [[sum(v) / len(chans) for v in zip(*chans)]]


def take_path(sound, n):
    return os.path.join(SOURCE, sound, f'{sound}-{n}.mp3')


def hp(chans, sr):
    return [biquad(c, *high_pass(sr, 80, math.sqrt(0.5))) for c in chans]


def process(sound, n, length, stereo=False):
    chans, sr = decode(take_path(sound, n))
    chans = chans if stereo else mono(chans)
    chans = fade(trim(hp(chans, sr), sr, length), sr)
    chans, gain = normalize(chans, momentary_max(chans, sr), SFX_LUFS)
    print(f'  {sound}-{n}: {len(chans[0]) / sr:.3f} s, {gain:+.1f} dB, {momentary_max(chans, sr):.1f} LUFS')
    return chans, sr


def main():
    takes = json.load(open(TAKES))
    os.makedirs(OUT, exist_ok=True)

    print('Sprite')
    sprite, sr, t, sounds = [], None, LEAD, {}
    for sound, length in SPRITE.items():
        for n in takes[sound]:
            (c,), rate = process(sound, n, length)
            if sr is None:
                sr = rate
                sprite = [0.0] * round(LEAD * sr)
            assert rate == sr, f'{sound}: {rate} Hz'
            sounds.setdefault(sound, []).append([round(len(sprite) / sr, 4), round(len(c) / sr, 4)])
            sprite += c + [0.0] * round(GAP * sr)
    encode([sprite], sr, os.path.join(OUT, 'sfx.m4a'), 64000)
    with open(os.path.join(OUT, 'sfx.json'), 'w') as f:
        rows = ',\n'.join(f'  {json.dumps(k)}: {json.dumps(v)}' for k, v in sounds.items())
        f.write(f'{{\n "length": {round(len(sprite) / sr, 4)},\n "sounds": {{\n{rows}\n }}\n}}\n')

    print('Cortinas')
    for sound, length in STINGERS.items():
        chans, rate = process(sound, takes[sound][0], length, stereo=True)
        encode(chans, rate, os.path.join(OUT, 'stingers', f'{sound}.m4a'), 96000)

    print('Ambiente')
    chans, rate = decode(take_path(AMBIENCE, takes[AMBIENCE][0]))
    chans = hp(mono(chans), rate)
    chans, gain = normalize(chans, integrated(chans, rate), AMB_LUFS)
    chans = loop(chans, rate)
    print(f'  {AMBIENCE}-{takes[AMBIENCE][0]}: loop {len(chans[0]) / rate:.2f} s, {gain:+.1f} dB, {integrated(chans, rate):.1f} LUFS')
    encode(chans, rate, os.path.join(OUT, 'ambience', f'{AMBIENCE}.m4a'), 48000)

    total = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(OUT) for f in fs)
    print(f'public/assets/audio: {total / 1024:.0f} KB')


if __name__ == '__main__':
    sys.exit(main())
