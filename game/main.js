// main.js — the state machine of Double Take: menu, playing, scene result,
// final result. It owns the clock, the clicks, the hints and the score, and
// it hands rendering to render.js and words to ui.js. A `?shot=` query puts
// the game into a frozen, scripted state so screenshots show a real game
// mid-hunt: ?shot=cover, ?shot=park, ?shot=hint or ?shot=win.

const BEST_KEY = 'double-take-best-score';

const game = {
  status: 'menu', // menu | playing | sceneDone | gameDone
  sceneIndex: 0,
  found: new Set(),
  score: 0,
  best: 0,
  streak: 0,
  misses: 0,
  hintsLeft: MAX_HINTS_PER_SCENE,
  hintsUsed: 0,
  timeLeft: 0,
  campaign: false,
  doneFlags: [false, false, false],
  stars: [0, 0, 0],
  totalFound: 0,
  frozen: false, // shot mode: the clock never moves, animations pinned
  lastFrameAt: 0,
  lastTickSecond: -1,
  hintTimeout: null,
};

function currentScene() {
  return SCENES[game.sceneIndex];
}

function loadBest() {
  try {
    game.best = Number(localStorage.getItem(BEST_KEY) || 0) || 0;
  } catch (e) {
    game.best = 0;
  }
}

function saveBest() {
  if (game.score <= game.best) return;
  game.best = game.score;
  try {
    localStorage.setItem(BEST_KEY, String(game.best));
  } catch (e) {
    // Private mode or blocked storage: the best score just does not persist.
  }
}

function refreshHud() {
  const scene = currentScene();
  uiSetScore(game.score, game.best);
  uiSetScene(scene, game.sceneIndex, game.doneFlags);
  uiSetTimer(game.timeLeft, scene.timeLimit);
  uiSetFound(game.found.size, scene.diffs.length);
  uiSetHints(game.hintsLeft);
  uiSetStreak(game.streak);
  uiSetFoundChips(scene, game.found);
}

function startScene(index, campaign) {
  game.sceneIndex = index;
  game.campaign = campaign;
  game.found = new Set();
  game.streak = 0;
  game.misses = 0;
  game.hintsLeft = MAX_HINTS_PER_SCENE;
  game.hintsUsed = 0;
  game.timeLeft = currentScene().timeLimit;
  game.lastTickSecond = -1;
  game.status = 'playing';
  renderReset();
  uiHideOverlays();
  refreshHud();
}

function startCampaign() {
  playClickSound();
  startScene(0, true);
}

function backToMenu() {
  playClickSound();
  game.status = 'menu';
  renderReset();
  uiShowOverlay('menu');
  refreshHud();
}

function endScene(cleared) {
  const scene = currentScene();
  const timeBonus = cleared ? timeBonusForScene(game.timeLeft) : 0;
  const stars = cleared ? starsForScene(scene, game.timeLeft, game.misses, game.hintsUsed) : 0;
  game.score += timeBonus;
  game.stars[game.sceneIndex] = stars;
  game.totalFound += game.found.size;
  if (cleared) game.doneFlags[game.sceneIndex] = true;
  saveBest();
  game.status = 'sceneDone';
  if (cleared) playWinSound();
  uiSetScore(game.score, game.best);
  uiShowSceneResult({
    cleared,
    stars,
    scene,
    found: game.found.size,
    total: scene.diffs.length,
    remaining: scene.diffs.length - game.found.size,
    timeBonus,
    score: game.score,
    isLastScene: !game.campaign || game.sceneIndex >= SCENES.length - 1,
  });
}

function endCampaign() {
  const totalDifferences = SCENES.reduce((sum, s) => sum + s.diffs.length, 0);
  const bestStars = Math.max(...game.stars);
  const bestScene = SCENES[game.stars.indexOf(bestStars)].name;
  game.status = 'gameDone';
  saveBest();
  uiShowEndResult({
    clearedAll: game.doneFlags.every(Boolean),
    score: game.score,
    totalFound: game.totalFound,
    totalDifferences,
    bestScene,
  });
}

function advanceAfterScene() {
  playClickSound();
  if (game.campaign && game.sceneIndex < SCENES.length - 1) {
    startScene(game.sceneIndex + 1, true);
  } else if (game.campaign) {
    endCampaign();
  } else {
    backToMenu();
  }
}

function stagePointFromEvent(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (STAGE_WIDTH / rect.width),
    y: (event.clientY - rect.top) * (STAGE_HEIGHT / rect.height),
  };
}

function onPanelClick(panel, event) {
  if (game.status !== 'playing' || game.frozen) return;
  audioEnsure();
  const canvas = panel === 'left' ? uiElements.leftCanvas : uiElements.rightCanvas;
  const point = stagePointFromEvent(canvas, event);
  const scene = currentScene();
  const now = performance.now();

  const already = findFoundDifferenceAt(scene, game.found, point.x, point.y);
  if (already >= 0) {
    uiToast('Already found: ' + scene.diffs[already].label);
    return;
  }

  const hit = findDifferenceAt(scene, game.found, point.x, point.y);
  if (hit >= 0) {
    game.streak += 1;
    const points = pointsForFind(game.timeLeft, game.streak);
    game.score += points;
    game.found.add(hit);
    renderAddMarker(scene.diffs[hit].x, scene.diffs[hit].y, now);
    renderAddPopup(scene.diffs[hit].x, scene.diffs[hit].y - 30, '+' + points, panel, now);
    playFindSound();
    uiToast('Found: ' + scene.diffs[hit].label + '  (+' + points + ')');
    refreshHud();
    if (allDifferencesFound(scene, game.found)) {
      setTimeout(() => endScene(true), 650);
    }
    return;
  }

  game.streak = 0;
  game.misses += 1;
  game.score = Math.max(0, game.score - MISS_PENALTY);
  renderAddMiss(point.x, point.y, panel, now);
  playMissSound();
  uiToast('Not quite — that costs ' + MISS_PENALTY + ' points.');
  refreshHud();
}

function useHint() {
  if (game.status !== 'playing' || game.frozen) return;
  const scene = currentScene();
  const remaining = remainingDifferences(scene, game.found);
  if (remaining.length === 0 || game.hintsLeft <= 0) return;
  audioEnsure();
  game.hintsLeft -= 1;
  game.hintsUsed += 1;
  game.score = Math.max(0, game.score - HINT_COST);
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  renderSetHint(pick);
  playHintSound();
  uiToast('Hint: ' + pick.hint + '  (−' + HINT_COST + ')', 2600);
  refreshHud();
  if (game.hintTimeout) clearTimeout(game.hintTimeout);
  game.hintTimeout = setTimeout(() => renderSetHint(null), 2600);
}

function toggleSound() {
  audioSetMuted(!audioIsMuted());
  uiSetSoundButton(audioIsMuted());
  if (!audioIsMuted()) playClickSound();
}

// ---- Frame loop: the clock, the hint pulse, and both panels. ----
function frameLoop(now) {
  const delta = game.lastFrameAt ? (now - game.lastFrameAt) / 1000 : 0;
  game.lastFrameAt = now;

  if (game.status === 'playing' && !game.frozen) {
    game.timeLeft -= delta;
    if (game.timeLeft <= 10) {
      const whole = Math.ceil(game.timeLeft);
      if (whole !== game.lastTickSecond && whole > 0) {
        game.lastTickSecond = whole;
        playTickSound();
      }
    }
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      refreshHud();
      endScene(false);
    } else {
      uiSetTimer(game.timeLeft, currentScene().timeLimit);
    }
  }

  if (game.status !== 'menu') {
    renderState.hintPhase = game.frozen ? 0.6 : (now / 900) % 1;
    renderPanel(uiElements.leftCanvas, currentScene(), false, 'left', now);
    renderPanel(uiElements.rightCanvas, currentScene(), true, 'right', now);
    renderPrune(now);
  }
  requestAnimationFrame(frameLoop);
}

// ---- Shot mode: frozen, scripted states for real screenshots. ----
function applyShot(shot) {
  const now = performance.now();
  game.frozen = true;
  if (shot === 'cover') {
    // Harbour at dusk, three of seven found, counter and clock mid-game.
    startScene(1, false);
    game.timeLeft = 48;
    game.hintsLeft = 2;
    game.streak = 3;
    game.score = 365;
    for (const i of [0, 1, 3]) {
      game.found.add(i);
      renderAddMarker(SCENES[1].diffs[i].x, SCENES[1].diffs[i].y, 0);
    }
  } else if (shot === 'park') {
    // Sunny Park, two of five found, early in the round.
    startScene(0, false);
    game.timeLeft = 71;
    game.streak = 2;
    game.score = 210;
    for (const i of [0, 2]) {
      game.found.add(i);
      renderAddMarker(SCENES[0].diffs[i].x, SCENES[0].diffs[i].y, 0);
    }
  } else if (shot === 'hint') {
    // Cosy Bookshop, two found, a hint pulsing on the moon.
    startScene(2, false);
    game.timeLeft = 33;
    game.hintsLeft = 1;
    game.hintsUsed = 2;
    game.score = 180;
    for (const i of [0, 4]) {
      game.found.add(i);
      renderAddMarker(SCENES[2].diffs[i].x, SCENES[2].diffs[i].y, 0);
    }
    renderSetHint(SCENES[2].diffs[6]);
  } else if (shot === 'win') {
    // Sunny Park cleared: all five ringed, three stars, result card up.
    startScene(0, false);
    game.timeLeft = 36;
    game.score = 685;
    for (let i = 0; i < 5; i++) {
      game.found.add(i);
      renderAddMarker(SCENES[0].diffs[i].x, SCENES[0].diffs[i].y, 0);
    }
    game.status = 'sceneDone';
    game.doneFlags[0] = true;
    game.stars[0] = 3;
    uiSetScore(game.score, game.best);
    uiShowSceneResult({
      cleared: true,
      stars: 3,
      scene: SCENES[0],
      found: 5,
      total: 5,
      remaining: 0,
      timeBonus: 180,
      score: game.score,
      isLastScene: true,
    });
  }
  refreshHud();
  void now;
}

function wireEvents() {
  uiElements.leftCanvas.addEventListener('click', (e) => onPanelClick('left', e));
  uiElements.rightCanvas.addEventListener('click', (e) => onPanelClick('right', e));
  uiElements.hintButton.addEventListener('click', useHint);
  uiElements.soundButton.addEventListener('click', toggleSound);
  uiElements.menuButton.addEventListener('click', backToMenu);
  uiElements.nextSceneButton.addEventListener('click', advanceAfterScene);
  uiElements.replaySceneButton.addEventListener('click', () => {
    playClickSound();
    startScene(game.sceneIndex, game.campaign);
  });
  uiElements.playAgainButton.addEventListener('click', () => {
    game.score = 0;
    game.totalFound = 0;
    game.doneFlags = [false, false, false];
    game.stars = [0, 0, 0];
    startCampaign();
  });
  uiElements.endMenuButton.addEventListener('click', backToMenu);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'h' || event.key === 'H') useHint();
    if (event.key === 'm' || event.key === 'M') toggleSound();
    if (event.key === 'Escape') backToMenu();
    if (event.key === 'Enter' && game.status === 'sceneDone') advanceAfterScene();
  });
  uiBuildMenu(
    (index) => { playClickSound(); startScene(index, false); },
    startCampaign,
  );
}

function boot() {
  uiCollect();
  loadBest();
  uiSetSoundButton(false);
  wireEvents();
  refreshHud();
  uiShowOverlay('menu');
  const shot = new URLSearchParams(window.location.search).get('shot');
  if (shot) {
    uiHideOverlays();
    applyShot(shot);
  }
  requestAnimationFrame(frameLoop);
}

// A small handle for automated play-testing: state, scene list and the
// current score, without touching the DOM.
window.doubleTake = {
  game,
  scenes: SCENES,
  startScene,
  startCampaign,
  useHint,
  endScene,
};

document.addEventListener('DOMContentLoaded', boot);
