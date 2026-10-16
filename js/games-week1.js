/* Week 1: Meet the Chromebook */

/* A thumbs-up / thumbs-down choice game, shared by Week 1 (care) and Week 6 (kind and safe). */
function choiceGame(api, items, intro, winMsg) {
  const list = shuffle(items);
  let i = 0;
  const scene = h('div', { class: 'choice-scene' });
  const text = h('div', { class: 'choice-text' });
  const yes = h('button', { class: 'choice-btn yes', 'data-say': 'Thumbs up. Good choice.' }, h('span', null, '👍'), 'Good choice');
  const no = h('button', { class: 'choice-btn no', 'data-say': 'Thumbs down. Not a good choice.' }, h('span', null, '👎'), 'Not good');
  const card = h('div', { class: 'choice-card' }, scene, text);
  api.stage.append(h('div', { class: 'choice-wrap' }, card, h('div', { class: 'choice-btns' }, no, yes)));
  let locked = false;

  function show(prefix) {
    const it = list[i];
    scene.textContent = it.scene; text.textContent = it.text; card.dataset.say = it.text;
    card.classList.remove('right', 'wrong'); card.classList.add('enter');
    setTimeout(() => card.classList.remove('enter'), 400);
    api.progress(i, list.length);
    api.say((prefix ? prefix + ' ' : '') + it.text + '. Good choice, or not good?', it.text);
    locked = false;
  }
  function answer(good, btn) {
    if (locked) return;
    const it = list[i];
    if (good === it.good) {
      locked = true;
      card.classList.add('right'); api.good();
      const r = btn.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, good ? '⭐' : '✔️');
      api.say(it.why, (good ? '👍 ' : '👎 ') + it.why);
      api.later(() => { i++; if (i < list.length) show(); else { api.progress(i, list.length); api.win(winMsg); } }, 2600);
    } else {
      card.classList.add('wrong'); wiggle(card); api.oops();
      api.say('Hmm. Think again. ' + it.text + '.', 'Hmm… think again!');
      setTimeout(() => card.classList.remove('wrong'), 600);
    }
  }
  yes.addEventListener('click', () => answer(true, yes));
  no.addEventListener('click', () => answer(false, no));
  show(intro);
}

registerGame({
  id: 'care', emoji: '🤲', title: 'Chromebook Care',
  blurb: 'Good choice or not?',
  start(api) {
    choiceGame(api, [
      { scene: '🤲💻', text: 'Carry the Chromebook with two hands', good: true, why: 'Yes! Two hands keep it safe.' },
      { scene: '🏃💻', text: 'Run with the Chromebook', good: false, why: 'Right. We walk with our Chromebook.' },
      { scene: '😴💻', text: 'Close the lid gently, like a sleeping baby', good: true, why: 'Yes! Close it softly, like a sleeping baby.' },
      { scene: '💥💻', text: 'Slam the lid shut', good: false, why: 'Right. Slamming can break the screen.' },
      { scene: '🧃💻', text: 'Put a juice box next to the Chromebook', good: false, why: 'Right. Food and drinks stay far away.' },
      { scene: '👀✋', text: 'Eyes up, hands off when the teacher talks', good: true, why: 'Yes! Eyes up, hands off.' },
      { scene: '✏️💻', text: 'Poke the screen with a pencil', good: false, why: 'Right. Pencils can scratch the screen.' },
      { scene: '🔢🔌', text: 'Put the Chromebook back in its numbered spot', good: true, why: 'Yes! Every Chromebook has a home.' },
      { scene: '🙋🧑‍🤝‍🧑', text: 'Ask a friend, then ask a teacher', good: true, why: 'Yes! Ask a friend, then ask a teacher.' }
    ], 'Let’s take care of our Chromebook! Is it a good choice? Click thumbs up or thumbs down.', 'You know how to take care of a Chromebook!');
  }
});

registerGame({
  id: 'parts', emoji: '🔍', title: 'Chromebook Parts',
  blurb: 'Screen, keyboard, trackpad, camera',
  start(api) {
    const PARTS = {
      screen: { say: 'Click the screen. The screen is where we see things.', label: 'screen' },
      keyboard: { say: 'Click the keyboard. The keyboard has letters.', label: 'keyboard' },
      trackpad: { say: 'Click the trackpad. The trackpad moves the pointer.', label: 'trackpad' },
      camera: { say: 'Click the camera. It is the tiny dot at the top. The camera reads your badge.', label: 'camera' }
    };
    let keys = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 12; c++)
      keys += `<rect x="${100 + c * 34.5}" y="${306 + r * 17}" width="30" height="13" rx="3" fill="#3c4650"/>`;
    const svg = `
<svg viewBox="0 0 600 440" preserveAspectRatio="xMidYMid meet" class="cb-svg" role="img" aria-label="A Chromebook">
  <g data-part="screen" class="part">
    <rect x="80" y="14" width="440" height="272" rx="18" fill="#2b333b"/>
    <rect x="102" y="46" width="396" height="222" rx="6" fill="#bfe6f5"/>
    <circle cx="170" cy="110" r="26" fill="#FFCB05"/>
    <path d="M102 268 L190 170 L250 230 L330 140 L498 268 Z" fill="#43A047" opacity=".85"/>
  </g>
  <g data-part="camera" class="part">
    <circle cx="300" cy="30" r="24" fill="transparent"/>
    <circle cx="300" cy="30" r="7" fill="#0b0f12" stroke="#7a8691" stroke-width="2"/>
  </g>
  <path d="M60 290 H540 L588 424 Q590 430 582 430 H18 Q10 430 12 424 Z" fill="#c9d0d6" data-part="base" class="part"/>
  <g data-part="keyboard" class="part">
    <rect x="90" y="298" width="420" height="80" rx="8" fill="#9aa5ae"/>
    ${keys}
  </g>
  <g data-part="trackpad" class="part">
    <rect x="226" y="386" width="148" height="38" rx="7" fill="#aeb7bf" stroke="#7a8691" stroke-width="2"/>
  </g>
</svg>`;
    const wrap = h('div', { class: 'parts-wrap', html: svg });
    const tag = h('div', { class: 'part-tag' });
    wrap.append(tag);
    api.stage.append(wrap);
    const order = shuffle(Object.keys(PARTS)).concat(shuffle(Object.keys(PARTS)));
    let i = 0, busy = false;
    const ask = () => { api.progress(i, order.length); api.say(PARTS[order[i]].say, PARTS[order[i]].say.split('.')[0] + '!'); };
    wrap.querySelectorAll('.part').forEach(g => g.addEventListener('click', e => {
      if (busy) return;
      const part = g.dataset.part, want = order[i];
      const r = wrap.getBoundingClientRect();
      tag.style.left = (e.clientX - r.left) + 'px'; tag.style.top = (e.clientY - r.top) + 'px';
      if (part === want) {
        busy = true; api.good(); burst(e.clientX, e.clientY, '⭐');
        tag.textContent = PARTS[part].label; tag.className = 'part-tag show good';
        g.classList.add('flash');
        api.later(() => {
          g.classList.remove('flash'); tag.className = 'part-tag';
          i++; busy = false;
          if (i < order.length) ask(); else { api.progress(i, order.length); api.win('You know the parts of a Chromebook!'); }
        }, 1300);
      } else {
        api.oops();
        tag.textContent = part === 'base' ? 'bottom' : PARTS[part].label; tag.className = 'part-tag show';
        api.say(`That is the ${part === 'base' ? 'bottom of the Chromebook' : part}. ${PARTS[want].say}`, PARTS[want].say.split('.')[0] + '!');
        api.later(() => { tag.className = 'part-tag'; }, 1400);
      }
    }));
    ask();
  }
});

registerGame({
  id: 'loginsteps', emoji: '🪪', title: 'Log In Steps',
  blurb: 'Put the steps in order',
  start(api) {
    const ROUNDS = [
      { name: 'Log in', intro: 'How do we log in? Click the steps in order. What do we do first?', steps: [
        { icon: '💻', text: 'Open the lid gently' },
        { icon: '🪪', text: 'Hold your badge up to the camera' },
        { icon: 'chrome', text: 'Click Chrome' },
        { icon: 'clever', text: 'Click Clever' }
      ] },
      { name: 'Log out', intro: 'Now, how do we log out? Click the steps in order.', steps: [
        { icon: '🕒', text: 'Click the time in the corner' },
        { icon: '🚪', text: 'Click Sign out' },
        { icon: '😴', text: 'Close the lid gently' },
        { icon: '🤲', text: 'Carry it back with two hands' }
      ] }
    ];
    const iconEl = icon => icon === 'chrome' ? h('span', { class: 'fake-icon chrome' }, h('span'))
      : icon === 'clever' ? h('span', { class: 'fake-icon clever' }, 'C') : h('span', { class: 'step-emoji' }, icon);
    let round = 0;
    function play() {
      api.stage.innerHTML = '';
      const R = ROUNDS[round];
      let next = 0, misses = 0;
      const slots = R.steps.map((_, k) => h('div', { class: 'slot' }, h('span', { class: 'slot-num' }, k + 1)));
      const cards = shuffle(R.steps.map((s, k) => ({ ...s, k }))).map(s => {
        const c = h('button', { class: 'step-card' }, iconEl(s.icon), h('span', null, s.text));
        c.dataset.k = s.k;
        c.addEventListener('click', () => {
          if (+c.dataset.k === next) {
            api.good();
            c.classList.remove('hint'); c.disabled = true;
            slots[next].append(c); slots[next].classList.add('filled');
            next++; misses = 0;
            api.progress(next + round * 4, 8);
            if (next === R.steps.length) {
              if (round === 0) { api.say('Yes! That is how we log in.'); api.later(() => { round = 1; play(); }, 2400); }
              else api.win('You know how to log in and log out!');
            } else { api.say(s.text + '. What is next?', 'What is next?'); hint(); }
          } else {
            api.oops(); wiggle(c); misses++;
            api.say(s.text + '? Not yet! What comes ' + (next === 0 ? 'first?' : 'next?'));
            hint();
          }
        });
        return c;
      });
      function hint() {
        cards.forEach(c => c.classList.remove('hint'));
        if (round === 0 || misses >= 2) { const c = cards.find(c => +c.dataset.k === next); c && c.classList.add('hint'); }
      }
      api.stage.append(
        h('div', { class: 'steps-title' }, R.name === 'Log in' ? '🔓 Log in' : '🔒 Log out'),
        h('div', { class: 'slots' }, slots),
        h('div', { class: 'step-cards' }, cards));
      api.say(R.intro);
      hint();
    }
    api.progress(0, 8);
    play();
  }
});
