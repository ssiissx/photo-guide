/* scenes.js: every picture in the guide is drawn here.
   Photo-like "prints" use fixed film colours (a photo looks the same in any theme);
   diagrams use theme classes (.t-ink, .f-line …) so they follow light/dark. */

const C = {
  ink: '#2B241F', paper: '#FBF7EF', skin: '#E7B793', skinS: '#B9805E', hair: '#3A2A22',
  red: '#C8432F', yellow: '#E7B33E', teal: '#2F7C77', navy: '#34405A', olive: '#6E8550',
  stone: '#B9AE9C', stoneD: '#7E7262', brick: '#B9714F', roof: '#9C4F38', glass: '#A9C6CF',
  lamp: '#FFD27A', sil: '#1E1614', white: '#FBF8F2'
};

/* svg builder: each picture gets unique gradient/filter ids */
function mk() {
  const id = 'p' + (++mk.n);
  let defs = '', k = 0;
  return {
    lin(c1, c2, x2 = 0, y2 = 1, mid) {
      const g = id + 'g' + (k++);
      defs += `<linearGradient id="${g}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${c1}"/>` +
        (mid ? `<stop offset="${mid[0]}" stop-color="${mid[1]}"/>` : '') + `<stop offset="1" stop-color="${c2}"/></linearGradient>`;
      return `url(#${g})`;
    },
    stops(list, x2 = 0, y2 = 1) {
      const g = id + 'g' + (k++);
      defs += `<linearGradient id="${g}" x1="0" y1="0" x2="${x2}" y2="${y2}">` +
        list.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('') + `</linearGradient>`;
      return `url(#${g})`;
    },
    rad(c1, c2, cx = .5, cy = .5, r = .5) {
      const g = id + 'g' + (k++);
      defs += `<radialGradient id="${g}" cx="${cx}" cy="${cy}" r="${r}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>`;
      return `url(#${g})`;
    },
    blur(sd) {
      const f = id + 'f' + (k++);
      defs += `<filter id="${f}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
      return `url(#${f})`;
    },
    clip(shape) {
      const c = id + 'c' + (k++);
      defs += `<clipPath id="${c}">${shape}</clipPath>`;
      return `url(#${c})`;
    },
    svg(w, h, body, label, cls = 'scene') {
      return `<svg class="${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}"><defs>${defs}</defs>${body}</svg>`;
    }
  };
}
mk.n = 0;

/* ---------- primitives ---------- */
const R = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const circ = (x, y, r, fill, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const ell = (x, y, rx, ry, fill, extra = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const poly = (pts, fill, extra = '') => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${fill}" ${extra}/>`;
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (x1, y1, x2, y2, col, w = 2, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;

function ridge(pts, base, fill, extra = '') {
  let d = `M${pts[0][0]},${base} L${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1], [x, y] = pts[i];
    d += ` Q${px},${py} ${(px + x) / 2},${(py + y) / 2}`;
  }
  const l = pts[pts.length - 1];
  d += ` L${l[0]},${l[1]} L${l[0]},${base} Z`;
  return path(d, fill, extra);
}

function sun(x, y, r, col = '#FFF1C9', halo = '#FFE3A1', ho = .35) {
  return circ(x, y, r * 2.1, halo, `opacity="${ho * .5}"`) + circ(x, y, r * 1.45, halo, `opacity="${ho}"`) + circ(x, y, r, col);
}

function cloud(x, y, s, col = '#FFFFFF', op = .85) {
  return `<g opacity="${op}" fill="${col}">` + ell(x, y, 34 * s, 11 * s, col) + ell(x - 16 * s, y - 7 * s, 16 * s, 11 * s, col) +
    ell(x + 10 * s, y - 11 * s, 20 * s, 14 * s, col) + ell(x + 28 * s, y - 2 * s, 14 * s, 9 * s, col) + `</g>`;
}

function birds(x, y, s = 1, col = C.ink) {
  const b = (bx, by, k) => `<path d="M${bx - 7 * k},${by - 3 * k} Q${bx - 3 * k},${by - 5 * k} ${bx},${by} Q${bx + 3 * k},${by - 5 * k} ${bx + 7 * k},${by - 3 * k}" stroke="${col}" stroke-width="${1.6 * k}" fill="none" stroke-linecap="round"/>`;
  return b(x, y, s) + b(x + 18 * s, y + 8 * s, s * .8) + b(x - 14 * s, y + 12 * s, s * .7);
}

function tree(x, base, h, col = '#5F7A4C', trunk = '#5A4334') {
  return R(x - h * .035, base - h * .45, h * .07, h * .45, trunk) +
    circ(x, base - h * .62, h * .26, col) + circ(x - h * .17, base - h * .48, h * .2, col) + circ(x + h * .18, base - h * .5, h * .19, col);
}

function tower(x, base, h, col = '#6E6A72', pod = '#D9D2C6') {
  return poly([[x - h * .05, base], [x + h * .05, base], [x + h * .016, base - h * .72], [x - h * .016, base - h * .72]], col) +
    R(x - h * .075, base - h * .8, h * .15, h * .075, pod, `rx="${h * .03}"`) +
    R(x - h * .05, base - h * .835, h * .1, h * .04, col, `rx="${h * .015}"`) +
    line(x, base - h * .83, x, base - h, col, Math.max(1, h * .012));
}

function lighthouse(x, base, h) {
  const w0 = h * .16, w1 = h * .1;
  return poly([[x - w0 / 2, base], [x + w0 / 2, base], [x + w1 / 2, base - h * .8], [x - w1 / 2, base - h * .8]], '#F4EEE4') +
    poly([[x - w0 * .47, base - h * .3], [x + w0 * .47, base - h * .3], [x + w0 * .44, base - h * .42], [x - w0 * .44, base - h * .42]], C.red) +
    poly([[x - w0 * .4, base - h * .58], [x + w0 * .4, base - h * .58], [x + w0 * .37, base - h * .68], [x - w0 * .37, base - h * .68]], C.red) +
    R(x - w1 * .45, base - h * .92, w1 * .9, h * .12, '#FFE7A8') + path(`M${x - w1 * .7},${base - h * .92} L${x},${base - h} L${x + w1 * .7},${base - h * .92}Z`, C.ink);
}

function boat(x, y, s, hull = '#7A3F2E', sail = '#F3EBDD') {
  return path(`M${x - 18 * s},${y} L${x + 18 * s},${y} L${x + 12 * s},${y + 6 * s} L${x - 13 * s},${y + 6 * s}Z`, hull) +
    path(`M${x - 1 * s},${y - 2 * s} L${x - 1 * s},${y - 30 * s} L${x + 15 * s},${y - 2 * s}Z`, sail) +
    path(`M${x - 3 * s},${y - 2 * s} L${x - 3 * s},${y - 24 * s} L${x - 14 * s},${y - 2 * s}Z`, sail, 'opacity=".85"');
}

/* building; lean > 0 pulls the top inward (keystone) */
function bld(o) {
  const { x, y, w, h, fill = C.stone, win = '#6F7C86', cols = 3, rows = 5, lean = 0, roof = null, roofCol = C.roof, door = false, lit = 0 } = o;
  const P = (u, v) => { const xl = x + lean * v, xr = x + w - lean * v; return [xl + (xr - xl) * u, y - h * v]; };
  let s = poly([P(0, 0), P(1, 0), P(1, 1), P(0, 1)], fill);
  if (roof === 'tri') s += poly([P(-.04, 1), P(1.04, 1), [(P(0, 1)[0] + P(1, 1)[0]) / 2, y - h - (w - 2 * lean) * .38]], roofCol);
  if (roof === 'flat') s += poly([P(-.03, 1), P(1.03, 1), P(1.03, 1.03), P(-.03, 1.03)], roofCol);
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const u0 = (c + .28) / cols, u1 = (c + .72) / cols, v0 = (r + .32) / (rows + .2), v1 = (r + .78) / (rows + .2);
    if (door && r === 0 && c === Math.floor(cols / 2)) continue;
    const on = lit && ((c * 7 + r * 3) % 5 < lit * 5);
    s += poly([P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)], on ? C.lamp : win);
  }
  if (door) { const c = Math.floor(cols / 2); s += poly([P((c + .2) / cols, 0), P((c + .8) / cols, 0), P((c + .8) / cols, .16), P((c + .2) / cols, .16)], '#4E3B30'); }
  return s;
}

/* person: y = feet, h = height. legs = hip height ratio (short ~.40, long ~.52) */
function person(o) {
  const { x, y, h = 100, shirt = C.red, pants = C.navy, skin = C.skin, hair = C.hair, sil = null, pose = 'stand', legs = .47, sx = 1, op = 1, eyesClosed = false } = o;
  const k = sil ? { shirt: sil, pants: sil, skin: sil, hair: sil } : { shirt, pants, skin, hair };
  const r = h * .075, hip = y - h * legs, sh = y - h * .82, tw = h * .23, lw = h * .085;
  const hy = y - h + r;
  const st = (d, col, w) => `<path d="${d}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  let s = '';
  if (pose === 'walk' || pose === 'run') {
    const a = pose === 'run' ? .2 : .13;
    s += st(`M${x - lw * .3},${hip} L${x - h * a},${y}`, k.pants, lw) + st(`M${x + lw * .3},${hip} L${x + h * a * .9},${y - h * .02}`, k.pants, lw);
  } else if (pose === 'jump') {
    s += st(`M${x - lw * .5},${hip} L${x - h * .14},${hip + h * .2} L${x - h * .06},${y - h * .06}`, k.pants, lw) +
      st(`M${x + lw * .5},${hip} L${x + h * .15},${hip + h * .16} L${x + h * .22},${y - h * .1}`, k.pants, lw);
  } else {
    s += R(x - tw * .44, hip - 2, lw, y - hip + 2, k.pants, `rx="${lw * .4}"`) + R(x + tw * .44 - lw, hip - 2, lw, y - hip + 2, k.pants, `rx="${lw * .4}"`);
  }
  s += R(x - tw / 2, sh, tw, hip - sh + h * .05, k.shirt, `rx="${tw * .32}"`);
  const ay = sh + h * .045, ax = tw / 2 - h * .025, aw = h * .062;
  const arms = {
    stand: [[x - ax, ay, x - ax - h * .045, hip + h * .03], [x + ax, ay, x + ax + h * .045, hip + h * .03]],
    up: [[x - ax, ay, x - h * .21, sh - h * .2], [x + ax, ay, x + h * .21, sh - h * .2]],
    wave: [[x - ax, ay, x - ax - h * .045, hip + h * .03], [x + ax, ay, x + h * .2, sh - h * .2]],
    walk: [[x - ax, ay, x - h * .12, hip + h * .01], [x + ax, ay, x + h * .1, hip - h * .02]],
    run: [[x - ax, ay, x - h * .16, ay + h * .14], [x + ax, ay, x + h * .17, ay + h * .04]],
    jump: [[x - ax, ay, x - h * .22, sh - h * .18], [x + ax, ay, x + h * .22, sh - h * .18]],
    selfie: [[x - ax, ay, x - ax - h * .045, hip + h * .03], [x + ax, ay, x + h * .3, sh - h * .05]]
  }[pose] || [];
  arms.forEach(a => { s += st(`M${a[0]},${a[1]} L${a[2]},${a[3]}`, k.shirt, aw); });
  s += R(x - r * .38, hy + r * .5, r * .76, sh - hy - r * .3, k.skin);
  s += circ(x, hy, r, k.skin);
  if (!sil) {
    s += path(`M${x - r * 1.02},${hy + r * .15} A${r * 1.02},${r * 1.02} 0 0 1 ${x + r * 1.02},${hy + r * .15} Q${x + r * .3},${hy - r * .3} ${x - r * 1.02},${hy + r * .15}Z`, k.hair);
    if (h > 120) {
      const ey = hy + r * .12;
      s += eyesClosed ? st(`M${x - r * .5},${ey} l${r * .28},0 M${x + r * .22},${ey} l${r * .28},0`, '#3A2A22', r * .1)
        : circ(x - r * .36, ey, r * .1, '#2A1F1A') + circ(x + r * .36, ey, r * .1, '#2A1F1A');
    }
  }
  return `<g opacity="${op}"${sx !== 1 ? ` transform="translate(${x},0) scale(${sx},1) translate(${-x},0)"` : ''}>${s}</g>`;
}

/* annotation label on a photo (handwriting, light with dark outline) */
function lab(x, y, text, o = {}) {
  const { size = 22, col = '#FFF8EC', stroke = '#2B241F', anchor = 'middle', rot = 0 } = o;
  return `<text class="hand anno" x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="${col}" stroke="${stroke}" stroke-width="${size * .2}" stroke-linejoin="round" paint-order="stroke"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}>${text}</text>`;
}
/* red-pen arrow and ring */
function arrow(x1, y1, x2, y2, col = '#FFF8EC', w = 2.6, s = 10, bend = 0) {
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const a = Math.atan2(y2 - my, x2 - mx);
  const p1 = [x2 - s * Math.cos(a - .5), y2 - s * Math.sin(a - .5)], p2 = [x2 - s * Math.cos(a + .5), y2 - s * Math.sin(a + .5)];
  const d = `M${x1},${y1} Q${mx},${my} ${x2},${y2} M${p1} L${x2},${y2} L${p2}`;
  return `<g class="anno"><path d="${d}" stroke="#2B241F" stroke-width="${w + 2.4}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>` +
    `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}
function ring(x, y, rx, ry, col = '#FF6B4A', rot = -8) {
  return `<ellipse class="anno" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="none" stroke="${col}" stroke-width="3" stroke-dasharray="${rx * 5.4} 14" transform="rotate(${rot} ${x} ${y})" stroke-linecap="round"/>`;
}
function grid3(w, h, col = 'rgba(255,250,240,.75)') {
  return `<g stroke="${col}" stroke-width="1.4" stroke-dasharray="5 5">` + line(w / 3, 0, w / 3, h, col, 1.4) + line(2 * w / 3, 0, 2 * w / 3, h, col, 1.4) +
    line(0, h / 3, w, h / 3, col, 1.4) + line(0, 2 * h / 3, w, 2 * h / 3, col, 1.4) + `</g>`;
}
/* paper tag inside a photo (fixed colours) */
function tag(x, y, text, o = {}) {
  const { size = 15, anchor = 'start', bg = 'rgba(251,247,239,.92)', col = C.ink } = o;
  const w = text.length * size * .92 + 14;
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  return R(x0, y - size - 4, w, size + 11, bg, 'rx="3"') + `<text class="sans" x="${x0 + 7}" y="${y + 1}" font-size="${size}" fill="${col}">${text}</text>`;
}

/* ---------- backgrounds ---------- */
const SKY = {
  day: ['#86B4CC', '#DCEBE8'], gold: ['#D9774A', '#F7D79C'], blue: ['#1F355A', '#6D88AA'],
  night: ['#0B1020', '#1E2742'], grey: ['#B7BBBA', '#DADBD5'], washed: ['#EEF1EE', '#E2E8E4'], dawn: ['#C9B6C8', '#F4DCC8']
};
function sky(b, kind, w, h) { const [a, z] = SKY[kind]; return R(0, 0, w, h, b.lin(a, z)); }

/* ---------- scenes ---------- */
const SC = {};

SC.cover = () => {
  const b = mk();
  let s = R(0, 0, 400, 192, b.lin('#C9664A', '#F7D79C', 0, 1, [.55, '#EFA56A'])) + sun(286, 168, 19);
  s += ridge([[0, 178], [40, 170], [90, 181], [140, 189], [400, 190]], 192, '#8C5646');
  s += R(0, 190, 400, 110, b.lin('#E39A64', '#5E3A35'));
  for (let i = 0; i < 9; i++) s += R(286 - (22 - i * 2), 196 + i * 11, (22 - i * 2) * 2, 2.5, '#FFE3A8', `opacity="${.75 - i * .07}"`);
  s += path('M0,214 Q70,206 128,214 Q168,222 190,300 L0,300Z', '#3A2420');
  s += person({ x: 92, y: 214, h: 62, sil: '#22140F', pose: 'wave' });
  s += birds(330, 86, 1.1, '#5A2F25');
  return b.svg(400, 300, s, '골든아워 해안 절벽 위에서 손을 든 사람의 실루엣');
};

SC.quality = () => {
  const b = mk();
  const panel = (ox, hard) => {
    let s = R(ox, 0, 196, 260, hard ? b.lin('#6FA7C7', '#CFE4EA') : b.lin('#A9AEB0', '#D8D9D4'));
    s += R(ox, 175, 196, 85, hard ? '#C9B98F' : '#B9B29C');
    if (hard) s += sun(ox + 36, 36, 11, '#FFFBEA', '#FFF2C2', .5);
    else s += cloud(ox + 98, 46, 2.2, '#EEEDE8', .95) + cloud(ox + 40, 70, 1.2, '#E4E3DD', .9);
    const cx = ox + 104, cy = 168;
    if (hard) {
      s += ell(cx + 40, cy + 26, 52, 11, '#3E3528', 'opacity=".55"');
      s += circ(cx, cy, 32, b.stops([[0, '#F0B27A'], [.52, '#E39A5E'], [.53, '#9B5A35'], [1, '#7A4428']], 1, 1));
    } else {
      s += ell(cx + 10, cy + 28, 50, 12, '#3E3528', `opacity=".4" filter="${b.blur(7)}"`);
      s += circ(cx, cy, 32, b.rad('#F2BF8E', '#A8693F', .38, .32, .75));
    }
    s += tag(ox + 98, 244, hard ? '강한 빛 · 작은 광원' : '부드러운 빛 · 넓은 광원', { anchor: 'middle', size: 14 });
    return s;
  };
  return b.svg(400, 260, panel(0, true) + panel(204, false) + R(196, 0, 8, 260, 'var(--paper-2)'), '강한 빛은 그림자 경계가 선명하고 부드러운 빛은 그림자가 흐리게 퍼진다');
};

SC.daylight = () => {
  const b = mk();
  const mini = (kind) => {
    let s = '';
    const W = 196, H = 146, g = 104;
    if (kind === 'noon') {
      s += R(0, 0, W, H, b.lin('#7FB2D0', '#D6E8EC')) + sun(150, 22, 8, '#FFFDF2', '#FFF5D0', .4) + R(0, g, W, H - g, '#A9B77B');
      s += bld({ x: 44, y: g, w: 44, h: 30, fill: '#EDE4D3', win: '#7E8C96', cols: 2, rows: 1, roof: 'tri' }) + ell(66, g + 3, 26, 3, '#4D4A33', 'opacity=".45"');
      s += tree(130, g, 44, '#6E8A55') + ell(130, g + 2, 13, 3, '#3F4A2C', 'opacity=".5"');
    } else if (kind === 'gold') {
      s += R(0, 0, W, H, b.lin('#E3884F', '#F6D597')) + sun(170, 88, 10, '#FFEFC4', '#FFDFA0', .45) + R(0, g, W, H - g, '#B9884F');
      s += poly([[44, g], [88, g], [20, g + 14], [-30, g + 14]], '#5E3B22', 'opacity=".5"') + poly([[124, g], [136, g], [60, g + 10], [40, g + 10]], '#5E3B22', 'opacity=".5"');
      s += bld({ x: 44, y: g, w: 44, h: 30, fill: '#F2C48C', win: '#8C5A3C', cols: 2, rows: 1, roof: 'tri', roofCol: '#8E4A30' }) + tree(130, g, 44, '#8C7A3E', '#5A3A24');
    } else if (kind === 'blue') {
      s += R(0, 0, W, H, b.lin('#1F355A', '#7290B2')) + R(0, g, W, H - g, '#2A3452');
      s += bld({ x: 44, y: g, w: 44, h: 30, fill: '#3E4A68', win: C.lamp, cols: 2, rows: 1, roof: 'tri', roofCol: '#2D3550' }) + tree(130, g, 44, '#26324A', '#1E2638');
      s += line(170, g, 170, g - 34, '#1C2236', 2) + circ(170, g - 36, 9, '#FFD27A', 'opacity=".35"') + circ(170, g - 36, 3.5, '#FFE6AE');
    } else {
      s += R(0, 0, W, H, b.lin('#0A0F1E', '#1C2540')) + R(0, g, W, H - g, '#121828');
      [[20, 18], [60, 34], [98, 12], [140, 28], [176, 50], [34, 60], [120, 58]].forEach(([x, y]) => { s += circ(x, y, 1.2, '#E9E4D6'); });
      s += circ(160, 24, 9, '#EFE8D2') + circ(156, 21, 8, '#0D1324');
      s += bld({ x: 44, y: g, w: 44, h: 30, fill: '#232B42', win: C.lamp, cols: 2, rows: 1, roof: 'tri', roofCol: '#1A2034', lit: 1 }) + tree(130, g, 44, '#151C2D', '#10141F');
    }
    return s;
  };
  const cell = (x, y, kind, t) => `<svg x="${x}" y="${y}" width="196" height="146" viewBox="0 0 196 146">${mini(kind)}${tag(8, 136, t, { size: 13 })}</svg>`;
  const s = cell(0, 0, 'noon', '한낮 · 그림자 짧고 진함') + cell(204, 0, 'gold', '골든아워 · 길고 따뜻함') +
    cell(0, 154, 'blue', '블루아워 · 파랑과 불빛') + cell(204, 154, 'night', '밤 · 인공조명');
  return b.svg(400, 300, s, '한낮, 골든아워, 블루아워, 밤의 빛 비교');
};

SC.window = () => {
  const b = mk();
  let s = R(36, 34, 328, 232, 'none', 'class="s-line" stroke-width="2" rx="4"');
  s += poly([[150, 36], [262, 36], [342, 262], [70, 262]], 'var(--yellow)', 'opacity=".16"');
  s += R(150, 30, 112, 10, 'var(--yellow)', 'rx="2"');
  s += `<text class="sans t-mut" x="206" y="24" font-size="14" text-anchor="middle">창</text>`;
  const cam = (x, y, rot, l, t1, t2, tx, ty, anchor) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-15" y="-10" width="30" height="20" rx="4" class="f-ink"/><circle cx="0" cy="-10" r="5" class="f-paper s-ink" stroke-width="2"/></g>` +
    `<circle cx="${x}" cy="${y}" r="13" fill="none" class="s-acc" stroke-width="0"/>` +
    `<text class="mono t-acc" x="${x + (anchor === 'end' ? -24 : 24)}" y="${y + 5}" font-size="16" font-weight="600" text-anchor="${anchor === 'end' ? 'end' : 'start'}">${l}</text>` +
    `<text class="sans t-ink" x="${tx}" y="${ty}" font-size="14" font-weight="600" text-anchor="${anchor}">${t1}</text>` +
    `<text class="sans t-mut" x="${tx}" y="${ty + 18}" font-size="13" text-anchor="${anchor}">${t2}</text>`;
  s += `<line x1="206" y1="88" x2="206" y2="128" class="s-line" stroke-width="1.5" stroke-dasharray="4 4"/>`;
  s += `<line x1="300" y1="160" x2="230" y2="160" class="s-line" stroke-width="1.5" stroke-dasharray="4 4"/>`;
  s += `<line x1="206" y1="232" x2="206" y2="190" class="s-line" stroke-width="1.5" stroke-dasharray="4 4"/>`;
  s += cam(206, 76, 180, 'A', '순광', '밝고 평평', 120, 74, 'end');
  s += cam(312, 160, 90, 'B', '측광', '입체적', 300, 202, 'end');
  s += cam(206, 244, 0, 'C', '역광', '얼굴 어두움', 120, 238, 'end');
  s += circ(206, 160, 21, 'var(--paper-2)', 'class="s-ink" stroke-width="2"') + ell(206, 160, 32, 13, 'none', 'class="s-ink" stroke-width="2"');
  s += `<text class="sans t-mut" x="206" y="165" font-size="12" text-anchor="middle">인물</text>`;
  return b.svg(400, 280, s, '창가에서 카메라 위치 A, B, C에 따른 빛의 차이를 위에서 본 도식', 'dg');
};

SC.triangle = () => {
  const b = mk();
  const A = [200, 80], S = [78, 230], I = [322, 230];
  let s = `<polygon points="${[A, S, I].map(p => p.join(',')).join(' ')}" fill="none" class="s-line" stroke-width="2" stroke-dasharray="6 6"/>`;
  s += circ(200, 178, 30, 'var(--paper-2)', 'class="s-ink" stroke-width="2"') + `<text class="sans t-ink" x="200" y="184" font-size="16" font-weight="600" text-anchor="middle">밝기</text>`;
  const node = ([x, y], icon) => circ(x, y, 26, 'var(--paper-2)', 'class="s-ink" stroke-width="2"') + icon(x, y);
  const ap = (x, y) => { let t = ''; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; t += `<line x1="${x + 7 * Math.cos(a)}" y1="${y + 7 * Math.sin(a)}" x2="${x + 18 * Math.cos(a + .9)}" y2="${y + 18 * Math.sin(a + .9)}" class="s-ink" stroke-width="2"/>`; } return t + circ(x, y, 18, 'none', 'class="s-ink" stroke-width="2"'); };
  const sh = (x, y) => circ(x, y, 15, 'none', 'class="s-ink" stroke-width="2"') + `<path d="M${x},${y} L${x},${y - 11} M${x},${y} L${x + 8},${y + 4}" class="s-ink" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
  const iso = (x, y) => `<text class="mono t-ink" x="${x}" y="${y + 5}" font-size="14" font-weight="600" text-anchor="middle">ISO</text>`;
  s += node(A, ap) + node(S, sh) + node(I, iso);
  s += `<text class="sans t-ink" x="200" y="20" font-size="16" font-weight="600" text-anchor="middle">조리개</text>`;
  s += `<rect x="238" y="66" width="118" height="26" rx="13" fill="var(--red)"/><text class="sans" x="297" y="84" font-size="13" text-anchor="middle" fill="var(--on-red)">아이폰: 고정</text>`;
  s += `<text class="sans t-mut" x="200" y="40" font-size="13" text-anchor="middle">열수록 배경 흐림</text>`;
  s += `<text class="sans t-ink" x="78" y="280" font-size="16" font-weight="600" text-anchor="middle">셔터 속도</text><text class="sans t-mut" x="78" y="300" font-size="13" text-anchor="middle">길수록 흔들림·번짐</text>`;
  s += `<text class="sans t-ink" x="322" y="280" font-size="16" font-weight="600" text-anchor="middle">ISO</text><text class="sans t-mut" x="322" y="300" font-size="13" text-anchor="middle">높을수록 노이즈</text>`;
  s += `<text class="sans t-acc" x="200" y="252" font-size="13" text-anchor="middle">아이폰: 둘 다 자동</text>`;
  return b.svg(400, 310, s, '노출 삼각형: 조리개, 셔터 속도, ISO', 'dg');
};

SC.metering = () => {
  const b = mk();
  const tile = (x, y, kind, cam) => {
    let s = '';
    const W = 108, H = 76;
    if (kind === 'snow') {
      s += R(0, 0, W, H, cam ? '#A4A7A6' : '#F4F5F1') + path(`M0,${H * .55} Q50,${H * .4} ${W},${H * .6} L${W},${H} L0,${H}Z`, cam ? '#8F9393' : '#DCE5EE');
      s += person({ x: 70, y: 60, h: 30, shirt: cam ? '#7E4A40' : C.red, pants: '#3A3F4C' });
    } else if (kind === 'grey') {
      s += R(0, 0, W, H, '#8E8C86') + R(18, 14, 30, 40, '#7D7B75') + R(60, 14, 30, 40, '#7D7B75');
    } else {
      s += R(0, 0, W, H, cam ? '#57575A' : '#121214') + person({ x: 54, y: 72, h: 52, shirt: cam ? '#F1E6DA' : '#C9583F', pants: cam ? '#C6C0B8' : '#332A2A', skin: cam ? '#FFF1E2' : C.skin });
    }
    return `<svg x="${x}" y="${y}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>`;
  };
  let s = `<text class="sans t-ink" x="16" y="20" font-size="14" font-weight="600">실제 장면</text>`;
  s += tile(16, 30, 'snow', 0) + tile(146, 30, 'grey', 0) + tile(276, 30, 'black', 0);
  s += `<text class="sans t-mut" x="70" y="124" font-size="13" text-anchor="middle">흰 눈밭</text><text class="sans t-mut" x="200" y="124" font-size="13" text-anchor="middle">회색 벽</text><text class="sans t-mut" x="330" y="124" font-size="13" text-anchor="middle">검은 배경</text>`;
  s += `<path d="M200,134 L200,154 M193,148 L200,155 L207,148" class="s-acc" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<text class="sans t-ink" x="16" y="160" font-size="14" font-weight="600">카메라 결과</text><text class="sans t-acc" x="384" y="160" font-size="13" text-anchor="end">전부 중간 밝기로</text>`;
  s += tile(16, 170, 'snow', 1) + tile(146, 170, 'grey', 1) + tile(276, 170, 'black', 1);
  s += `<text class="sans t-acc" x="70" y="266" font-size="14" font-weight="600" text-anchor="middle">노출 + 필요</text><text class="sans t-mut" x="200" y="266" font-size="14" text-anchor="middle">그대로</text><text class="sans t-acc" x="330" y="266" font-size="14" font-weight="600" text-anchor="middle">노출 − 필요</text>`;
  return b.svg(400, 278, s, '카메라는 흰 장면도 검은 장면도 중간 밝기로 맞춘다', 'dg');
};

SC.iphoneui = () => {
  const b = mk();
  const ph = `<rect x="22" y="8" width="168" height="284" rx="26" class="f-ink"/>`;
  const vf = b;
  let v =R(0, 0, 150, 252, vf.lin('#C9664A', '#F7D79C', 0, 1, [.5, '#EFA56A'])) + sun(100, 132, 11) + R(0, 140, 150, 112, '#7C4A3A');
  v += person({ x: 52, y: 214, h: 92, sil: '#2A1813', pose: 'stand' });
  v += `<rect x="78" y="106" width="46" height="46" fill="none" stroke="#FFD60A" stroke-width="2"/>`;
  v += line(134, 92, 134, 114, '#FFD60A', 1.6) + line(134, 138, 134, 166, '#FFD60A', 1.6) + circ(134, 126, 5.5, '#FFD60A');
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; v += line(134 + 7.5 * Math.cos(a), 126 + 7.5 * Math.sin(a), 134 + 10 * Math.cos(a), 126 + 10 * Math.sin(a), '#FFD60A', 1.4); }
  v += R(38, 14, 74, 20, '#FFD60A', 'rx="4"') + `<text class="sans" x="75" y="28" font-size="11.5" font-weight="700" text-anchor="middle" fill="#1C1C1E">AE/AF 잠금</text>`;
  let s = ph + `<svg x="31" y="24" width="150" height="252" viewBox="0 0 150 252">${v}</svg>`;
  s += R(84, 280, 44, 4, '#F3EEE6', 'rx="2" opacity=".6"');
  const call = (n, y, t1, t2, tx, ty) =>
    `<path d="M${tx},${ty} L206,${y}" class="s-line" stroke-width="1.5" stroke-dasharray="3 4" fill="none"/>` +
    circ(222, y, 13, 'var(--red)') + `<text class="mono" x="222" y="${y + 5}" font-size="14" font-weight="600" text-anchor="middle" fill="var(--on-red)">${n}</text>` +
    `<text class="sans t-ink" x="242" y="${y - 2}" font-size="15" font-weight="600">${t1}</text><text class="sans t-mut" x="242" y="${y + 16}" font-size="13">${t2}</text>`;
  s += call('1', 120, '탭', '초점·밝기 기준', 155, 152) + call('2', 182, '위아래로 밀기', '밝기 조절', 168, 150) + call('3', 54, '길게 누르기', 'AE/AF 잠금', 143, 48);
  return b.svg(400, 300, s, '아이폰 카메라 화면에서 탭, 밀기, 길게 누르기로 노출을 조절하는 방법', 'dg');
};

SC.histogram = () => {
  const b = mk();
  const N = 64, W = 340, X0 = 34, Y0 = 186, H = 140;
  const vals = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    let v = .55 * Math.exp(-Math.pow((t - .32) / .13, 2)) + .35 * Math.exp(-Math.pow((t - .62) / .1, 2)) + .06;
    if (i >= N - 3) v = i === N - 1 ? 1 : .5;
    vals.push(v);
  }
  let d = `M${X0},${Y0}`;
  vals.forEach((v, i) => { d += ` L${X0 + (i + .5) * W / N},${Y0 - v * H}`; });
  d += ` L${X0 + W},${Y0} Z`;
  let s = `<g clip-path="${b.clip(R(X0, 30, W * (N - 3) / N, 160, '#000'))}">${path(d, 'var(--teal)', 'opacity=".55"')}</g>`;
  s += `<g clip-path="${b.clip(R(X0 + W * (N - 3) / N, 30, W * 3 / N + 2, 160, '#000'))}">${path(d, 'var(--red)')}</g>`;
  s += `<line x1="${X0}" y1="${Y0}" x2="${X0 + W}" y2="${Y0}" class="s-ink" stroke-width="2"/>`;
  [1, 2].forEach(k => { s += `<line x1="${X0 + W * k / 3}" y1="40" x2="${X0 + W * k / 3}" y2="${Y0}" class="s-line" stroke-width="1" stroke-dasharray="3 4"/>`; });
  s += `<text class="sans t-mut" x="${X0 + W / 6}" y="34" font-size="13" text-anchor="middle">그림자</text><text class="sans t-mut" x="${X0 + W / 2}" y="34" font-size="13" text-anchor="middle">중간</text><text class="sans t-mut" x="${X0 + W * 5 / 6}" y="34" font-size="13" text-anchor="middle">하이라이트</text>`;
  s += `<text class="sans t-ink" x="${X0}" y="${Y0 + 22}" font-size="13">← 어두움</text><text class="sans t-ink" x="${X0 + W}" y="${Y0 + 22}" font-size="13" text-anchor="end">밝음 →</text>`;
  s += `<path d="M250,62 Q330,52 ${X0 + W - 3},${Y0 - H + 8}" class="s-acc" stroke-width="2" fill="none"/><text class="sans t-acc" x="244" y="66" font-size="13" font-weight="600" text-anchor="end">끝에 벽처럼 쌓임</text><text class="sans t-acc" x="244" y="83" font-size="13" text-anchor="end">= 하이라이트 날아감</text>`;
  return b.svg(400, 216, s, '히스토그램: 오른쪽 끝에 쌓이면 하이라이트가 날아간 것', 'dg');
};

SC.hdr = () => {
  const b = mk();
  const room = (shade) => {
    let s = R(0, 0, 100, 70, '#8C7A66') + R(30, 10, 46, 42, '#BFE0F0') + R(30, 38, 46, 14, '#8DB36C') + tree(62, 46, 26, '#4E7A3F') + R(30, 10, 46, 42, 'none', 'stroke="#5B4A3B" stroke-width="3"');
    s += R(8, 50, 26, 20, '#A0563E') + R(70, 56, 22, 14, '#D8C9A8');
    if (shade === 'dark') s += R(0, 0, 100, 70, '#0B0806', 'opacity=".72"') + R(30, 10, 46, 42, '#BFE0F0', 'opacity=".55"') + tree(62, 46, 26, '#4E7A3F', '#3C2B1F');
    if (shade === 'bright') s += R(0, 0, 100, 70, '#FFFFFF', 'opacity=".25"') + R(29, 9, 48, 44, '#FFFFFF');
    return s;
  };
  const f = (x, y, sh, w = 100, h = 70) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 100 70">${room(sh)}</svg>`;
  let s = f(18, 14, 'dark') + f(150, 14, 'mid') + f(282, 14, 'bright');
  s += `<text class="sans t-mut" x="68" y="102" font-size="12.5" text-anchor="middle">어둡게: 창밖</text><text class="sans t-mut" x="200" y="102" font-size="12.5" text-anchor="middle">보통</text><text class="sans t-mut" x="332" y="102" font-size="12.5" text-anchor="middle">밝게: 실내</text>`;
  s += `<path d="M68,110 Q100,140 170,150 M200,110 L200,146 M332,110 Q300,140 230,150" class="s-acc" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  s += f(140, 152, 'mid', 120, 84) + R(140, 152, 120, 84, 'none', 'class="s-ink" stroke-width="2"');
  s += `<text class="sans t-ink" x="200" y="256" font-size="14" font-weight="600" text-anchor="middle">합친 결과: 창밖도 실내도 보임</text>`;
  return b.svg(400, 266, s, '스마트 HDR은 밝기가 다른 여러 장을 합친다', 'dg');
};

/* --- composition --- */
SC.simplify_bad = () => {
  const b = mk();
  let s = sky(b, 'day', 400, 300) + bld({ x: -10, y: 230, w: 120, h: 150, fill: '#D3BFA4', win: '#7E8B95', cols: 4, rows: 6 }) +
    bld({ x: 250, y: 230, w: 170, h: 175, fill: '#BFAF9C', win: '#7E8B95', cols: 5, rows: 7 }) + bld({ x: 110, y: 230, w: 140, h: 100, fill: '#E2D5C2', win: '#8E9AA3', cols: 4, rows: 3 });
  s += R(0, 230, 400, 70, '#9A948B');
  s += line(0, 40, 400, 80, '#2E2A27', 1.6) + line(0, 58, 400, 70, '#2E2A27', 1.4);
  s += line(206, 40, 206, 260, '#4D4844', 5) + R(186, 92, 40, 26, '#2F6FA8', 'rx="3"') + R(320, 170, 46, 30, '#E4B23A', 'rx="3"') + line(343, 200, 343, 262, '#4D4844', 4);
  s += R(60, 238, 24, 34, '#3D6B4C', 'rx="3"') + R(368, 250, 22, 28, '#7C7C7C', 'rx="3"');
  s += person({ x: 30, y: 282, h: 78, shirt: '#8C8C8C', pants: '#555', pose: 'walk', op: .9 }) + person({ x: 300, y: 276, h: 70, shirt: '#6C7D8C', pants: '#444', pose: 'walk' }) + person({ x: 120, y: 278, h: 66, shirt: '#B59A73', pants: '#4A4A4A' });
  s += person({ x: 206, y: 284, h: 88, shirt: C.red });
  s += lab(206, 30, '주인공이 어디?', { size: 26 }) + ring(206, 230, 32, 66);
  return b.svg(400, 300, s, '잡동사니가 많아 주인공이 묻힌 사진');
};
SC.simplify_good = () => {
  const b = mk();
  let s = R(0, 0, 400, 300, '#E9D3B7') + R(0, 0, 400, 300, b.lin('#EFDDC4', '#D9BC98', 1, 0));
  s += R(40, 30, 96, 150, '#5E7F86', 'rx="48" ry="48"') + R(40, 105, 96, 75, '#5E7F86') + R(48, 38, 80, 142, '#87A5A8', 'rx="40"') + R(48, 100, 80, 80, '#87A5A8');
  s += R(0, 250, 400, 50, '#C7A98A');
  s += person({ x: 268, y: 470, h: 430, shirt: C.red, pants: C.navy });
  s += lab(110, 230, '다가가서 빼기', { size: 26 });
  return b.svg(400, 300, s, '다가가서 배경을 단순하게 정리한 인물 사진');
};

SC.thirds_bad = () => {
  const b = mk();
  let s = R(0, 0, 400, 150, b.lin('#9CC3D6', '#E3EEEA')) + sun(200, 60, 15, '#FFFDF4', '#FFF4D0', .4) + R(0, 150, 400, 150, b.lin('#5E95A6', '#3C6E80'));
  s += boat(200, 152, 1.1) + grid3(400, 300) + lab(200, 140, '수평선이 한가운데', { size: 24 }) + lab(200, 236, '모든 게 정중앙', { size: 22 });
  return b.svg(400, 300, s, '수평선과 주인공이 정중앙에 있는 사진');
};
SC.thirds_good = () => {
  const b = mk();
  let s = R(0, 0, 400, 200, b.lin('#E7A16B', '#F6DFB4', 0, 1, [.5, '#F2C38F'])) + cloud(90, 60, 1.6, '#FBE9CF', .8) + cloud(300, 90, 1.2, '#FBE9CF', .7) +
    sun(330, 178, 13, '#FFF1C9') + R(0, 200, 400, 100, b.lin('#C98E62', '#5C4A4A'));
  s += boat(133, 202, 1.25, '#3A2B28', '#2E2422') + grid3(400, 300);
  s += circ(133, 200, 6, 'none', 'stroke="#FFF8EC" stroke-width="2.4"') + lab(150, 250, '아래 1/3 선', { size: 22, anchor: 'start' });
  return b.svg(400, 300, s, '수평선을 아래 1/3 선에, 배를 교차점에 둔 사진');
};

SC.leading = () => {
  const b = mk();
  let s = sky(b, 'day', 400, 150) + ridge([[0, 128], [80, 108], [160, 124], [240, 98], [320, 120], [400, 112]], 152, '#9DB0B3');
  s += R(0, 150, 400, 150, b.lin('#9FB46F', '#6D8A47'));
  s += poly([[226, 150], [236, 150], [330, 300], [110, 300]], '#D8C7A0');
  s += `<path d="M231,150 L222,300" stroke="#F6EFDF" stroke-width="2" stroke-dasharray="8 10"/>`;
  for (let i = 0; i < 8; i++) { const t = Math.pow(i / 7, 1.6); const yy = 152 + t * 148; const xl = 224 - t * 140, xr = 238 + t * 120; s += R(xl - 2 - t * 3, yy - 6 - t * 26, 3 + t * 5, 6 + t * 26, '#6B5440') + R(xr - t * 3, yy - 6 - t * 26, 3 + t * 5, 6 + t * 26, '#6B5440'); }
  s += bld({ x: 220, y: 151, w: 22, h: 14, fill: '#EFE7D8', win: '#7A6A5A', cols: 1, rows: 1, roof: 'tri' });
  s += person({ x: 214, y: 196, h: 34, shirt: C.yellow, pose: 'walk' });
  s += `<path d="M126,296 L224,156 M322,296 L238,156" stroke="#FFF8EC" stroke-width="2.4" stroke-dasharray="2 7" stroke-linecap="round" opacity=".9"/>`;
  s += lab(300, 230, '선 따라 시선이 이동', { size: 22 });
  return b.svg(400, 300, s, '길과 울타리가 소실점으로 모이며 사람에게 시선을 이끄는 사진');
};

SC.framing = () => {
  const b = mk();
  let s = R(0, 0, 400, 300, b.lin('#8DBFD8', '#E3F0EE')) + cloud(250, 70, 1.3) + R(0, 190, 400, 110, b.lin('#3F86A0', '#2C5F72')) + lighthouse(280, 192, 90);
  s += ridge([[220, 192], [250, 178], [300, 176], [330, 192]], 196, '#6F7F63');
  s += path('M0,0 H400 V300 H0Z M78,300 V150 A122,118 0 0 1 322,150 V300Z', '#4A3A31', 'fill-rule="evenodd"');
  for (let i = 0; i < 8; i++) s += line(0, 40 + i * 34, 70, 40 + i * 34, '#3A2D25', 2) + line(330, 40 + i * 34, 400, 40 + i * 34, '#3A2D25', 2);
  s += path('M78,150 A122,118 0 0 1 322,150', 'none', 'stroke="#3A2D25" stroke-width="6"');
  s += R(78, 270, 244, 30, '#7C6A58') + person({ x: 160, y: 274, h: 96, sil: '#241A15' });
  s += lab(200, 24, '어두운 틀 + 밝은 너머', { size: 23 });
  return b.svg(400, 300, s, '돌 아치로 바깥 풍경과 사람을 감싼 프레이밍 사진');
};

SC.symmetry = () => {
  const b = mk();
  const left = () => {
    let s = R(0, 0, 196, 150, b.lin('#F0C9A7', '#F8E6CF')) + poly([[30, 150], [98, 52], [166, 150]], '#6D6A82') + poly([[70, 150], [98, 92], [126, 150]], '#8F86A0', 'opacity=".6"');
    s += R(0, 150, 196, 150, b.lin('#F2D7BC', '#C9A98F')) + poly([[30, 150], [98, 248], [166, 150]], '#8A879B', 'opacity=".8"');
    for (let i = 0; i < 6; i++) s += line(20 + i * 8, 170 + i * 18, 176 - i * 8, 170 + i * 18, '#FBEBD8', 1.4, 'opacity=".6"');
    s += `<line x1="98" y1="6" x2="98" y2="294" stroke="#FFF8EC" stroke-width="1.6" stroke-dasharray="5 6"/>`;
    return s + tag(98, 288, '대칭은 정중앙', { anchor: 'middle', size: 13 });
  };
  const right = () => {
    let s = R(0, 0, 196, 300, '#D9D2C4');
    for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) {
      const x = 26 + c * 48, y = 34 + r * 54, red = r === 2 && c === 2;
      s += path(`M${x - 20},${y} Q${x},${y - 26} ${x + 20},${y}Z`, red ? C.red : (c + r) % 2 ? '#2F6C70' : '#37797C') + line(x, y, x, y + 16, '#4B3E33', 2);
    }
    return s + tag(98, 288, '하나만 다르게', { anchor: 'middle', size: 13 });
  };
  const s = `<svg x="0" y="0" width="196" height="300" viewBox="0 0 196 300">${left()}</svg><svg x="204" y="0" width="196" height="300" viewBox="0 0 196 300">${right()}</svg>`;
  return b.svg(400, 300, s, '호수 반영의 대칭 구도와, 반복되는 우산 가운데 빨간 우산 하나');
};

SC.space = () => {
  const b = mk();
  let s = R(0, 0, 400, 300, b.lin('#B9C6D8', '#F3DCCB', 0, 1, [.6, '#E9CFCB'])) + path('M0,252 Q120,240 240,250 T400,246 V300 H0Z', '#D9BFA3');
  s += poly([[300, 252], [306, 252], [262, 262], [250, 262]], '#7E6650', 'opacity=".45"');
  s += person({ x: 302, y: 252, h: 26, sil: '#2B201C', pose: 'walk' }) + birds(110, 92, .9, '#5A4A54');
  s += arrow(250, 196, 294, 228, '#FFF8EC', 2.4, 9, .15) + lab(236, 190, '주인공은 작게', { size: 22 });
  return b.svg(400, 300, s, '넓은 하늘과 모래 언덕 속에 작게 걷는 사람');
};

SC.layers = () => {
  const b = mk();
  let s = sky(b, 'day', 400, 300) + ridge([[0, 120], [70, 86], [150, 112], [230, 80], [310, 106], [400, 92]], 170, '#A7B9C0') +
    ridge([[0, 160], [100, 140], [200, 158], [300, 136], [400, 150]], 210, '#7F9C7A') + R(0, 196, 400, 104, '#9DB06A');
  s += path('M210,196 Q240,240 200,300 L270,300 Q290,240 222,196Z', '#D9C9A2');
  s += person({ x: 232, y: 236, h: 52, shirt: C.yellow });
  const fl = (x, y, r, col) => line(x, y, x + 4, 300, '#4F6B3A', 3) + circ(x, y, r, col) + circ(x, y, r * .35, '#F6D36B');
  s += fl(30, 214, 22, '#D9583F') + fl(78, 240, 18, '#E8875E') + fl(14, 268, 16, '#E0694A') + fl(120, 272, 14, '#F1A06F') + ell(70, 300, 120, 22, '#5F7D42');
  s += lab(320, 70, '후경', { size: 24 }) + arrow(320, 76, 300, 104, '#FFF8EC', 2.2, 8);
  s += lab(320, 216, '중경', { size: 24 }) + arrow(304, 210, 252, 214, '#FFF8EC', 2.2, 8);
  s += lab(150, 236, '전경', { size: 24 }) + arrow(132, 230, 96, 232, '#FFF8EC', 2.2, 8);
  return b.svg(400, 300, s, '전경 꽃, 중경 사람, 후경 산이 겹친 풍경');
};

SC.height = () => {
  const b = mk();
  let s = `<line x1="16" y1="232" x2="384" y2="232" class="s-ink" stroke-width="2"/>`;
  s += person({ x: 330, y: 232, h: 150, shirt: C.red });
  const cam = (y, t1, t2) => `<g transform="translate(44 ${y})"><rect x="-13" y="-10" width="26" height="20" rx="4" class="f-ink"/><circle cx="13" cy="0" r="5" class="f-paper s-ink" stroke-width="2"/></g>` +
    `<line x1="60" y1="${y}" x2="318" y2="${150}" class="s-line" stroke-width="1.4" stroke-dasharray="4 5"/>` +
    `<text class="sans t-ink" x="68" y="${y - 12}" font-size="14" font-weight="600">${t1}</text><text class="sans t-mut" x="68" y="${y + 24}" font-size="13">${t2}</text>`;
  s += cam(40, '높게', '머리 크고 다리 짧게') + cam(110, '눈높이', '자연스러운 기록') + cam(204, '낮게', '다리 길고 당당하게');
  return b.svg(400, 246, s, '카메라 높이에 따라 인물이 달라 보이는 도식', 'dg');
};

SC.level_bad = () => {
  const b = mk();
  let s = `<g transform="rotate(-4 200 150)">` + R(-40, -40, 480, 200, b.lin('#9CC3D6', '#E3EEEA')) + R(-40, 160, 480, 200, b.lin('#4F8FA2', '#2E6274')) +
    ridge([[230, 162], [270, 140], [340, 138], [440, 162]], 164, '#6E7F62') + lighthouse(320, 142, 80) + `</g>`;
  s += lab(110, 246, '바다가 쏟아질 것 같다', { size: 23 }) + R(0, 0, 400, 300, 'none');
  return b.svg(400, 300, s, '수평선이 기울어진 바다 사진');
};
SC.level_good = () => {
  const b = mk();
  let s = R(0, 0, 400, 160, b.lin('#9CC3D6', '#E3EEEA')) + R(0, 160, 400, 140, b.lin('#4F8FA2', '#2E6274')) +
    ridge([[230, 162], [270, 140], [340, 138], [400, 150]], 164, '#6E7F62') + lighthouse(320, 142, 80);
  s += `<line x1="150" y1="160" x2="250" y2="160" stroke="#FFD60A" stroke-width="2.4"/><line x1="140" y1="160" x2="150" y2="160" stroke="#FFD60A" stroke-width="2.4" opacity=".6"/>`;
  s += lab(200, 246, '수평 표시가 노랗게', { size: 23 });
  return b.svg(400, 300, s, '수평을 맞춘 바다 사진');
};

/* --- lens & colour diagrams --- */
SC.wideportrait = () => {
  const b = mk();
  let s = `<rect x="10" y="12" width="380" height="140" rx="4" fill="#DCE8E4" stroke="#7E8C88" stroke-width="1.5"/>`;
  s += R(10, 112, 380, 40, '#C8BFA7');
  s += person({ x: 62, y: 146, h: 108, shirt: C.teal, sx: 1.55 }) + person({ x: 200, y: 146, h: 108, shirt: C.red }) + person({ x: 338, y: 146, h: 108, shirt: C.yellow, sx: 1.55 });
  s += `<text class="mono t-mut" x="16" y="30" font-size="12">0.5x</text>`;
  s += `<text class="sans t-acc" x="62" y="172" font-size="13.5" font-weight="600" text-anchor="middle">가장자리: 늘어남</text><text class="sans t-ink" x="200" y="172" font-size="13.5" font-weight="600" text-anchor="middle">가운데: 괜찮음</text><text class="sans t-acc" x="338" y="172" font-size="13.5" font-weight="600" text-anchor="middle">가장자리: 늘어남</text>`;
  const face = (x, y, close) => {
    let f = '';
    if (!close) f += ell(x - 37, y + 4, 7, 12, C.skinS) + ell(x + 37, y + 4, 7, 12, C.skinS);
    f += ell(x, y, close ? 34 : 38, close ? 50 : 46, C.skin);
    f += path(`M${x - 38},${y - 8} Q${x - 36},${y - 54} ${x},${y - 50} Q${x + 36},${y - 54} ${x + 38},${y - 8} Q${x + 20},${y - 34} ${x - 38},${y - 8}Z`, C.hair);
    f += circ(x - 14, y - 2, 3.2, '#2A1F1A') + circ(x + 14, y - 2, 3.2, '#2A1F1A');
    f += close ? ell(x, y + 16, 12, 13, C.skinS) + ell(x, y + 13, 10, 11, '#EFC3A2') : path(`M${x},${y + 2} L${x - 5},${y + 16} L${x + 4},${y + 17}`, 'none', `stroke="${C.skinS}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"`);
    f += path(`M${x - 11},${y + 28} Q${x},${y + 35} ${x + 11},${y + 28}`, 'none', 'stroke="#9A4A3A" stroke-width="2.4" stroke-linecap="round"');
    return f;
  };
  s += face(120, 250, true) + face(282, 250, false);
  s += `<text class="sans t-ink" x="120" y="326" font-size="14" font-weight="600" text-anchor="middle">30cm: 코가 크고 귀가 숨음</text><text class="sans t-ink" x="282" y="326" font-size="14" font-weight="600" text-anchor="middle">1.5m 이상: 자연스러움</text>`;
  return b.svg(400, 336, s, '초광각 가장자리에서 늘어나는 인물과, 거리에 따른 얼굴 왜곡', 'dg');
};

SC.kelvin = () => {
  const b = mk();
  const X = K => 20 + 360 * (Math.log(K) - Math.log(1500)) / (Math.log(10000) - Math.log(1500));
  const g = b.stops([[0, '#FF8A2A'], [.2, '#FFB15A'], [.45, '#FFE3B8'], [.68, '#FFF8F0'], [.82, '#DCE8FF'], [1, '#9FC2FF']], 1, 0);
  let s = R(20, 66, 360, 28, g, 'rx="4" class="s-line" stroke-width="1"');
  const mark = (K, n, up) => {
    const x = X(K);
    return `<line x1="${x}" y1="${up ? 58 : 94}" x2="${x}" y2="${up ? 66 : 102}" class="s-ink" stroke-width="1.5"/>` +
      `<text class="sans t-ink" x="${x}" y="${up ? 30 : 120}" font-size="13" font-weight="600" text-anchor="middle">${n}</text>` +
      `<text class="mono t-mut" x="${x}" y="${up ? 48 : 137}" font-size="12" text-anchor="middle">${K}K</text>`;
  };
  s += mark(1900, '촛불', 1) + mark(2700, '전구', 0) + mark(3500, '해질녘', 1) + mark(5500, '한낮', 0) + mark(6500, '흐린 날', 1) + mark(8000, '그늘', 0);
  s += `<text class="sans t-acc" x="20" y="166" font-size="13.5" font-weight="600">← 따뜻함 (주황)</text><text class="sans" x="380" y="166" font-size="13.5" font-weight="600" text-anchor="end" fill="var(--teal)">차가움 (파랑) →</text>`;
  return b.svg(400, 176, s, '색온도 켈빈 눈금: 촛불부터 그늘까지', 'dg');
};

SC.colorwheel = () => {
  const b = mk();
  const cx = 116, cy = 124, r1 = 104, r0 = 48;
  let s = '';
  for (let i = 0; i < 12; i++) {
    const h = i * 30, a0 = (h - 15 - 90) * Math.PI / 180, a1 = (h + 15 - 90) * Math.PI / 180;
    const P = (r, a) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    s += path(`M${P(r0, a0)} L${P(r1, a0)} A${r1},${r1} 0 0 1 ${P(r1, a1)} L${P(r0, a1)} A${r0},${r0} 0 0 0 ${P(r0, a0)}Z`, `hsl(${h} 62% 58%)`, 'stroke="var(--paper-2)" stroke-width="2"');
  }
  const pt = (h, r) => [cx + r * Math.cos((h - 90) * Math.PI / 180), cy + r * Math.sin((h - 90) * Math.PI / 180)];
  const [ox, oy] = pt(30, 78), [bx, by] = pt(210, 78);
  s += line(ox, oy, bx, by, 'var(--ink)', 2.4) + circ(ox, oy, 6, 'var(--paper-2)', 'class="s-ink" stroke-width="2.4"') + circ(bx, by, 6, 'var(--paper-2)', 'class="s-ink" stroke-width="2.4"');
  const [a0x, a0y] = pt(-12, 116), [a1x, a1y] = pt(72, 116);
  s += `<path d="M${a0x},${a0y} A116,116 0 0 1 ${a1x},${a1y}" fill="none" stroke="var(--ink)" stroke-width="3" stroke-dasharray="1 7" stroke-linecap="round"/>`;
  s += `<text class="sans t-ink" x="244" y="70" font-size="15" font-weight="600">보색</text><text class="sans t-mut" x="244" y="90" font-size="13">마주 보는 색</text><text class="sans t-mut" x="244" y="107" font-size="13">서로를 진하게 만든다</text>`;
  s += R(244, 118, 28, 16, 'hsl(30 62% 58%)', 'rx="2"') + R(276, 118, 28, 16, 'hsl(210 62% 58%)', 'rx="2"');
  s += `<text class="sans t-ink" x="244" y="170" font-size="15" font-weight="600">유사색</text><text class="sans t-mut" x="244" y="190" font-size="13">이웃한 색</text><text class="sans t-mut" x="244" y="207" font-size="13">조화롭고 차분하다</text>`;
  s += R(244, 218, 28, 16, 'hsl(0 62% 58%)', 'rx="2"') + R(276, 218, 28, 16, 'hsl(30 62% 58%)', 'rx="2"') + R(308, 218, 28, 16, 'hsl(60 62% 58%)', 'rx="2"');
  return b.svg(400, 248, s, '색상환의 보색과 유사색', 'dg');
};

/* --- lens widget scenes --- */
SC.lensMaster = (b) => {
  let s = R(0, 0, 400, 300, b.lin('#8CB8CF', '#E2EEEB')) + cloud(70, 44, 1.2) + cloud(330, 60, 1);
  s += ridge([[0, 158], [80, 136], [150, 150], [200, 128], [260, 146], [330, 130], [400, 150]], 190, '#95A9AE');
  s += tower(200, 160, 44, '#5E5A63', '#E8E0D2') + birds(214, 128, .35, '#3B3330');
  s += ridge([[0, 182], [100, 168], [200, 178], [300, 164], [400, 176]], 220, '#7E9A7C');
  const houses = [[20, 52, 40], [74, 40, 30], [118, 60, 46], [182, 44, 34], [230, 58, 42], [292, 46, 36], [342, 62, 48]];
  houses.forEach(([x, w, h], i) => { s += bld({ x, y: 226, w, h, fill: ['#EADCC5', '#D9A982', '#F1E9DA', '#C98E6B', '#E6D2B0'][i % 5], win: '#6F7C86', cols: 2, rows: 2, roof: 'tri', roofCol: i % 2 ? '#A0533A' : '#7D4A3A' }); });
  s += R(0, 226, 400, 74, '#5A4A3E') + R(0, 240, 400, 6, '#3E332B');
  for (let i = 0; i < 9; i++) s += R(10 + i * 48, 246, 6, 54, '#3E332B');
  s += circ(30, 236, 22, '#D9583F') + circ(56, 230, 16, '#E8875E') + circ(372, 234, 24, '#E0694A') + circ(346, 240, 15, '#F1A06F') + R(0, 252, 90, 48, '#5F7D42') + R(320, 252, 80, 48, '#5F7D42');
  return s;
};

/* ---------- case scenes (bad / good) ---------- */
const CS = {};

CS.s01 = {
  bad() {
    const b = mk();
    let s = sky(b, 'washed', 400, 150) + ridge([[0, 140], [90, 130], [180, 142], [260, 126], [400, 140]], 152, '#B7C2BE') + R(0, 150, 400, 150, '#A9B27E');
    s += lab(300, 60, '하늘이 하얗게', { size: 22 }) + lab(200, 168, '수평선 한가운데', { size: 22 }) + lab(200, 250, '아래는 텅 빔', { size: 22 });
    return b.svg(400, 300, s, '하늘이 날아가고 수평선이 가운데인 밋밋한 풍경');
  },
  good() {
    const b = mk();
    let s = R(0, 0, 400, 110, b.lin('#6E9EC0', '#CFE2E8')) + cloud(80, 40, 1.4, '#FFFFFF', .9) + cloud(290, 62, 1.1, '#FFFFFF', .8);
    s += ridge([[0, 100], [80, 70], [150, 92], [230, 60], [320, 88], [400, 76]], 120, '#8DA1AE') + R(0, 108, 400, 192, '#93A86A');
    s += path('M226,110 Q250,160 200,210 Q160,250 190,300 L280,300 Q250,250 270,210 Q300,160 236,110Z', '#D9C9A2');
    s += bld({ x: 226, y: 116, w: 20, h: 12, fill: '#F2EADB', win: '#7A6A5A', cols: 1, rows: 1, roof: 'tri' });
    const fl = (x, y, r, col) => line(x, y, x + 3, 300, '#4F6B3A', 3) + circ(x, y, r, col) + circ(x, y, r * .35, '#F6D36B');
    s += ell(70, 300, 130, 40, '#5F7D42') + fl(34, 232, 22, '#D9583F') + fl(84, 258, 18, '#E8875E') + fl(18, 284, 16, '#E0694A') + fl(128, 284, 13, '#F1A06F');
    s += grid3(400, 300, 'rgba(255,250,240,.55)');
    s += lab(70, 196, '전경', { size: 22 }) + lab(330, 180, '길이 이끈다', { size: 22 }) + lab(350, 128, '1/3', { size: 20 });
    return b.svg(400, 300, s, '전경 꽃과 길을 넣고 수평선을 위 1/3에 둔 풍경');
  }
};

CS.s02 = {
  bad() {
    const b = mk();
    let s = `<g transform="rotate(2.5 150 200)">` + sky(b, 'day', 300, 400).replace('<rect x="0" y="0"', '<rect x="-30" y="-30"').replace('width="300" height="400"', 'width="360" height="460"');
    s += bld({ x: 20, y: 420, w: 260, h: 400, fill: '#E3D6C1', win: '#7F8C96', cols: 4, rows: 8, lean: 70, door: true }) + `</g>`;
    s += line(-10, 60, 310, 20, '#2E2A27', 1.8) + line(-10, 80, 310, 44, '#2E2A27', 1.4);
    s += person({ x: 60, y: 436, h: 120, shirt: '#7D7D7D', pants: '#444', pose: 'walk' }) + person({ x: 250, y: 440, h: 130, shirt: '#5D6E80', pants: '#3A3A3A', pose: 'walk' });
    s += lab(150, 120, '뒤로 넘어가는 건물', { size: 24 }) + arrow(70, 250, 108, 120, '#FFF8EC', 2.4, 10) + arrow(232, 250, 194, 120, '#FFF8EC', 2.4, 10);
    return b.svg(300, 400, s, '폰을 위로 꺾어 사다리꼴로 찍힌 건물');
  },
  good() {
    const b = mk();
    let s = sky(b, 'day', 300, 400) + cloud(60, 50, .9);
    s += R(30, 120, 240, 250, '#E8DCC6') + poly([[20, 124], [280, 124], [150, 54]], '#D9C8AA') + poly([[40, 118], [260, 118], [150, 66]], '#E8DCC6');
    s += circ(150, 104, 14, '#B9A27E') + circ(150, 104, 9, '#8BA0B0');
    s += R(130, 290, 40, 80, '#5B4434', 'rx="20"') + R(130, 310, 40, 60, '#5B4434');
    [[60, 180], [210, 180], [60, 250], [210, 250], [128, 180]].forEach(([x, y]) => { s += R(x, y, 30, 44, '#7F8C96', 'rx="15"') + R(x, y + 15, 30, 29, '#7F8C96'); });
    s += R(30, 116, 240, 8, '#CDBB9C') + R(0, 370, 300, 30, '#BFB3A0');
    s += person({ x: 96, y: 378, h: 40, shirt: C.red, pose: 'walk' });
    s += `<line x1="150" y1="20" x2="150" y2="390" stroke="#FFF8EC" stroke-width="1.4" stroke-dasharray="5 6" opacity=".9"/>`;
    s += lab(150, 160, '세로선은 평행하게', { size: 23 }) + lab(96, 335, '사람으로 크기', { size: 20 });
    return b.svg(300, 400, s, '폰을 수직으로 세워 반듯하게 찍은 건물 정면');
  }
};

CS.s03 = {
  bad() {
    const b = mk();
    let s = R(0, 0, 300, 400, b.lin('#B7D3E0', '#EAF2EF')) + R(0, 240, 300, 160, '#C9C2B2');
    s += line(150, 0, 150, 300, '#4D4844', 6) + R(135, 70, 30, 16, '#4D4844');
    s += person({ x: 150, y: 430, h: 270, shirt: C.red, legs: .4 });
    s += lab(150, 60, '머리 위가 텅', { size: 23 }) + ring(150, 150, 34, 34) + lab(240, 140, '기둥이 솟음', { size: 21 }) + lab(150, 390, '발목 잘림', { size: 22 });
    return b.svg(300, 400, s, '머리 위 여백이 넓고 기둥이 머리에서 솟고 발목이 잘린 인물 사진');
  },
  good() {
    const b = mk();
    let s = R(0, 0, 300, 400, b.lin('#88B7CF', '#E1EEEA')) + R(0, 236, 300, 40, '#4F8FA2') + R(0, 276, 300, 124, '#D8CBB0');
    s += line(270, 0, 270, 290, '#4D4844', 5);
    s += person({ x: 104, y: 384, h: 330, shirt: C.red, legs: .52 });
    s += grid3(300, 400, 'rgba(255,250,240,.5)');
    s += lab(210, 360, '발끝은 아래 가장자리', { size: 20 }) + lab(212, 110, '낮게, 1/3 선에', { size: 21 });
    return b.svg(300, 400, s, '낮은 위치에서 발끝을 아래 가장자리에 두고 1/3 선에 세운 인물 사진');
  }
};

CS.s04 = {
  bad() {
    const b = mk();
    let s = sky(b, 'day', 400, 300) + ridge([[0, 196], [120, 186], [260, 194], [400, 184]], 206, '#9DB0A8') + R(0, 204, 400, 96, '#B9B79A');
    s += tower(200, 210, 150, '#6E6A72');
    s += person({ x: 200, y: 330, h: 230, shirt: C.teal });
    s += ring(200, 120, 30, 40) + lab(300, 70, '머리에 꽂힌 탑', { size: 23 }) + lab(300, 280, '탑이 너무 작다', { size: 21 });
    return b.svg(400, 300, s, '명소가 작고 사람 머리 위에 꽂힌 인증샷');
  },
  good() {
    const b = mk();
    let s = R(0, 0, 400, 300, b.lin('#E9A46E', '#F7DDB0')) + ridge([[0, 230], [160, 204], [300, 220], [400, 196]], 260, '#9B7C6A');
    s += tower(290, 262, 216, '#5E5A63', '#EADFCB');
    s += R(0, 250, 400, 50, '#8C7562');
    s += person({ x: 118, y: 318, h: 260, shirt: C.teal });
    s += grid3(400, 300, 'rgba(255,250,240,.45)');
    s += lab(210, 40, '물러나서 2x 이상', { size: 23 });
    return b.svg(400, 300, s, '뒤로 물러나 망원으로 명소를 크게 넣고 사람을 왼쪽 1/3에 둔 인증샷');
  }
};

function face(x, y, r, o = {}) {
  const { skin = C.skin, view = 'level', shade = 0, hair = C.hair, smile = true } = o;
  let f = '';
  if (view === 'below') {
    f += R(x - r * .55, y + r * .6, r * 1.1, r * 1.4, skin) + ell(x, y + r * .72, r * .75, r * .4, C.skinS, 'opacity=".55"');
    f += ell(x, y, r * .86, r, skin);
    f += path(`M${x - r * .86},${y - r * .1} Q${x - r * .9},${y - r * 1.15} ${x},${y - r * 1.08} Q${x + r * .9},${y - r * 1.15} ${x + r * .86},${y - r * .1} Q${x},${y - r * .78} ${x - r * .86},${y - r * .1}Z`, hair);
    f += ell(x - r * .32, y - r * .36, r * .1, r * .055, '#2A1F1A') + ell(x + r * .32, y - r * .36, r * .1, r * .055, '#2A1F1A');
    f += ell(x - r * .12, y + r * .2, r * .07, r * .05, '#6B3B2C') + ell(x + r * .12, y + r * .2, r * .07, r * .05, '#6B3B2C');
    f += path(`M${x - r * .2},${y + r * .45} Q${x},${y + r * .52} ${x + r * .2},${y + r * .45}`, 'none', `stroke="#8A3E30" stroke-width="${r * .06}" stroke-linecap="round"`);
    f += path(`M${x - r * .55},${y + r * .78} Q${x},${y + r * 1.05} ${x + r * .55},${y + r * .78}`, 'none', `stroke="${C.skinS}" stroke-width="${r * .05}" opacity=".7"`);
  } else {
    f += R(x - r * .4, y + r * .7, r * .8, r * .7, skin) + ell(x, y, r * .82, r, skin);
    f += path(`M${x - r * .86},${y + r * .1} Q${x - r * .95},${y - r * 1.1} ${x},${y - r * 1.06} Q${x + r * .95},${y - r * 1.1} ${x + r * .86},${y + r * .1} Q${x + r * .6},${y - r * .7} ${x - r * .86},${y + r * .1}Z`, hair);
    f += ell(x - r * .3, y - r * .05, r * .09, r * .11, '#2A1F1A') + ell(x + r * .3, y - r * .05, r * .09, r * .11, '#2A1F1A');
    f += path(`M${x},${y + r * .05} L${x - r * .08},${y + r * .3} L${x + r * .06},${y + r * .32}`, 'none', `stroke="${C.skinS}" stroke-width="${r * .05}" stroke-linecap="round" stroke-linejoin="round"`);
    f += smile ? path(`M${x - r * .25},${y + r * .5} Q${x},${y + r * .7} ${x + r * .25},${y + r * .5}`, 'none', `stroke="#8A3E30" stroke-width="${r * .065}" stroke-linecap="round"`) : '';
  }
  if (shade) f += ell(x, y, view === 'below' ? r * .86 : r * .82, r, '#120C0A', `opacity="${shade}"`) + (view === 'below' ? R(x - r * .55, y + r * .6, r * 1.1, r * 1.4, '#120C0A', `opacity="${shade * .8}"`) : '');
  return f;
}

CS.s05 = {
  bad() {
    const b = mk();
    let s = R(0, 0, 400, 300, '#FFFDF8') + R(0, 0, 400, 300, b.rad('#FFFFFF', '#E6E1D6', .5, .3, .8));
    s += R(30, 0, 8, 120, '#DCD6CA') + R(362, 0, 8, 120, '#DCD6CA') + R(0, 118, 400, 6, '#DCD6CA');
    s += R(120, 250, 160, 60, '#3B4C63', 'rx="60"') + face(200, 196, 92, { view: 'below', shade: .55 });
    s += lab(96, 60, '창을 등져 얼굴이 어둡다', { size: 21, anchor: 'start' }).replace('x="96"', 'x="14"') + lab(318, 272, '아래에서: 턱 강조', { size: 21 });
    return b.svg(400, 300, s, '창을 등지고 아래에서 찍어 얼굴이 어둡고 턱이 강조된 셀카');
  },
  good() {
    const b = mk();
    let s = R(0, 0, 400, 300, b.lin('#9CC4D8', '#EDE4D3')) + ridge([[0, 170], [100, 150], [200, 166], [300, 140], [400, 160]], 220, '#A9B7A3', `filter="${b.blur(2.5)}"`);
    s += tower(320, 214, 120, '#7E7A82', '#EADFCB');
    s += R(0, 210, 400, 90, '#C9BFA6');
    s += R(108, 238, 160, 70, C.teal, 'rx="60"') + face(188, 160, 70, { view: 'level' });
    s += path('M268,262 Q320,230 360,300', 'none', `stroke="${C.teal}" stroke-width="26" stroke-linecap="round"`);
    s += lab(310, 50, '빛을 마주 보고', { size: 22 }) + lab(84, 60, '눈높이 위', { size: 22 });
    return b.svg(400, 300, s, '눈높이보다 살짝 위에서 빛을 마주 보고 찍은 셀카');
  }
};

CS.s06 = {
  bad() {
    const b = mk();
    let s = R(0, 0, 400, 300, '#6E5A44') + poly([[40, 110], [360, 110], [400, 300], [0, 300]], '#A88A5E');
    s += ell(200, 210, 110, 48, '#F2EBDD') + ell(200, 206, 72, 28, '#D9A15A') + ell(186, 200, 26, 9, '#B9462F') + ell(222, 210, 20, 7, '#8DA35A');
    s += R(300, 150, 52, 88, '#1E1E22', 'rx="8" transform="rotate(18 326 194)"') + path('M40,250 Q70,220 100,258 Q80,286 46,276Z', '#F4F1EA') + R(270, 250, 56, 40, '#FBFAF6', 'transform="rotate(-12 298 270)"');
    s += ell(90, 150, 26, 12, '#E9E2D2') + R(64, 120, 52, 30, '#E9E2D2');
    s += R(0, 0, 400, 300, '#FFB42E', 'opacity=".24"');
    s += lab(200, 70, '애매한 각도 + 누런빛', { size: 22 }) + lab(330, 120, '폰·영수증', { size: 20 });
    return b.svg(400, 300, s, '누렇고 잡동사니가 함께 찍힌 음식 사진');
  },
  good() {
    const b = mk();
    let s = R(0, 0, 400, 300, '#B48C62');
    for (let i = 0; i < 6; i++) s += line(0, 18 + i * 52, 400, 18 + i * 52, '#9E7650', 2);
    s += circ(186, 156, 98, '#3E2C20', 'opacity=".3"').replace('cx="186"', 'cx="200"').replace('cy="156"', 'cy="166"');
    s += circ(186, 150, 98, '#F4EEE2') + circ(186, 150, 80, '#EDE5D5');
    s += circ(160, 128, 26, '#FBF7EC') + circ(160, 128, 11, '#F2B536');
    s += path('M190,170 Q230,140 252,176 Q232,206 196,196Z', '#7FA35A') + path('M200,176 Q226,160 240,182', 'none', 'stroke="#5E8241" stroke-width="3"');
    s += R(120, 160, 56, 40, '#D7A060', 'rx="8" transform="rotate(-14 148 180)"');
    s += circ(330, 70, 40, '#3E2C20', 'opacity=".3"').replace('cx="330"', 'cx="342"').replace('cy="70"', 'cy="80"') + circ(330, 70, 40, '#F4EEE2') + circ(330, 70, 30, '#8A5A3A') + path('M318,66 Q330,54 342,66 Q330,82 318,66Z', '#F1E3CF');
    s += R(300, 160, 12, 120, '#C9C3B8', 'rx="6" transform="rotate(-20 306 220)"');
    s += R(0, 0, 70, 300, b.lin('#FFF4DA', '#FFF4DA', 1, 0), 'opacity=".18"');
    s += lab(60, 40, '창빛 →', { size: 22 }) + lab(320, 280, '위에서, 정돈해서', { size: 22 });
    return b.svg(400, 300, s, '창가 빛을 받은 음식을 위에서 정돈해 찍은 사진');
  }
};

CS.s07 = {
  bad() {
    const b = mk();
    let s = R(0, 0, 400, 200, b.lin('#F2EEE6', '#E8E0D4')) + R(0, 200, 400, 100, b.lin('#B9A898', '#7D6E64'));
    s += circ(300, 120, 70, '#FFFFFF', 'opacity=".55"') + circ(240, 170, 22, '#FFFFFF', 'opacity=".35"') + circ(200, 200, 12, '#FFFFFF', 'opacity=".3"');
    s += person({ x: 150, y: 290, h: 170, shirt: '#5B4A42', pants: '#463A34', skin: '#7A5E50', hair: '#3A2E28' }) + person({ x: 196, y: 296, h: 176, shirt: '#665248', pants: '#463A34', skin: '#7A5E50', hair: '#3A2E28' });
    s += lab(300, 40, '노을이 사라짐', { size: 22 }) + lab(84, 140, '얼굴도 어둡다', { size: 22 });
    return b.svg(400, 300, s, '하늘은 날아가고 얼굴은 어두운 역광 인물 사진');
  },
  good() {
    const b = mk();
    let s = R(0, 0, 400, 210, b.lin('#5A3F6E', '#F6B26B', 0, 1, [.55, '#E57D5B'])) + sun(250, 206, 26, '#FFE6B0', '#FFC27A', .5);
    s += R(0, 206, 400, 94, b.lin('#6A3B3D', '#21161C'));
    for (let i = 0; i < 7; i++) s += R(250 - (20 - i * 2.4), 214 + i * 11, (20 - i * 2.4) * 2, 2.4, '#FFD49A', `opacity="${.7 - i * .08}"`);
    s += person({ x: 110, y: 262, h: 120, sil: C.sil, pose: 'jump' }) + ell(110, 286, 26, 4, '#120C0E', 'opacity=".5"');
    s += person({ x: 330, y: 284, h: 130, sil: C.sil, pose: 'wave' });
    s += lab(200, 46, '노출은 하늘에', { size: 23 }) + lab(220, 160, '간격을 두고', { size: 20 });
    return b.svg(400, 300, s, '하늘에 노출을 맞춰 선명한 실루엣으로 찍은 일몰 사진');
  }
};

CS.s08 = {
  bad() {
    const b = mk();
    let s = R(0, 0, 400, 300, '#050608');
    const sky_ = [[0, 60, 210], [60, 40, 170], [100, 50, 230], [150, 70, 190], [220, 40, 250], [260, 60, 200], [320, 44, 220], [364, 40, 180]];
    sky_.forEach(([x, w, h]) => { s += R(x, 300 - h + 40, w, h, '#0E1014'); });
    const bl = b.blur(4);
    let lights = '';
    for (let i = 0; i < 40; i++) { const x = (i * 97) % 400, y = 120 + (i * 53) % 150; lights += circ(x, y, 3 + (i % 3), i % 4 ? '#FFD27A' : '#FFFFFF'); }
    s += `<g filter="${bl}" opacity=".9">${lights}</g><g filter="${bl}" opacity=".45" transform="translate(9 -5)">${lights}</g>`;
    for (let i = 0; i < 260; i++) s += R((i * 37) % 400, (i * 71) % 300, 1.4, 1.4, '#6B6B6B', 'opacity=".5"');
    s += lab(200, 50, '검은 하늘 + 번짐 + 흔들림', { size: 22 });
    return b.svg(400, 300, s, '하늘이 검고 불빛이 번지고 흔들린 야경');
  },
  good() {
    const b = mk();
    let s = R(0, 0, 400, 300, b.lin('#1E3558', '#7290B2', 0, 1, [.55, '#3E5F86']));
    const sk = [[0, 60, 120], [56, 40, 90], [92, 50, 150], [140, 64, 110], [206, 40, 170], [244, 60, 130], [306, 44, 150], [348, 52, 100]];
    sk.forEach(([x, w, h], i) => { s += bld({ x, y: 200, w, h, fill: ['#1E2840', '#232E48', '#1A2238'][i % 3], win: '#2C3654', cols: 3, rows: Math.round(h / 22), lit: .45 }); });
    s += R(0, 200, 400, 100, b.lin('#253655', '#121A2C'));
    sk.forEach(([x, w], i) => { for (let j = 0; j < 3; j++) s += R(x + 6 + j * w / 3, 210 + j * 14 + (i % 3) * 6, w / 5, 2, '#FFD27A', `opacity="${.55 - j * .12}"`); });
    s += path('M0,196 Q200,170 400,196', 'none', 'stroke="#FFD27A" stroke-width="2" opacity=".8"');
    for (let i = 0; i < 9; i++) s += circ(20 + i * 45, 196 - Math.sin(i / 8 * Math.PI) * 13, 2.6, '#FFE6AE');
    s += lab(200, 46, '블루아워: 하늘에 색이 남음', { size: 22 }) + lab(200, 280, '물에 비친 불빛', { size: 21 });
    return b.svg(400, 300, s, '블루아워에 찍어 하늘이 푸르고 불빛이 선명한 야경');
  }
};

CS.s09 = {
  bad() {
    const b = mk();
    let s = R(0, 0, 400, 300, '#E8E1D4') + R(0, 250, 400, 50, '#A58E70');
    s += poly([[86, 40], [314, 54], [300, 230], [100, 244]], '#7A5B3E') + poly([[100, 56], [300, 68], [288, 218], [112, 230]], b.lin('#8FB0C4', '#C9B47E'));
    s += poly([[150, 56], [210, 60], [130, 230], [112, 230], [100, 140]], '#FFFFFF', 'opacity=".55"');
    s += person({ x: 236, y: 232, h: 120, sil: '#3E3A36', op: .32 }) + ell(250, 74, 16, 8, '#FFFFFF', 'opacity=".9"');
    s += lab(160, 30, '유리 반사 + 내 모습', { size: 22 }) + lab(340, 280, '사다리꼴', { size: 22 });
    return b.svg(400, 300, s, '유리 반사와 사다리꼴로 기울어진 작품 사진');
  },
  good() {
    const b = mk();
    let s = R(0, 0, 400, 300, '#EDE6DA') + R(0, 224, 400, 76, b.lin('#B39C7E', '#8E785D'));
    s += R(110, 40, 180, 130, '#6B4E36') + R(120, 50, 160, 110, b.lin('#E8B07A', '#7FA3B8'));
    s += ridge([[120, 128], [170, 104], [220, 120], [280, 98]], 160, '#5D6E66');
    s += R(150, 196, 100, 12, '#6B5A48') + R(156, 208, 6, 18, '#6B5A48') + R(238, 208, 6, 18, '#6B5A48');
    s += person({ x: 176, y: 262, h: 116, sil: '#2E2723' });
    s += path('M110,300 L130,224 M290,300 L270,224', 'none', 'stroke="#A08A6E" stroke-width="2"');
    s += lab(344, 206, '정면 · 평행', { size: 22 }) + lab(88, 214, '관람객과 함께', { size: 21 });
    return b.svg(400, 300, s, '정면에서 평행하게 작품과 관람객 실루엣을 함께 담은 사진');
  }
};

CS.s10 = {
  bad() {
    const b = mk();
    let s = R(0, 0, 400, 200, '#CBCDCA') + R(0, 196, 400, 104, '#8E918E');
    [[0, 60, 40], [60, 80, 54], [140, 70, 36], [210, 90, 60], [300, 100, 44]].forEach(([x, w, h]) => { s += bld({ x, y: 200, w, h, fill: '#A9ABA8', win: '#8C908F', cols: 3, rows: 2 }); });
    s += person({ x: 120, y: 260, h: 40, shirt: '#6E716F', pants: '#555' }) + person({ x: 280, y: 266, h: 44, shirt: '#7E807E', pants: '#555' });
    s += lab(200, 90, '회색 하늘이 2/3', { size: 23 });
    return b.svg(400, 300, s, '회색 하늘이 대부분을 차지한 칙칙한 흐린 날 사진');
  },
  good() {
    const b = mk();
    let s = R(0, 0, 400, 300, '#6E7270');
    const top = (flip) => {
      let t = R(0, 0, 400, 40, '#C6C9C6');
      [[0, 90, '#8C8270'], [90, 70, '#6E6A60'], [160, 110, '#9A8C78'], [270, 130, '#7E7466']].forEach(([x, w, c]) => { t += bld({ x, y: 150, w, h: 140, fill: c, win: '#4E5458', cols: 3, rows: 4, lit: .2 }); });
      t += R(0, 150, 400, 4, '#3E3F3E');
      t += path('M226,110 Q252,86 278,110Z', C.red) + line(252, 110, 252, 128, '#2A2A2A', 2) + person({ x: 252, y: 150, h: 46, shirt: '#2F3A46', pants: '#222', pose: 'walk' });
      return flip ? `<g transform="translate(0 300) scale(1 -1)" opacity=".75">${t}</g>` : t;
    };
    s += top(false) + R(0, 150, 400, 150, '#3E4244') + `<g clip-path="${b.clip(ell(210, 232, 190, 60, '#000'))}">${top(true)}</g>`;
    s += ell(210, 232, 190, 60, 'none', 'stroke="#5A5E60" stroke-width="2"');
    for (let i = 0; i < 26; i++) s += line((i * 61) % 400, (i * 29) % 140, (i * 61) % 400 - 4, (i * 29) % 140 + 16, '#E8ECEC', 1.2, 'opacity=".5"');
    s += lab(84, 200, '웅덩이 반영', { size: 22 }) + lab(330, 80, '색 한 점', { size: 21 });
    return b.svg(400, 300, s, '낮게 앉아 웅덩이 반영과 빨간 우산을 담은 비 오는 날 사진');
  }
};

CS.s11 = {
  bad() {
    const b = mk();
    let s = sky(b, 'day', 400, 200) + R(0, 196, 400, 104, '#B9A988');
    for (let i = 4; i > 0; i--) s += person({ x: 352 - i * 9, y: 270, h: 120, shirt: C.yellow, pose: 'run', op: .14 });
    s += `<g filter="${b.blur(2.2)}">${person({ x: 356, y: 270, h: 120, shirt: C.yellow, pose: 'run' })}</g>`;
    s += lab(170, 120, '흐릿하고, 앞 공간이 없다', { size: 22 }) + arrow(250, 128, 330, 176, '#FFF8EC', 2.4, 10, -.15);
    return b.svg(400, 300, s, '번지고 화면 끝에 몰린 달리는 사람 사진');
  },
  good() {
    const b = mk();
    let s = sky(b, 'day', 400, 200) + cloud(300, 60, 1.1) + R(0, 196, 400, 104, '#B9A988');
    s += person({ x: 136, y: 214, h: 124, shirt: C.yellow, pose: 'jump' }) + ell(136, 262, 30, 5, '#5A4A34', 'opacity=".45"');
    s += arrow(190, 150, 330, 150, '#FFF8EC', 2.4, 11) + lab(280, 136, '가는 방향에 여백', { size: 22 }) + lab(136, 286, '정점에서 정지', { size: 21 });
    return b.svg(400, 300, s, '점프의 정점에서 선명하게 멈추고 앞쪽에 여백을 둔 사진');
  }
};

CS.s12 = {
  bad() {
    const b = mk();
    let s = R(0, 0, 400, 300, b.lin('#8EC0DA', '#E8F0EA')) + R(0, 210, 400, 90, '#C9C08F');
    const cols = [C.red, C.teal, C.yellow, '#7B5EA7', '#4E8F5A', '#D97A4A'];
    const xs = [30, 100, 165, 235, 300, 370], hs = [118, 150, 110, 144, 122, 132];
    xs.forEach((x, i) => { const edge = i === 0 || i === 5; s += person({ x, y: 262, h: hs[i], shirt: cols[i], sx: edge ? 1.5 : 1, eyesClosed: i === 3 }); });
    s += poly([[0, 262], [400, 262], [400, 272], [0, 272]], '#3E3A2A', 'opacity=".25"');
    s += lab(60, 60, '가장자리 늘어남', { size: 21 }) + lab(250, 50, '일렬로 길게', { size: 21 });
    return b.svg(400, 300, s, '초광각으로 일렬로 서서 가장자리 사람이 늘어난 단체 사진');
  },
  good() {
    const b = mk();
    let s = R(0, 0, 400, 300, b.lin('#9FB3A6', '#DCE3D8')) + tree(60, 210, 220, '#5D7A55') + tree(350, 210, 200, '#6A8660') + R(0, 206, 400, 94, '#9AA77C');
    const cols = [C.red, C.teal, C.yellow, '#7B5EA7', '#4E8F5A', '#D97A4A'];
    [[150, 258, 170], [210, 254, 178], [270, 258, 168]].forEach(([x, y, h], i) => { s += person({ x, y, h, shirt: cols[i + 3] }); });
    [[120, 292, 150], [180, 296, 150], [240, 296, 150], [300, 292, 150]].forEach(([x, y, h], i) => { s += person({ x, y, h, shirt: cols[i % 3], legs: .38 }); });
    s += lab(200, 40, '그늘에서, 엇갈린 높이로 촘촘히', { size: 22 });
    return b.svg(400, 300, s, '그늘에서 높이를 엇갈려 촘촘히 모인 단체 사진');
  }
};

CS.s13 = {
  bad() {
    const b = mk();
    let s = R(0, 0, 400, 140, '#B8BEC4') + ridge([[0, 120], [100, 80], [200, 110], [300, 70], [400, 100]], 150, '#9EA3A6') + R(0, 140, 400, 160, '#A7ABAC');
    [[60, 150], [90, 160], [330, 150]].forEach(([x, y]) => { s += poly([[x, y - 60], [x - 18, y], [x + 18, y]], '#5F6562'); });
    s += person({ x: 220, y: 250, h: 110, shirt: '#3F4245', pants: '#2E3032' });
    s += lab(110, 236, '눈이 회색', { size: 26 });
    return b.svg(400, 300, s, '노출이 부족해 눈이 회색으로 나온 사진');
  },
  good() {
    const b = mk();
    let s = R(0, 0, 400, 140, b.lin('#6FA9D6', '#BFDDF0')) + ridge([[0, 120], [100, 80], [200, 110], [300, 70], [400, 100]], 150, '#F2F6FA') + R(0, 140, 400, 160, '#F8F9F7');
    s += path('M0,220 Q120,190 220,250 T400,240 V300 H0Z', '#DCE7F2');
    [[60, 150], [90, 160], [330, 150]].forEach(([x, y]) => { s += poly([[x, y - 60], [x - 18, y], [x + 18, y]], '#3E5A48'); });
    s += path('M120,300 Q170,250 214,252', 'none', 'stroke="#C9D7E6" stroke-width="3"') + path('M134,300 Q180,256 226,254', 'none', 'stroke="#C9D7E6" stroke-width="3"');
    s += person({ x: 220, y: 250, h: 110, shirt: C.red, pants: '#2E3A4E' }) + ell(232, 252, 30, 5, '#AFC4DA');
    s += lab(110, 110, '노출 +', { size: 24 }) + lab(330, 200, '원색 옷', { size: 22 });
    return b.svg(400, 300, s, '노출을 올려 하얀 눈과 빨간 옷이 돋보이는 사진');
  }
};

CS.s14 = {
  bad() {
    const b = mk();
    let s = R(0, 0, 400, 300, '#D9D6CF');
    const win = ell(200, 150, 112, 132, '#000');
    s += `<g clip-path="${b.clip(win)}">` + R(0, 0, 400, 300, b.lin('#C3CDD2', '#E2E4E0')) + cloud(170, 190, 2.4, '#F2F2EE', .8);
    s += R(0, 0, 400, 300, '#FFFFFF', 'opacity=".25"') + circ(230, 80, 30, '#FFFFFF', 'opacity=".6"') + ell(170, 140, 40, 50, '#5A5A5A', 'opacity=".18"');
    s += `<g filter="${b.blur(5)}">` + circ(150, 210, 16, '#FFFFFF', 'opacity=".6"') + circ(250, 170, 10, '#FFFFFF', 'opacity=".5"') + `</g></g>`;
    s += ell(200, 150, 112, 132, 'none', 'stroke="#BDB8AE" stroke-width="16"');
    s += lab(200, 34, '조명·얼굴 반사, 얼룩', { size: 22 });
    return b.svg(400, 300, s, '창 반사와 얼룩으로 뿌연 비행기 창밖 사진');
  },
  good() {
    const b = mk();
    let s = R(0, 0, 400, 300, '#2A2422');
    const win = ell(200, 150, 112, 132, '#000');
    s += `<g clip-path="${b.clip(win)}">` + R(0, 0, 400, 300, b.lin('#3E4E7A', '#F6B26B', 0, 1, [.55, '#E9906A'])) + sun(250, 166, 14, '#FFE6B0');
    s += path('M60,190 Q120,170 180,186 T300,180 T420,190 V300 H60Z', '#F0D2C0') + path('M60,214 Q140,200 220,212 T420,210 V300 H60Z', '#E2B9A6');
    s += poly([[70, 300], [92, 236], [318, 200], [330, 210], [150, 300]], '#8E98A4') + poly([[92, 236], [318, 200], [324, 205], [100, 246]], '#D9DEE4') + poly([[316, 201], [322, 168], [330, 170], [330, 210]], '#7D8794') + `</g>`;
    s += ell(200, 150, 112, 132, 'none', 'stroke="#3C3532" stroke-width="16"');
    s += lab(318, 284, '날개로 프레이밍', { size: 22 });
    return b.svg(400, 300, s, '비행기 날개를 넣어 구름 위 골든아워를 찍은 창밖 사진');
  }
};

/* compare pairs used in theory chapters */
const PAIRS = {
  simplify: [SC.simplify_bad, SC.simplify_good, '주인공이 잡동사니에 묻힘', '다가가서 배경 정리'],
  thirds: [SC.thirds_bad, SC.thirds_good, '수평선과 배가 정중앙', '수평선은 1/3, 배는 교차점'],
  level: [SC.level_bad, SC.level_good, '수평선이 4° 기울어짐', '수평 표시로 맞춤']
};
