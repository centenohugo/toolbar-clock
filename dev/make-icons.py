# Dev-only: regenerates icons/icon-{16,32,48,128}.png, a "09:30" digital
# readout in hand-drawn seven-segment digits. Needs Pillow:
#   python dev/make-icons.py

from pathlib import Path
from PIL import Image, ImageDraw

BG = (32, 33, 36, 255)
FG = (255, 255, 255, 255)
N = 1024  # drawn large, then downsampled for smooth edges
SEGMENTS = {'0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc',
            '5': 'afgcd', '6': 'afgedc', '7': 'abc', '8': 'abcdefg', '9': 'abcfgd'}


def digit(d, ch, x, y, w, h, t, inset):
    """Seven-segment digit at (x, y), w x h, stroke t; inset leaves thin cuts at the joints."""
    k = t * inset
    mid = y + h / 2 - t / 2
    boxes = {
        'a': (x + k, y, x + w - k, y + t),
        'g': (x + k, mid, x + w - k, mid + t),
        'd': (x + k, y + h - t, x + w - k, y + h),
        'f': (x, y + k, x + t, mid + t - k),
        'b': (x + w - t, y + k, x + w, mid + t - k),
        'e': (x, mid + k, x + t, y + h - k),
        'c': (x + w - t, mid + k, x + w, y + h - k),
    }
    for s in SEGMENTS[ch]:
        d.rounded_rectangle(boxes[s], radius=t / 2, fill=FG)


def icon(text='09:30', dw=168, h=300, t=50, gap=36, inset=0.25):
    img = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, N - 1, N - 1], radius=230, fill=BG)
    x, y = (N - (4 * dw + 4 * gap + t)) / 2, (N - h) / 2
    for i, ch in enumerate(text.replace(':', '')):
        digit(d, ch, x, y, dw, h, t, inset)
        x += dw + gap
        if i == 1:
            for cy in (y + h * 0.32, y + h * 0.68):
                d.rounded_rectangle((x, cy - t / 2, x + t, cy + t / 2), radius=t / 2, fill=FG)
            x += t + gap
    return img


if __name__ == '__main__':
    out = Path(__file__).resolve().parent.parent / 'icons'
    big = icon()
    for size in (16, 32, 48, 128):
        big.resize((size, size), Image.LANCZOS).save(out / f'icon-{size}.png')
    print('icons written to', out)
