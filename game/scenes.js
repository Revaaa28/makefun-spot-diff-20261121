// scenes.js — the three scenes of Double Take. Every picture is drawn in code
// on a 640x400 stage: no image files, no copied art. Each scene lists its
// differences (label + stage position + click radius) and draws itself twice:
// once plain, once with every difference applied. The left panel shows the
// plain version, the right panel the changed one.

function sceneCircle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function sceneEllipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function sceneRect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function sceneRoundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function scenePoly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function sceneLine(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function sceneCloud(ctx, x, y, scale) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, 18 * scale, 0, Math.PI * 2);
  ctx.arc(x + 20 * scale, y - 8 * scale, 15 * scale, 0, Math.PI * 2);
  ctx.arc(x + 40 * scale, y, 17 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function sceneBird(ctx, x, y, scale, color) {
  ctx.beginPath();
  ctx.arc(x - 9 * scale, y, 9 * scale, Math.PI * 1.15, Math.PI * 1.95);
  ctx.arc(x + 9 * scale, y, 9 * scale, Math.PI * 1.05, Math.PI * 1.85);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5 * scale;
  ctx.lineCap = 'round';
  ctx.stroke();
}

// ---- Scene 1: Sunny Park (5 differences, 90 seconds) ----
function drawSunnyPark(ctx, on) {
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#79c6f2');
  sky.addColorStop(0.55, '#bfe6fb');
  sky.addColorStop(1, '#eef7dc');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 640, 400);

  // Sun with rays, top left.
  ctx.save();
  ctx.translate(90, 70);
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    sceneLine(ctx, 0, -46, 0, -58, '#f2b705', 5);
  }
  ctx.restore();
  sceneCircle(ctx, 90, 70, 34, '#ffd23e');
  sceneCircle(ctx, 90, 70, 26, '#ffe98a');

  sceneCloud(ctx, 300, 58, 1);
  sceneCloud(ctx, 505, 42, 0.8);

  // Rolling hills.
  sceneEllipse(ctx, 140, 470, 340, 150, '#79c94f');
  sceneEllipse(ctx, 540, 490, 360, 160, '#5fb53e');

  // Winding path, kept on the hillside (y 335-400) so it never floats.
  ctx.beginPath();
  ctx.moveTo(290, 400);
  ctx.bezierCurveTo(300, 372, 262, 360, 286, 346);
  ctx.bezierCurveTo(302, 336, 330, 336, 340, 350);
  ctx.bezierCurveTo(354, 368, 332, 386, 346, 400);
  ctx.closePath();
  ctx.fillStyle = '#e8c98f';
  ctx.fill();

  // Big tree, left of the path: trunk runs down to the hillside.
  sceneRect(ctx, 158, 165, 22, 170, '#7a4a21');
  sceneCircle(ctx, 135, 140, 42, '#3f9d4e');
  sceneCircle(ctx, 205, 140, 42, '#3f9d4e');
  sceneCircle(ctx, 170, 105, 48, '#4cb45c');
  if (on.has(0)) {
    sceneCircle(ctx, 150, 122, 8, '#d94f30');
    sceneCircle(ctx, 192, 106, 8, '#d94f30');
    sceneCircle(ctx, 176, 142, 8, '#d94f30');
  }

  // Bench, right side: legs run down to the hillside.
  sceneRect(ctx, 432, 238, 108, 10, '#8a5a2b');
  sceneRect(ctx, 432, 214, 108, 10, '#8a5a2b');
  sceneRect(ctx, 440, 248, 8, 84, '#6b4423');
  sceneRect(ctx, 524, 248, 8, 84, '#6b4423');
  if (on.has(1)) sceneRoundRect(ctx, 438, 226, 96, 10, 5, '#d94f30');

  // Bird in the sky (difference 3).
  if (on.has(2)) sceneBird(ctx, 420, 72, 1, '#2b2118');

  // Tulip bed along the bottom.
  const tulipXs = [110, 200, 300, 390, 480];
  for (let i = 0; i < tulipXs.length; i++) {
    const x = tulipXs[i];
    sceneLine(ctx, x, 352, x, 386, '#3f9d4e', 4);
    const petal = (i === 2 && on.has(3)) ? '#f2b705' : '#e85d75';
    sceneCircle(ctx, x, 344, 11, petal);
    scenePoly(ctx, [[x - 11, 344], [x, 330], [x + 11, 344]], petal);
  }
  sceneEllipse(ctx, 300, 392, 260, 14, '#4cb45c');

  // Kite in the sky (difference 5).
  if (on.has(4)) {
    scenePoly(ctx, [[545, 78], [568, 96], [545, 114], [522, 96]], '#e85d75');
    scenePoly(ctx, [[545, 114], [552, 126], [545, 138], [538, 126]], '#f2b705');
    sceneLine(ctx, 545, 138, 520, 190, '#2b2118', 1.5);
  }
}

// ---- Scene 2: Harbour at Dusk (7 differences, 75 seconds) ----
function drawHarbourDusk(ctx, on) {
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#3a2b5c');
  sky.addColorStop(0.5, '#b65a7a');
  sky.addColorStop(1, '#f28c4a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 640, 260);

  // Early stars and the moon.
  sceneCircle(ctx, 520, 55, 22, '#fdf3c4');
  sceneCircle(ctx, 512, 48, 18, '#3a2b5c');
  const starSpots = [[80, 40], [200, 30], [330, 55], [420, 28], [590, 110], [150, 90]];
  for (const [sx, sy] of starSpots) sceneCircle(ctx, sx, sy, 2.5, '#ffffff');
  if (on.has(5)) {
    sceneCircle(ctx, 470, 45, 4, '#ffe98a');
    sceneLine(ctx, 470, 33, 470, 57, '#ffe98a', 2);
    sceneLine(ctx, 458, 45, 482, 45, '#ffe98a', 2);
  }

  // Gulls.
  sceneBird(ctx, 380, 70, 1, '#2b2118');
  sceneBird(ctx, 430, 92, 0.85, '#2b2118');
  if (on.has(2)) sceneBird(ctx, 482, 74, 0.9, '#2b2118');

  // Sea.
  const sea = ctx.createLinearGradient(0, 260, 0, 400);
  sea.addColorStop(0, '#e07a4a');
  sea.addColorStop(1, '#274b63');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 260, 640, 140);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  for (const [wx, wy, wl] of [[60, 300, 50], [180, 330, 70], [330, 310, 55], [470, 345, 65], [540, 300, 45]]) {
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + wl / 2, wy - 6, wx + wl, wy);
    ctx.stroke();
  }

  // Lighthouse on the rocks, left.
  scenePoly(ctx, [[30, 300], [170, 300], [160, 265], [40, 265]], '#5a4632');
  sceneRect(ctx, 92, 110, 56, 160, '#fdf3e3');
  sceneRect(ctx, 92, 150, 56, 22, '#d94f30');
  sceneRect(ctx, 92, 205, 56, 22, '#d94f30');
  sceneRect(ctx, 86, 92, 68, 20, '#2b2118');
  sceneCircle(ctx, 120, 102, 9, '#ffe98a');
  if (on.has(0)) {
    ctx.save();
    ctx.globalAlpha = 0.45;
    scenePoly(ctx, [[154, 100], [300, 70], [300, 132]], '#ffe98a');
    ctx.restore();
  }

  // Main sailboat.
  scenePoly(ctx, [[285, 300], [345, 300], [335, 282], [295, 282]], '#6b4423');
  sceneLine(ctx, 315, 282, 315, 175, '#4a2e16', 4);
  scenePoly(ctx, [[318, 180], [318, 275], [352, 275]], on.has(1) ? '#d94f30' : '#fdf3e3');
  scenePoly(ctx, [[312, 190], [312, 275], [288, 275]], '#fdf3e3');

  // Small boat, right.
  scenePoly(ctx, [[430, 315], [470, 315], [462, 300], [438, 300]], '#8a5a2b');
  scenePoly(ctx, [[450, 300], [450, 250], [468, 300]], '#f2b705');

  // Buoy (difference 5).
  if (on.has(4)) {
    sceneEllipse(ctx, 240, 332, 14, 8, '#d94f30');
    sceneRect(ctx, 234, 318, 12, 10, '#d94f30');
    sceneCircle(ctx, 240, 314, 3, '#ffe98a');
  }

  // Wooden dock, bottom right, with cottages behind it.
  sceneRect(ctx, 505, 285, 135, 12, '#8a5a2b');
  sceneRect(ctx, 505, 305, 135, 12, '#7a4a21');
  for (let i = 0; i < 4; i++) sceneRect(ctx, 515 + i * 32, 285, 4, 32, '#6b4423');
  sceneRect(ctx, 520, 225, 52, 60, '#e8c98f');
  scenePoly(ctx, [[515, 226], [546, 200], [577, 226]], '#d94f30');
  sceneRect(ctx, 532, 252, 14, 14, on.has(3) ? '#ffe98a' : '#3a2b5c');
  sceneRect(ctx, 556, 252, 14, 14, '#3a2b5c');
  sceneRect(ctx, 585, 240, 40, 45, '#c9a06a');
  scenePoly(ctx, [[580, 241], [605, 220], [630, 241]], '#8a5a2b');
  sceneRect(ctx, 598, 256, 12, 12, '#3a2b5c');

  // Rope coil on the dock (difference 7).
  if (on.has(6)) {
    ctx.beginPath();
    ctx.arc(590, 296, 12, 0, Math.PI * 2);
    ctx.strokeStyle = '#e8c98f';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(590, 296, 6, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ---- Scene 3: Cosy Bookshop (9 differences, 60 seconds) ----
function drawCosyBookshop(ctx, on) {
  // Warm wall and wooden floor.
  sceneRect(ctx, 0, 0, 640, 310, '#f3e3c2');
  sceneRect(ctx, 0, 310, 640, 90, '#b98a5a');
  for (let i = 0; i < 5; i++) sceneLine(ctx, 0, 330 + i * 14, 640, 330 + i * 14, '#a1764a', 2);

  // Window with night sky, right.
  sceneRect(ctx, 478, 58, 126, 150, '#2b3a5c');
  sceneLine(ctx, 541, 58, 541, 208, '#7a4a21', 6);
  sceneLine(ctx, 478, 133, 604, 133, '#7a4a21', 6);
  sceneCircle(ctx, 505, 85, 2, '#ffffff');
  sceneCircle(ctx, 575, 100, 2, '#ffffff');
  sceneCircle(ctx, 525, 115, 2, '#ffffff');
  if (on.has(6)) {
    sceneCircle(ctx, 572, 88, 16, '#fdf3c4');
    sceneCircle(ctx, 566, 82, 13, '#2b3a5c');
  }

  // Wall clock.
  sceneCircle(ctx, 320, 80, 30, '#fdf3e3');
  ctx.beginPath();
  ctx.arc(320, 80, 30, 0, Math.PI * 2);
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 3;
  ctx.stroke();
  if (on.has(1)) {
    sceneLine(ctx, 320, 80, 333, 93, '#2b2118', 3); // hour hand, between 4 and 5
    sceneLine(ctx, 320, 80, 320, 98, '#2b2118', 3); // minute hand, on the 6: 4:30
  } else {
    sceneLine(ctx, 320, 80, 320, 60, '#2b2118', 3); // 12
    sceneLine(ctx, 320, 80, 338, 80, '#2b2118', 3); // 3
  }
  sceneCircle(ctx, 320, 80, 3, '#d94f30');

  // Framed poster (difference 8).
  if (on.has(7)) {
    sceneRect(ctx, 408, 150, 52, 66, '#7a4a21');
    sceneRect(ctx, 413, 155, 42, 56, '#8fb8d8');
    sceneCircle(ctx, 434, 176, 12, '#f2b705');
    scenePoly(ctx, [[420, 211], [434, 188], [448, 211]], '#3f9d4e');
  }

  // Bookshelf, left, three shelves of spines.
  sceneRect(ctx, 36, 56, 168, 264, '#7a4a21');
  const shelfRows = [66, 150, 234];
  const spineColors = ['#d94f30', '#3f9d4e', '#4a6fa5', '#e8a13c', '#8e6bbf', '#e85d75'];
  for (let row = 0; row < 3; row++) {
    let bx = 44;
    for (let b = 0; b < 6; b++) {
      const bw = 22 + ((b * 7 + row * 3) % 8);
      let color = spineColors[(b + row * 2) % spineColors.length];
      if (row === 1 && b === 2) color = on.has(4) ? '#d94f30' : '#4a6fa5';
      sceneRect(ctx, bx, shelfRows[row], bw, 76, color);
      sceneLine(ctx, bx + 4, shelfRows[row] + 10, bx + bw - 4, shelfRows[row] + 10, 'rgba(255,255,255,0.35)', 2);
      bx += bw + 3;
    }
    sceneRect(ctx, 36, shelfRows[row] + 76, 168, 8, '#5d3a1a');
  }

  // Hanging lamp with warm glow (difference 3).
  sceneLine(ctx, 470, 30, 470, 78, '#2b2118', 3);
  scenePoly(ctx, [[448, 108], [492, 108], [482, 78], [458, 78]], '#d94f30');
  sceneCircle(ctx, 470, 114, 8, on.has(2) ? '#ffe98a' : '#c9b896');
  if (on.has(2)) {
    ctx.save();
    ctx.globalAlpha = 0.25;
    sceneCircle(ctx, 470, 122, 42, '#ffe98a');
    ctx.restore();
  }

  // Rug.
  sceneEllipse(ctx, 320, 352, 140, 30, '#b65a7a');
  sceneEllipse(ctx, 320, 352, 108, 22, '#e8c98f');
  if (on.has(8)) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(320, 352, 108, 22, 0, 0, Math.PI * 2);
    ctx.clip();
    sceneRect(ctx, 400, 340, 10, 26, '#3f9d4e');
    ctx.restore();
  }

  // Cat asleep on the rug (difference 1).
  if (on.has(0)) {
    sceneEllipse(ctx, 320, 338, 34, 14, '#e8a13c');
    sceneCircle(ctx, 350, 332, 11, '#e8a13c');
    scenePoly(ctx, [[344, 324], [348, 314], [352, 324]], '#e8a13c');
    scenePoly(ctx, [[354, 324], [358, 314], [362, 324]], '#e8a13c');
    sceneLine(ctx, 356, 336, 366, 340, '#7a4a21', 2);
  }

  // Reading table with a stack of books.
  sceneRect(ctx, 215, 238, 210, 12, '#7a4a21');
  sceneRect(ctx, 228, 250, 10, 60, '#5d3a1a');
  sceneRect(ctx, 402, 250, 10, 60, '#5d3a1a');
  sceneRect(ctx, 330, 214, 56, 10, '#4a6fa5');
  sceneRect(ctx, 336, 204, 48, 10, '#d94f30');
  sceneRect(ctx, 342, 194, 40, 10, '#3f9d4e');

  // Teacup on the table (difference 4).
  if (on.has(3)) {
    sceneRoundRect(ctx, 240, 218, 30, 20, 4, '#fdf3e3');
    ctx.beginPath();
    ctx.arc(272, 228, 7, -Math.PI / 2, Math.PI / 2);
    ctx.strokeStyle = '#fdf3e3';
    ctx.lineWidth = 4;
    ctx.stroke();
    sceneLine(ctx, 250, 212, 250, 204, '#b9c4cc', 2);
    sceneLine(ctx, 258, 212, 258, 203, '#b9c4cc', 2);
  }

  // Potted plant, bottom right.
  sceneRect(ctx, 552, 296, 34, 26, '#d94f30');
  sceneEllipse(ctx, 569, 296, 20, 6, '#b03a24');
  sceneEllipse(ctx, 556, 282, 10, 16, '#3f9d4e');
  sceneEllipse(ctx, 582, 282, 10, 16, '#4cb45c');
  sceneEllipse(ctx, 569, 274, 10, 18, '#3f9d4e');
  if (on.has(5)) {
    sceneCircle(ctx, 569, 262, 7, '#e85d75');
    sceneCircle(ctx, 569, 262, 3, '#f2b705');
  }
}

const SCENES = [
  {
    id: 'sunny-park',
    name: 'Sunny Park',
    tagline: 'A lazy afternoon in the park',
    timeLimit: 90,
    draw: drawSunnyPark,
    diffs: [
      { label: 'Apples on the tree', x: 170, y: 125, r: 34, hint: 'Look up in the tree — something red is growing.' },
      { label: 'Cushion on the bench', x: 485, y: 232, r: 28, hint: 'The bench looks softer on one side.' },
      { label: 'Bird in the sky', x: 420, y: 72, r: 24, hint: 'Something is flying high above the path.' },
      { label: 'A yellow tulip', x: 300, y: 344, r: 24, hint: 'One flower in the bed changed its colour.' },
      { label: 'Kite in the sky', x: 545, y: 96, r: 28, hint: 'High on the right, something colourful is flying.' },
    ],
  },
  {
    id: 'harbour-dusk',
    name: 'Harbour at Dusk',
    tagline: 'The lighthouse wakes as the sun goes down',
    timeLimit: 75,
    draw: drawHarbourDusk,
    diffs: [
      { label: 'Lighthouse beam', x: 185, y: 102, r: 34, hint: 'The lighthouse is shining on one side only.' },
      { label: 'Red sail', x: 330, y: 235, r: 30, hint: 'The big sailboat changed its sail.' },
      { label: 'Third gull', x: 482, y: 74, r: 24, hint: 'Count the birds — one side has an extra.' },
      { label: 'Lit cottage window', x: 539, y: 259, r: 22, hint: 'Someone left a light on in the cottages.' },
      { label: 'Buoy in the water', x: 240, y: 328, r: 24, hint: 'Something red is bobbing in the harbour.' },
      { label: 'Bright star', x: 470, y: 45, r: 22, hint: 'A star near the moon is shining brighter.' },
      { label: 'Rope coil on the dock', x: 590, y: 296, r: 24, hint: 'The dock is tidier on one side.' },
    ],
  },
  {
    id: 'cosy-bookshop',
    name: 'Cosy Bookshop',
    tagline: 'Nine small secrets on the shelves',
    timeLimit: 60,
    draw: drawCosyBookshop,
    diffs: [
      { label: 'Cat on the rug', x: 320, y: 336, r: 32, hint: 'Something warm and orange is napping on the rug.' },
      { label: 'Clock hands', x: 320, y: 80, r: 28, hint: 'The clock on the wall shows a different time.' },
      { label: 'Lamp glow', x: 470, y: 122, r: 26, hint: 'The hanging lamp is glowing on one side.' },
      { label: 'Teacup on the table', x: 255, y: 228, r: 22, hint: 'A cup of tea appeared on the reading table.' },
      { label: 'Red book spine', x: 110, y: 188, r: 22, hint: 'One book on the middle shelf changed colour.' },
      { label: 'Flower on the plant', x: 569, y: 262, r: 24, hint: 'The plant by the window is blooming.' },
      { label: 'Moon in the window', x: 572, y: 88, r: 26, hint: 'Look through the window — the night sky differs.' },
      { label: 'Poster on the wall', x: 434, y: 183, r: 26, hint: 'A picture hangs on the wall on one side.' },
      { label: 'Green stripe on the rug', x: 408, y: 352, r: 24, hint: 'The rug has an extra stripe on the right.' },
    ],
  },
];
