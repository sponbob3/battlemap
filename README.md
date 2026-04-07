# BattleMap

Interactive animated battle explanation tool. Enter any historical battle and get an AI-researched, animated top-down tactical visualization with phase-by-phase playback, narration, and strategic analysis.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (dark military palette)
- Framer Motion (unit movement animations)
- Anthropic Claude API with web search (battle research)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If the Next.js dev server ever shows stale chunk/module 404 errors after rapid changes, restart with:

```bash
npm run dev:reset
```

## Claude API (Optional)

To enable live battle research for any conflict, add your Anthropic API key:

```bash
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
```

Without an API key, the app uses a hardcoded sample for the Battle of Ankara.

## How It Works

1. Enter a battle name (e.g. "Battle of Austerlitz") and optional tactical focus
2. The API researches the battle via Claude with web search and returns structured JSON
3. The battle viewer renders an animated SVG map with terrain, unit icons, and movement arrows
4. Phase-by-phase playback with timeline scrubber, narration panel, and tactical notes
5. Collapsible context sidebar with full battle metadata, order of battle, and aftermath
