/* The six weeks, taken from the SK Chromebook Course Teacher Guide.
   `games` are played in the 10–25 minute practice block, in this order. */
const WEEKS = [
  {
    n: 1, emoji: '💻', color: '#017EA7',
    title: 'Meet the Chromebook',
    kidTitle: 'Hello, Chromebook!',
    goal: 'Handle the device safely and log in to Chrome and Clever with the badge.',
    words: ['screen', 'keyboard', 'trackpad', 'badge', 'log in', 'log out'],
    games: ['parts', 'care', 'loginsteps'],
    codes: ['1A Handles the Chromebook safely', '1B Logs in with the Clever badge'],
    plan: [
      ['0–5', 'Hand out Chromebooks one table at a time. Model “two hands to carry.”'],
      ['5–12', 'Show the parts: screen, keyboard, trackpad, camera. Model opening the lid (not past a slant).'],
      ['12–24', 'Model the badge login, then students log in, open Chrome, find Clever, log out and repeat. Early finishers play the games below.'],
      ['24–30', 'Ask: “What is one rule for taking care of our Chromebook?” Close the lid and return.']
    ],
    success: 'Logs in with their badge with at most one reminder and closes the lid gently.',
    struggle: 'Pair with a helper, keep the badge steady in front of the camera, and put a sticker on the Chrome icon.',
    note: 'Students will still be new to the trackpad, so the Week 1 games use very large targets. They also make a good warm-up at the start of Week 2.'
  },
  {
    n: 2, emoji: '🖱️', color: '#43A047',
    title: 'Pointing, clicking and dragging',
    kidTitle: 'Point, Click, Drag!',
    goal: 'Control the pointer using the trackpad or a mouse.',
    words: ['pointer', 'click', 'double-click', 'drag', 'trackpad'],
    games: ['bubbles', 'hunt', 'eggs', 'feed', 'draw'],
    codes: ['2A Points and clicks', '2B Drags and double-clicks'],
    plan: [
      ['0–5', 'Get-ready routine. Students log in with less help than last week.'],
      ['5–10', 'Model moving the pointer with one finger, then click and drag. Say “finger down, move, finger up.”'],
      ['10–25', 'Pointer practice: Bubble Pop and Shape Hunt (click), Hatch the Eggs (double-click), Feed the Animals (drag), then free drawing.'],
      ['25–30', 'Ask: “What did your pointer do today?” Log out and return.']
    ],
    success: 'Moves the pointer to a target and clicks it without help at least three times.',
    struggle: 'Offer a small mouse in place of the trackpad, start with Bubble Pop (biggest targets), and say each movement out loud together.',
    note: 'Shape Hunt can also be run whole-class from the projector: you call the shape, students find it on their own screen.'
  },
  {
    n: 3, emoji: '⌨️', color: '#8E24AA',
    title: 'Intro to the keyboard',
    kidTitle: 'Find the Keys!',
    goal: 'Find keys on the keyboard and type their first name.',
    words: ['key', 'letter', 'space bar', 'Shift', 'capital letter'],
    games: ['colorname', 'letterpop', 'rocket', 'capitals', 'typename'],
    codes: ['3A Finds keys', '3B Types their name'],
    plan: [
      ['0–5', 'Get-ready routine. Students log in and open Typing.com from Clever (or this site).'],
      ['5–10', 'Show that the letters are not in ABC order. Model finding one letter, then the space bar and Shift.'],
      ['10–25', 'Students use their name card: Color My Name, then Type My Name. Letter Pop, Space Rocket and Capital Letters are extra practice. Then Typing.com early lessons.'],
      ['25–30', 'Ask: “Which key was hardest to find?” Log out and return.']
    ],
    success: 'Types most of the letters in their first name using their name card.',
    struggle: 'Let them type only the first letter, use letter stickers on the keys, and pair with a buddy who finds the next letter.',
    note: 'Color My Name is the on-screen version of the printed keyboard name sheets: same key layout, lowercase like the real Chromebook keys. Each Chromebook remembers the name typed in, so set it once per device.'
  },
  {
    n: 4, emoji: '📘', color: '#F26B21',
    title: 'Book Creator, part 1',
    kidTitle: 'Make a Book Cover',
    goal: 'Open Book Creator, add a title and their name, and save.',
    words: ['app', 'book', 'cover', 'title', 'text box'],
    games: ['appfinder', 'cover'],
    codes: ['4A Opens Book Creator', '4B Makes a cover'],
    plan: [
      ['0–5', 'Get-ready routine. Students log in, open Clever and find the Book Creator tile.'],
      ['5–10', 'Model starting a new book, clicking the title text box, typing a title, adding their name and changing the text size.'],
      ['10–25', 'Students make their real cover in Book Creator. Use Find the App and Practice Cover first with anyone who needs a dry run.'],
      ['25–30', 'Show two or three covers. Ask: “What do you like about this cover?” Close the book and log out.']
    ],
    success: 'Has a cover with a title and at least the first letter of their name, and opens the app from Clever with one reminder.',
    struggle: 'Set up the book for them so they only fill in the text, and let them dictate the title to a helper.',
    note: 'The practice games are a rehearsal, not a replacement: the steps and buttons mirror Book Creator so the real thing feels familiar. The practice cover is saved on the Chromebook and reused in Week 5.'
  },
  {
    n: 5, emoji: '🎤', color: '#E53935',
    title: 'Book Creator, part 2',
    kidTitle: 'Pages, Pictures, Voices',
    goal: 'Add pages, pictures and voice to a book.',
    words: ['page', 'picture', 'camera', 'record', 'microphone'],
    games: ['whichbutton', 'bookbuilder'],
    codes: ['5A Adds a page', '5B Adds a picture or voice'],
    plan: [
      ['0–5', 'Get-ready routine. Students log in and reopen their book from last week.'],
      ['5–10', 'Model adding a page, drawing, taking a photo and recording a voice reading.'],
      ['10–25', 'Students add two or three pages in Book Creator. Which Button? is a quick warm-up; Practice Book lets students rehearse the camera and microphone first.'],
      ['25–30', 'Partners swap and say one thing they like. Save and log out.']
    ],
    success: 'Adds a second page and uses one of the picture or voice tools with at most one reminder.',
    struggle: 'Focus on one tool (drawing or voice), and have a helper hold the record button with them the first time.',
    note: 'Practice Book asks for camera and microphone permission the first time. Use headphones or a quiet corner for recording.'
  },
  {
    n: 6, emoji: '🎉', color: '#FFB300',
    title: 'Finish, share and celebrate',
    kidTitle: 'Share and Celebrate!',
    goal: 'Finish a book, play it for a buddy and talk about being kind and safe online.',
    words: ['share', 'play', 'kind', 'safe', 'ask first'],
    games: ['kindsafe', 'playbook', 'certificate'],
    freeChoice: ['draw', 'bubbles', 'rocket', 'letterpop', 'feed'],
    codes: ['6A Plays their book', '6B Names a rule'],
    plan: [
      ['0–5', 'Get-ready routine. Students log in and open their book with little or no help.'],
      ['5–10', 'Show the play button. Introduce two rules: “Ask before touching someone else’s screen” and “Tell a teacher if something looks wrong.” Play Kind and Safe together.'],
      ['10–22', 'Students finish their book and play it all the way through.'],
      ['22–30', 'Buddy share, then 5 minutes of free choice (the games at the bottom of the Week 6 page). Print certificates.']
    ],
    success: 'Logs in and opens their book independently, plays it, and can say one of the two rules.',
    struggle: 'Pair with a buddy for the share, and accept a book of one or two pages as finished.',
    note: 'The certificate prints one per page with the student’s name and star count from this Chromebook.'
  }
];

const CHECKLIST_KEY = 'I = does it independently · H = does it with help · N = not yet';

const BEFORE_YOU_BEGIN = [
  'Chromebooks charged, one numbered device per student',
  'Every Clever badge printed, laminated and tested',
  'Projector ready to model each step',
  'Headphones for Weeks 5 and 6',
  'Typing.com class set up (Week 3)',
  'Book Creator library set up through Clever (Week 4)',
  'A classroom helper for Weeks 1 and 4',
  'A spot for the lid-and-charger routine',
  'Each student’s name typed into this site on their Chromebook (Teacher page ▸ This Chromebook)',
  'Printed skills checklist (bottom of this page)'
];

const HABITS = [
  ['🤲', 'Two hands to carry.'],
  ['👀', 'Eyes up, hands off.'],
  ['🙋', 'Ask a friend, then ask a teacher.']
];
