# Little Lynx Computer Lab

Practice games for the Senior Kindergarten 6-week Chromebook course. Plain HTML, CSS and JavaScript, no build step. Open `index.html` through any web server.

| Week | Focus | Games |
|---|---|---|
| 1 | Meet the Chromebook | Chromebook Parts, Chromebook Care, Log In Steps |
| 2 | Point, click, drag | Bubble Pop, Shape Hunt, Hatch the Eggs (double-click), Feed the Animals (drag), Drawing Pad |
| 3 | Keyboard | Color My Name, Letter Pop, Space Rocket, Capital Letters (Shift), Type My Name |
| 4 | Book Creator 1 | Find the App, Practice Cover |
| 5 | Book Creator 2 | Which Button?, Practice Book (pages, pen, camera, voice) |
| 6 | Share and celebrate | Kind and Safe, Play My Book, Certificate, plus free choice |

The teacher guide is at `#/teacher`: week plans, practice-game links, device settings and a printable skills checklist.

## Notes

- Every direction is read aloud with the browser's built-in voice; 🔊 repeats it.
- Each Chromebook stores its student's name, stars and practice book in the browser (localStorage). No student data leaves the device. Set the name on the Teacher page or by adding `?name=Easton` to the address.
- Camera and microphone (Week 5) need permission the first time.

## Editing

- Week content and teacher notes: `js/data.js`
- Games: `js/games-week1.js`, `games-week2.js`, `games-week3.js`, `games-book.js` (Weeks 4–6), `games-week6.js`
- After changing a file, bump the `?v=` number in `index.html` so Chromebooks load the new version.
