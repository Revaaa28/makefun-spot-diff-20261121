# Double Take — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Revaaa28/makefun-spot-diff-20261121/rank.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Revaaa28/makefun-spot-diff-20261121/reward.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)

A complete spot-the-difference game for the [make.fun bounty](https://make.fun/c/best-spot-the-difference-game-20261121-0451): two near-identical pictures side by side, markers on the differences found, several still unfound, and a counter of how many remain.

## The game

Three original scenes, every picture drawn in code on canvas — no image files, no copied art:

- **Sunny Park** — 5 differences, 90 seconds on the clock
- **Harbour at Dusk** — 7 differences, 75 seconds
- **Cosy Bookshop** — 9 differences, 60 seconds

Click a difference on **either** picture to ring it (green ring + check, a chime, +100 points and a streak bonus). A wrong click costs 25 points. A hint (3 per scene, 50 points each) pulses a gold ring around one difference still hiding. Clear a scene for a time bonus and up to three stars; clear all three for the final score.

Keyboard: **H** hint, **M** mute, **Esc** menu, **Enter** next scene.

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

Static files only — `game/index.html` opens in desktop Chrome and plays with no network request. Sounds are synthesized with WebAudio; nothing is downloaded.

## Layout

- `game/index.html` — page shell and HUD
- `game/style.css` — warm paper-and-ink look
- `game/scenes.js` — the three scenes: procedural art + difference definitions
- `game/differences.js` — hit-testing and scoring rules
- `game/render.js` — panels, find markers, miss flashes, hint pulse, popups
- `game/audio.js` — WebAudio sound effects
- `game/ui.js` — HUD, menu, result screens
- `game/main.js` — state machine, input, clock, screenshot shot mode
- `main.ts` — entry program: copies `game/` + `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's library, unchanged
