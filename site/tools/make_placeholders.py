#!/usr/bin/env python3
"""Generate visually distinct placeholder art for every image slot.

Final art is produced with chatopt-imagegen using the prompts in
IMAGE_PROMPTS.md; these placeholders keep the layout shippable and QA-able
(each has its own accent color, motif, and the product name readable on a
label) until the real renders are dropped in at the same paths.
"""

import math
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "images")


def font(size, bold=False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def blueprint_base(w, h, accent):
    img = Image.new("RGB", (w, h), (242, 243, 245))
    d = ImageDraw.Draw(img)
    grid = (210, 216, 222)
    for x in range(0, w, 32):
        d.line([(x, 0), (x, h)], fill=grid, width=1)
    for y in range(0, h, 32):
        d.line([(0, y), (w, y)], fill=grid, width=1)
    d.rectangle([0, 0, w - 1, h - 1], outline=(28, 33, 38), width=6)
    d.rectangle([0, 0, w, 14], fill=hex_rgb(accent))
    return img, d


def draw_motif(d, cx, cy, r, accent, motif):
    a = hex_rgb(accent)
    ink = (28, 33, 38)
    if motif == "talon":
        d.arc([cx - r, cy - r, cx + r, cy + r], 200, 340, fill=a, width=18)
        d.polygon([(cx - r * 0.2, cy), (cx + r * 0.5, cy - r * 0.6), (cx + r * 0.25, cy + r * 0.45)], fill=ink)
    elif motif == "contour":
        for i in range(5):
            rr = r - i * r // 6
            d.ellipse([cx - rr, cy - rr * 0.7, cx + rr, cy + rr * 0.7], outline=a if i % 2 else ink, width=8)
    elif motif == "flame":
        d.polygon([(cx, cy - r), (cx + r * 0.55, cy + r * 0.6), (cx - r * 0.55, cy + r * 0.6)], outline=a, width=12)
        d.polygon([(cx, cy - r * 0.45), (cx + r * 0.3, cy + r * 0.5), (cx - r * 0.3, cy + r * 0.5)], fill=ink)
    elif motif == "route":
        pts = [(cx - r, cy + r * 0.5), (cx - r * 0.3, cy - r * 0.4), (cx + r * 0.3, cy + r * 0.2), (cx + r, cy - r * 0.6)]
        d.line(pts, fill=a, width=14)
        for p in pts:
            d.ellipse([p[0] - 16, p[1] - 16, p[0] + 16, p[1] + 16], fill=ink)
    elif motif == "pulse":
        pts = []
        for i in range(40):
            x = cx - r + (2 * r) * i / 39
            y = cy + (math.sin(i / 3.2) * r * 0.45 if 12 < i < 28 else 0)
            pts.append((x, y))
        d.line(pts, fill=a, width=12)
        d.ellipse([cx - 14, cy - 14, cx + 14, cy + 14], fill=ink)
    elif motif == "ledger":
        for i in range(4):
            y = cy - r * 0.6 + i * r * 0.4
            d.line([(cx - r * 0.8, y), (cx + r * 0.8, y)], fill=ink if i % 2 else a, width=12)
        d.line([(cx - r * 0.1, cy - r * 0.8), (cx + r * 0.2, cy + r * 0.7)], fill=a, width=10)
    elif motif == "crate":
        d.rectangle([cx - r * 0.8, cy - r * 0.55, cx + r * 0.8, cy + r * 0.55], outline=ink, width=12)
        d.line([(cx - r * 0.8, cy - r * 0.1), (cx + r * 0.8, cy - r * 0.1)], fill=a, width=10)
        d.rectangle([cx - r * 0.25, cy - r * 0.22, cx + r * 0.25, cy - r * 0.0], fill=a)
    elif motif == "bench":
        d.line([(cx - r * 0.8, cy + r * 0.5), (cx + r * 0.8, cy + r * 0.5)], fill=ink, width=14)
        d.line([(cx - r * 0.55, cy + r * 0.5), (cx - r * 0.55, cy - r * 0.3)], fill=a, width=12)
        d.line([(cx + r * 0.55, cy + r * 0.5), (cx + r * 0.55, cy - r * 0.3)], fill=a, width=12)
        d.ellipse([cx - 24, cy - r * 0.55, cx + 24, cy - r * 0.55 + 48], outline=ink, width=10)
    elif motif == "glow":
        d.ellipse([cx - r * 0.7, cy - r * 0.7, cx + r * 0.7, cy + r * 0.7], outline=a, width=16)
        d.ellipse([cx - r * 0.35, cy - r * 0.35, cx + r * 0.35, cy + r * 0.35], fill=ink)
    elif motif == "moon":
        d.ellipse([cx - r * 0.7, cy - r * 0.7, cx + r * 0.7, cy + r * 0.7], fill=ink)
        d.ellipse([cx - r * 0.35, cy - r * 0.85, cx + r * 0.95, cy + r * 0.45], fill=(242, 243, 245))
        d.ellipse([cx - r * 0.7, cy - r * 0.7, cx + r * 0.7, cy + r * 0.7], outline=a, width=12)
    elif motif == "compass":
        d.ellipse([cx - r * 0.75, cy - r * 0.75, cx + r * 0.75, cy + r * 0.75], outline=ink, width=12)
        d.polygon([(cx, cy - r * 0.6), (cx + r * 0.18, cy), (cx, cy + r * 0.6), (cx - r * 0.18, cy)], fill=a)
    elif motif == "swarm":
        for i, (dx, dy) in enumerate([(-0.6, -0.4), (0.5, -0.5), (-0.2, 0.1), (0.6, 0.3), (-0.65, 0.5), (0.1, 0.6)]):
            x, y = cx + dx * r, cy + dy * r
            s = 26 if i % 2 else 38
            d.rectangle([x - s, y - s, x + s, y + s], fill=hex_rgb(accent) if i % 2 else ink)
        d.line([(cx - r * 0.6, cy - r * 0.4), (cx - r * 0.2, cy + r * 0.1), (cx + r * 0.5, cy - r * 0.5)], fill=ink, width=6)


def label(d, w, h, name, code, accent):
    f_big = font(int(h * 0.055), bold=True)
    f_small = font(int(h * 0.027))
    band_h = int(h * 0.18)
    d.rectangle([0, h - band_h, w, h], fill=(28, 33, 38))
    d.text((28, h - band_h + band_h * 0.16), name.upper(), font=f_big, fill=(255, 255, 255))
    d.text((28, h - band_h + band_h * 0.62), f"{code}  ·  PLACEHOLDER — FINAL ART VIA IMAGE_PROMPTS.MD",
           font=f_small, fill=hex_rgb(accent))


def make(path, w, h, name, code, accent, motif):
    img, d = blueprint_base(w, h, accent)
    draw_motif(d, w // 2, int(h * 0.42), int(min(w, h) * 0.3), accent, motif)
    f_tag = font(int(h * 0.024))
    d.text((24, 26), "OPENTALON // UNIT SCHEMATIC", font=f_tag, fill=(93, 103, 112))
    label(d, w, h, name, code, accent)
    out = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img.save(out, optimize=True)
    print("wrote", out)


SLOTS = [
    ("hero.png", 1536, 1024, "OpenTalon — Integration Bay 4", "FIG.01", "#e84e00", "talon"),
    ("products/talon-recon-audit.png", 1024, 1024, "Talon Recon Audit", "OT-EA-001", "#f95d0a", "talon"),
    ("products/drift-map-audit.png", 1024, 1024, "Drift Map Audit", "OT-EA-002", "#0a84c1", "contour"),
    ("products/hard-burn-review.png", 1024, 1024, "Hard Burn Review", "OT-EA-003", "#b8231f", "flame"),
    ("products/wayfinder-deployment.png", 1024, 1024, "Wayfinder Deployment", "OT-AD-101", "#e8a013", "route"),
    ("products/cindertrace-deployment.png", 1024, 1024, "Cindertrace Deployment", "OT-AD-102", "#7a3df0", "pulse"),
    ("products/ledgerhawk-deployment.png", 1024, 1024, "Ledgerhawk Deployment", "OT-AD-103", "#0fae7c", "ledger"),
    ("products/edge-crate-mk2.png", 1024, 1024, "Edge Crate Mk.II", "OT-FK-201", "#5b6770", "crate"),
    ("products/null-g-bench-kit.png", 1024, 1024, "Null-G Bench Kit", "OT-FK-202", "#1f7ab8", "bench"),
    ("products/glow-protocol-dossier.png", 1024, 1024, "Glow Protocol Dossier", "OT-GD-301", "#d4317a", "glow"),
    ("products/night-shift-playbook.png", 1024, 1024, "Night Shift Playbook", "OT-GD-302", "#3b3f8f", "moon"),
    ("projects/wayfinder-7.png", 1536, 1024, "WAYFINDER-7", "LOG-W7", "#e8a013", "compass"),
    ("projects/cindertrace.png", 1536, 1024, "CINDERTRACE", "LOG-CT", "#7a3df0", "pulse"),
    ("projects/night-market-ledger.png", 1536, 1024, "NIGHT MARKET LEDGER", "LOG-NML", "#0fae7c", "swarm"),
]

if __name__ == "__main__":
    for slot in SLOTS:
        make(*slot)
