# QEDly brand files

The logo is **"Box the answer"**: QED in a drawn box, with "ly" outside. It is written **QEDly** and said **"Q-E-D-lee"**. The tagline is **"From hunch to proof."**

Every file is plain vector shapes, with no fonts inside, so it looks the same everywhere.

| File | Use | Minimum size |
|---|---|---|
| `wordmark.svg` | The logo on light backgrounds | 24 px tall |
| `wordmark-dark.svg` | The logo on dark backgrounds | 24 px tall |
| `lockup-tagline.svg` | Logo with "FROM HUNCH TO PROOF": hero, slides, social | 80 px tall (the tagline stops being legible below that) |
| `lockup-tagline-dark.svg` | The same, on dark | 80 px tall |
| `icon.svg` | The boxed Q: app icon, GitHub avatar, docs logo | 32 px |
| `icon-dark.svg` | Boxed Q on an ink tile | 32 px |
| `favicon.svg` | Solid box with a knocked-out Q, for 16 to 31 px | 16 px |
| `favicon-dark.svg` | The same, light on dark | 16 px |
| `icon-512.png`, `icon-dark-512.png` | Raster icons where SVG is not accepted | 512 px |
| `qed-stamp.svg` | The green QED box that starts PR footers and receipts | 12 px tall |
| `og-template.svg` | 1200 × 630 social card background | 1200 × 630 |

## Rules

- The logo is one colour: ink `#11151C` on light, `#E7EAF0` on dark. Clearance green `#0E7A6D` (dark: `#43C9B5`) appears only in the stamp and in "passed" states, and always means proved.
- Keep clear space around the logo equal to the height of the box's stroke times three.
- Don't stretch, recolour, outline, add shadows, or put the logo on a busy image.
- Below 32 px, use `favicon.svg`: the outlined box gets too thin to see.

## Rebuilding

`scripts/brand/export.py` regenerates every SVG from the two open-licence fonts: Anybody (weight 900, width 125) and JetBrains Mono (weight 500). Both come from https://github.com/google/fonts. Download `Anybody[wdth,wght].ttf` and `JetBrainsMono[wght].ttf` next to the script, then run:

```sh
python3 -m venv venv && ./venv/bin/pip install fonttools
./venv/bin/python export.py
```

The script writes to `out/`. The PNG icons are screenshots of `icon.svg` and `icon-dark.svg` at 512 px.
