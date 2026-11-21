// render.js — paints the two panels and everything that moves on them:
// the found markers (a green ring that pops in, with a check), the red X of
// a miss, the pulsing gold ring of a hint, and the floating "+100" popups.
// It never owns game state; main.js hands it a plain view of the frame.

const STAGE_WIDTH = 640;
const STAGE_HEIGHT = 400;

const renderState = {
  // Markers appear with a quick pop: { x, y, startedAt } in milliseconds.
  markers: [],
  // Miss flashes: { x, y, panel, startedAt } — shown on the clicked panel only.
  misses: [],
  // Floating score popups: { x, y, panel, text, startedAt }.
  popups: [],
  // Active hint: { x, y, label } or null. Its pulse phase is time-based,
  // except in frozen shot mode where main.js pins it.
  hint: null,
  hintPhase: 0,
};

function renderReset() {
  renderState.markers = [];
  renderState.misses = [];
  renderState.popups = [];
  renderState.hint = null;
  renderState.hintPhase = 0;
}

function renderAddMarker(x, y, now) {
  renderState.markers.push({ x, y, startedAt: now });
}

function renderAddMiss(x, y, panel, now) {
  renderState.misses.push({ x, y, panel, startedAt: now });
}

function renderAddPopup(x, y, text, panel, now) {
  renderState.popups.push({ x, y, text, panel, startedAt: now });
}

function renderSetHint(diff) {
  renderState.hint = diff ? { x: diff.x, y: diff.y, label: diff.label } : null;
}

// Ease-out-back: overshoots slightly, so a marker lands with a bounce.
function popScale(progress) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const p = Math.min(1, Math.max(0, progress));
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
}

function drawFoundMarker(ctx, marker, now) {
  const age = now - marker.startedAt;
  const scale = popScale(age / 220);
  const radius = 26 * scale;
  ctx.save();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#2e9e4f';
  ctx.beginPath();
  ctx.arc(marker.x, marker.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(marker.x, marker.y, radius + 3, 0, Math.PI * 2);
  ctx.globalAlpha = 0.35;
  ctx.stroke();
  ctx.globalAlpha = 1;
  // Check mark inside the ring.
  ctx.beginPath();
  ctx.moveTo(marker.x - 11, marker.y + 1);
  ctx.lineTo(marker.x - 3, marker.y + 9);
  ctx.lineTo(marker.x + 13, marker.y - 9);
  ctx.strokeStyle = '#2e9e4f';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}

function drawMissFlash(ctx, miss, now) {
  const age = now - miss.startedAt;
  const life = 1 - age / 650;
  if (life <= 0) return;
  ctx.save();
  ctx.globalAlpha = life;
  ctx.strokeStyle = '#d94f30';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const s = 12;
  ctx.beginPath();
  ctx.moveTo(miss.x - s, miss.y - s);
  ctx.lineTo(miss.x + s, miss.y + s);
  ctx.moveTo(miss.x + s, miss.y - s);
  ctx.lineTo(miss.x - s, miss.y + s);
  ctx.stroke();
  ctx.restore();
}

function drawHintPulse(ctx, hint, phase) {
  const breathe = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2);
  const radius = 26 + breathe * 10;
  ctx.save();
  ctx.strokeStyle = '#f2b705';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 7]);
  ctx.lineDashOffset = -phase * 34;
  ctx.beginPath();
  ctx.arc(hint.x, hint.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#f2b705';
  ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  const labelY = hint.y - radius - 10 < 14 ? hint.y + radius + 22 : hint.y - radius - 10;
  ctx.fillText('Look here!', hint.x, labelY);
  ctx.restore();
}

function drawScorePopup(ctx, popup, now) {
  const age = now - popup.startedAt;
  const life = 1 - age / 1100;
  if (life <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, life * 2);
  ctx.font = '900 22px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2e9e4f';
  ctx.fillText(popup.text, popup.x, popup.y - age / 25);
  ctx.restore();
}

// Draws one panel: the scene (plain on the left, changed on the right) plus
// every marker, miss and popup that belongs on it. Both panels share the
// same markers, so a found difference is ringed on both pictures at once;
// a miss flash and a score popup appear only on the panel that was clicked.
function renderPanel(canvas, scene, changed, panel, now) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
  const on = new Set();
  if (changed) for (let i = 0; i < scene.diffs.length; i++) on.add(i);
  scene.draw(ctx, on);
  for (const marker of renderState.markers) drawFoundMarker(ctx, marker, now);
  for (const miss of renderState.misses) {
    if (miss.panel === panel) drawMissFlash(ctx, miss, now);
  }
  if (renderState.hint) drawHintPulse(ctx, renderState.hint, renderState.hintPhase);
  for (const popup of renderState.popups) {
    if (popup.panel === panel) drawScorePopup(ctx, popup, now);
  }
}

// Drops finished effects so the lists never grow without bound.
function renderPrune(now) {
  renderState.misses = renderState.misses.filter((m) => now - m.startedAt < 700);
  renderState.popups = renderState.popups.filter((p) => now - p.startedAt < 1200);
}
