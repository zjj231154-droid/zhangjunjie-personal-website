from __future__ import annotations

import math
import os
import random
import struct
import zlib


ROOT = os.path.dirname(os.path.dirname(__file__))
ASSETS = os.path.join(ROOT, "public", "assets")
os.makedirs(ASSETS, exist_ok=True)


def write_png(path: str, width: int, height: int, pixels: list[tuple[int, int, int, int]]) -> None:
    def chunk(kind: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + kind
            + data
            + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
        )

    raw = bytearray()
    for y in range(height):
        raw.append(0)
        row_start = y * width
        for r, g, b, a in pixels[row_start : row_start + width]:
            raw.extend((r, g, b, a))

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")

    with open(path, "wb") as f:
        f.write(png)


def blend(c1, c2, t):
    return tuple(int(c1[i] * (1 - t) + c2[i] * t) for i in range(3))


def project_image(name: str, palette: list[tuple[int, int, int]], seed: int) -> None:
    random.seed(seed)
    w, h = 1320, 820
    pixels = []
    for y in range(h):
        for x in range(w):
            nx = x / w
            ny = y / h
            wave = (math.sin(nx * 9 + ny * 4 + seed) + 1) / 2
            base = blend(palette[0], palette[1], min(1, max(0, nx * 0.7 + ny * 0.25)))
            glow = blend(base, palette[2], wave * 0.28)
            vignette = 1 - min(0.68, ((nx - 0.5) ** 2 + (ny - 0.45) ** 2) * 1.2)
            r, g, b = [int(v * vignette) for v in glow]

            grid = (x % 74 < 2 and y > h * 0.18) or (y % 74 < 2 and x > w * 0.1)
            if grid:
                r, g, b = [min(255, int(v + 34)) for v in (r, g, b)]

            if 160 < x < 1160 and 160 < y < 660:
                border = x < 166 or x > 1154 or y < 166 or y > 654
                if border:
                    r, g, b = [min(255, int(v + 58)) for v in (r, g, b)]
                else:
                    r, g, b = [int(v * 0.62 + 18) for v in (r, g, b)]

            for cx, cy, radius, boost in [
                (340, 310, 130, 66),
                (700, 430, 180, 48),
                (980, 300, 105, 70),
            ]:
                d = math.hypot(x - cx, y - cy)
                if d < radius:
                    k = (1 - d / radius) * boost
                    r = min(255, int(r + k))
                    g = min(255, int(g + k * 0.85))
                    b = min(255, int(b + k * 1.05))

            pixels.append((r, g, b, 255))
    write_png(os.path.join(ASSETS, name), w, h, pixels)


def portrait() -> None:
    w, h = 860, 1080
    pixels = []
    for y in range(h):
        for x in range(w):
            nx = x / w
            ny = y / h
            r, g, b = blend((12, 15, 20), (32, 42, 48), ny * 0.9)
            beam = max(0, 1 - abs(nx - 0.58) * 2.4) * max(0, 1 - ny * 0.65)
            r += int(beam * 45)
            g += int(beam * 62)
            b += int(beam * 70)

            head = ((x - 430) / 116) ** 2 + ((y - 300) / 145) ** 2 < 1
            torso = ((x - 430) / 245) ** 2 + ((y - 705) / 335) ** 2 < 1
            neck = 360 < x < 500 and 395 < y < 555
            if head or torso or neck:
                shade = 44 + int(26 * (1 - nx) + 18 * math.sin(ny * 8))
                r, g, b = shade, shade + 12, shade + 19
            if 180 < x < 680 and 720 < y < 736:
                r, g, b = 154, 231, 220
            if 130 < x < 730 and 150 < y < 930 and (x % 92 < 2 or y % 92 < 2):
                r, g, b = max(r, 54), max(g, 66), max(b, 72)
            pixels.append((min(r, 255), min(g, 255), min(b, 255), 255))
    write_png(os.path.join(ASSETS, "zjj-portrait.png"), w, h, pixels)


project_image("project-walulu-sop.png", [(9, 14, 20), (21, 60, 68), (153, 239, 217)], 4)
project_image("project-walulu-miniapp.png", [(12, 13, 24), (46, 48, 93), (201, 172, 255)], 9)
project_image("project-ai-brand-system.png", [(15, 18, 18), (65, 58, 42), (245, 221, 160)], 14)
portrait()
