# Hunch – Number Guessing Game

**Task 25 · Web Development Track ·**

An interactive browser-based game where players try to guess a randomly generated number within a defined range. The game provides higher or lower hints and tracks the number of attempts until the correct answer is found.

## Objective

Practice randomization, conditionals, and attempt tracking.

## Tools

- HTML5
- CSS3
- JavaScript (vanilla, no libraries)

## Project structure

```
number-guess/
├── index.html   # Page and game markup
├── style.css    # Design and themes
├── script.js    # Game logic and state
└── README.md
```

## How to run

Keep the three files together and open `index.html` in a browser. No server is needed. Fonts load from Google Fonts and fall back to system fonts offline.

## Deliverables

| Deliverable | How it is done |
| --- | --- |
| Random target number within a defined range | `randomInt(min, max)` using `Math.random()` and `Math.floor()`, with Easy (1–50), Medium (1–100) and Hard (1–500) ranges |
| Higher/lower feedback | "Too high" or "Too low" after every guess |
| Attempt counter | `attempts` state shown as "Attempts 3 / 8" plus a row of pips |
| Play again button | Shown on the win/lose banner, and "New game" is always available |

## Hints from the task

- **Math.random and Math.floor:** `Math.floor(Math.random() * (max - min + 1)) + min`.
- **Attempts in state:** the `attempts` variable increases only for valid guesses.
- **Validation:** empty, decimal, out-of-range and repeated guesses show a message and are not counted.

## Extra features

- Three difficulty levels, each with its own attempt limit.
- Hot-or-cold reading based on how close the guess is compared with the range size.
- A range bar and "It's between X and Y" text that narrow after each guess.
- Guess history chips marked with up and down arrows.
- One hint per game (odd or even) that costs an attempt.
- Win and loss banner with a rating that compares your guesses to the ideal number.
- Saved stats: games played, wins, win rate and best score per difficulty (browser localStorage).
- Dark and light theme toggle, responsive layout, reduced-motion support.

## Interview questions

**How would you generate a random integer in a range?**
`Math.floor(Math.random() * (max - min + 1)) + min`. `Math.random()` gives a decimal from 0 up to but not including 1. Multiplying by the size of the range and flooring gives a whole number from 0 to `max - min`, and adding `min` shifts it into place. The `+ 1` makes `max` possible.

**How would you give feedback for an out-of-range guess?**
Check the range before comparing with the target. If the number is below `min` or above `max`, show a message such as "Out of range. Pick a number from 1 to 100." and return early without counting an attempt, so players are not punished for typos.

**How would you reset the game state?**
Put all the starting values in one `newGame()` function: choose a new target, set attempts to 0, clear the guess list, restore the range, re-enable the inputs and hide the banner. Call it on page load, on "Play again" and when the difficulty changes, so there is only one place where state is initialised.


## 👩‍💻 Author

Priya Tambe
