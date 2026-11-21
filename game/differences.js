// differences.js — the rules of the hunt: what counts as a find, what a miss
// costs, and what a find is worth. Pure functions over a scene and the set of
// differences already found; they know nothing about the DOM or the canvas.

const MISS_PENALTY = 25;
const HINT_COST = 50;
const FIND_BASE_POINTS = 100;
const FIND_STREAK_BONUS = 10;
const TIME_BONUS_PER_SECOND = 5;
const MAX_HINTS_PER_SCENE = 3;

// Returns the index of the unfound difference whose circle contains the
// stage point (x, y), or -1 when the click lands on nothing unfound.
function findDifferenceAt(scene, found, x, y) {
  let best = -1;
  let bestDistance = Infinity;
  for (let i = 0; i < scene.diffs.length; i++) {
    if (found.has(i)) continue;
    const d = scene.diffs[i];
    const distance = Math.hypot(x - d.x, y - d.y);
    if (distance <= d.r && distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  }
  return best;
}

// Returns the index of a difference already found at the point, or -1.
function findFoundDifferenceAt(scene, found, x, y) {
  for (const i of found) {
    const d = scene.diffs[i];
    if (Math.hypot(x - d.x, y - d.y) <= d.r) return i;
  }
  return -1;
}

function remainingDifferences(scene, found) {
  return scene.diffs.filter((_, i) => !found.has(i));
}

function allDifferencesFound(scene, found) {
  return found.size >= scene.diffs.length;
}

// Points for a find: a flat base, a bonus for a hot streak of finds without
// a miss in between, and a bonus for the seconds still on the clock.
function pointsForFind(timeLeftSeconds, streak) {
  return FIND_BASE_POINTS + FIND_STREAK_BONUS * Math.max(0, streak - 1);
}

// Time bonus banked when a scene is cleared.
function timeBonusForScene(timeLeftSeconds) {
  return Math.round(timeLeftSeconds) * TIME_BONUS_PER_SECOND;
}

// Stars for a cleared scene: 3 for fast and accurate, 2 for a clean clear,
// 1 for a clear that ran the clock down or leaned on hints.
function starsForScene(scene, timeLeftSeconds, misses, hintsUsed) {
  const timeShare = timeLeftSeconds / scene.timeLimit;
  if (timeShare >= 0.4 && misses === 0 && hintsUsed === 0) return 3;
  if (timeShare >= 0.15 && misses <= 2) return 2;
  return 1;
}
