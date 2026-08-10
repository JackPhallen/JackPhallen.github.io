# jackphallen.com

Jack Phallen's personal homepage. It features an animated floating-character
canvas background that reacts to hover and clicks, plus retro terminal-style
content pages (About, Links).

## Tech stack

- React 19
- Vite
- react-router-dom
- lucide-react

## Commands

- `npm run dev` — start the local dev server
- `npm run build` — build for production into `dist/`
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally
- `npm run deploy` — build and publish `dist/` to GitHub Pages

## Project structure

- `src/features/floating-characters/` — the animated canvas background.
  A plain-JS physics engine decoupled from React (see CLAUDE.md for details).
- `src/components/` — shared UI (menu overlay, terminal page renderer)
- `src/pages/` — route components
- `src/content/` — the text shown on each terminal page; edit these files
  to change page content

## Deployment

`npm run deploy` publishes to GitHub Pages via gh-pages. `public/CNAME`
preserves the custom domain across deploys, and the `postbuild` script
copies `dist/index.html` to `dist/404.html` so deep links like `/about`
survive a refresh.
