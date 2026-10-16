/* Week 6: Finish, share and celebrate */

registerGame({
  id: 'kindsafe', emoji: '💛', title: 'Kind and Safe',
  blurb: 'Good choice or not?',
  start(api) {
    choiceGame(api, [
      { scene: '🙋💻', text: 'Ask before touching a friend’s screen', good: true, why: 'Yes! We ask first.' },
      { scene: '👉💻', text: 'Touch a friend’s screen without asking', good: false, why: 'Right. Always ask first.' },
      { scene: '😟🧑‍🏫', text: 'Something looks wrong, so you tell a teacher', good: true, why: 'Yes! Tell a teacher if something looks wrong.' },
      { scene: '🤫😟', text: 'Something scary pops up and you keep it a secret', good: false, why: 'Right. Tell a teacher, every time.' },
      { scene: '😊📘', text: 'Tell a friend, I like your book!', good: true, why: 'Yes! Kind words make friends happy.' },
      { scene: '😝🎨', text: 'Laugh at a friend’s drawing', good: false, why: 'Right. We use kind words.' },
      { scene: '🤝🖱️', text: 'Help a friend with one step', good: true, why: 'Yes! Helpers help with one step.' },
      { scene: '✊🖱️', text: 'Grab the mouse from a friend', good: false, why: 'Right. Helpers do not take over.' }
    ], 'Let’s be kind and safe! Is it a good choice? Click thumbs up or thumbs down.', 'You know how to be kind and safe!');
  }
});

registerGame({
  id: 'certificate', emoji: '🏆', title: 'My Certificate',
  blurb: 'Print your award',
  async start(api) {
    const name = await askName();
    const stars = Progress.total();
    const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const badges = WEEKS.map(w => {
      const n = w.games.filter(g => Progress.stars(g) > 0).length;
      return h('div', { class: 'cert-badge' + (n ? ' on' : '') }, h('span', null, w.emoji), 'Week ' + w.n);
    });
    const print = h('button', { class: 'big-btn go no-print' }, '🖨️ Print');
    print.addEventListener('click', () => window.print());
    api.stage.append(h('div', { class: 'cert-wrap' },
      h('div', { class: 'cert' },
        h('div', { class: 'cert-paws' }, '🐾 🐾 🐾'),
        h('div', { class: 'cert-kicker' }, 'Little Lynx Computer Lab'),
        h('h2', { class: 'cert-title' }, 'Chromebook Champion'),
        h('div', { class: 'cert-sub' }, 'This award goes to'),
        h('div', { class: 'cert-name' }, name),
        h('div', { class: 'cert-for' }, 'for learning to log in, click, drag, type and make a book!'),
        h('div', { class: 'cert-badges' }, badges),
        h('div', { class: 'cert-foot' }, h('span', null, '⭐ ' + stars + ' stars'), h('span', null, date))),
      print));
    api.markDone();
    confetti(60); Sfx.win();
    api.say(`Congratulations, ${name}! You are a Chromebook Champion!`, '🎉 You are a Chromebook Champion!');
  }
});
