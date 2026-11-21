// ui.js — everything the player reads: the score, the clock, the "Found X / Y"
// counter, the scene dots, the found chips, the menu and the result screens.
// It only writes to the DOM; main.js decides what it should say.

const uiElements = {};

function uiCollect() {
  const ids = [
    'scoreValue', 'bestValue', 'soundButton', 'menuButton', 'sceneName',
    'sceneDots', 'timerBar', 'timerFill', 'timerText', 'foundCounter',
    'hintButton', 'hintCount', 'leftCanvas', 'rightCanvas', 'foundChips',
    'streakBadge', 'menuOverlay', 'sceneOverlay', 'sceneStars',
    'sceneResultTitle', 'sceneResultText', 'sceneResultStats',
    'nextSceneButton', 'replaySceneButton', 'endOverlay', 'endTitle',
    'endText', 'endStats', 'playAgainButton', 'endMenuButton', 'toast',
    'sceneCards', 'playAllButton',
  ];
  for (const id of ids) uiElements[id] = document.getElementById(id);
}

function uiFormatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function uiSetScore(score, best) {
  uiElements.scoreValue.textContent = String(score);
  uiElements.bestValue.textContent = String(best);
}

function uiSetScene(scene, index, doneFlags) {
  uiElements.sceneName.textContent = scene.name;
  uiElements.sceneDots.innerHTML = '';
  for (let i = 0; i < SCENES.length; i++) {
    const dot = document.createElement('span');
    dot.className = 'scene-dot' + (doneFlags[i] ? ' done' : i === index ? ' current' : '');
    uiElements.sceneDots.appendChild(dot);
  }
}

function uiSetTimer(timeLeft, timeLimit) {
  uiElements.timerText.textContent = uiFormatTime(timeLeft);
  const share = Math.max(0, Math.min(1, timeLeft / timeLimit));
  uiElements.timerFill.style.width = (share * 100).toFixed(1) + '%';
  const low = timeLeft <= 10;
  uiElements.timerFill.classList.toggle('low', low);
  uiElements.timerText.classList.toggle('low', low);
}

function uiSetFound(found, total) {
  uiElements.foundCounter.textContent = 'Found ' + found + ' / ' + total;
}

function uiSetHints(hintsLeft) {
  uiElements.hintCount.textContent = String(hintsLeft);
  uiElements.hintButton.disabled = hintsLeft <= 0;
}

function uiSetStreak(streak) {
  if (streak >= 2) {
    uiElements.streakBadge.hidden = false;
    uiElements.streakBadge.textContent = 'Streak x' + streak;
  } else {
    uiElements.streakBadge.hidden = true;
  }
}

function uiSetFoundChips(scene, found) {
  const chips = uiElements.foundChips;
  chips.innerHTML = '';
  if (found.size === 0) {
    const empty = document.createElement('em');
    empty.className = 'strip-empty';
    empty.textContent = 'Nothing yet — look closely…';
    chips.appendChild(empty);
    return;
  }
  for (const i of [...found].sort((a, b) => a - b)) {
    const chip = document.createElement('span');
    chip.className = 'found-chip';
    chip.textContent = '✓ ' + scene.diffs[i].label;
    chips.appendChild(chip);
  }
}

let toastTimer = null;
function uiToast(message, ms) {
  const toast = uiElements.toast;
  toast.textContent = message;
  toast.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, ms || 1800);
}

function uiShowOverlay(which) {
  uiElements.menuOverlay.hidden = which !== 'menu';
  uiElements.sceneOverlay.hidden = which !== 'scene';
  uiElements.endOverlay.hidden = which !== 'end';
}

function uiHideOverlays() {
  uiElements.menuOverlay.hidden = true;
  uiElements.sceneOverlay.hidden = true;
  uiElements.endOverlay.hidden = true;
}

function uiStarRow(stars) {
  let out = '';
  for (let i = 0; i < 3; i++) {
    out += i < stars
      ? '<span>&#9733;</span>'
      : '<span class="star-off">&#9733;</span>';
  }
  return out;
}

function uiShowSceneResult(result) {
  uiElements.sceneStars.innerHTML = uiStarRow(result.stars);
  uiElements.sceneResultTitle.textContent = result.cleared
    ? 'Scene complete!'
    : "Time's up!";
  uiElements.sceneResultText.textContent = result.cleared
    ? 'You found every difference in ' + result.scene.name + '.'
    : 'The clock ran out with ' + result.remaining + ' difference' +
      (result.remaining === 1 ? '' : 's') + ' still hiding.';
  uiElements.sceneResultStats.innerHTML =
    '<div class="stat"><span class="stat-label">FOUND</span><span class="stat-value">' +
    result.found + ' / ' + result.total + '</span></div>' +
    '<div class="stat"><span class="stat-label">TIME BONUS</span><span class="stat-value">+' +
    result.timeBonus + '</span></div>' +
    '<div class="stat"><span class="stat-label">SCORE</span><span class="stat-value">' +
    result.score + '</span></div>';
  uiElements.nextSceneButton.textContent = result.isLastScene
    ? 'See final score \u25B6'
    : 'Next scene \u25B6';
  uiShowOverlay('scene');
}

function uiShowEndResult(result) {
  uiElements.endTitle.textContent = result.clearedAll
    ? 'You cleared every scene!'
    : 'Hunt finished!';
  uiElements.endText.textContent = result.clearedAll
    ? 'Every difference found, every scene cleared. Sharp eyes.'
    : 'You found ' + result.totalFound + ' of ' + result.totalDifferences +
      ' differences across the three scenes.';
  uiElements.endStats.innerHTML =
    '<div class="stat"><span class="stat-label">FINAL SCORE</span><span class="stat-value">' +
    result.score + '</span></div>' +
    '<div class="stat"><span class="stat-label">FOUND</span><span class="stat-value">' +
    result.totalFound + ' / ' + result.totalDifferences + '</span></div>' +
    '<div class="stat"><span class="stat-label">BEST SCENE</span><span class="stat-value">' +
    result.bestScene + '</span></div>';
  uiShowOverlay('end');
}

function uiBuildMenu(onPickScene, onPlayAll) {
  const cards = uiElements.sceneCards;
  cards.innerHTML = '';
  for (let i = 0; i < SCENES.length; i++) {
    const scene = SCENES[i];
    const card = document.createElement('button');
    card.className = 'scene-card';
    card.type = 'button';
    card.innerHTML =
      '<span class="card-name">' + scene.name + '</span>' +
      '<span class="card-meta">' + scene.tagline + '<br>' +
      uiFormatTime(scene.timeLimit) + ' on the clock</span>' +
      '<span class="card-diffs">' + scene.diffs.length + ' differences</span>';
    card.addEventListener('click', () => onPickScene(i));
    cards.appendChild(card);
  }
  uiElements.playAllButton.addEventListener('click', onPlayAll);
}

function uiSetSoundButton(muted) {
  uiElements.soundButton.innerHTML = muted ? '&#128263;' : '&#128266;';
  uiElements.soundButton.title = muted ? 'Sound off — click to turn on (M)' : 'Sound on — click to mute (M)';
}
