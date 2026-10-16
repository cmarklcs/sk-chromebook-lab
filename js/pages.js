/* Pages: home, week, game player and the teacher guide. Hash routes:
   #/  ·  #/week/3  ·  #/play/letterpop/3  ·  #/teacher */

function weekDone(w) { return w.games.filter(g => Progress.stars(g) > 0).length; }

function gameCard(id, weekN) {
  const g = Games[id];
  const stars = Progress.stars(id);
  const a = h('a', { class: 'game-card', href: `#/play/${id}/${weekN}`, 'data-say': g.title },
    h('span', { class: 'gc-emoji' }, g.emoji),
    h('span', { class: 'gc-title' }, g.title),
    h('span', { class: 'gc-blurb' }, g.blurb),
    h('span', { class: 'gc-stars' }, stars ? '⭐'.repeat(Math.min(stars, 3)) + (stars > 3 ? ' +' + (stars - 3) : '') : '☆'));
  return a;
}

function homePage(mount) {
  const name = getName();
  const hi = h('div', { class: 'hero' },
    h('div', null,
      h('h1', null, name ? `Hi, ${name}! 👋` : 'Welcome to the Computer Lab! 👋'),
      h('p', { class: 'hero-sub' }, 'Pick your week and play!')),
    h('div', { class: 'habits' }, HABITS.map(([e, t]) => {
      return h('div', { class: 'habit', 'data-say': t }, h('span', null, e), t);
    })));
  const grid = h('div', { class: 'week-grid' }, WEEKS.map(w => {
    const done = weekDone(w);
    const a = h('a', { class: 'week-card', href: '#/week/' + w.n, style: { '--wk': w.color }, 'data-say': `Week ${w.n}. ${w.kidTitle}` },
      h('span', { class: 'wc-num' }, 'Week ' + w.n),
      h('span', { class: 'wc-emoji' }, w.emoji),
      h('span', { class: 'wc-title' }, w.kidTitle),
      h('span', { class: 'wc-progress' }, w.games.map(g => h('i', { class: Progress.stars(g) ? 'on' : '' }))),
      done === w.games.length ? h('span', { class: 'wc-badge' }, '🏅') : null);
    return a;
  }));
  mount.append(hi, grid,
    h('footer', { class: 'foot' }, h('a', { href: '#/teacher' }, '👩‍🏫 Teacher guide'), name ? h('a', { href: '#', onclick: e => { e.preventDefault(); askName(true).then(() => App.route(true)); } }, '✏️ Not ' + name + '?') : null));
}

function weekPage(mount, n) {
  const w = WEEKS.find(x => x.n === n);
  if (!w) return homePage(mount);
  const prev = WEEKS.find(x => x.n === n - 1), next = WEEKS.find(x => x.n === n + 1);
  mount.append(...[
    h('div', { class: 'week-head', style: { '--wk': w.color } },
      h('a', { class: 'back-btn', href: '#/', 'aria-label': 'Home', 'data-say': 'Home' }, '🏠'),
      h('div', { class: 'wh-emoji' }, w.emoji),
      h('div', null, h('div', { class: 'wh-num' }, 'Week ' + w.n), h('h1', null, w.kidTitle))),
    h('div', { class: 'words' }, h('span', { class: 'words-label' }, 'Our words:'), w.words.map(word => {
      const b = h('button', { class: 'word-chip', 'data-nosay': '' }, '🔊 ' + word);
      b.addEventListener('click', () => Voice.say(word));
      return b;
    })),
    h('div', { class: 'game-grid' }, w.games.map(id => gameCard(id, w.n))),
    w.freeChoice ? h('div', { class: 'free' }, h('h2', null, '🎈 Free choice'), h('div', { class: 'game-grid small' }, w.freeChoice.map(id => gameCard(id, w.n)))) : null,
    h('div', { class: 'week-nav' },
      prev ? h('a', { class: 'big-btn alt', href: '#/week/' + prev.n, 'data-say': 'Go to week ' + prev.n }, '⬅ Week ' + prev.n) : h('span'),
      next ? h('a', { class: 'big-btn alt', href: '#/week/' + next.n, 'data-say': 'Go to week ' + next.n }, 'Week ' + next.n + ' ➡') : h('span'))
  ].filter(Boolean));
  Voice.say(`Week ${w.n}. ${w.kidTitle}`);
}

function teacherPage(mount) {
  const name = getName();
  const nameIn = h('input', { class: 'tp-input', value: name, placeholder: 'Student first name', maxlength: 20 });
  const saveName = h('button', { class: 'tp-btn' }, 'Save name');
  saveName.addEventListener('click', () => { const n = cleanName(nameIn.value); if (n) { Store.set('name', n); nameIn.value = n; toast('Saved: ' + n); } });
  const reset = h('button', { class: 'tp-btn warn' }, 'Reset stars');
  reset.addEventListener('click', () => { if (confirm('Clear all stars for this student?')) { Progress.reset(); App.route(true); } });
  const delBook = h('button', { class: 'tp-btn warn' }, 'Delete practice book');
  delBook.addEventListener('click', () => { if (confirm('Delete this student’s practice book?')) { Store.remove('book'); toast('Practice book deleted'); } });
  const printList = h('button', { class: 'tp-btn' }, '🖨️ Print skills checklist');
  printList.addEventListener('click', () => { document.body.classList.add('print-checklist'); window.print(); setTimeout(() => document.body.classList.remove('print-checklist'), 500); });

  const allCodes = WEEKS.flatMap(w => w.codes.map(c => c.split(' ')[0]));
  const rows = Array.from({ length: 18 }, () => h('tr', null, h('td'), allCodes.map(() => h('td')), h('td')));

  mount.append(h('div', { class: 'teacher' },
    h('div', { class: 'tp-head' }, h('a', { class: 'back-btn', href: '#/', 'aria-label': 'Home' }, '🏠'), h('div', null, h('h1', null, 'Teacher guide'), h('p', null, 'Senior Kindergarten Chromebook Course · six 30-minute sessions'))),

    h('section', { class: 'tp-card' },
      h('h2', null, 'How to use this site'),
      h('p', null, 'Each week’s page holds the mini-games for the 10–25 minute practice block. Every game reads its directions aloud (🔊 repeats them), so students who are not reading yet can play on their own. Stars are saved on each Chromebook, and the home screen shows which games each child has finished.'),
      h('p', null, 'Games for Weeks 1–3 practice the device skills directly. Weeks 4–6 are rehearsals for Book Creator: students try the same steps here first, then do the real thing in Book Creator.')),

    h('section', { class: 'tp-card' },
      h('h2', null, 'Course at a glance'),
      h('table', { class: 'tp-table' },
        h('thead', null, h('tr', null, ['Week', 'Focus', 'Practice games', 'Checklist'].map(t => h('th', null, t)))),
        h('tbody', null, WEEKS.map(w => h('tr', null,
          h('td', null, h('a', { href: '#/week/' + w.n }, w.emoji + ' ' + w.n)),
          h('td', null, w.title),
          h('td', null, w.games.map(id => h('a', { class: 'tp-game', href: `#/play/${id}/${w.n}` }, Games[id].emoji + ' ' + Games[id].title))),
          h('td', null, w.codes.map(c => h('div', null, c)))))))),

    h('section', { class: 'tp-card tp-two' },
      h('div', null, h('h2', null, 'Every session'),
        h('ol', { class: 'tp-routine' },
          h('li', null, h('b', null, '0–5 Get ready: '), 'collect Chromebook with two hands, open the lid, log in'),
          h('li', null, h('b', null, '5–10 Model: '), 'show one skill on the projector, students say or do it together'),
          h('li', null, h('b', null, '10–25 Practice: '), 'students play this week’s games while you circulate'),
          h('li', null, h('b', null, '25–30 Share and pack up: '), 'one or two share, log out, close the lid, return')),
        h('h3', null, 'Three habits'),
        h('ul', null, HABITS.map(([e, t]) => h('li', null, e + ' ' + t)))),
      h('div', null, h('h2', null, 'Before you begin'),
        h('ul', { class: 'tp-check' }, BEFORE_YOU_BEGIN.map(t => h('li', null, h('label', null, h('input', { type: 'checkbox' }), ' ' + t)))))),

    WEEKS.map(w => h('section', { class: 'tp-card tp-week', style: { '--wk': w.color } },
      h('h2', null, `${w.emoji} Week ${w.n}: ${w.title}`),
      h('p', null, h('b', null, 'Goal: '), w.goal),
      h('p', null, h('b', null, 'Words to teach: '), w.words.join(', ')),
      h('table', { class: 'tp-table' },
        h('thead', null, h('tr', null, h('th', null, 'Minutes'), h('th', null, 'What happens'))),
        h('tbody', null, w.plan.map(([m, t]) => h('tr', null, h('td', null, m), h('td', null, t))))),
      h('p', null, h('b', null, 'Practice games: '), w.games.map((id, i) => [i ? ' · ' : '', h('a', { href: `#/play/${id}/${w.n}` }, Games[id].title)])),
      h('p', null, h('b', null, 'Success looks like: '), w.success),
      h('p', null, h('b', null, 'If students struggle: '), w.struggle),
      h('p', { class: 'tp-note' }, '💡 ' + w.note))),

    h('section', { class: 'tp-card' },
      h('h2', null, 'This student’s sign-in'),
      h('p', null, 'The site saves each student’s name (used in the name games and certificate), stars and practice book under their Chrome sign-in on this Chromebook. Several students can share a device without mixing up progress, but saved work does not follow a student to a different Chromebook, so keep each child on their numbered device. Set a name here while signed in as that student, or add ', h('code', null, '?name=Easton'), ' to the end of the address.'),
      h('div', { class: 'tp-row' }, nameIn, saveName),
      h('p', null, `Stars for this student: ⭐ ${Progress.total()}`),
      h('div', { class: 'tp-row' }, reset, delBook)),

    h('section', { class: 'tp-card checklist' },
      h('div', { class: 'tp-row spread' }, h('h2', null, 'Skills checklist'), printList),
      h('p', null, h('b', null, 'Rating key: '), CHECKLIST_KEY),
      h('table', { class: 'tp-table codes' },
        h('tbody', null, WEEKS.flatMap(w => w.codes.map(c => h('tr', null, h('td', null, c.slice(0, 2)), h('td', null, c.slice(3))))))),
      h('table', { class: 'tp-table roster' },
        h('thead', null, h('tr', null, h('th', null, 'Student'), allCodes.map(c => h('th', null, c)), h('th', null, 'Notes'))),
        h('tbody', null, rows)))));
}

const App = {
  stop: null,
  route() {
    if (this.stop) { this.stop(); this.stop = null; }
    Voice.stop();
    const mount = document.getElementById('app');
    mount.innerHTML = '';
    document.querySelectorAll('.win, .bk-modal, .play-ov, .toast').forEach(e => e.remove());
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    document.body.dataset.page = parts[0] || 'home';
    if (parts[0] === 'week') weekPage(mount, +parts[1]);
    else if (parts[0] === 'play' && Games[parts[1]]) this.stop = runGame(parts[1], +parts[2], mount);
    else if (parts[0] === 'teacher') teacherPage(mount);
    else homePage(mount);
    window.scrollTo(0, 0);
  }
};

window.addEventListener('hashchange', () => App.route());
document.getElementById('muteBtn').addEventListener('click', e => {
  const m = !Sfx.muted(); Store.set('muted', m);
  e.currentTarget.textContent = m ? '🔇' : '🔊';
  if (m) Voice.stop(); else Sfx.good();
});
document.getElementById('muteBtn').textContent = Sfx.muted() ? '🔇' : '🔊';
getName();
updateStarTotal();
App.route();
