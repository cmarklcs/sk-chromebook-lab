/* Week 3: Intro to the keyboard */

function nameLine(name, cls = '') {
  const line = h('div', { class: 'name-line ' + cls });
  const letters = [...name].map(ch => h('span', { class: 'nl-letter' + (ch === ' ' ? ' nl-space' : '') }, ch === ' ' ? ' ' : ch));
  line.append(...letters);
  return { el: line, letters };
}
const letterSay = ch => ch === ' ' ? 'space' : ch.toUpperCase();

registerGame({
  id: 'colorname', emoji: '🖍️', title: 'Color My Name',
  blurb: 'Find the letters in your name',
  async start(api) {
    const name = await askName();
    const CRAYONS = ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#1E88E5', '#8E24AA'];
    let crayon = CRAYONS[0];
    const want = new Set([...name.toLowerCase()].filter(c => /[a-z]/.test(c)));
    const done = new Set();
    const nl = nameLine(name, 'sheet');
    const crayons = h('div', { class: 'crayons' }, CRAYONS.map((c, i) => {
      const b = h('button', { class: 'crayon' + (i === 0 ? ' on' : ''), style: { '--c': c }, 'aria-label': 'crayon' });
      b.addEventListener('click', () => { crayon = c; crayons.querySelectorAll('.crayon').forEach(x => x.classList.remove('on')); b.classList.add('on'); Sfx.click(); });
      return b;
    }));
    let lastMiss = 0;
    const kb = Keyboard({ onClick: k => press(k) });
    api.stage.append(h('div', { class: 'colorname' }, nl.el, crayons, kb.el));
    api.progress(0, want.size);

    function press(k) {
      if (k.length > 1) return;
      kb.flash(k);
      if (want.has(k) && !done.has(k)) {
        done.add(k);
        kb.color(k, crayon);
        nl.letters.forEach(l => { if (l.textContent.toLowerCase() === k) { l.style.color = crayon; l.classList.add('pop-in'); } });
        Sfx.good();
        const r = kb.keys(k)[0].getBoundingClientRect(); burst(r.left + r.width / 2, r.top, '✨', 6);
        api.progress(done.size, want.size);
        if (done.size === want.size) api.later(() => api.win('You colored every letter in your name!'), 700);
        else api.say(letterSay(k) + '! ' + (want.size - done.size === 1 ? 'One more letter.' : 'Find another letter in your name.'), 'Find another letter in your name.');
      } else if (done.has(k)) {
        Sfx.click();
      } else {
        Sfx.oops(); kb.flash(k, 'miss');
        if (performance.now() - lastMiss > 2500) { api.say(letterSay(k) + ' is not in your name. Look at your name card.'); lastMiss = performance.now(); }
      }
    }
    api.on(window, 'keydown', e => { const k = keyName(e); if (k && !e.repeat) press(k); });
    api.say(`Hi ${name}! Pick a crayon. Then click the key for each letter in your name. You can press the real keys too!`, 'Pick a crayon, then find each letter in your name.');
  }
});

registerGame({
  id: 'letterpop', emoji: '🎈', title: 'Letter Pop',
  blurb: 'Find the letter on the keyboard',
  start(api) {
    const ROUNDS = 10;
    const nameLetters = [...(getName() || '').toLowerCase()].filter(c => /[a-z]/.test(c));
    const pool = [...'abcdefghijklmnopqrstuvwxyz'];
    const letters = [];
    while (letters.length < ROUNDS) {
      const c = Math.random() < 0.4 && nameLetters.length ? pick(nameLetters) : pick(pool);
      if (letters[letters.length - 1] !== c) letters.push(c);
    }
    const balloon = h('div', { class: 'balloon' }, h('span', { class: 'bl-letter' }));
    const kb = Keyboard({ small: false });
    api.stage.append(h('div', { class: 'letterpop' }, h('div', { class: 'balloon-sky' }, balloon), kb.el));
    let i = 0, hintT, misses = 0, busy = false;
    function next() {
      busy = false; misses = 0;
      const c = letters[i];
      balloon.className = 'balloon rise';
      balloon.style.setProperty('--bc', pick(['#E53935', '#1E88E5', '#43A047', '#8E24AA', '#FB8C00']));
      balloon.querySelector('.bl-letter').textContent = c;
      kb.glow(null);
      api.progress(i, ROUNDS);
      api.say(`Find the letter ${c.toUpperCase()}.`, `Find the letter  ${c}`);
      clearTimeout(hintT); hintT = api.later(() => kb.glow(c), 6000);
    }
    api.on(window, 'keydown', e => {
      const k = keyName(e);
      if (!k || busy || e.repeat) return;
      kb.flash(k);
      if (k === letters[i]) {
        busy = true; clearTimeout(hintT);
        balloon.classList.add('popped'); Sfx.pop(); Sfx.good();
        const r = balloon.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, '🎉', 10);
        i++;
        api.later(() => i < ROUNDS ? next() : (api.progress(i, ROUNDS), api.win('You popped all the balloons!')), 900);
      } else if (k.length === 1) {
        Sfx.oops(); kb.flash(k, 'miss'); misses++;
        if (misses === 2) { kb.glow(letters[i]); api.say(`Look for the glowing key. ${letters[i].toUpperCase()}.`); }
      }
    });
    next();
  }
});

registerGame({
  id: 'rocket', emoji: '🚀', title: 'Space Rocket',
  blurb: 'Press the space bar',
  start(api) {
    let count = 10, flying = false, lastTip = 0;
    const rocket = h('div', { class: 'rocket' }, '🚀');
    const num = h('div', { class: 'countdown' }, '10');
    const sky = h('div', { class: 'rocket-sky' }, h('div', { class: 'moon' }, '🌕'), num, rocket, h('div', { class: 'launchpad' }));
    const kb = Keyboard({ small: true });
    kb.glow('space');
    api.stage.append(h('div', { class: 'rocket-wrap' }, sky, kb.el));
    api.progress(0, 10);
    api.on(window, 'keydown', e => {
      const k = keyName(e);
      if (!k || flying || e.repeat) return;
      kb.flash(k);
      if (k === 'space') {
        count--; Sfx.step(10 - count);
        num.textContent = count; num.classList.remove('bump'); void num.offsetWidth; num.classList.add('bump');
        rocket.style.setProperty('--lift', (10 - count) * 6 + 'px');
        rocket.classList.add('rumble');
        api.progress(10 - count, 10);
        if (count === 0) {
          flying = true; num.textContent = 'Blast off!';
          Voice.say('Blast off!');
          rocket.classList.add('launch');
          api.later(() => api.win('Your rocket made it to the moon!'), 2200);
        }
      } else if (performance.now() - lastTip > 3000) {
        lastTip = performance.now(); Sfx.oops(); kb.flash(k, 'miss');
        api.say('That is not the space bar. The space bar is the long key at the bottom.');
      }
    });
    api.say('Count down to blast off! Press the space bar. It is the long key at the bottom of the keyboard. Press it ten times!', 'Press the SPACE BAR to count down: 10, 9, 8…');
  }
});

registerGame({
  id: 'capitals', emoji: '🔠', title: 'Capital Letters',
  blurb: 'Hold Shift to make a big letter',
  start(api) {
    const GOAL = 5;
    let caps = 0, smallStreak = 0;
    const board = h('div', { class: 'cap-board' });
    const kb = Keyboard({ small: true });
    kb.glow('shift');
    api.stage.append(h('div', { class: 'capitals' }, board, kb.el));
    api.progress(0, GOAL);
    const setShift = on => kb.el.classList.toggle('shifted', on);
    api.on(window, 'keyup', e => { if (e.key === 'Shift') setShift(false); });
    api.on(window, 'keydown', e => {
      const k = keyName(e);
      if (!k) return;
      if (k === 'shift') { setShift(true); kb.flash('shift'); return; }
      if (e.repeat || k.length > 1) return;
      if (!/[a-z]/.test(k)) return;
      kb.flash(k);
      const big = e.shiftKey;
      const l = h('span', { class: 'cap-letter' + (big ? ' big' : '') }, big ? k.toUpperCase() : k);
      if (big) l.style.color = pick(['#E53935', '#1E88E5', '#43A047', '#8E24AA', '#FB8C00', '#017EA7']);
      board.append(l);
      while (board.children.length > 10) board.firstChild.remove();
      if (big) {
        caps++; smallStreak = 0; Sfx.good();
        const r = l.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, '⭐', 6);
        api.progress(caps, GOAL);
        if (caps === GOAL) api.later(() => api.win('You made capital letters with Shift!'), 700);
        else api.say(`Capital ${k.toUpperCase()}!`, 'Capital letter! Make another one.');
      } else {
        Sfx.click(); smallStreak++;
        if (smallStreak === 3) { smallStreak = 0; api.say('That is a small letter. Hold down Shift first, then press the letter.'); }
      }
    });
    api.say('Let’s make capital letters! Hold down the Shift key. Keep holding it, then press a letter.', 'Hold down SHIFT, then press a letter.');
  }
});

registerGame({
  id: 'typename', emoji: '✍️', title: 'Type My Name',
  blurb: 'Type your name, letter by letter',
  async start(api) {
    const name = (await askName()).replace(/[^A-Za-z ]/g, '');
    const ROUNDS = 3;
    let round = 0, idx = 0, busy = false;
    const kb = Keyboard({ small: false });
    const card = h('div', { class: 'name-card' }, h('span', { class: 'nc-label' }, 'My name card'), h('span', { class: 'nc-name' }, name));
    const box = h('div', { class: 'type-box' });
    api.stage.append(h('div', { class: 'typename' }, card, box, kb.el));
    let cells = [];
    function setup() {
      idx = 0; busy = false;
      box.innerHTML = '';
      cells = [...name].map(ch => h('span', { class: 'tb-cell' + (ch === ' ' ? ' tb-space' : '') }, h('span', { class: 'tb-want' }, ch === ' ' ? '␣' : ch)));
      box.append(...cells);
      api.progress(round, ROUNDS);
      mark();
    }
    function mark() {
      cells.forEach((c, i) => c.classList.toggle('current', i === idx));
      const ch = name[idx];
      if (!ch) return kb.glow(null);
      const k = ch === ' ' ? 'space' : ch.toLowerCase();
      kb.glow(ch !== ' ' && ch === ch.toUpperCase() ? ['shift', k] : k);
    }
    api.on(window, 'keydown', e => {
      const k = keyName(e);
      if (!k || busy || e.repeat || k === 'shift') return;
      kb.flash(k);
      const ch = name[idx];
      const want = ch === ' ' ? 'space' : ch.toLowerCase();
      if (k === want) {
        const cell = cells[idx];
        cell.classList.add('typed');
        const isCap = ch !== ' ' && ch === ch.toUpperCase();
        if (isCap && e.shiftKey) { cell.classList.add('cap'); const r = cell.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, '⭐', 6); }
        Sfx.step(idx);
        Voice.say(isCap && e.shiftKey ? 'Capital ' + ch : letterSay(ch));
        idx++;
        if (idx === name.length) {
          busy = true; round++;
          api.progress(round, ROUNDS);
          kb.glow(null);
          box.classList.add('celebrate');
          api.later(() => {
            box.classList.remove('celebrate');
            if (round === ROUNDS) api.win(`You typed your name, ${name}!`);
            else { api.say(`You typed your name! Type it again.`); setup(); }
          }, 1300);
          Sfx.good();
        } else mark();
      } else if (k.length === 1 || k === 'space') {
        Sfx.oops(); kb.flash(k, 'miss'); wiggle(cells[idx]);
      }
    });
    setup();
    api.say(`Type your name, ${name}! Look at the glowing key. For a capital letter, hold Shift.`, 'Type your name. Follow the glowing keys!');
  }
});
