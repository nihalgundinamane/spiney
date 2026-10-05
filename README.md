# Spinly — Random Picker

> Can't decide? Let randomness decide.

Spinly is a small, focused random picker. Add your choices, spin the wheel, and get one fair random result. You can share a picker with anyone through a link, with no account or server involved.

## Features

- Add, edit and delete choices inline (2 to 50 choices)
- Visual wheel that adapts to the number and length of choices
- Fair random selection: every choice has an equal chance
- Smooth spin animation with realistic deceleration (~4 seconds)
- Result card with confetti, plus Pick Again and Edit Choices
- Shareable link (choices are stored in the URL, nothing is sent to a server)
- Copy link, and native Web Share where the browser supports it
- Light theme by default, with a dark theme toggle
- Responsive layout (mobile, tablet, desktop)
- Accessibility: keyboard support, visible focus, `aria-live` result, reduced-motion support

## Tech stack

- React 18
- Vite 5
- Plain CSS (design tokens as CSS variables, light and dark themes)
- HTML canvas for the wheel
- No backend, no database, no analytics

## Project structure

```
spinly/
├─ index.html          App shell and font links
├─ package.json        Scripts and dependencies
├─ vite.config.js      Vite + React config
├─ .gitignore
├─ README.md
├─ GITHUB.md           Steps to upload this project to GitHub
└─ src/
   ├─ main.jsx         Entry point
   ├─ App.jsx          State, spin logic, choices list, result, share dialog
   ├─ Wheel.jsx        Canvas wheel, pointer and SPIN button
   ├─ lib.js           Randomness, validation, share-link encoding
   └─ styles.css       Design system and layout
```

## Getting started

Requirements: [Node.js](https://nodejs.org) 18 or newer.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open the local URL printed in the terminal (usually http://localhost:5173).

## Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # serves the production build locally
```

Upload the contents of `dist/` to any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages).

> `vite.config.js` also uses `vite-plugin-singlefile`, which bundles everything into one `dist/index.html`. If you want a normal multi-file build, remove that plugin from `package.json` and delete the `viteSingleFile()` call in `vite.config.js`.

## How randomness works

1. The winner index is chosen first with `crypto.getRandomValues` and rejection sampling, which removes modulo bias so each choice has exactly equal probability.
2. The wheel's landing angle is then calculated from that winner, with a small random offset inside the segment so it never lands on an edge.
3. The wheel animates to that angle, so the visual result always matches the chosen result.

## How sharing works

The choices are converted to JSON, encoded as UTF-8, then turned into URL-safe base64 and placed in the URL hash (`#c=...`). The hash is never sent to a server. When someone opens the link, the app decodes, cleans and de-duplicates the list. Damaged links fall back to the default choices with a friendly message.

## Validation rules

- Empty and whitespace-only entries are rejected
- Extra spaces are normalised
- Duplicates (case-insensitive) are rejected so odds aren't accidentally weighted
- Maximum 40 characters per choice and 50 choices

## License

MIT
