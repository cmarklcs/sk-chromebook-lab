/* Little Lynx Computer Lab — shared helpers: storage, sound, voice, effects,
   the on-screen keyboard, and the game runner every mini-game plugs into. */

const Store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('sklab.' + key);
      return v == null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('sklab.' + key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  },
  remove(key) { try { localStorage.removeItem('sklab.' + key); } catch (e) {} }
};

/* ---------- small DOM helpers ---------- */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') for (const [p, val] of Object.entries(v)) {
      if (p.startsWith('--')) el.style.setProperty(p, val); else el.style[p] = val;
    }
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(kid));
  }
  return el;
}
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const rand = (lo, hi) => lo + Math.random() * (hi - lo);

/* ---------- sound effects (Web Audio, no files) ---------- */
const Sfx = {
  ctx: null,
  muted() { return Store.get('muted', false); },
  tone(freq, dur = 0.15, type = 'sine', delay = 0, vol = 0.18) {
    if (this.muted()) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const t = this.ctx.currentTime + delay;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(this.ctx.destination);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  },
  pop() { this.tone(520, 0.08, 'triangle'); this.tone(880, 0.1, 'triangle', 0.05); },
  good() { this.tone(660, 0.12, 'triangle'); this.tone(990, 0.18, 'triangle', 0.1); },
  oops() { this.tone(220, 0.18, 'sine', 0, 0.12); },
  click() { this.tone(1200, 0.04, 'square', 0, 0.05); },
  step(n) { this.tone(300 + n * 45, 0.12, 'triangle'); },
  win() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, 'triangle', i * 0.12)); }
};

/* ---------- read-aloud ---------- */
const Voice = {
  voice: null,
  pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
    const prefs = [/Google US English/i, /Samantha/i, /Ava/i, /Allison/i, /Google UK English Female/i, /Female/i, /en-US/i];
    for (const p of prefs) {
      const v = vs.find(v => p.test(v.name) || p.test(v.lang));
      if (v) { this.voice = v; return; }
    }
    this.voice = vs[0] || null;
  },
  say(text) {
    if (!text || Sfx.muted() || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, ''));
      if (!this.voice) this.pickVoice();
      if (this.voice) u.voice = this.voice;
      u.rate = 0.88; u.pitch = 1.08;
      speechSynthesis.speak(u);
    } catch (e) {}
  },
  stop() { try { speechSynthesis.cancel(); } catch (e) {} }
};
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => Voice.pickVoice();

/* ---------- effects ---------- */
function confetti(count = 40) {
  const fx = document.getElementById('fx');
  const bits = ['⭐', '🎉', '✨', '🌟', '💛', '💙'];
  for (let i = 0; i < count; i++) {
    const s = h('span', { class: 'confetti' }, Math.random() < 0.5 ? pick(bits) : '');
    if (!s.textContent) {
      s.classList.add('chip');
      s.style.background = pick(['#FFCB05', '#017EA7', '#00274C', '#E53935', '#43A047', '#8E24AA']);
    }
    s.style.left = rand(0, 100) + 'vw';
    s.style.animationDuration = rand(1.4, 2.6) + 's';
    s.style.animationDelay = rand(0, 0.4) + 's';
    s.style.fontSize = rand(18, 34) + 'px';
    fx.append(s);
    setTimeout(() => s.remove(), 3200);
  }
}
function burst(x, y, emoji = '✨', n = 8) {
  const fx = document.getElementById('fx');
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n, d = rand(50, 90);
    const s = h('span', { class: 'burst' }, emoji);
    s.style.left = x + 'px'; s.style.top = y + 'px';
    s.style.setProperty('--dx', Math.cos(a) * d + 'px');
    s.style.setProperty('--dy', Math.sin(a) * d + 'px');
    fx.append(s);
    setTimeout(() => s.remove(), 800);
  }
}
function wiggle(el) { el.classList.remove('wiggle'); void el.offsetWidth; el.classList.add('wiggle'); }

/* ---------- stars / progress ---------- */
const Progress = {
  all() { return Store.get('progress', {}); },
  stars(id) { return this.all()[id] || 0; },
  add(id) {
    const p = this.all(); p[id] = (p[id] || 0) + 1; Store.set('progress', p);
    updateStarTotal();
  },
  total() { return Object.values(this.all()).reduce((a, b) => a + b, 0); },
  reset() { Store.remove('progress'); updateStarTotal(); }
};
function updateStarTotal() {
  const el = document.getElementById('starTotal');
  if (el) el.textContent = '⭐ ' + Progress.total();
}

/* ---------- student name (saved on this Chromebook) ---------- */
function cleanName(s) {
  s = (s || '').replace(/[^A-Za-z \-']/g, '').trim().slice(0, 20);
  return s ? s[0].toUpperCase() + s.slice(1) : '';
}
function getName() {
  const fromUrl = new URLSearchParams(location.search).get('name');
  if (fromUrl && cleanName(fromUrl)) Store.set('name', cleanName(fromUrl));
  return Store.get('name', '');
}
function askName(force) {
  return new Promise(resolve => {
    const saved = getName();
    if (saved && !force) return resolve(saved);
    const input = h('input', { class: 'name-input', type: 'text', maxlength: 20, autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Your name', value: saved || '' });
    const ok = h('button', { class: 'big-btn go' }, '✓ That’s me!');
    const box = h('div', { class: 'modal-back' },
      h('div', { class: 'modal' },
        h('div', { class: 'modal-emoji' }, '👋'),
        h('h2', null, 'What is your name?'),
        h('p', { class: 'muted' }, 'Use your name card. A grown-up can help!'),
        input, ok));
    const done = () => {
      const n = cleanName(input.value);
      if (!n) { wiggle(input); Voice.say('Type your name first.'); input.focus(); return; }
      Store.set('name', n); box.remove(); Sfx.good(); resolve(n);
    };
    ok.addEventListener('click', done);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') done(); });
    document.body.append(box);
    Voice.say('What is your name? Type your name, then click the green button.');
    setTimeout(() => input.focus(), 50);
  });
}

/* ---------- on-screen keyboard (matches the printed name sheets) ---------- */
const KEY_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'backspace'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'enter'],
  ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'shift'],
  ['space']
];
function keyName(e) {
  if (e.key === ' ' || e.code === 'Space') return 'space';
  if (e.key === 'Shift') return 'shift';
  if (e.key === 'Enter') return 'enter';
  if (e.key === 'Backspace') return 'backspace';
  return e.key && e.key.length === 1 ? e.key.toLowerCase() : null;
}
function Keyboard(opts = {}) {
  const el = h('div', { class: 'kb' + (opts.small ? ' kb-small' : '') });
  const keys = {};
  KEY_ROWS.forEach((row, ri) => {
    const r = h('div', { class: 'kb-row kb-row' + ri });
    row.forEach(k => {
      const label = k === 'backspace' ? '←' : k;
      const b = h('button', { class: 'key key-' + k + (k.length > 1 ? ' key-wide' : ''), 'data-key': k, tabindex: -1, type: 'button' }, label);
      if (opts.onClick) b.addEventListener('click', () => opts.onClick(k, b));
      else b.disabled = true;
      (keys[k] = keys[k] || []).push(b);
      r.append(b);
    });
    el.append(r);
  });
  return {
    el,
    keys: k => keys[k] || [],
    glow(k) { el.querySelectorAll('.glow').forEach(b => b.classList.remove('glow')); (k ? [].concat(k) : []).forEach(x => (keys[x] || []).forEach(b => b.classList.add('glow'))); },
    color(k, c) { (keys[k] || []).forEach(b => { b.style.background = c; b.classList.add('colored'); }); },
    flash(k, cls = 'pressed') { (keys[k] || []).forEach(b => { b.classList.remove(cls); void b.offsetWidth; b.classList.add(cls); setTimeout(() => b.classList.remove(cls), 350); }); }
  };
}

/* ---------- drag helper (trackpad, mouse and touch) ---------- */
function makeDraggable(node, { onDrop, onStart } = {}) {
  node.classList.add('draggable');
  node.addEventListener('pointerdown', e => {
    if (node.classList.contains('gone')) return;
    e.preventDefault();
    try { node.setPointerCapture(e.pointerId); } catch (_) {}
    const sx = e.clientX, sy = e.clientY;
    node.classList.add('dragging'); node.style.transition = 'none';
    onStart && onStart();
    const move = ev => { node.style.transform = `translate(${ev.clientX - sx}px, ${ev.clientY - sy}px) scale(1.1)`; };
    const up = ev => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      node.classList.remove('dragging');
      const kept = onDrop && onDrop(ev.clientX, ev.clientY);
      if (!kept) { node.style.transition = 'transform .35s cubic-bezier(.3,1.5,.6,1)'; node.style.transform = ''; }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  });
}
function hitTest(el, x, y, pad = 20) {
  const r = el.getBoundingClientRect();
  return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
}

/* ---------- shapes for pointer games ---------- */
const COLORS = { red: '#E53935', blue: '#1E88E5', yellow: '#FDD835', green: '#43A047', purple: '#8E24AA', orange: '#FB8C00' };
function starPoints(cx, cy, R, r, n = 5) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n, rad = i % 2 ? r : R;
    pts.push((cx + Math.cos(a) * rad).toFixed(1) + ',' + (cy + Math.sin(a) * rad).toFixed(1));
  }
  return pts.join(' ');
}
function shapeSVG(shape, color) {
  const fill = COLORS[color] || color, st = 'stroke="#00274C" stroke-width="3" stroke-linejoin="round"';
  const body = {
    circle: `<circle cx="50" cy="50" r="42" fill="${fill}" ${st}/>`,
    square: `<rect x="10" y="10" width="80" height="80" rx="8" fill="${fill}" ${st}/>`,
    triangle: `<polygon points="50,8 93,88 7,88" fill="${fill}" ${st}/>`,
    star: `<polygon points="${starPoints(50, 54, 46, 19)}" fill="${fill}" ${st}/>`,
    heart: `<path d="M50 88 C 12 62 2 38 20 20 C 34 8 48 16 50 30 C 52 16 66 8 80 20 C 98 38 88 62 50 88 Z" fill="${fill}" ${st}/>`
  }[shape];
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;
}

/* ---------- game registry + runner ---------- */
const Games = {};
function registerGame(def) { Games[def.id] = def; }

function runGame(id, weekNum, mount) {
  const def = Games[id];
  const cleanups = [];
  let lastSaid = '';
  let finished = false, dead = false;
  const week = WEEKS.find(w => w.n === weekNum) || WEEKS.find(w => w.games.includes(id));

  const promptText = h('div', { class: 'prompt-text' });
  const sayBtn = h('button', { class: 'say-btn', 'aria-label': 'Hear it again', title: 'Hear it again' }, '🔊');
  const dots = h('div', { class: 'dots' });
  const stage = h('div', { class: 'stage stage-' + id });
  const backHref = week ? '#/week/' + week.n : '#/';
  const bar = h('div', { class: 'game-bar', style: { '--wk': week ? week.color : '#017EA7' } },
    h('a', { class: 'back-btn', href: backHref, 'aria-label': 'Back' }, '⬅'),
    h('div', { class: 'game-title' }, h('span', { class: 'game-emoji' }, def.emoji), def.title),
    h('div', { class: 'prompt' }, sayBtn, promptText),
    dots);
  mount.append(h('section', { class: 'game' }, bar, stage));
  sayBtn.addEventListener('click', () => Voice.say(lastSaid));

  const api = {
    stage, week,
    say(text, show) { lastSaid = text; promptText.textContent = show || text; Voice.say(text); },
    show(text) { promptText.textContent = text; },
    good() { Sfx.good(); }, oops() { Sfx.oops(); }, pop() { Sfx.pop(); },
    progress(cur, total) {
      dots.innerHTML = '';
      if (total > 12) { dots.append(h('span', { class: 'count' }, `${cur} / ${total}`)); return; }
      for (let i = 0; i < total; i++) dots.append(h('span', { class: 'dot' + (i < cur ? ' on' : '') }));
    },
    on(target, type, fn, opt) { if (dead) return; target.addEventListener(type, fn, opt); cleanups.push(() => target.removeEventListener(type, fn, opt)); },
    later(fn, ms) { const t = setTimeout(() => { if (!finished || fn.always) fn(); }, ms); cleanups.push(() => clearTimeout(t)); return t; },
    every(fn, ms) { const t = setInterval(fn, ms); cleanups.push(() => clearInterval(t)); return t; },
    loop(fn) {
      let last = performance.now(), id;
      const tick = now => { fn(Math.min(50, now - last) / 16.67); last = now; id = requestAnimationFrame(tick); };
      id = requestAnimationFrame(tick);
      cleanups.push(() => cancelAnimationFrame(id));
    },
    cleanup(fn) { cleanups.push(fn); },
    markDone() { if (!Progress.stars(id)) Progress.add(id); },
    win(message = 'You did it!', opts = {}) {
      if (finished) return; finished = true;
      Progress.add(id);
      Sfx.win(); confetti(50);
      const next = week && week.games[week.games.indexOf(id) + 1];
      const overlay = h('div', { class: 'win' },
        h('div', { class: 'win-card' },
          h('div', { class: 'win-star' }, '🌟'),
          h('h2', null, message),
          h('p', null, 'You earned a star!'),
          h('div', { class: 'win-actions' },
            opts.keepGoing ? h('button', { class: 'big-btn', onclick: () => { overlay.remove(); finished = false; opts.keepGoing(); } }, '✏️ Keep going')
              : h('button', { class: 'big-btn', onclick: () => App.route(true) }, '🔁 Again'),
            next ? h('a', { class: 'big-btn go', href: `#/play/${next}/${week.n}` }, 'Next ➡') : null,
            h('a', { class: 'big-btn alt', href: backHref }, week ? `Week ${week.n} 🏠` : '🏠'))));
      stage.append(overlay);
      Voice.say(message + ' You earned a star!');
    }
  };
  // keep space and backspace from scrolling or leaving the page while playing
  api.on(window, 'keydown', e => {
    if ((e.key === ' ' || e.key === 'Backspace') && !/INPUT|TEXTAREA/.test(e.target.tagName) && !e.target.isContentEditable) e.preventDefault();
  });
  def.start(api);
  return () => { finished = dead = true; document.querySelectorAll('.modal-back').forEach(m => m.remove()); cleanups.forEach(fn => { try { fn(); } catch (e) {} }); Voice.stop(); };
}
