# qedly.github.io

The website and docs for **QEDly**, said "Q-E-D-lee". From hunch to proof.

The site is built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build), and published to GitHub Pages at https://qedly.github.io.

```sh
npm ci          # Node 22 or newer
npm test        # unit tests
npm run dev     # local site at http://localhost:4321
npm run build   # static site in dist/
```

Brand files and their rules are in [`public/brand/`](public/brand/README.md). Rules for anyone changing the site, people and agents alike, are in [`AGENTS.md`](AGENTS.md).

Until launch, every page is `noindex`.
