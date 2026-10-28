/* app.js: routing, screens, widgets and the reader's own progress (kept in this browser only). */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const store = {
  get(k, d) { try { const v = localStorage.getItem('pg.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('pg.' + k, JSON.stringify(v)); } catch (e) { /* storage off: progress lasts this visit only */ } }
};
const STANDALONE = navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
let READ = new Set(store.get('read', []));
let CHECKED = new Set(store.get('check', []));
const icon = (n, cls = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="${cls}">${ICONS[n] || ''}</svg>`;

/* ---------- indexes ---------- */
const ORDER = PARTS.flatMap(p => p.ch);
const PART_OF = {}; PARTS.forEach(p => p.ch.forEach(c => { PART_OF[c] = p; }));
CASES.forEach((c, i) => { c.no = String(i + 1).padStart(2, '0'); });
const CASE = Object.fromEntries(CASES.map(c => [c.id, c]));
const XPAGES = {
  cheat: { title: '한 장 요약', icon: 'list-check', d: '현장에서 꺼내 보는 치트시트' },
  mistakes: { title: '자주 하는 실수 10가지', icon: 'alert-triangle', d: '셔터 누르기 전 마지막 점검' },
  people: { title: '찾아볼 만한 사진가', icon: 'users', d: '이름과 특징, 배울 점' },
  terms: { title: '용어 사전', icon: 'notebook', d: '이 앱에 나오는 말 26개' }
};
const TOTAL = ORDER.length + CASES.length;
const CASE_KEYS = {
  s01: '풍경 전망대 산 바다 해변 들판 자연 하늘 수평선', s02: '도시 건축 건물 성당 궁 빌딩 골목 거리 유럽',
  s03: '인물 친구 가족 연인 전신 다리 찍어주기 사람 커플', s04: '명소 랜드마크 인증샷 탑 성 관광지 여행지',
  s05: '셀카 셀피 혼자 전면 얼굴', s06: '음식 카페 맛집 디저트 커피 식당 시장 케이크',
  s07: '역광 일몰 노을 석양 해질녘 실루엣 해 일출', s08: '야경 밤 불빛 야시장 야간 네온',
  s09: '박물관 미술관 전시 실내 수족관 유리 작품 그림', s10: '흐림 흐린 비 장마 우산 웅덩이 날씨 구름',
  s11: '움직임 동물 아이 반려동물 강아지 새 뛰기 점프 연속 스포츠 파도', s12: '단체 여럿 모임 단체사진 가족 친구',
  s13: '눈 스키 설산 겨울 바다 해변 모래 하얀 밝은', s14: '비행기 기차 창밖 창문 이동 버스 구름 위'
};
const norm = t => t.toLowerCase().replace(/\s+/g, '');
function caseMatches(c, q) {
  if (!q) return true;
  const hay = norm([c.title, c.short, c.when.join(' '), CASE_KEYS[c.id]].join(' '));
  return hay.includes(q) || CASE_KEYS[c.id].split(' ').some(k => q.includes(k));
}
function filterCases(q) {
  const nq = norm(q);
  let n = 0;
  $$('.frame').forEach(f => { const on = caseMatches(CASE[f.dataset.go], nq); f.hidden = !on; if (on) n++; });
  const e = $('.sheet .empty'); if (e) e.hidden = n > 0;
}
const CHEAT_ONE = {
  s01: '0.5x로 전경에 바짝, 수평선은 1/3', s02: '폰은 수직, 물러나서 찍고 아래는 자르기', s03: '허리 높이, 발끝은 아래 가장자리',
  s04: '사람은 앞으로, 나는 물러나 2x 이상', s05: '빛을 마주 보고 눈높이 위에서', s06: '창가 자리, 납작한 음식은 위에서',
  s07: '실루엣이면 노출은 하늘에', s08: '블루아워, 렌즈 닦고 1x', s09: '플래시 끄고 렌즈를 유리 가까이',
  s10: '하늘은 빼고 색과 반영 찾기', s11: '밝은 곳에서 연속 촬영, 앞에 여백', s12: '그늘에서 1x, 엇갈린 높이로',
  s13: '노출 +, 결이 사라지기 직전까지', s14: '렌즈를 창에 붙이고 손으로 가리기'
};
const label = id => CH[id] ? `${CH[id].code} ${CH[id].title}` : CASE[id] ? `케이스 ${CASE[id].no} ${CASE[id].title}` : XPAGES[id] ? XPAGES[id].title : id;
const groupOf = id => ['home', 'theory', 'cases', 'check'].includes(id) ? id : CH[id] ? 'theory' : CASE[id] ? 'cases' : 'check';
const valid = id => ['home', 'theory', 'cases', 'check'].includes(id) || !!CH[id] || !!CASE[id] || !!XPAGES[id];

/* ---------- inline marks ---------- */
function inline(t) {
  return t
    .replace(/\[\[([a-z0-9]+)(?:\|([^\]]+))?\]\]/g, (_, id, l) => `<button type="button" class="xlink" data-go="${id}">${l || label(id)}</button>`)
    .replace(/\[(일반|Pro|17 시리즈)\]/g, (_, m) => `<span class="model ${m === '일반' ? 'std' : m === 'Pro' ? 'pro' : 'etc'}">${m}</span>`)
    .replace(/==(.+?)==/g, '<mark>$1</mark>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/* ---------- blocks ---------- */
function rowsHTML({ head, rows, cap }) {
  return (cap ? `<p class="rows-cap">${cap}</p>` : '') + `<div class="rows">` + rows.map(r =>
    `<div class="row"><span class="row-t">${inline(r[0])}</span><dl class="row-kv">` +
    r.slice(1).map((v, i) => `<dt>${head[i + 1]}</dt><dd>${inline(v)}</dd>`).join('') + `</dl></div>`).join('') + `</div>`;
}
function figHTML(key, cap) {
  const diagram = ['window', 'triangle', 'metering', 'iphoneui', 'histogram', 'hdr', 'height', 'wideportrait', 'kelvin', 'colorwheel'].includes(key);
  return `<figure class="print ${diagram ? 'diagram' : 'taped'}">${SC[key]()}<figcaption>${cap || ''}</figcaption></figure>`;
}
let CMP_N = 0;
function compareHTML(bad, good, capBad, capGood) {
  const n = ++CMP_N;
  return `<div class="cmp" data-cmp="${n}">
    <div class="cmp-switch" role="group" aria-label="아쉬운 컷과 좋은 컷 바꿔 보기">
      <button type="button" class="cmp-btn bad" data-cmpset="bad" aria-pressed="true"><span class="mk">✕</span>아쉬운 컷</button>
      <button type="button" class="cmp-btn good" data-cmpset="good" aria-pressed="false"><span class="mk">○</span>좋은 컷</button>
    </div>
    <div class="cmp-stage">
      <figure class="print cmp-face" data-face="bad" data-on="true">${bad}<span class="stamp bad" aria-hidden="true">✕</span><figcaption>${capBad}</figcaption></figure>
      <figure class="print cmp-face" data-face="good" data-on="false" aria-hidden="true">${good}<span class="stamp good" aria-hidden="true">○</span><figcaption>${capGood}</figcaption></figure>
    </div>
    <p class="cmp-hint">버튼을 눌러 두 컷을 바꿔 보세요</p>
  </div>`;
}
function block([type, a, b]) {
  switch (type) {
    case 'p': return `<p class="p">${inline(a)}</p>`;
    case 'h': return `<h2 class="h2">${inline(a)}</h2>`;
    case 'list': return `<ul class="list">${a.map(x => `<li>${inline(x)}</li>`).join('')}</ul>`;
    case 'steps': return `<ol class="steps">${a.map(x => `<li><span>${inline(x)}</span></li>`).join('')}</ol>`;
    case 'rows': return rowsHTML(a);
    case 'fig': return figHTML(a, b);
    case 'cmp': { const [bf, gf, cb, cg] = PAIRS[a]; return compareHTML(bf(), gf(), cb, cg); }
    case 'tip': return `<aside class="memo"><span class="memo-k">메모</span>${inline(a)}</aside>`;
    case 'note': return `<aside class="note"><span class="note-k">기종 메모</span>${inline(a)}</aside>`;
    case 'person': return `<aside class="quote-person">${inline(a)}</aside>`;
    case 'widget': return a === 'light' ? lightWidget() : lensWidget(a === 'lensB' ? 'B' : 'A');
  }
  return '';
}

/* ---------- light widget ---------- */
const LIGHT_ZONES = [
  [22, '순광', '해가 내 등 뒤에 있다. 얼굴 전체가 밝고 그림자는 뒤로 숨는다.', '파란 하늘, 색이 선명한 건물과 간판', '입체감이 약하고 눈이 부셔 찡그리기 쉽다'],
  [67, '사선광', '얼굴 한쪽이 살짝 어두워 입체감이 생기고, 두 눈은 모두 밝다. 인물에 가장 무난하다.', '인물, 거리 스냅, 대부분의 장면', '그림자 쪽이 너무 어두우면 흰 벽 같은 반사로 채운다'],
  [112, '측광', '얼굴이 반은 밝고 반은 어둡다. 극적이고 질감이 산다.', '건축, 돌담, 빵·음식의 질감, 분위기 있는 인물', '밝기 차이가 커서 어두운 쪽이 뭉개지기 쉽다'],
  [157, '사선 역광', '윤곽에 빛 테두리가 생기고 얼굴은 대부분 그늘이다.', '머리카락 빛, 햇빛 비친 잎, 골든아워 인물', '얼굴을 탭해 밝기를 맞추고, 렌즈에 드는 해는 손으로 가린다'],
  [181, '역광', '해가 피사체 뒤에서 비친다. 얼굴은 어둡고 배경은 밝다.', '실루엣, 일몰, 빛줄기', '실루엣이면 하늘에, 얼굴을 살리려면 얼굴에 노출을 맞춘다']
];
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => {
  const h = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const [a, b] = [h(c1), h(c2)];
  return '#' + a.map((v, i) => Math.round(lerp(v, b[i], t)).toString(16).padStart(2, '0')).join('');
};
function lightSVG(th) {
  const t = th / 180, rad = th * Math.PI / 180;
  const cx = 75, cy = 118, R0 = 56;
  const sx = cx + R0 * Math.sin(rad), sy = cy + R0 * Math.cos(rad);
  let s = `<rect x="0" y="0" width="150" height="236" rx="4" fill="var(--paper)"/>`;
  s += `<text x="75" y="24" class="sans t-mut" font-size="15" text-anchor="middle">위에서 본 모습</text>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${R0}" fill="none" class="s-line" stroke-width="1.4" stroke-dasharray="3 5"/>`;
  const shx = cx - Math.sin(rad) * 40, shy = cy - Math.cos(rad) * 40;
  s += `<line x1="${cx}" y1="${cy}" x2="${shx}" y2="${shy}" stroke="var(--ink)" stroke-width="9" stroke-linecap="round" opacity=".16"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="11" fill="var(--paper-2)" class="s-ink" stroke-width="2"/><path d="M${cx - 4},${cy + 9} L${cx},${cy + 15} L${cx + 4},${cy + 9}" class="s-ink" stroke-width="2" fill="none"/>`;
  s += `<g transform="translate(${cx} 212)"><rect x="-14" y="-9" width="28" height="18" rx="4" class="f-ink"/><circle cx="0" cy="-9" r="4.5" class="f-paper s-ink" stroke-width="2"/></g><text x="${cx + 22}" y="218" class="sans t-mut" font-size="15">나</text>`;
  s += `<circle cx="${sx}" cy="${sy}" r="15" fill="#F6C453" opacity=".35"/><circle cx="${sx}" cy="${sy}" r="9" fill="#F2B43A"/>`;
  // camera view
  const bg = mix('#6F9FC0', '#F7E2B8', Math.pow(t, 1.4)), ground = mix('#9AA67A', '#6E5A44', t);
  let v = `<rect x="0" y="0" width="236" height="236" fill="${bg}"/>`;
  if (th > 135) { const k = (th - 135) / 45; v += `<circle cx="${lerp(206, 132, k)}" cy="${lerp(70, 92, k)}" r="${16 + 22 * k}" fill="#FFF3D2" opacity="${.35 + .4 * k}"/><circle cx="${lerp(206, 132, k)}" cy="${lerp(70, 92, k)}" r="13" fill="#FFF8E6"/>`; }
  v += `<rect x="0" y="170" width="236" height="66" fill="${ground}"/>`;
  const X = 118, Y = 112, r = 46, dark = '#7A4E3A', lit = '#F2C29C';
  const kx = Math.cos(rad), rx = Math.abs(kx) * r;
  const litPath = (x, y, rr, rxx) => `M${x},${y - rr} A${rr},${rr} 0 0 1 ${x},${y + rr} A${rxx},${rr} 0 0 ${kx > 0 ? 1 : 0} ${x},${y - rr}Z`;
  // shoulders
  v += `<path d="M30,236 Q34,174 ${X},166 Q202,174 206,236Z" fill="#3B4A63"/>`;
  v += `<clipPath id="lwbody"><path d="M30,236 Q34,174 ${X},166 Q202,174 206,236Z"/></clipPath>`;
  v += `<g clip-path="url(#lwbody)"><path d="${litPath(X, 200, 110, Math.abs(kx) * 110)}" fill="#6D86A8"/></g>`;
  v += `<rect x="${X - 15}" y="${Y + 36}" width="30" height="26" fill="${dark}"/><rect x="${X}" y="${Y + 36}" width="${15 * Math.max(0, kx) + 6}" height="26" fill="${lit}" opacity="${Math.max(0, kx)}"/>`;
  v += `<circle cx="${X}" cy="${Y}" r="${r}" fill="${dark}"/>`;
  v += `<path d="${litPath(X, Y, r, rx)}" fill="${lit}"/>`;
  v += `<path d="M${X - r - 2},${Y - 4} Q${X - r},${Y - r - 14} ${X},${Y - r - 6} Q${X + r},${Y - r - 14} ${X + r + 2},${Y - 4} Q${X + 20},${Y - 32} ${X - r - 2},${Y - 4}Z" fill="#2E211B"/>`;
  if (th > 100) { const k = (th - 100) / 80; v += `<path d="M${X + 4},${Y - r - 6} A${r + 4},${r + 4} 0 0 1 ${X + r * .95},${Y + r * .55}" fill="none" stroke="#FFE7B5" stroke-width="${1 + 4 * k}" stroke-linecap="round" opacity="${.4 + .6 * k}"/>`; }
  const eyeL = Math.max(.25, Math.min(1, 1 - (th - 60) / 80));
  v += `<circle cx="${X - 16}" cy="${Y + 2}" r="3.6" fill="#24170F" opacity="${eyeL}"/><circle cx="${X + 16}" cy="${Y + 2}" r="3.6" fill="#24170F" opacity="${Math.max(.3, 1 - (th - 110) / 70)}"/>`;
  s += `<svg x="164" y="0" width="236" height="236" viewBox="0 0 236 236"><clipPath id="lwview"><rect width="236" height="236" rx="4"/></clipPath><g clip-path="url(#lwview)">${v}</g></svg>`;
  s += `<text x="282" y="24" class="sans" font-size="15" text-anchor="middle" fill="#FFF8EC" stroke="#2B241F" stroke-width="3.5" paint-order="stroke">카메라에 보이는 모습</text>`;
  return `<svg class="dg" viewBox="0 0 400 236" role="img" aria-label="해의 각도 ${th}도일 때 인물에 비치는 빛">${s}</svg>`;
}
function lightWidget() {
  return `<div class="widget" data-w="light">
    <div class="widget-k"><span class="h3">해를 움직여 보세요</span><span class="small-k">SUN ANGLE</span></div>
    <div class="lw-svg">${lightSVG(45)}</div>
    <label class="sr" for="sun-angle">해의 각도</label>
    <input id="sun-angle" class="range" type="range" min="0" max="180" step="1" value="45">
    <div class="chips">${[[0, '순광'], [45, '사선광'], [90, '측광'], [135, '사선 역광'], [180, '역광']].map(([a, n]) => `<button type="button" class="chip" data-sun="${a}" aria-pressed="${a === 45}">${n}</button>`).join('')}</div>
    <div class="readout" aria-live="polite"></div>
  </div>`;
}
function updateLight(w, th) {
  $('.lw-svg', w).innerHTML = lightSVG(th);
  $$('[data-sun]', w).forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.sun === th)));
  const z = LIGHT_ZONES.find(z => th < z[0]);
  $('.readout', w).innerHTML = `<span class="readout-name">${z[1]}</span><span class="readout-tag">${th}°</span><p>${z[2]}</p>
    <dl class="kv"><dt>잘 맞는 곳</dt><dd>${z[3]}</dd><dt>주의</dt><dd>${z[4]}</dd></dl>`;
}

/* ---------- lens widget ---------- */
const LENSES = [[.5, 13], [1, 24], [2, 48], [3, 77], [4, 100], [5, 120], [8, 200]];
const MODELS = {
  std: { name: '일반', sub: '15·16·17', k: { .5: 'opt', 1: 'opt', 2: 'crop' } },
  p3: { name: 'Pro 3x', sub: '14 Pro·15 Pro', k: { .5: 'opt', 1: 'opt', 2: 'crop', 3: 'opt' } },
  p5: { name: 'Pro 5x', sub: '15 Pro Max·16 Pro', k: { .5: 'opt', 1: 'opt', 2: 'crop', 5: 'opt' } },
  p4: { name: 'Pro 4x', sub: '17 Pro', k: { .5: 'opt', 1: 'opt', 2: 'crop', 4: 'opt', 8: 'crop' } }
};
const KIND = { opt: ['광학', '실제 렌즈. 화질 그대로'], crop: ['센서 크롭', '48MP 센서의 가운데를 잘라 씀. 화질 손실이 거의 없음'], dig: ['디지털 줌', '이미지를 잘라 확대. 배율이 커질수록 흐려짐'] };
const kindOf = (m, z) => MODELS[m].k[z] || 'dig';
let MASTER = null;
function lensMaster() { if (!MASTER) { const b = mk(); MASTER = b.svg(400, 300, SC.lensMaster(b), '전망대에서 본 마을과 언덕 위 탑'); } return MASTER; }
function lensViewA(st) {
  const f = LENSES.find(l => l[0] === st.z)[1];
  const w = 400 * 13 / f, h = w * .75, x = 200 - w / 2, y = 142 - h / 2;
  const kind = kindOf(st.m, st.z);
  let base = 13;
  LENSES.forEach(([z, ff]) => { if (ff <= f && kindOf(st.m, z) !== 'dig') base = ff; });
  const blur = kind === 'dig' ? (f / base - 1 + .6) * w / 400 : 0;
  const svg = lensMaster().replace('viewBox="0 0 400 300"', `viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="xMidYMid slice"`)
    .replace('<defs>', `<defs><filter id="lzblur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="${blur.toFixed(2)}"/></filter>`)
    .replace(/(<\/defs>)([\s\S]*)(<\/svg>)$/, (_, a, body, c) => `${a}<g${blur ? ' filter="url(#lzblur)"' : ''}>${body}</g>${c}`);
  const mini = `<svg class="lz-mini" viewBox="0 0 400 300" aria-hidden="true"><image href="data:image/svg+xml;utf8,${encodeURIComponent(lensMaster().replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))}" width="400" height="300"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#FFD60A" stroke-width="${6}"/></svg>`;
  return `<div class="lz-view">${svg}${mini}</div>`;
}
function lensViewB(st) {
  const f = LENSES.find(l => l[0] === st.z)[1];
  const d = 2.267 * f / 36, frac = 60 * f / (36 * (d + 400)), rfrac = 140 * f / (36 * (d + 2400));
  const H = 400, hz = 204;
  const b = mk();
  let s = R(0, 0, 300, H, b.lin('#86B4CC', '#E3EEEA'));
  const rh = rfrac * H;
  s += ridge([[0, hz - rh * .7], [60, hz - rh], [130, hz - rh * .6], [200, hz - rh * .95], [300, hz - rh * .5]], hz + 2, '#9DB0B3');
  s += tower(212, hz + 1, frac * H, '#5E5A63', '#E8E0D2');
  s += R(0, hz, 300, H - hz, b.lin('#B7AE8E', '#9C9070'));
  s += person({ x: 100, y: 382, h: 300, shirt: C.red });
  s += lab(214, Math.max(30, hz - frac * H - 12), `탑 ${Math.round(frac * 100)}%`, { size: 22 });
  return `<div class="lz-view portrait">${b.svg(300, H, s, `${f}mm로 인물을 같은 크기로 찍을 때 배경 탑의 크기`)}</div>`;
}
function lensWidget(mode) {
  return `<div class="widget" data-w="lens" data-mode="${mode}" data-m="std" data-z="${mode === 'A' ? 1 : 2}">
    <div class="widget-k"><span class="h3">${mode === 'A' ? '렌즈 버튼을 눌러 보세요' : '인물 크기를 고정하고 렌즈를 바꾸면'}</span><span class="small-k">${mode === 'A' ? 'FIELD OF VIEW' : 'DISTANCE'}</span></div>
    <div class="seg" role="group" aria-label="보기 방식">
      <button type="button" data-lmode="A" aria-pressed="${mode === 'A'}">제자리에서 렌즈만</button>
      <button type="button" data-lmode="B" aria-pressed="${mode === 'B'}">인물 크기 고정</button>
    </div>
    <div class="lz-out"></div>
    <div><p class="small-k ko" style="margin:0 0 .5rem">내 아이폰</p><div class="chips" data-models>${Object.entries(MODELS).map(([k, m]) => `<button type="button" class="chip" data-model="${k}" aria-pressed="${k === 'std'}">${m.name}<span class="sr"> ${m.sub}</span></button>`).join('')}</div></div>
    <div><p class="small-k ko" style="margin:0 0 .5rem">렌즈 버튼</p><div class="chips nowrap" data-lenses></div></div>
    <div class="legend"><span><i style="background:var(--teal)"></i>광학</span><span><i style="background:var(--yellow)"></i>센서 크롭</span><span><i style="border-top:1.5px dashed var(--ink-2);height:0"></i>디지털 줌</span></div>
    <div class="readout" aria-live="polite"></div>
  </div>`;
}
function updateLens(w) {
  const st = { mode: w.dataset.mode, m: w.dataset.m, z: +w.dataset.z };
  const list = LENSES.filter(([z]) => st.mode === 'A' || z !== 8);
  if (!list.some(l => l[0] === st.z)) { st.z = 1; w.dataset.z = 1; }
  $('[data-lenses]', w).innerHTML = list.map(([z]) => `<button type="button" class="chip lens" data-lens="${z}" data-kind="${kindOf(st.m, z)}" aria-pressed="${z === st.z}">${z === .5 ? '.5' : z + 'x'}</button>`).join('');
  $$('[data-model]', w).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.model === st.m)));
  $$('[data-lmode]', w).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lmode === st.mode)));
  $('.widget-k .h3', w).textContent = st.mode === 'A' ? '렌즈 버튼을 눌러 보세요' : '인물 크기를 고정하고 렌즈를 바꾸면';
  $('.widget-k .small-k', w).textContent = st.mode === 'A' ? 'FIELD OF VIEW' : 'DISTANCE';
  $('.lz-out', w).innerHTML = st.mode === 'A' ? lensViewA(st) : lensViewB(st);
  const f = LENSES.find(l => l[0] === st.z)[1], kind = kindOf(st.m, st.z), m = MODELS[st.m];
  let p;
  if (st.mode === 'A') {
    p = st.z === .5 ? '같은 자리에서 가장 넓게. 노란 틀이 각 배율이 담는 범위다.' : `같은 자리에서 찍었으니 원근감은 .5와 똑같다. 가운데를 ${(f / 13).toFixed(1)}배 확대한 것과 같다.`;
    if (st.z === .5 && st.m === 'std') p += ' 16e와 Air처럼 후면 카메라가 하나인 모델에는 .5가 없다.';
  } else {
    const d = 2.267 * f / 36;
    p = `인물을 같은 크기로 담으려면 약 ${d < 1 ? d.toFixed(1) : Math.round(d * 10) / 10}m 떨어져야 한다. ` +
      (f <= 13 ? '너무 가까워 얼굴과 몸 비율이 왜곡되기 쉽다.' : f <= 24 ? '배경은 작고 멀어 보인다.' : f <= 48 ? '배경이 조금씩 당겨져 보인다.' : '멀리서 찍은 만큼 배경이 크게 당겨져 보인다(압축).');
  }
  $('.readout', w).innerHTML = `<span class="readout-name">${st.z === .5 ? '.5' : st.z + 'x'} · ${f}mm</span><span class="readout-tag ${kind}">${KIND[kind][0]}</span>
    <p>${p}</p><dl class="kv"><dt>내 기종</dt><dd>${m.name} (${m.sub}): ${KIND[kind][1]}</dd></dl>`;
}

/* ---------- screens ---------- */
const view = () => $('#view');
function readBtn(id) {
  const on = READ.has(id);
  return `<button type="button" class="readbtn" data-read="${id}" aria-pressed="${on}">${on ? '현상 완료' : '다 읽었어요'}<small>${on ? 'READ ✓' : 'TAP TO MARK'}</small></button>`;
}
function pnHTML(list, id) {
  const i = list.indexOf(id), prev = list[i - 1], next = list[i + 1];
  const tk = (t, dir) => t ? `<button type="button" class="ticket ghost ${dir}" data-go="${t}"><span class="t-main"><span class="t-sub">${dir === 'prev' ? '← 이전' : '다음 →'}</span><span>${label(t)}</span></span></button>` : '<span></span>';
  return `<div class="pn">${tk(prev, 'prev')}${tk(next, 'next')}</div>`;
}
function renderChapter(id) {
  const c = CH[id], p = PART_OF[id];
  return `<header class="page-head"><div class="eyebrow"><span class="code">${c.code}</span><span>PART ${p.no} · ${p.name}</span></div>
    <h1 class="h1">${c.title}</h1><p class="lede">${c.lede}</p></header>
    <div class="flow">${c.body.map(block).join('')}</div>
    <div class="endcap">${readBtn(id)}${pnHTML(ORDER, id)}</div>`;
}
function renderCase(id) {
  const c = CASE[id];
  const order = CASES.map(x => x.id);
  return `<header class="page-head"><div class="eyebrow"><span class="code">CASE ${c.no}</span><span>상황별</span></div>
    <h1 class="h1">${c.title}</h1><p class="lede">${c.short}</p>
    <div class="when">${c.when.map(w => `<span class="labeltape">${w}</span>`).join('')}</div></header>
    ${compareHTML(CS[id].bad(), CS[id].good(), c.cap[0], c.cap[1])}
    <section class="sec"><div class="sec-k"><span class="num">01</span><h2 class="h2">문제</h2></div><p class="p">${inline(c.problem)}</p></section>
    <section class="sec"><div class="sec-k"><span class="num">02</span><h2 class="h2">원리</h2></div><p class="p">${inline(c.principle)}</p>
      <div class="related">${c.links.map(l => `<button type="button" class="xlink" data-go="${l}">${label(l)}</button>`).join('')}</div></section>
    <section class="sec"><div class="sec-k"><span class="num">03</span><h2 class="h2">해결</h2></div><ol class="steps">${c.fix.map(x => `<li><span>${inline(x)}</span></li>`).join('')}</ol></section>
    <aside class="note" style="margin-top:1.4rem"><span class="note-k">메모</span>${inline(c.note)}</aside>
    <div class="endcap">${readBtn(id)}${pnHTML(order, id)}</div>`;
}
function renderHome() {
  const last = store.get('last', null);
  const cont = last && valid(last) && !['home', 'theory', 'cases', 'check'].includes(last) ? last : 'intro';
  const readCount = [...READ].filter(x => CH[x] || CASE[x]).length;
  const frames = [...ORDER, ...CASES.map(c => c.id)].map(id => `<i class="${READ.has(id) ? 'on' : ''}"></i>`).join('');
  const tip = DAILY[Math.floor(Math.random() * DAILY.length)];
  const tocRow = (n, t, d, go, c) => `<li><button type="button" data-${go[0]}="${go[1]}"><span class="n">${n}</span><span><span class="t">${t}</span><span class="d">${d}</span></span><span class="c">${c}</span></button></li>`;
  return `<section class="mast">
      <div class="mast-top"><span>VOL.01 · 이론편</span><span>2026 가을호</span></div>
      <h1 class="mast-title">사진 잘<br>찍는 <em>법</em></h1>
      <div class="mast-sub"><span class="hand">아이폰으로 떠나는 여행 사진</span><span class="small-k">43 STORIES</span></div>
    </section>
    <figure class="print taped cover">${SC.cover()}<figcaption>해가 지기 20분 전, 측광에서 역광으로</figcaption></figure>
    <button type="button" class="ticket wide" data-go="${cont}"><span class="stub">${icon(cont === 'intro' ? 'player-play' : 'bookmark')}</span>
      <span class="t-main"><span class="t-sub">${cont === 'intro' ? 'START' : 'CONTINUE'}</span><span>${cont === 'intro' ? '처음부터 읽기' : '이어서 읽기 · ' + label(cont)}</span></span></button>
    <div class="progress"><div class="progress-top"><h2 class="h3">현상한 필름</h2><span class="progress-n">${readCount} / ${TOTAL}컷</span></div>
      <div class="filmbar" role="img" aria-label="${TOTAL}편 중 ${readCount}편 읽음"><div class="filmbar-frames">${frames}</div></div></div>
    <div class="section-k"><h2 class="h2">이번 호 차례</h2><small>CONTENTS</small></div>
    <ul class="toc">
      ${PARTS.map(p => tocRow(p.no, p.name, p.desc, ['go', p.ch[0]], p.ch.length + '편')).join('')}
      ${tocRow('6', '상황별 케이스', '여행지에서 바로 꺼내 보는 14가지 장면', ['tab', 'cases'], '14편')}
      ${tocRow('7', '체크와 부록', '아이폰 설정, 여행 루틴, 치트시트, 용어', ['tab', 'check'], '6편')}
    </ul>
    <aside class="memo daily"><span class="memo-k">오늘의 한 줄</span>${tip}</aside>
    ${STANDALONE ? '' : `<aside class="note" style="margin-top:1.6rem"><span class="note-k">홈 화면에 추가하기</span>아이폰 Safari에서 아래쪽 공유 버튼(네모에 위쪽 화살표)을 누르고 ‘홈 화면에 추가’를 고르면 앱처럼 열려요. 한 번 열어 두면 데이터가 없어도 열립니다.</aside>`}`;
}
function renderTheory() {
  return `<header class="page-head"><div class="eyebrow"><span class="code">PART 0–5</span><span>이론</span></div><h1 class="h1">이론</h1>
    <p class="lede">빛, 노출, 구도, 화각, 색. 출발 전에 한 번 읽어 두면 현장에서 손이 먼저 움직인다.</p></header>` +
    PARTS.map(p => `<section class="part"><div class="part-head"><span class="part-no">${p.no}</span><span class="part-name">${p.name}</span><span class="part-desc">${p.desc}</span></div>
      ${p.ch.map(id => `<button type="button" class="chap ${READ.has(id) ? 'is-read' : ''}" data-go="${id}"><span class="chap-code">${CH[id].code}</span><span><span class="chap-t">${CH[id].title}</span><span class="chap-d">${CH[id].short}</span></span><span class="readmark" aria-label="${READ.has(id) ? '읽음' : '안 읽음'}">${icon('check')}</span></button>`).join('')}</section>`).join('');
}
function renderCases() {
  return `<header class="page-head"><div class="eyebrow"><span class="code">CASE 01–14</span><span>상황별</span></div><h1 class="h1">상황별 케이스</h1>
    <p class="lede">여행지에서 마주치는 14가지 장면. 문제, 원리, 해결 순서로 보고 ✕/○ 컷을 비교한다.</p></header>
    <label class="search" for="case-search">${icon('search')}<span class="sr">상황 검색</span><input id="case-search" type="search" placeholder="노을, 카페, 셀카처럼 찾아보세요" autocomplete="off" enterkeyhint="search"></label>
    <div class="quick">${['노을', '야경', '음식', '인물', '실내', '비'].map(k => `<button type="button" class="chip" data-q="${k}">${k}</button>`).join('')}</div>
    <div class="sheet"><p class="empty" hidden>맞는 장면이 없어요. 다른 말로 찾아보세요.</p>${CASES.map(c => `<button type="button" class="frame ${READ.has(c.id) ? 'is-read' : ''}" data-go="${c.id}">
      <span class="frame-edge"><span>${c.no}A ▸</span><span>FILM 400</span></span>
      <span class="frame-img">${CS[c.id].good().replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ')}</span>
      <span class="frame-t">${c.title}</span><span class="frame-w">${c.short}</span></button>`).join('')}</div>`;
}
function checkItem(it) {
  return `<li><label class="check"><input type="checkbox" data-check="${it.id}" ${CHECKED.has(it.id) ? 'checked' : ''}><span><span class="check-t">${it.t}</span><span class="check-d">${inline(it.d)}</span></span></label></li>`;
}
function renderCheck() {
  const n = SETUP.filter(x => CHECKED.has(x.id)).length;
  return `<header class="page-head"><div class="eyebrow"><span class="code">CHECK</span><span>체크와 부록</span></div><h1 class="h1">떠나기 전, 그리고 현장에서</h1>
    <p class="lede">체크 표시는 이 기기에만 저장된다. 여행이 끝나면 아래에서 한 번에 지울 수 있다.</p></header>
    <div class="section-k"><h2 class="h2">아이폰 설정</h2><small class="count" data-count>${n} / ${SETUP.length}</small></div>
    <ul class="checks">${SETUP.map(checkItem).join('')}</ul>
    <div class="section-k"><h2 class="h2">여행 촬영 루틴</h2><small>ROUTINE</small></div>
    ${ROUTINE.map(g => `<p class="group-k">${g.k}</p><ul class="checks">${g.items.map(checkItem).join('')}</ul>`).join('')}
    <div style="margin-top:1rem"><button type="button" class="ticket ghost" data-reset>${icon('rotate')}체크 모두 지우기</button><p class="small-k ko" data-reset-msg style="margin:.6rem 0 0" hidden></p></div>
    <div class="section-k"><h2 class="h2">부록</h2><small>APPENDIX</small></div>
    <ul class="linkrows">${Object.entries(XPAGES).map(([k, x]) => `<li><button type="button" data-go="${k}">${icon(x.icon)}<span><span class="chap-t">${x.title}</span><span class="chap-d">${x.d}</span></span>${icon('chevron-right', 'chev')}</button></li>`).join('')}</ul>`;
}
function renderX(id) {
  const x = XPAGES[id];
  let body = '';
  if (id === 'cheat') {
    const card = (t, items, wide) => `<div class="cheat-card ${wide ? 'cheat-wide' : ''}"><h3>${t}</h3><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul></div>`;
    body = `<div class="cheat">
      ${card('빛', ['해가 어디 있나 먼저 본다', '인물은 비스듬한 45° 빛', '골든아워·블루아워를 일정에', '한낮 인물은 그늘로'])}
      ${card('노출', ['탭 → 위아래로 밀기', '길게 누르면 AE/AF 잠금', '흰 건 +, 검은 건 −', '하이라이트를 지킨다'])}
      ${card('구도', ['주인공을 한 문장으로', '다가가서 빼기', '수평선은 1/3 선에', '선, 틀, 층을 찾는다', '가장자리 한 바퀴'])}
      ${card('화각', ['원근감은 거리가 정한다', '.5는 전경에 바짝', '인물은 1x~2x, 1.5m 이상', '버튼 배율만 쓰고 나중에 자르기'])}
      ${card('색', ['따뜻함으로 분위기', '채도보다 생동감', '색은 하나만 강조', '같은 날 사진은 편집 복사'])}
      ${card('사람', ['폰은 허리 높이로', '발끝은 아래 가장자리', '머리 뒤 기둥 피하기', '여러 장 연속으로'])}
      ${card('상황별 한 줄', CASES.map(c => `<button type="button" class="xlink" data-go="${c.id}">${c.title}</button> ${CHEAT_ONE[c.id]}`), true)}
    </div>`;
  } else if (id === 'mistakes') {
    body = `<ol class="steps">${MISTAKES.map(([t, d, l]) => `<li><span><b>${t}</b><br>${d}${l ? ` <button type="button" class="xlink" data-go="${l}">${label(l)}</button>` : ''}</span></li>`).join('')}</ol>`;
  } else if (id === 'people') {
    body = `<p class="p" style="margin-bottom:1rem">사진은 이 앱에 싣지 않았다. 이름으로 검색해서 직접 찾아보자.</p><div class="rows">${PEOPLE.map(([ko, en, w, d, learn, l]) =>
      `<div class="row"><span class="row-t">${ko} <span class="small-k">${en}</span></span><dl class="row-kv"><dt>시대·지역</dt><dd>${w}</dd><dt>특징</dt><dd>${d}</dd><dt>배울 점</dt><dd>${learn} · <button type="button" class="xlink" data-go="${l}">${label(l)}</button></dd></dl></div>`).join('')}</div>`;
  } else {
    body = `<dl class="terms">${TERMS.map(([t, e, d]) => `<div class="term"><dt>${t}<small>${e}</small></dt><dd>${d}</dd></div>`).join('')}</dl>`;
  }
  return `<header class="page-head"><div class="eyebrow"><span class="code">APPENDIX</span><span>체크와 부록</span></div><h1 class="h1">${x.title}</h1><p class="lede">${x.d}</p></header>${body}`;
}

/* ---------- router ---------- */
let STACK = [];
function render(id) {
  const v = view();
  CMP_N = 0;
  v.innerHTML = id === 'home' ? renderHome() : id === 'theory' ? renderTheory() : id === 'cases' ? renderCases() : id === 'check' ? renderCheck()
    : CH[id] ? renderChapter(id) : CASE[id] ? renderCase(id) : renderX(id);
  v.classList.remove('view'); void v.offsetWidth; v.classList.add('view');
  $$('[data-w="light"]', v).forEach(w => updateLight(w, 45));
  $$('[data-w="lens"]', v).forEach(updateLens);
  const root = ['home', 'theory', 'cases', 'check'].includes(id);
  const bar = $('#bar');
  bar.hidden = root;
  if (!root) {
    $('#bar-title').textContent = CH[id] ? CH[id].title : CASE[id] ? CASE[id].title : XPAGES[id].title;
    $('#bar-code').textContent = CH[id] ? CH[id].code : CASE[id] ? 'CASE ' + CASE[id].no : 'APPX';
  }
  const g = groupOf(id);
  $$('.tab').forEach(t => t.toggleAttribute('aria-current', false));
  const cur = $(`.tab[data-tab="${g}"]`); if (cur) cur.setAttribute('aria-current', 'page');
  document.title = root ? '사진 잘 찍는 법' : `${label(id)} · 사진 잘 찍는 법`;
  if (CH[id] || CASE[id]) store.set('last', id);
}
function go(id, push = true) {
  if (!valid(id)) return;
  if (push && STACK.length) STACK[STACK.length - 1].y = window.scrollY;
  if (push) STACK.push({ id, y: 0 });
  render(id);
  window.scrollTo(0, 0);
}
function back() {
  if (STACK.length > 1) {
    STACK.pop();
    const top = STACK[STACK.length - 1];
    render(top.id);
    window.scrollTo(0, top.y || 0);
  } else { const g = groupOf(STACK[0] ? STACK[0].id : 'home'); STACK = [{ id: g, y: 0 }]; render(g); window.scrollTo(0, 0); }
}
function tab(id) { STACK = [{ id, y: 0 }]; render(id); window.scrollTo(0, 0); }

document.addEventListener('click', e => {
  const t = e.target.closest('button, [data-go]');
  if (!t) return;
  if (t.dataset.go) { go(t.dataset.go); return; }
  if (t.dataset.tab) { tab(t.dataset.tab); return; }
  if (t.hasAttribute('data-back')) { back(); return; }
  if (t.dataset.cmpset) {
    const c = t.closest('.cmp'), which = t.dataset.cmpset;
    $$('.cmp-btn', c).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cmpset === which)));
    $$('.cmp-face', c).forEach(f => { const on = f.dataset.face === which; f.dataset.on = String(on); f.setAttribute('aria-hidden', String(!on)); });
    const h = $('.cmp-hint', c); if (h) h.hidden = true;
    return;
  }
  if (t.dataset.q) { const i = $('#case-search'); i.value = i.value === t.dataset.q ? '' : t.dataset.q; filterCases(i.value); $$('[data-q]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.q === i.value))); return; }
  if (t.dataset.sun) { const w = t.closest('.widget'); $('.range', w).value = t.dataset.sun; updateLight(w, +t.dataset.sun); return; }
  if (t.dataset.model) { const w = t.closest('.widget'); w.dataset.m = t.dataset.model; updateLens(w); return; }
  if (t.dataset.lens) { const w = t.closest('.widget'); w.dataset.z = t.dataset.lens; updateLens(w); return; }
  if (t.dataset.lmode) { const w = t.closest('.widget'); w.dataset.mode = t.dataset.lmode; updateLens(w); return; }
  if (t.dataset.read) {
    const id = t.dataset.read;
    READ.has(id) ? READ.delete(id) : READ.add(id);
    store.set('read', [...READ]);
    t.outerHTML = readBtn(id);
    return;
  }
  if (t.hasAttribute('data-reset')) {
    CHECKED = new Set(); store.set('check', []);
    $$('[data-check]').forEach(i => { i.checked = false; });
    const c = $('[data-count]'); if (c) c.textContent = `0 / ${SETUP.length}`;
    const m = $('[data-reset-msg]'); if (m) { m.hidden = false; m.textContent = '체크를 모두 지웠어요'; }
  }
});
document.addEventListener('input', e => {
  if (e.target.matches('#sun-angle')) updateLight(e.target.closest('.widget'), +e.target.value);
  if (e.target.matches('#case-search')) { filterCases(e.target.value); $$('[data-q]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.q === e.target.value))); }
});
document.addEventListener('change', e => {
  const i = e.target.closest('[data-check]');
  if (!i) return;
  i.checked ? CHECKED.add(i.dataset.check) : CHECKED.delete(i.dataset.check);
  store.set('check', [...CHECKED]);
  const c = $('[data-count]'); if (c) c.textContent = `${SETUP.filter(x => CHECKED.has(x.id)).length} / ${SETUP.length}`;
});

(function start() {
  const h = (location.hash || '').slice(1);
  const first = valid(h) ? h : 'home';
  const g = groupOf(first);
  STACK = first === g ? [{ id: g, y: 0 }] : [{ id: g, y: 0 }, { id: first, y: 0 }];
  render(first);
})();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => { /* offline copy unavailable; the app still works online */ }); });
}
