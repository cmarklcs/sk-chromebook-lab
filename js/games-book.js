/* Weeks 4–6: Book Creator rehearsal. The buttons mirror Book Creator's
   (＋ to add things, pen, camera, record, play) in a simpler practice space. */

const APPS = [
  { name: 'Book Creator', icon: '📖', color: '#F26B21', say: 'Book Creator' },
  { name: 'Typing.com', icon: '⌨️', color: '#2BB673', say: 'Typing' },
  { name: 'Music Lab', icon: '🎹', color: '#7E57C2', say: 'Music Lab' },
  { name: 'Epic', icon: '📚', color: '#E91E63', say: 'Epic' },
  { name: 'Canvas', icon: '🎨', color: '#00ACC1', say: 'Canvas, the drawing app' },
  { name: 'Math', icon: '🔢', color: '#3949AB', say: 'Math' },
  { name: 'Videos', icon: '🎬', color: '#6D4C41', say: 'Videos' },
  { name: 'Science', icon: '🔬', color: '#00897B', say: 'Science' }
];

registerGame({
  id: 'appfinder', emoji: '🧭', title: 'Find the App',
  blurb: 'Find Book Creator in Clever',
  start(api) {
    const order = ['Book Creator', 'Typing.com', 'Book Creator', 'Music Lab', 'Epic', 'Book Creator'];
    let i = 0;
    const want = h('div', { class: 'app-want' });
    const grid = h('div', { class: 'app-grid' });
    api.stage.append(h('div', { class: 'portal' },
      h('div', { class: 'portal-bar' }, h('span', { class: 'portal-logo' }, 'C'), 'My Apps'),
      h('div', { class: 'portal-body' }, want, grid)));
    const tile = a => h('div', { class: 'app-icon', style: { background: a.color } }, a.icon);
    function next() {
      const target = APPS.find(a => a.name === order[i]);
      want.innerHTML = '';
      want.append(h('span', null, 'Find this app:'), h('div', { class: 'app-tile mini' }, tile(target), h('span', null, target.name)));
      grid.innerHTML = '';
      let done = false;
      shuffle(APPS).forEach(a => {
        const b = h('button', { class: 'app-tile' }, tile(a), h('span', null, a.name));
        b.addEventListener('click', e => {
          if (done) return;
          if (a === target) {
            done = true; api.good(); b.classList.add('found'); burst(e.clientX, e.clientY, '⭐');
            i++; api.progress(i, order.length);
            api.later(() => i < order.length ? next() : api.win('You can find the apps!'), 1100);
          } else { api.oops(); wiggle(b); api.say(`That is ${a.say}. Find ${target.say}.`); }
        });
        grid.append(b);
      });
      api.progress(i, order.length);
      api.say(`Find ${target.say}! Look for the ${target.name === 'Book Creator' ? 'orange book' : 'picture'}.`, `Find ${target.name}!`);
    }
    next();
  }
});

/* ---- shared book helpers ---- */
const STICKERS = ['😀', '🐱', '🐶', '🦁', '🌈', '⭐', '🌸', '🚀', '🏠', '❤️', '⚽', '🦋'];
const COVER_COLORS = ['#017EA7', '#00274C', '#E53935', '#43A047', '#8E24AA', '#FB8C00', '#FFCB05', '#F06292'];
function loadBook() {
  return Store.get('book', null) || { title: 'My Book', name: getName() || '', color: '#017EA7', titleSize: 36, stickers: ['⭐'], pages: [] };
}
function saveBook(book) {
  const ok = Store.set('book', book);
  if (!ok) toast('This Chromebook is out of room. Try a shorter recording.');
  return ok;
}
function toast(msg) {
  const t = h('div', { class: 'toast' }, msg);
  document.body.append(t);
  setTimeout(() => t.remove(), 3500);
}
function coverEl(book) {
  return h('div', { class: 'bk-page cover', style: { background: book.color } },
    h('div', { class: 'cv-title', style: { fontSize: (book.titleSize || 36) / 36 + 'em' } }, book.title || 'My Book'),
    h('div', { class: 'cv-stickers' }, (book.stickers || []).map(s => h('span', null, s))),
    h('div', { class: 'cv-name' }, book.name || ''));
}
function pageEl(page, n) {
  const media = [page.photo, page.draw].filter(Boolean);
  const el = h('div', { class: 'bk-page' + (media.length === 2 ? ' two' : '') },
    page.text ? h('div', { class: 'pg-text' }, page.text) : null,
    h('div', { class: 'pg-media' }, media.map(src => h('img', { src, alt: '' }))),
    !media.length && !page.text ? h('div', { class: 'pg-empty' }, 'Empty page') : null,
    page.audio ? h('button', { class: 'pg-audio', 'aria-label': 'Play recording', onclick: e => { e.stopPropagation(); new Audio(page.audio).play(); } }, '🔊') : null,
    h('div', { class: 'pg-num' }, n));
  return el;
}

registerGame({
  id: 'cover', emoji: '📘', title: 'Practice Cover',
  blurb: 'Title, name, color, picture, save',
  async start(api) {
    const name = await askName();
    const book = { title: '', name: '', color: '#017EA7', titleSize: 28, stickers: [], pages: (Store.get('book', null) || {}).pages || [] };
    const SIZES = [22, 28, 36, 44, 52];
    let step = 0;
    const view = h('div', { class: 'bc' });
    api.stage.append(view);

    // Screen 1: library
    const newBtn = h('button', { class: 'bc-new' }, h('span', null, '＋'), 'New Book');
    const lib = h('div', { class: 'bc-lib' }, h('div', { class: 'bc-libbar' }, '📚 My Books'), h('div', { class: 'bc-shelf' }, newBtn));
    // Screen 2: shapes
    const shapes = h('div', { class: 'bc-shapes' }, ['portrait', 'square', 'landscape'].map(s => {
      const b = h('button', { class: 'bc-shape ' + s }, h('span'), s === 'portrait' ? 'Tall' : s === 'square' ? 'Square' : 'Wide');
      b.addEventListener('click', () => { if (step === 1) { Sfx.click(); go(2); } });
      return b;
    }));
    // Screen 3: editor
    const titleIn = h('textarea', { class: 'bc-input', maxlength: 30, rows: 2, 'aria-label': 'Title', spellcheck: 'false' });
    const titleBox = h('div', { class: 'bc-box title-box' }, h('span', { class: 'bc-ph' }, 'Click to type a title'), titleIn);
    const nameIn = h('input', { class: 'bc-input', maxlength: 20, 'aria-label': 'Your name', spellcheck: 'false' });
    const nameBox = h('div', { class: 'bc-box name-box' }, h('span', { class: 'bc-ph' }, 'Click to type your name'), nameIn);
    const stickerZone = h('div', { class: 'bc-stickers' });
    const page = h('div', { class: 'bc-cover' }, titleBox, stickerZone, nameBox);
    const smaller = h('button', { class: 'bc-tool', 'aria-label': 'Smaller text' }, h('small', null, 'A'));
    const bigger = h('button', { class: 'bc-tool', 'aria-label': 'Bigger text' }, h('big', null, 'A'));
    const swatches = h('div', { class: 'bc-swatches' }, COVER_COLORS.map(c => {
      const b = h('button', { class: 'bc-swatch', style: { background: c }, 'aria-label': 'cover color' });
      b.addEventListener('click', () => { if (step < 8) return; book.color = c; page.style.background = c; Sfx.click(); if (step === 8) go(9); });
      return b;
    }));
    const stickerBar = h('div', { class: 'bc-stickerbar' }, STICKERS.map(s => {
      const b = h('button', { class: 'bc-sticker' }, s);
      b.addEventListener('click', () => {
        if (step < 9 || book.stickers.length >= 6) return;
        book.stickers.push(s); stickerZone.append(h('span', { class: 'pop-in' }, s)); Sfx.pop();
        if (step === 9) go(10);
      });
      return b;
    }));
    const saveBtn = h('button', { class: 'bc-save' }, '💾 Save');
    const hint = h('div', { class: 'bc-hint' });
    const doneBtn = h('button', { class: 'big-btn go bc-done' }, '✓ Done');
    const editor = h('div', { class: 'bc-editor' },
      h('div', { class: 'bc-toolbar' },
        h('div', { class: 'bc-group' }, h('span', { class: 'bc-label' }, 'Text size'), smaller, bigger),
        h('div', { class: 'bc-group' }, h('span', { class: 'bc-label' }, 'Color'), swatches),
        saveBtn),
      h('div', { class: 'bc-main' }, page, h('div', { class: 'bc-side' }, hint, doneBtn, h('span', { class: 'bc-label' }, 'Pictures'), stickerBar)));

    function setSize(i) { book.titleSize = SIZES[i]; titleIn.style.fontSize = SIZES[i] + 'px'; }
    let sizeI = 1; setSize(sizeI);
    bigger.addEventListener('click', () => { if (step < 5) return; sizeI = Math.min(SIZES.length - 1, sizeI + 1); setSize(sizeI); Sfx.click(); if (step === 5) go(6); });
    smaller.addEventListener('click', () => { if (step < 5) return; sizeI = Math.max(0, sizeI - 1); setSize(sizeI); Sfx.click(); });
    newBtn.addEventListener('click', () => { if (step === 0) { Sfx.click(); go(1); } });
    titleBox.addEventListener('click', () => { if (step === 3) { go(4); } if (step >= 4) titleIn.focus(); });
    nameBox.addEventListener('click', () => { if (step === 6) { go(7); } if (step >= 7) nameIn.focus(); });
    const finishTyping = () => {
      if (step === 4) {
        if (!titleIn.value.trim()) { wiggle(titleBox); api.say('Type a title first.'); titleIn.focus(); return; }
        book.title = titleIn.value.trim(); titleIn.blur(); go(5);
      } else if (step === 7) {
        if (!nameIn.value.trim()) { wiggle(nameBox); api.say('Type your name first.'); nameIn.focus(); return; }
        book.name = nameIn.value.trim(); nameIn.blur(); go(8);
      }
    };
    doneBtn.addEventListener('click', finishTyping);
    [titleIn, nameIn].forEach(inp => {
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); finishTyping(); } });
      inp.addEventListener('input', () => inp.parentElement.classList.toggle('has-text', !!inp.value));
    });
    saveBtn.addEventListener('click', () => {
      if (step !== 10) return;
      book.title = titleIn.value.trim() || book.title; book.name = nameIn.value.trim() || book.name;
      saveBook(book);
      api.win('Your book cover is saved!');
    });

    const STEPS = [
      { t: newBtn, say: 'Let’s make a book! Click New Book.' },
      { t: shapes, say: 'Pick a shape for your book. Any shape is OK!' },
      null,
      { t: titleBox, say: 'This is your cover. Click the title box.' },
      { t: titleBox, say: 'Type a title. You can type All About Me. Click Done when you finish.', hint: ['Try:', h('b', null, 'All About Me')], done: true },
      { t: bigger, say: 'Make your title bigger! Click the big A.' },
      { t: nameBox, say: 'Now click the name box.' },
      { t: nameBox, say: `Type your name. Click Done when you finish.`, hint: ['Your name:', h('b', null, name)], done: true },
      { t: swatches, say: 'Pick a color for your cover.' },
      { t: stickerBar, say: 'Add a picture! Click a sticker. You can add more than one.' },
      { t: saveBtn, say: 'Your cover looks great! Click Save.' }
    ];
    function go(n) {
      step = n;
      if (n === 2) { step = 3; n = 3; }
      STEPS.forEach(x => x && x.t.classList.remove('coach'));
      view.innerHTML = '';
      view.append(n === 0 ? lib : n === 1 ? h('div', { class: 'bc-shape-screen' }, h('h3', null, 'Pick a shape'), shapes) : editor);
      const S = STEPS[n];
      S.t.classList.add('coach');
      hint.innerHTML = ''; if (S.hint) hint.append(...S.hint.map(x => typeof x === 'string' ? h('span', null, x) : x));
      doneBtn.style.display = S.done ? '' : 'none';
      api.progress(Math.min(n, 10) - (n > 2 ? 1 : 0), 10);
      api.say(S.say);
      if (n === 4) setTimeout(() => titleIn.focus(), 50);
      if (n === 7) setTimeout(() => nameIn.focus(), 50);
      if (n > 1) Sfx.good();
    }
    go(0);
  }
});

const TOOL_BUTTONS = [
  { id: 'pen', icon: '🖊️', q: 'Which button lets you draw?', name: 'pen' },
  { id: 'camera', icon: '📷', q: 'Which button takes a photo?', name: 'camera' },
  { id: 'mic', icon: '🎤', q: 'Which button records your voice?', name: 'microphone' },
  { id: 'play', icon: '▶️', q: 'Which button plays your book?', name: 'play button' },
  { id: 'page', icon: '📄', q: 'Which button adds a new page?', name: 'new page button', plus: true },
  { id: 'text', icon: 'T', q: 'Which button lets you type words?', name: 'text button' },
  { id: 'add', icon: '＋', q: 'Which button opens the menu to add things?', name: 'plus button' }
];
function toolBtnFace(t) {
  return h('span', { class: 'tb-face' + (t.id === 'text' ? ' text' : '') }, t.icon, t.plus ? h('i', null, '+') : null);
}

registerGame({
  id: 'whichbutton', emoji: '🔘', title: 'Which Button?',
  blurb: 'Learn the Book Creator buttons',
  start(api) {
    const qs = shuffle(TOOL_BUTTONS).concat(shuffle(TOOL_BUTTONS.filter(t => ['pen', 'camera', 'mic', 'page'].includes(t.id)))).slice(0, 9);
    let i = 0;
    const row = h('div', { class: 'tool-quiz' });
    api.stage.append(h('div', { class: 'quiz-wrap' }, row));
    function next() {
      const want = qs[i];
      const opts = shuffle([want, ...shuffle(TOOL_BUTTONS.filter(t => t !== want)).slice(0, 3)]);
      row.innerHTML = '';
      let done = false;
      opts.forEach(t => {
        const b = h('button', { class: 'tool-choice' }, toolBtnFace(t));
        b.addEventListener('click', e => {
          if (done) return;
          if (t === want) {
            done = true; api.good(); b.classList.add('found'); burst(e.clientX, e.clientY, '⭐');
            api.show(`Yes! The ${t.name}.`);
            i++; api.progress(i, qs.length);
            api.later(() => i < qs.length ? next() : api.win('You know all the buttons!'), 1200);
          } else { api.oops(); wiggle(b); api.say(`That is the ${t.name}. ${want.q}`, want.q); }
        });
        row.append(b);
      });
      api.progress(i, qs.length);
      api.say(want.q);
    }
    next();
  }
});

/* ---- Practice Book (Week 5) and Play My Book (Week 6) ---- */
function bookGame(api, mode) {
  const book = loadBook();
  if (!book.name) book.name = getName();
  let cur = 0, won = false, played = false;
  const tasks = mode === 'build'
    ? [{ id: 'page', text: '📄 Add a page' }, { id: 'pic', text: '🖊️ Draw or 📷 take a photo' }, { id: 'voice', text: '🎤 Record your voice' }]
    : [{ id: 'page', text: '📄 Have at least one page' }, { id: 'play', text: '▶️ Click Play' }, { id: 'end', text: '📖 Play to the end' }];
  const doneTasks = new Set();
  const taskList = h('ul', { class: 'tasks' });
  const thumbs = h('div', { class: 'thumbs' });
  const main = h('div', { class: 'bk-main' });
  const addBtn = h('button', { class: 'bk-tool', 'aria-label': 'Add' }, '＋');
  const playBtn = h('button', { class: 'bk-tool play', 'aria-label': 'Play' }, '▶');
  const newPage = h('button', { class: 'bk-newpage' }, toolBtnFace(TOOL_BUTTONS[4]), 'New page');
  const menu = h('div', { class: 'bk-menu hidden' });
  api.stage.append(h('div', { class: 'bk' },
    h('div', { class: 'bk-bar' }, h('span', { class: 'bk-name' }, '📘 ', book.title), h('div', { class: 'bk-bar-right' }, addBtn, playBtn), menu),
    h('div', { class: 'bk-body' }, h('div', { class: 'bk-side' }, thumbs, newPage), main, h('div', { class: 'bk-tasks' }, h('h4', null, 'My jobs'), taskList))));

  function tick(id) {
    if (!doneTasks.has(id) && tasks.some(t => t.id === id)) { doneTasks.add(id); Sfx.good(); }
    renderTasks();
    const ok = mode === 'build' ? doneTasks.has('page') && (doneTasks.has('pic') || doneTasks.has('voice')) : doneTasks.has('end');
    if (ok && !won) { won = true; api.later(() => api.win(mode === 'build' ? 'You made pages for your book!' : 'You played your whole book!', { keepGoing: () => {} }), 700); }
  }
  function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(t => taskList.append(h('li', { class: doneTasks.has(t.id) ? 'done' : '' }, h('span', { class: 'box' }, doneTasks.has(t.id) ? '✓' : ''), t.text)));
  }
  function render() {
    thumbs.innerHTML = '';
    const all = [coverEl(book), ...book.pages.map((p, i) => pageEl(p, i + 1))];
    all.forEach((el, i) => {
      const t = h('button', { class: 'thumb' + (i === cur ? ' on' : '') }, el);
      t.addEventListener('click', () => { cur = i; Sfx.click(); render(); });
      thumbs.append(t);
    });
    main.innerHTML = '';
    main.append(cur === 0 ? coverEl(book) : pageEl(book.pages[cur - 1], cur));
    if (cur > 0) main.append(h('button', { class: 'bk-del', 'aria-label': 'Delete page', onclick: () => {
      if (!confirm('Delete this page?')) return;
      book.pages.splice(cur - 1, 1); cur = Math.min(cur, book.pages.length); saveBook(book); render();
    } }, '🗑️'));
    if (book.pages.length) tick('page');
  }
  function addPage() {
    book.pages.push({ draw: null, photo: null, audio: null, text: '' });
    cur = book.pages.length; saveBook(book); render(); Sfx.pop();
    newPage.classList.remove('coach');
    api.say('A new page! Click the plus button to add a picture or your voice.', 'New page! Click ＋ to add things.');
    addBtn.classList.add('coach');
  }
  newPage.addEventListener('click', addPage);
  const needPage = () => {
    if (cur > 0) return false;
    api.say('This is your cover. Click New page first, then add things to it.', 'Click New page first.');
    newPage.classList.add('coach'); wiggle(newPage); return true;
  };
  const MENU = [
    { t: TOOL_BUTTONS[0], label: 'Pen', fn: openPen },
    { t: TOOL_BUTTONS[1], label: 'Camera', fn: openCamera },
    { t: TOOL_BUTTONS[2], label: 'Record', fn: openRecorder },
    { t: TOOL_BUTTONS[5], label: 'Text', fn: openText }
  ];
  MENU.forEach(m => {
    const b = h('button', { class: 'bk-menu-item' }, toolBtnFace(m.t), m.label);
    b.addEventListener('click', () => { menu.classList.add('hidden'); m.fn(); });
    menu.append(b);
  });
  addBtn.addEventListener('click', () => {
    addBtn.classList.remove('coach');
    if (needPage()) return;
    menu.classList.toggle('hidden'); Sfx.click();
    if (!menu.classList.contains('hidden')) api.say('Pick pen to draw, camera for a photo, record for your voice, or text to type.', 'Pen, camera, record or text?');
  });
  playBtn.addEventListener('click', () => { playBtn.classList.remove('coach'); tick('play'); playBook(); });

  function modal(title, body, actions) {
    const m = h('div', { class: 'bk-modal' }, h('div', { class: 'bk-modal-card' }, h('h3', null, title), body, h('div', { class: 'bk-modal-actions' }, actions)));
    api.stage.append(m);
    return m;
  }
  const curPage = () => book.pages[cur - 1];

  function openPen() {
    const pad = drawingPad(api);
    let m;
    const done = h('button', { class: 'big-btn go' }, '✓ Done');
    const cancel = h('button', { class: 'big-btn alt' }, '✕');
    done.addEventListener('click', () => {
      if (pad.hasDrawing()) {
        const c = document.createElement('canvas'), s = Math.min(1, 640 / pad.canvas.width);
        c.width = pad.canvas.width * s; c.height = pad.canvas.height * s;
        c.getContext('2d').drawImage(pad.canvas, 0, 0, c.width, c.height);
        curPage().draw = c.toDataURL('image/jpeg', 0.8);
        saveBook(book); tick('pic');
      }
      m.remove(); render();
    });
    cancel.addEventListener('click', () => m.remove());
    m = modal('🖊️ Draw', pad.el, [cancel, done]);
    m.classList.add('wide');
    requestAnimationFrame(pad.fit);
    api.say('Draw your picture. Click Done when you finish.');
  }

  function stopStream(s) { s && s.getTracks().forEach(t => t.stop()); }
  async function openCamera() {
    const video = h('video', { class: 'cam-video', autoplay: true, playsinline: true, muted: true });
    const shot = h('img', { class: 'cam-shot hidden', alt: '' });
    const snap = h('button', { class: 'shutter', 'aria-label': 'Take photo' });
    const retry = h('button', { class: 'big-btn alt hidden' }, '↺ Again');
    const use = h('button', { class: 'big-btn go hidden' }, '✓ Use it');
    const cancel = h('button', { class: 'big-btn alt' }, '✕');
    let stream = null, data = null;
    const m = modal('📷 Camera', h('div', { class: 'cam' }, video, shot, snap), [cancel, retry, use]);
    const close = () => { stopStream(stream); m.remove(); };
    api.cleanup(() => stopStream(stream));
    cancel.addEventListener('click', close);
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      video.srcObject = stream;
      api.say('Smile! Click the big round button to take a photo.');
    } catch (e) {
      m.querySelector('.cam').replaceChildren(h('p', { class: 'cam-err' }, '📷 The camera is not on. Ask a teacher to allow the camera, or use the pen instead.'));
      api.say('The camera is not working. Ask a teacher for help, or use the pen instead.');
      return;
    }
    snap.addEventListener('click', () => {
      const c = document.createElement('canvas'), w = 480, hgt = Math.round(480 * (video.videoHeight || 480) / (video.videoWidth || 640));
      c.width = w; c.height = hgt;
      c.getContext('2d').drawImage(video, 0, 0, w, hgt);
      data = c.toDataURL('image/jpeg', 0.75);
      shot.src = data; Sfx.click();
      [video, snap].forEach(x => x.classList.add('hidden'));
      [shot, retry, use].forEach(x => x.classList.remove('hidden'));
      api.say('Do you like it? Click Use it, or Again.');
    });
    retry.addEventListener('click', () => {
      [video, snap].forEach(x => x.classList.remove('hidden'));
      [shot, retry, use].forEach(x => x.classList.add('hidden'));
    });
    use.addEventListener('click', () => { curPage().photo = data; saveBook(book); tick('pic'); close(); render(); });
  }

  async function openRecorder() {
    const rec = h('button', { class: 'rec-btn', 'aria-label': 'Record' });
    const timer = h('div', { class: 'rec-timer' }, 'Click the red button to start');
    const listen = h('button', { class: 'big-btn hidden' }, '▶ Listen');
    const keep = h('button', { class: 'big-btn go hidden' }, '✓ Keep it');
    const cancel = h('button', { class: 'big-btn alt' }, '✕');
    let stream = null, recorder = null, chunks = [], url = null, data = null, secs = 0, tmr = null;
    const m = modal('🎤 Record', h('div', { class: 'rec' }, rec, timer), [cancel, listen, keep]);
    const close = () => { clearInterval(tmr); if (recorder && recorder.state === 'recording') recorder.stop(); stopStream(stream); m.remove(); };
    api.cleanup(() => { clearInterval(tmr); stopStream(stream); });
    cancel.addEventListener('click', close);
    if (!window.MediaRecorder || !navigator.mediaDevices) {
      timer.textContent = 'Recording does not work in this browser.'; rec.disabled = true; return;
    }
    api.say('Click the red button and read your page out loud. Click it again to stop.');
    const stop = () => { if (recorder && recorder.state === 'recording') recorder.stop(); };
    rec.addEventListener('click', async () => {
      if (recorder && recorder.state === 'recording') return stop();
      Voice.stop();
      try { stream = stream || await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch (e) { timer.textContent = '🎤 The microphone is not on. Ask a teacher for help.'; api.say('The microphone is not on. Ask a teacher for help.'); return; }
      chunks = [];
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => e.data.size && chunks.push(e.data);
      recorder.onstop = () => {
        clearInterval(tmr); rec.classList.remove('on');
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        url = URL.createObjectURL(blob);
        const fr = new FileReader(); fr.onload = () => { data = fr.result; }; fr.readAsDataURL(blob);
        timer.textContent = 'Click Listen to hear it!';
        [listen, keep].forEach(x => x.classList.remove('hidden'));
      };
      recorder.start(); rec.classList.add('on'); secs = 0;
      timer.textContent = '🔴 Recording… 0';
      tmr = setInterval(() => { secs++; timer.textContent = '🔴 Recording… ' + secs; if (secs >= 20) stop(); }, 1000);
    });
    listen.addEventListener('click', () => url && new Audio(url).play());
    keep.addEventListener('click', () => {
      const save = () => { curPage().audio = data; saveBook(book); tick('voice'); close(); render(); };
      data ? save() : setTimeout(save, 300);
    });
  }

  function openText() {
    const inp = h('textarea', { class: 'txt-in', maxlength: 80, rows: 2, spellcheck: 'false', 'aria-label': 'Words for this page' });
    inp.value = curPage().text || '';
    const done = h('button', { class: 'big-btn go' }, '✓ Done');
    const cancel = h('button', { class: 'big-btn alt' }, '✕');
    const m = modal('T  Type words', inp, [cancel, done]);
    cancel.addEventListener('click', () => m.remove());
    done.addEventListener('click', () => { curPage().text = inp.value.trim(); saveBook(book); m.remove(); render(); });
    setTimeout(() => inp.focus(), 50);
    api.say('Type some words for your page.');
  }

  function playBook() {
    let p = 0, audio = null;
    const total = book.pages.length + 2; // cover, pages, the end
    const frame = h('div', { class: 'play-frame' });
    const prev = h('button', { class: 'play-nav prev', 'aria-label': 'Back' }, '‹');
    const next = h('button', { class: 'play-nav next', 'aria-label': 'Next' }, '›');
    const close = h('button', { class: 'play-close', 'aria-label': 'Close' }, '✕');
    const ov = h('div', { class: 'play-ov' }, frame, prev, next, close);
    api.stage.append(ov);
    const stopAudio = () => { if (audio) { audio.pause(); audio = null; } };
    function show() {
      stopAudio();
      frame.innerHTML = '';
      if (p === 0) frame.append(coverEl(book));
      else if (p <= book.pages.length) {
        const pg = book.pages[p - 1];
        frame.append(pageEl(pg, p));
        if (pg.audio) { audio = new Audio(pg.audio); audio.play().catch(() => {}); }
      } else {
        frame.append(h('div', { class: 'bk-page the-end' }, '🎉', h('div', null, 'The End')));
        Sfx.win(); tick('end');
      }
      prev.style.visibility = p === 0 ? 'hidden' : '';
      next.style.visibility = p === total - 1 ? 'hidden' : '';
      next.classList.toggle('coach', p < total - 1);
    }
    prev.addEventListener('click', () => { p = Math.max(0, p - 1); show(); });
    next.addEventListener('click', () => { p = Math.min(total - 1, p + 1); Sfx.click(); show(); });
    close.addEventListener('click', () => { stopAudio(); ov.remove(); });
    api.cleanup(stopAudio);
    show();
    if (mode === 'play') api.say('Click the arrow to turn the page. Go all the way to the end!', 'Click › to turn the page.');
  }

  renderTasks(); render();
  if (mode === 'build') {
    if (!Store.get('book', null)) api.say('This is your practice book. Click New page to add a page!', 'Click New page to add a page.');
    else api.say('Here is your book! Click New page to add a page.', 'Click New page to add a page.');
    newPage.classList.add('coach');
  } else {
    if (!book.pages.length) { api.say('Your book needs a page first. Click New page, then find the play button.', 'Add a page, then click ▶ Play.'); newPage.classList.add('coach'); }
    else { api.say('Your book is ready! Find the play button and play your book all the way to the end.', 'Find the ▶ play button!'); playBtn.classList.add('coach'); }
  }
}

registerGame({ id: 'bookbuilder', emoji: '📒', title: 'Practice Book', blurb: 'Add pages, pictures and your voice', start: api => bookGame(api, 'build') });
registerGame({ id: 'playbook', emoji: '▶️', title: 'Play My Book', blurb: 'Find play and read to the end', start: api => bookGame(api, 'play') });
