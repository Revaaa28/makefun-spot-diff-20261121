// main.ts — the Double Take entry program (Node 22, standard library only).
//
// It hands the game in: it copies this repository's game/ (plain static
// files, no build step) and screenshots/ (real browser renders of the game)
// into the output directory and writes dossier.json there, using the
// vendored make.fun library's buildDossier. The grader runs this program
// twice in a sandbox with no network; both runs must write identical bytes,
// so the copy is done fresh every run: stale files from an earlier run are
// removed before the new ones land.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Replace the target directory outright, so a renamed or deleted file from
// an earlier run can never survive into this run's output.
function copyFresh(sourceDir, targetDir) {
  rmSync(targetDir, { recursive: true, force: true });
  cpSync(sourceDir, targetDir, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyFresh(join(repoRoot, 'game'), join(outputDir, 'game'));
if (existsSync(join(repoRoot, 'screenshots'))) {
  copyFresh(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));
} else {
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's caps, as the kit's library documents them: the text budget
// for the dossier, the screenshot count and size, and the game tree limits.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
