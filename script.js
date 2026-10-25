const $ = id => document.getElementById(id);
const LEVELS = {
  easy:   { min: 1, max: 50,  attempts: 7 },
  medium: { min: 1, max: 100, attempts: 8 },
  hard:   { min: 1, max: 500, attempts: 10 }
};
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
let stats = store.get('hunch-stats', { played: 0, won: 0, best: {} });

// ---- game state ----
let level = 'medium', min, max, maxAttempts, target;
let attempts, guesses, low, high, over, hintUsed;

// Random integer from min to max, both included
const randomInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

function newGame() {
  ({ min, max, attempts: maxAttempts } = LEVELS[level]);
  target = randomInt(min, max);
  attempts = 0; guesses = []; low = min; high = max; over = false; hintUsed = false;
  $('banner').hidden = true;
  $('guess').value = ''; $('guess').disabled = false; $('go').disabled = false; $('hint').disabled = false;
  $('guess').min = min; $('guess').max = max; $('guess').placeholder = `${min} to ${max}`;
  $('hinttext').textContent = '';
  setFeedback('Make your first guess.', '', '');
  render();
  $('guess').focus();
}

// ---- helpers ----
function setFeedback(text, cls, temp) {
  $('dir').textContent = text;
  $('dir').className = 'dir ' + cls;
  $('temp').textContent = temp;
}
function warn(msg) {            // validation message: does not cost an attempt
  setFeedback(msg, 'err', '');
  $('guess').classList.remove('bad'); void $('guess').offsetWidth; $('guess').classList.add('bad');
}
function temperature(guess) {   // hot or cold, based on distance relative to the range size
  const ratio = Math.abs(guess - target) / (max - min);
  if (ratio <= 0.03) return '🔥 Burning hot';
  if (ratio <= 0.08) return '🥵 Hot';
  if (ratio <= 0.2)  return '🙂 Warm';
  if (ratio <= 0.4)  return '🥶 Cold';
  return '🧊 Ice cold';
}

// ---- making a guess ----
function submitGuess() {
  if (over) return;
  const raw = $('guess').value.trim();
  const n = Number(raw);

  // Validation: number, whole, in range, not repeated
  if (raw === '' || Number.isNaN(n)) return warn('Type a number first.');
  if (!Number.isInteger(n)) return warn('Whole numbers only.');
  if (n < min || n > max) return warn(`Out of range. Pick a number from ${min} to ${max}.`);
  if (guesses.some(g => g.n === n)) return warn(`You already tried ${n}.`);

  $('guess').classList.remove('bad');
  attempts++;

  if (n === target) {
    guesses.push({ n, kind: 'hit' });
    setFeedback('🎉 Correct!', 'win', '');
    return endGame(true);
  }
  const tooHigh = n > target;
  if (tooHigh) high = Math.min(high, n - 1); else low = Math.max(low, n + 1);
  guesses.push({ n, kind: tooHigh ? 'down' : 'up' });
  setFeedback(tooHigh ? 'Too high ↓ Go lower' : 'Too low ↑ Go higher', tooHigh ? 'high' : 'low', temperature(n));

  $('guess').value = '';
  if (attempts >= maxAttempts) return endGame(false);
  render();
  $('guess').focus();
}

function endGame(won) {
  over = true;
  stats.played++;
  if (won) {
    stats.won++;
    const best = stats.best[level];
    if (!best || attempts < best) stats.best[level] = attempts;
  }
  store.set('hunch-stats', stats);
  $('guess').disabled = true; $('go').disabled = true; $('hint').disabled = true;
  $('bTitle').textContent = won ? `You got it in ${attempts} ${attempts === 1 ? 'try' : 'tries'}!` : 'Out of attempts';
  $('bText').textContent = won ? rating() : `The number was ${target}. Try again?`;
  $('banner').hidden = false;
  render();
  $('again').focus();
}
function rating() {
  const ideal = Math.ceil(Math.log2(max - min + 1));
  if (attempts <= ideal - 2) return 'Lucky or brilliant. Either way, well played.';
  if (attempts <= ideal) return 'Textbook binary search.';
  return 'Nice win. Try guessing the middle of the range to go faster.';
}

// ---- hint: odd or even, costs one attempt, once per game ----
$('hint').addEventListener('click', () => {
  if (over || hintUsed) return;
  if (attempts >= maxAttempts - 1) { $('hinttext').textContent = 'Not enough attempts left to use a hint.'; return; }
  hintUsed = true; attempts++;
  $('hinttext').textContent = `Hint: the number is ${target % 2 === 0 ? 'even' : 'odd'}.`;
  $('hint').disabled = true;
  render();
});

// ---- rendering ----
function render() {
  $('lowL').textContent = low;
  $('highL').textContent = high;
  const span = max - min + 1;
  $('rangebar').style.setProperty('--l', ((low - min) / span) * 100 + '%');
  $('rangebar').style.setProperty('--r', ((max - high) / span) * 100 + '%');
  $('attemptsText').textContent = `Attempts ${attempts} / ${maxAttempts}`;

  $('pips').innerHTML = '';
  for (let i = 0; i < maxAttempts; i++) {
    const s = document.createElement('span');
    if (i < attempts) s.className = 'used';
    $('pips').appendChild(s);
  }

  const list = $('history');
  list.innerHTML = '';
  if (!guesses.length) list.innerHTML = '<li class="empty">None yet.</li>';
  guesses.forEach(g => {
    const li = document.createElement('li');
    li.className = g.kind;
    li.textContent = g.n + (g.kind === 'up' ? ' ↑' : g.kind === 'down' ? ' ↓' : ' ✓');
    list.appendChild(li);
  });

  $('stPlayed').textContent = stats.played;
  $('stWon').textContent = stats.won;
  $('stBest').textContent = stats.best[level] ?? '–';
  $('stRate').textContent = stats.played ? Math.round((stats.won / stats.played) * 100) + '%' : '0%';
}

// ---- events ----
$('form').addEventListener('submit', e => { e.preventDefault(); submitGuess(); });
$('levels').addEventListener('click', e => {
  const b = e.target.closest('button[data-level]');
  if (!b) return;
  level = b.dataset.level;
  document.querySelectorAll('#levels button').forEach(x => x.setAttribute('aria-pressed', x === b));
  newGame();
});
$('restart').addEventListener('click', newGame);
$('again').addEventListener('click', newGame);
$('clearStats').addEventListener('click', () => { stats = { played: 0, won: 0, best: {} }; store.set('hunch-stats', stats); render(); });

// ---- theme ----
const tb = $('theme');
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  tb.textContent = t === 'dark' ? '☀' : '☾';
  tb.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}
tb.addEventListener('click', () => {
  const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(t); store.set('hunch-theme', t);
});
applyTheme(store.get('hunch-theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

newGame();
