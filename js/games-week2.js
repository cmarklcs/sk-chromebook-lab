/* Week 2: Pointing, clicking, double-clicking and dragging */

registerGame({
  id: 'bubbles', emoji: '🫧', title: 'Bubble Pop',
  blurb: 'Point and click',
  start(api) {
    const LEVELS = [
      { size: 160, speed: 0.55, goal: 6, max: 3, say: 'Pop the bubbles! Move the pointer onto a bubble, then click.' },
      { size: 120, speed: 0.8, goal: 8, max: 4, say: 'Level 2! The bubbles are smaller.' },
      { size: 90, speed: 1.05, goal: 10, max: 5, say: 'Level 3! Tiny bubbles. You can do it!' }
    ];
    const field = h('div', { class: 'bubble-field' });
    const levelTag = h('div', { class: 'level-tag' });
    api.stage.append(field, levelTag);
    let level = 0, popped = 0, bubbles = [], paused = false;
    const tints = ['#bfe6f5', '#ffe9a8', '#d7f5c9', '#f3d4ff', '#ffd6d6'];

    function startLevel() {
      const L = LEVELS[level];
      popped = 0; paused = false;
      levelTag.textContent = 'Level ' + (level + 1);
      api.progress(0, L.goal);
      api.say(L.say, L.say.split('!')[0] + '!');
    }
    function spawn() {
      const L = LEVELS[level];
      const W = field.clientWidth, H = field.clientHeight;
      const size = L.size * rand(0.9, 1.1);
      const b = { x: rand(10, Math.max(20, W - size - 10)), y: H + 10, size, el: h('button', { class: 'bubble', 'aria-label': 'bubble' }), wob: rand(0, 6) };
      b.el.style.width = b.el.style.height = size + 'px';
      b.el.style.setProperty('--tint', pick(tints));
      b.el.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (paused) return;
        b.dead = true; b.el.classList.add('popped'); api.pop();
        burst(e.clientX, e.clientY, pick(['✨', '💧', '⭐']), 6);
        setTimeout(() => b.el.remove(), 250);
        popped++;
        api.progress(popped, LEVELS[level].goal);
        if (popped >= LEVELS[level].goal) {
          paused = true;
          bubbles.forEach(o => { if (!o.dead) { o.dead = true; o.el.classList.add('popped'); setTimeout(() => o.el.remove(), 250); } });
          level++;
          if (level < LEVELS.length) { api.good(); api.later(startLevel, 1200); }
          else api.win('You popped all the bubbles!');
        }
      });
      field.append(b.el);
      bubbles.push(b);
    }
    let t = 0;
    api.loop(dt => {
      if (paused) return;
      const L = LEVELS[level];
      t += dt;
      bubbles = bubbles.filter(b => !b.dead);
      if (bubbles.length < L.max && t > 40) { spawn(); t = 0; }
      bubbles.forEach(b => {
        b.y -= L.speed * dt; b.wob += 0.03 * dt;
        b.el.style.transform = `translate(${b.x + Math.sin(b.wob) * 14}px, ${b.y}px)`;
        if (b.y < -b.size - 10) { b.dead = true; b.el.remove(); }
      });
    });
    startLevel();
  }
});

registerGame({
  id: 'hunt', emoji: '🔺', title: 'Shape Hunt',
  blurb: 'Find the shape and click it',
  start(api) {
    const SHAPES = ['circle', 'square', 'triangle', 'star', 'heart'];
    const COLS = Object.keys(COLORS);
    const ROUNDS = 8;
    let round = 0;
    const grid = h('div', { class: 'hunt-grid' });
    api.stage.append(grid);
    function next() {
      api.progress(round, ROUNDS);
      const n = round < 3 ? 4 : round < 6 ? 6 : 8;
      const target = { shape: pick(SHAPES), color: pick(COLS) };
      const items = [target];
      let guard = 0;
      while (items.length < n && guard++ < 200) {
        const c = round < 2 ? { shape: pick(SHAPES.filter(s => s !== target.shape)), color: pick(COLS) }
          : { shape: Math.random() < 0.5 ? target.shape : pick(SHAPES), color: Math.random() < 0.5 ? target.color : pick(COLS) };
        if (!items.some(o => o.shape === c.shape && o.color === c.color)) items.push(c);
      }
      grid.innerHTML = '';
      grid.dataset.n = n;
      let done = false;
      shuffle(items).forEach(it => {
        const b = h('button', { class: 'hunt-item', 'aria-label': it.color + ' ' + it.shape, html: shapeSVG(it.shape, it.color) });
        b.addEventListener('click', e => {
          if (done) return;
          if (it === target) {
            done = true; api.good(); b.classList.add('found'); burst(e.clientX, e.clientY, '⭐');
            round++;
            api.later(() => round < ROUNDS ? next() : (api.progress(round, ROUNDS), api.win('You found every shape!')), 1100);
          } else {
            api.oops(); wiggle(b);
            api.say(`That is a ${it.color} ${it.shape}. Find the ${target.color} ${target.shape}.`);
          }
        });
        grid.append(b);
      });
      api.say(`Click the ${target.color} ${target.shape}!`);
    }
    next();
  }
});

registerGame({
  id: 'eggs', emoji: '🥚', title: 'Hatch the Eggs',
  blurb: 'Double-click',
  start(api) {
    const babies = shuffle(['🐣', '🐥', '🦖', '🐢', '🐍', '🐊', '🦆', '🐧', '🦕', '🦜']);
    const nest = h('div', { class: 'nest' });
    api.stage.append(nest);
    let hatched = 0, tipped = 0;
    const TOTAL = 6;
    api.progress(0, TOTAL);
    for (let i = 0; i < TOTAL; i++) {
      const egg = h('button', { class: 'egg', 'aria-label': 'egg' }, h('span', { class: 'egg-shell' }, '🥚'));
      let lastClick = 0, open = false;
      egg.addEventListener('click', e => {
        if (open) return;
        const now = performance.now();
        // a forgiving double-click: two clicks within 0.7 seconds
        if (now - lastClick < 700) {
          open = true; hatched++;
          egg.classList.add('hatched');
          egg.innerHTML = '';
          egg.append(h('span', { class: 'baby' }, babies[i]));
          api.good(); burst(e.clientX, e.clientY, '✨');
          api.progress(hatched, TOTAL);
          if (hatched === TOTAL) api.later(() => api.win('All the eggs hatched!'), 900);
          else if (hatched === 1) api.say('It hatched! Double-click another egg.');
        } else {
          lastClick = now;
          Sfx.click(); wiggle(egg);
          egg.classList.add('cracked');
          api.later(() => {
            if (!open && performance.now() - lastClick >= 690 && tipped++ < 4)
              api.say('Click, click, fast! Two quick clicks.', 'Click-click fast!');
          }, 750);
        }
      });
      nest.append(egg);
    }
    api.say('Hatch the eggs! Double-click an egg. That means click, click, fast!', 'Double-click an egg: click-click fast!');
  }
});

registerGame({
  id: 'feed', emoji: '🥕', title: 'Feed the Animals',
  blurb: 'Click and drag',
  start(api) {
    const PAIRS = shuffle([
      ['🐰', 'bunny', '🥕', 'carrot'], ['🐵', 'monkey', '🍌', 'banana'], ['🐶', 'puppy', '🦴', 'bone'],
      ['🐱', 'kitty', '🐟', 'fish'], ['🐿️', 'squirrel', '🌰', 'nut'], ['🐼', 'panda', '🎋', 'bamboo'], ['🐭', 'mouse', '🧀', 'cheese']
    ]).slice(0, 5);
    const foods = h('div', { class: 'food-row' });
    const animals = h('div', { class: 'animal-row' });
    api.stage.append(foods, h('div', { class: 'feed-hint' }, '☝️ finger down · move · finger up'), animals);
    let fed = 0;
    const animalEls = shuffle(PAIRS).map(p => {
      const a = h('div', { class: 'animal' }, h('span', { class: 'animal-face' }, p[0]), h('span', { class: 'animal-name' }, p[1]));
      a.dataset.food = p[2];
      animals.append(a);
      return a;
    });
    shuffle(PAIRS).forEach(p => {
      const f = h('div', { class: 'food', 'aria-label': p[3] }, p[2]);
      makeDraggable(f, {
        onStart: () => api.show('Drag the ' + p[3] + ' to the hungry animal!'),
        onDrop(x, y) {
          const target = animalEls.find(a => hitTest(a, x, y));
          if (!target) return false;
          if (target.dataset.food === p[2]) {
            f.classList.add('gone');
            target.classList.add('fed');
            target.append(h('span', { class: 'yum' }, '😋'));
            api.good(); burst(x, y, '💖');
            fed++; api.progress(fed, PAIRS.length);
            api.say(`Yum! The ${p[1]} loves the ${p[3]}!`);
            if (fed === PAIRS.length) api.later(() => api.win('Every animal is full!'), 1600);
            return true;
          }
          api.oops(); wiggle(target);
          const who = PAIRS.find(q => q[2] === target.dataset.food);
          api.say(`The ${who[1]} does not want the ${p[3]}. Who eats the ${p[3]}?`);
          return false;
        }
      });
      foods.append(f);
    });
    api.progress(0, PAIRS.length);
    api.say('Feed the animals! Put your finger down on a food, move it to the animal that eats it, then lift your finger.', 'Drag each food to the animal that eats it.');
  }
});

/* A free drawing canvas, used in Week 2 and as a free-choice tool. */
function drawingPad(api, { onDraw, height } = {}) {
  const PALETTE = ['#00274C', '#E53935', '#FB8C00', '#FDD835', '#43A047', '#1E88E5', '#8E24AA', '#8D6E63', '#ffffff'];
  const STAMPS = ['⭐', '🌸', '🐱', '🚗', '❤️', '🌈'];
  let color = PALETTE[1], size = 12, stamp = null, drew = false;
  const canvas = h('canvas', { class: 'pad-canvas' });
  const tools = h('div', { class: 'pad-tools' });
  const sw = PALETTE.map(c => {
    const b = h('button', { class: 'swatch' + (c === color ? ' on' : ''), style: { background: c }, 'aria-label': 'color' });
    b.addEventListener('click', () => { color = c; stamp = null; select(b); Sfx.click(); });
    return b;
  });
  const sizes = [6, 12, 24].map(s => {
    const b = h('button', { class: 'size-btn' + (s === size ? ' on' : ''), 'aria-label': 'brush size' }, h('span', { style: { width: s + 'px', height: s + 'px' } }));
    b.addEventListener('click', () => {
      size = s; sizes.forEach(x => x.classList.remove('on')); b.classList.add('on');
      if (stamp) { stamp = null; select(sw[PALETTE.indexOf(color)]); }
      Sfx.click();
    });
    return b;
  });
  const stamps = STAMPS.map(s => {
    const b = h('button', { class: 'stamp-btn', 'aria-label': 'stamp' }, s);
    b.addEventListener('click', () => { stamp = s; select(b); Sfx.click(); });
    return b;
  });
  const clear = h('button', { class: 'tool-btn', 'aria-label': 'Clear' }, '🗑️');
  clear.addEventListener('click', () => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); Sfx.oops(); });
  function select(b) {
    [...sw, ...stamps].forEach(x => x.classList.remove('on'));
    b.classList.add('on');
  }
  tools.append(h('div', { class: 'tool-group' }, sw), h('div', { class: 'tool-group' }, sizes), h('div', { class: 'tool-group' }, stamps), clear);
  const wrap = h('div', { class: 'pad' }, tools, canvas);
  const ctx = canvas.getContext('2d');
  let sized = false;
  function fit() {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    if (sized && Math.round(r.width) === canvas.width && Math.round(r.height) === canvas.height) return;
    const old = sized ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
    sized = true;
    canvas.width = Math.round(r.width); canvas.height = Math.round(r.height);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (old) ctx.putImageData(old, 0, 0);
  }
  let last = null;
  const pos = e => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height }; };
  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    const p = pos(e);
    if (stamp) {
      ctx.font = '64px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(stamp, p.x, p.y); Sfx.pop(); drew = true; onDraw && onDraw();
      return;
    }
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    last = p;
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2); ctx.fill();
  });
  canvas.addEventListener('pointermove', e => {
    if (!last) return;
    const p = pos(e);
    ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last = p;
    if (!drew) { drew = true; onDraw && onDraw(); }
  });
  const end = () => { last = null; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  requestAnimationFrame(fit);
  if (api) api.on(window, 'resize', fit);
  return { el: wrap, canvas, fit, toDataURL: (t, q) => canvas.toDataURL(t, q), hasDrawing: () => drew };
}

registerGame({
  id: 'draw', emoji: '🎨', title: 'Drawing Pad',
  blurb: 'Drag to draw',
  start(api) {
    const pad = drawingPad(api, {
      onDraw: () => { done.classList.add('ready'); }
    });
    const done = h('button', { class: 'big-btn go done-btn' }, '✓ I’m done!');
    done.addEventListener('click', () => api.win('What a great picture!'));
    pad.el.querySelector('.pad-tools').append(done);
    api.stage.append(pad.el);
    api.say('Draw a picture! Hold your finger down on the trackpad and move to draw. Click a color to change colors.', 'Hold and move to draw. Click a color or a stamp.');
  }
});
