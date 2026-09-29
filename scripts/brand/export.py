"""Export the approved QEDly "Box the answer" logo as font-free SVG files."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

OUT = Path("out")
OUT.mkdir(exist_ok=True)
INK, PAPER, INK_DARK, GROUND_DARK, GREEN = "#11151C", "#F2F4F6", "#E7EAF0", "#0D1015", "#0E7A6D"


def instance(path, **axes):
    return instantiateVariableFont(TTFont(path), axes)


WORD = instance("Anybody.ttf", wght=900, wdth=125)
ICON = instance("Anybody.ttf", wght=900, wdth=110)
MONO = instance("JetBrainsMono.ttf", wght=500)


def shape(font, text, size, tracking_em=0.0, x=0.0, baseline=0.0):
    """Return (svg path d, advance) for text set at size px with its baseline at y=baseline."""
    upm = font["head"].unitsPerEm
    scale = size / upm
    cmap, glyphs, hmtx = font.getBestCmap(), font.getGlyphSet(), font["hmtx"]
    pen = SVGPathPen(glyphs)
    cursor = 0.0
    for index, char in enumerate(text):
        name = cmap[ord(char)]
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x + cursor, baseline)))
        cursor += hmtx[name][0] * scale
        if index < len(text) - 1:
            cursor += tracking_em * size
    return pen.getCommands(), cursor


def ink_box(font, text, size):
    """Tight bounds (xMin, yMin, xMax, yMax) of the glyph ink, in px, baseline at 0, y up."""
    upm = font["head"].unitsPerEm
    scale = size / upm
    cmap, glyphs, hmtx = font.getBestCmap(), font.getGlyphSet(), font["hmtx"]
    bounds, cursor = None, 0.0
    for char in text:
        name = cmap[ord(char)]
        pen = BoundsPen(glyphs)
        glyphs[name].draw(pen)
        if pen.bounds:
            x0, y0, x1, y1 = pen.bounds
            box = (cursor + x0 * scale, y0 * scale, cursor + x1 * scale, y1 * scale)
            bounds = box if bounds is None else (min(bounds[0], box[0]), min(bounds[1], box[1]), max(bounds[2], box[2]), max(bounds[3], box[3]))
        cursor += hmtx[name][0] * scale
    return bounds


def svg(width, height, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width:.0f}" height="{height:.0f}" '
            f'viewBox="0 0 {width:.2f} {height:.2f}" role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n')


def lockup(size=120, colour=INK, tagline=False, tagline_colour="#5B6472", margin=None):
    """The primary logo: QED in a drawn box, 'ly' outside. Geometry follows the approved canvas board."""
    tracking = -0.02
    stroke = 0.075 * size
    pad_x, pad_top, pad_bottom = 0.15 * size, 0.13 * size, 0.09 * size
    gap = 0.083 * size
    margin = 0.25 * size if margin is None else margin
    cap = WORD["OS/2"].sCapHeight * size / WORD["head"].unitsPerEm
    qed_d_probe, qed_adv = shape(WORD, "QED", size, tracking)
    qx0, qy0, qx1, qy1 = ink_box(WORD, "QED", size)
    box_left = margin
    box_top = margin
    inner_left = box_left + stroke + pad_x
    tail = max(0.0, -qy0)
    baseline = box_top + stroke + pad_top + cap
    box_width = stroke * 2 + pad_x * 2 + (qx1 - qx0)
    box_height = stroke * 2 + pad_top + cap + tail + pad_bottom
    qed_d, _ = shape(WORD, "QED", size, tracking, x=inner_left - qx0, baseline=baseline)
    ly_x = box_left + box_width + gap
    ly_d, ly_adv = shape(WORD, "ly", size, tracking, x=ly_x, baseline=baseline)
    lx0, ly0, lx1, ly1 = ink_box(WORD, "ly", size)
    width = ly_x + lx1 + margin
    descender = max(0.0, -ly0)
    height = box_top + max(box_height, stroke + pad_top + cap + descender) + margin
    half = stroke / 2
    body = (f'<rect x="{box_left + half:.2f}" y="{box_top + half:.2f}" width="{box_width - stroke:.2f}" '
            f'height="{box_height - stroke:.2f}" fill="none" stroke="{colour}" stroke-width="{stroke:.2f}"/>'
            f'<path d="{qed_d}" fill="{colour}"/><path d="{ly_d}" fill="{colour}"/>')
    if tagline:
        tag_size = 0.125 * size
        tag_text = "FROM HUNCH TO PROOF"
        _, tag_adv = shape(MONO, tag_text, tag_size, 0.34)
        tag_baseline = height - margin + 0.23 * size + tag_size * 0.72
        tag_x = (width - tag_adv) / 2
        tag_d, _ = shape(MONO, tag_text, tag_size, 0.34, x=tag_x, baseline=tag_baseline)
        body += f'<path d="{tag_d}" fill="{tagline_colour}"/>'
        height = tag_baseline + margin
    return width, height, body


def boxed_q(colour=INK, solid=False, background=None):
    """The icon: Q in a drawn box (or a solid box with a knocked-out Q at favicon sizes), on a 100x100 grid."""
    body = ""
    if background:
        body += f'<rect width="100" height="100" fill="{background}"/>'
    if solid:
        size = 84
        q_colour = "#FFFFFF" if colour == INK else GROUND_DARK
        body += f'<rect width="100" height="100" fill="{colour}"/>'
        font = instance("Anybody.ttf", wght=900, wdth=100)
    else:
        size = 66
        q_colour = colour
        body += f'<rect x="12.5" y="12.5" width="75" height="75" fill="none" stroke="{colour}" stroke-width="9"/>'
        font = ICON
    x0, y0, x1, y1 = ink_box(font, "Q", size)
    x = 50 - (x0 + x1) / 2
    baseline = 50 + (y0 + y1) / 2
    d, _ = shape(font, "Q", size, x=x, baseline=baseline)
    body += f'<path d="{d}" fill="{q_colour}"/>'
    return body


def write(name, content):
    (OUT / name).write_text(content)
    print(f"wrote out/{name} ({len(content):,} bytes)")


for suffix, colour, tag_colour in (("", INK, "#5B6472"), ("-dark", INK_DARK, "#9AA4B2")):
    w, h, body = lockup(colour=colour)
    write(f"wordmark{suffix}.svg", svg(w, h, body, "QEDly"))
    w, h, body = lockup(colour=colour, tagline=True, tagline_colour=tag_colour)
    write(f"lockup-tagline{suffix}.svg", svg(w, h, body, "QEDly, from hunch to proof"))

write("icon.svg", svg(100, 100, boxed_q(INK), "QEDly"))
write("icon-dark.svg", svg(100, 100, boxed_q(INK_DARK, background=INK), "QEDly"))
write("favicon.svg", svg(100, 100, boxed_q(INK, solid=True), "QEDly"))
write("favicon-dark.svg", svg(100, 100, boxed_q(INK_DARK, solid=True), "QEDly"))

# The small QED box used as the stamp in PR footers and on receipts.
w, h, body = lockup(size=40, colour=GREEN, margin=2)
qed_only = body.split('<path d=', 2)
stamp_body = qed_only[0] + '<path d=' + qed_only[1].split('/>', 1)[0] + '/>'
stroke = 0.075 * 40
box_width = stroke * 2 + 0.15 * 40 * 2 + (ink_box(WORD, "QED", 40)[2] - ink_box(WORD, "QED", 40)[0])
write("qed-stamp.svg", svg(2 + box_width + 2, h, stamp_body, "QED"))

# Open Graph template, 1200x630: the tagline lockup centred on paper.
w, h, body = lockup(size=150, tagline=True, margin=0)
scale = min(900 / w, 360 / h)
tx, ty = (1200 - w * scale) / 2, (630 - h * scale) / 2
write("og-template.svg", svg(1200, 630, f'<rect width="1200" height="630" fill="{PAPER}"/><g transform="translate({tx:.2f} {ty:.2f}) scale({scale:.4f})">{body}</g>', "QEDly, from hunch to proof"))
