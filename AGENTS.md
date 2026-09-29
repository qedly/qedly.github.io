# Working on the QEDly site

This repository is the QEDly website and docs: `https://qedly.github.io`, built with Astro and Starlight. Its plan is `specs/042-qedly-site/plan.md` in PrepLabsAI/AgentX (branch `docs/040-qedly-site`), and each task there says which files to touch.

## Commands

- `npm ci` installs. Node 22 or newer is required.
- `npm test` runs the unit tests (Vitest, `tests/*.test.ts`). Write the failing test first.
- `npm run build` builds the site into `dist/`.
- `npm run dev` serves it locally.

## Rules for copy

- Write the name as **QEDly**, with QED in capitals. It is said "Q-E-D-lee".
- Every fact about what QEDly Code does today comes from the claims ledger (`src/data/claims.yaml`, once it exists), never from typed text.
- Never use these words in site copy: 10x, autonomous, AI engineer, AI employee, teammate, swarm, army of agents, software factory, mission control, production-ready in minutes, game-changing, enterprise-grade, open source. The licence is "source-available" and its wording lives in `SITE.licence`.
- Planned products carry a status label: Now, Next or Later.
- Plain words, active voice, short sentences.

## Rules for code

- Site-wide values (URL, licence, docs tag, repositories) live only in `src/config/site.ts`.
- The site sets no cookies.
- Brand files live in `public/brand/` and follow `public/brand/README.md`. Do not edit them by hand. Regenerate them with `scripts/brand/export.py`.
- Keep `SITE.launched` false until the launch PR. It controls `noindex` and `robots.txt`.
