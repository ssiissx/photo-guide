"""Draw the home-screen icons: a sunset print on a strip of film.
usage: python tools/make_icons.py   (writes icon-180/192/512.png and icon-maskable-512.png at the repo root)"""
import os
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = 1024  # draw large, then scale down for smooth edges
STRIP, HOLE, PAPER, INK = (42, 33, 27), (236, 226, 208), (250, 245, 235), (43, 28, 24)


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def sunset(w, h):
    im = Image.new('RGB', (w, h))
    d = ImageDraw.Draw(im)
    hz = int(h * .62)
    top, mid, low = (176, 78, 64), (232, 150, 98), (247, 215, 156)
    for y in range(hz):
        t = y / hz
        d.line([(0, y), (w, y)], fill=lerp(top, mid, t / .55) if t < .55 else lerp(mid, low, (t - .55) / .45))
    for y in range(hz, h):
        t = (y - hz) / (h - hz)
        d.line([(0, y), (w, y)], fill=lerp((214, 140, 96), (78, 46, 44), t))
    glow = Image.new('L', (w, h), 0)
    gd = ImageDraw.Draw(glow)
    cx, r = int(w * .6), int(w * .13)
    gd.ellipse([cx - r * 2, hz - r * 2, cx + r * 2, hz + r * 2], fill=120)
    glow = glow.filter(ImageFilter.GaussianBlur(r * .7))
    im = Image.composite(Image.new('RGB', (w, h), (255, 228, 170)), im, glow)
    d = ImageDraw.Draw(im)
    d.pieslice([cx - r, hz - r, cx + r, hz + r], 180, 360, fill=(255, 241, 206))
    for i in range(7):
        ww = int(r * (1 - i * .12))
        y = hz + int(h * .045) + i * int(h * .045)
        d.rounded_rectangle([cx - ww, y, cx + ww, y + int(h * .014)], radius=4, fill=lerp((255, 224, 168), (214, 140, 96), i / 7))
    d.polygon([(0, int(h * .7)), (int(w * .22), int(h * .68)), (int(w * .42), int(h * .78)), (int(w * .5), h), (0, h)], fill=INK)
    px, py, ph = int(w * .18), int(h * .69), int(h * .2)
    d.rounded_rectangle([px - ph * .11, py - ph * .78, px + ph * .11, py - ph * .38], radius=int(ph * .06), fill=INK)
    d.ellipse([px - ph * .085, py - ph * .97, px + ph * .085, py - ph * .8], fill=INK)
    d.line([(px + ph * .09, py - ph * .74), (px + ph * .22, py - ph * 1.0)], fill=INK, width=int(ph * .065))
    d.rectangle([px - ph * .09, py - ph * .4, px - ph * .01, py], fill=INK)
    d.rectangle([px + ph * .01, py - ph * .4, px + ph * .09, py], fill=INK)
    return im


def icon(maskable=False):
    im = Image.new('RGB', (S, S), STRIP)
    d = ImageDraw.Draw(im)
    if not maskable:  # sprocket holes along the top and bottom edges
        n, pitch, w = 10, S * .095, S * .055
        x0 = (S - (n - 1) * pitch - w) / 2
        for row in (int(S * .06), int(S * .94) - int(w)):
            for k in range(n):
                x = int(x0 + k * pitch)
                d.rounded_rectangle([x, row, x + int(w), row + int(w)], radius=int(S * .012), fill=HOLE)
    m = int(S * (.2 if maskable else .15))  # maskable keeps the print inside the safe circle
    d.rectangle([m, m, S - m, S - m], fill=PAPER)
    b = int(S * .035)
    inner = sunset(S - 2 * (m + b), S - 2 * (m + b))
    im.paste(inner, (m + b, m + b))
    return im


def main():
    big = icon()
    for size, name in ((180, 'icon-180.png'), (192, 'icon-192.png'), (512, 'icon-512.png')):
        big.resize((size, size), Image.LANCZOS).save(os.path.join(HERE, name), optimize=True)
    icon(True).resize((512, 512), Image.LANCZOS).save(os.path.join(HERE, 'icon-maskable-512.png'), optimize=True)
    print('icons ok')


main()
