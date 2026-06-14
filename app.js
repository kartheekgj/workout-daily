/* ============================================================
   LEVEL UP — Workout Tracker
   app.js — Complete Application Logic
   ============================================================

   Structure:
   1.  Constants & Config
   2.  Workout Data
   3.  State & LocalStorage
   4.  Navigation (SPA router)
   5.  Home Page Rendering
   6.  Workout Page Rendering
   7.  Exercise / Circuit Logic
   8.  XP & Gamification
   9.  Rest Timer
   10. Nutrition Page
   11. Stats Page
   12. History Page
   13. Confetti Engine
   14. Utilities
   15. App.init()
   ============================================================ */

/* ============================================================
   1. CONSTANTS & CONFIG
   ============================================================ */

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// XP rewards
const XP = {
  WARMUP:   10,
  COOLDOWN: 10,
  FINISHER: 20,
  WORKOUT:  100,
};

// Level thresholds: one level per 7 completed workout days
// XP per level = 7 * 100 = 700
const XP_PER_LEVEL = 700;

// Progress ring circumference: 2π × r
// Home ring r=68: 2π×68 ≈ 427.26
// Timer ring r=52: 2π×52 ≈ 326.73
const HOME_RING_CIRC = 2 * Math.PI * 68;
const TIMER_RING_CIRC = 2 * Math.PI * 52;
const NUTRITION_RING_CIRC = (r) => 2 * Math.PI * r;

// Motivational quotes — rotated daily via date seed
const QUOTES = [
  "Consistency beats intensity.",
  "Small wins become massive results.",
  "Keep showing up.",
  "The body achieves what the mind believes.",
  "Progress, not perfection.",
  "Champions are made in the hours nobody sees.",
  "Every rep is a vote for the person you want to become.",
  "The only bad workout is the one you didn't do.",
  "Discipline is freedom.",
  "Fall in love with taking care of your body.",
  "You don't stop when you're tired. You stop when you're done.",
  "Strength doesn't come from what you can do. It comes from overcoming what you thought you couldn't.",
  "One more rep.",
  "Show up. Do the work. Trust the process.",
  "Your future self is watching.",
];

// 6-Week Progression Cycle (auto-rotates from a fixed epoch)
const PROGRESSION_WEEKS = [
  { week: 1, phase: 'Learn Movement',        note: 'Focus on form and range of motion.' },
  { week: 2, phase: 'Increase Weight 5%',    note: 'Add a small amount to every lift.' },
  { week: 3, phase: 'Add One Extra Set',      note: 'Push volume: add 1 set per exercise.' },
  { week: 4, phase: 'Increase Weight Again',  note: 'Progress your load further.' },
  { week: 5, phase: 'Deload — Volume −40%',   note: 'Recover. Cut sets, maintain weight.' },
  { week: 6, phase: 'Restart Heavier',        note: 'New baseline. Let\'s go again.' },
];

// Epoch for progression cycle (a known Monday)
const PROGRESSION_EPOCH = new Date('2025-01-06'); // A known Monday (Week 2, 2025)

/* ============================================================
   2. WORKOUT DATA
   ============================================================ */

// Daily Finisher — shown on every workout day
const DAILY_FINISHER = [
  { id: 'fin_1', name: 'Deep Squat Hold',     detail: '60 sec',    icon: 'fa-person-falling-burst' },
  { id: 'fin_2', name: 'Hanging from Bar',     detail: '30 sec',    icon: 'fa-grip-lines' },
  { id: 'fin_3', name: 'Hip Flexor Stretch',   detail: '60 sec',    icon: 'fa-person-praying' },
  { id: 'fin_4', name: 'Thoracic Rotation',    detail: '10 each',   icon: 'fa-rotate' },
  { id: 'fin_5', name: 'Deep Breathing',       detail: '2 min',     icon: 'fa-wind' },
];

// Warmup — same every day
const WARMUP_EXERCISES = [
  { id: 'wu_1', name: 'March in Place',          detail: '1 min',     rest: 0  },
  { id: 'wu_2', name: 'Arm Circles',              detail: '20 reps',   rest: 0  },
  { id: 'wu_3', name: 'Hip Circles',              detail: '15 each',   rest: 0  },
  { id: 'wu_4', name: "World's Greatest Stretch", detail: '5 each',    rest: 0  },
  { id: 'wu_5', name: 'Bodyweight Squats',        detail: '15 reps',   rest: 0  },
  { id: 'wu_6', name: 'Glute Bridge',             detail: '15 reps',   rest: 0  },
  { id: 'wu_7', name: 'Bird Dog',                 detail: '10 each',   rest: 0  },
  { id: 'wu_8', name: 'Cat Cow',                  detail: '10 reps',   rest: 0  },
];

// Full workout data by day name
const WORKOUTS = {
  Monday: {
    title: 'Lower Body Strength',
    subtitle: 'Lower Body Strength + Conditioning',
    icon: '🦵',
    circuits: [
      {
        id: 'mon_a',
        name: 'Circuit A',
        rounds: 4,
        exercises: [
          { id: 'mon_a1', name: 'Goblet Squat',      sets: 4, reps: '12',      rest: 60 },
          { id: 'mon_a2', name: 'Romanian Deadlift',  sets: 4, reps: '12',      rest: 60 },
          { id: 'mon_a3', name: 'Reverse Lunges',     sets: 4, reps: '10 each', rest: 60 },
        ]
      },
      {
        id: 'mon_b',
        name: 'Circuit B',
        rounds: 3,
        exercises: [
          { id: 'mon_b1', name: 'Step-ups',             sets: 3, reps: '12',      rest: 45 },
          { id: 'mon_b2', name: 'Glute Bridge',          sets: 3, reps: '15',      rest: 45 },
          { id: 'mon_b3', name: 'Standing Calf Raises',  sets: 3, reps: '20',      rest: 30 },
        ]
      },
      {
        id: 'mon_c',
        name: 'Conditioning',
        rounds: 10,
        exercises: [
          { id: 'mon_c1', name: 'Fast Walk',    sets: 10, reps: '30 sec', rest: 30 },
          { id: 'mon_c2', name: 'Normal Walk',  sets: 10, reps: '30 sec', rest: 0  },
        ]
      },
    ],
    cooldown: [
      { id: 'mon_cd1', name: 'Hamstring Stretch',   detail: '60 sec each' },
      { id: 'mon_cd2', name: 'Hip Flexor Stretch',  detail: '60 sec each' },
      { id: 'mon_cd3', name: 'Quad Stretch',         detail: '45 sec each' },
      { id: 'mon_cd4', name: 'Deep Breathing',       detail: '10 min'      },
    ],
  },

  Tuesday: {
    title: 'Upper Strength',
    subtitle: 'Upper Strength + Mobility',
    icon: '💪',
    circuits: [
      {
        id: 'tue_a',
        name: 'Circuit A',
        rounds: 3,
        exercises: [
          { id: 'tue_a1', name: 'Push-ups',        sets: 3, reps: '10',      rest: 60 },
          { id: 'tue_a2', name: 'Dumbbell Row',     sets: 3, reps: '12 each', rest: 60 },
          { id: 'tue_a3', name: 'Shoulder Press',   sets: 3, reps: '12',      rest: 60 },
        ]
      },
      {
        id: 'tue_b',
        name: 'Circuit B',
        rounds: 3,
        exercises: [
          { id: 'tue_b1', name: 'Lat Pulldown',  sets: 3, reps: '12', rest: 60 },
          { id: 'tue_b2', name: 'Chest Press',    sets: 3, reps: '12', rest: 60 },
          { id: 'tue_b3', name: 'Face Pull',       sets: 3, reps: '15', rest: 45 },
        ]
      },
      {
        id: 'tue_mob',
        name: 'Mobility',
        rounds: 3,
        exercises: [
          { id: 'tue_m1', name: 'Shoulder CARs',    sets: 3, reps: '5 each', rest: 0  },
          { id: 'tue_m2', name: 'Thoracic Rotation', sets: 3, reps: '10 each', rest: 0 },
          { id: 'tue_m3', name: 'Wall Slides',        sets: 3, reps: '12',     rest: 0  },
          { id: 'tue_m4', name: 'Band Pull Apart',    sets: 3, reps: '15',     rest: 30 },
        ]
      },
      {
        id: 'tue_fin',
        name: 'Finisher',
        rounds: 3,
        exercises: [
          { id: 'tue_f1', name: 'Farmer Carry',  sets: 3, reps: '40 meters', rest: 60 },
        ]
      },
    ],
    cooldown: [
      { id: 'tue_cd1', name: 'Shoulder Stretch',      detail: '45 sec each' },
      { id: 'tue_cd2', name: 'Chest Opener',            detail: '60 sec'      },
      { id: 'tue_cd3', name: 'Wrist Flexor Stretch',    detail: '30 sec each' },
      { id: 'tue_cd4', name: 'Neck Stretch',             detail: '30 sec each' },
    ],
  },

  Wednesday: {
    title: 'Athletic Conditioning',
    subtitle: 'Athletic Conditioning + Core',
    icon: '⚡',
    circuits: [
      {
        id: 'wed_a',
        name: 'Conditioning',
        rounds: 5,
        exercises: [
          { id: 'wed_a1', name: 'Kettlebell Swing',    sets: 5, reps: '15',     rest: 30 },
          { id: 'wed_a2', name: 'Battle Rope',          sets: 5, reps: '30 sec', rest: 30 },
          { id: 'wed_a3', name: 'Box Step-up',           sets: 5, reps: '15',     rest: 30 },
          { id: 'wed_a4', name: 'Medicine Ball Slam',    sets: 5, reps: '15',     rest: 30 },
          { id: 'wed_a5', name: 'Walking',               sets: 5, reps: '1 min',  rest: 0  },
        ]
      },
      {
        id: 'wed_core',
        name: 'Core',
        rounds: 3,
        exercises: [
          { id: 'wed_c1', name: 'Dead Bug',      sets: 3, reps: '15',     rest: 30 },
          { id: 'wed_c2', name: 'Plank',          sets: 3, reps: '45 sec', rest: 30 },
          { id: 'wed_c3', name: 'Side Plank',     sets: 3, reps: '30 sec each', rest: 30 },
          { id: 'wed_c4', name: 'Pallof Press',   sets: 3, reps: '15 each', rest: 30 },
        ]
      },
      {
        id: 'wed_fin',
        name: 'Finisher',
        rounds: 1,
        exercises: [
          { id: 'wed_f1', name: 'Incline Treadmill',  sets: 1, reps: '20 min', rest: 0 },
        ]
      },
    ],
    cooldown: [
      { id: 'wed_cd1', name: 'Quad Stretch',       detail: '45 sec each' },
      { id: 'wed_cd2', name: 'Hip Flexor Stretch', detail: '60 sec each' },
      { id: 'wed_cd3', name: 'Lat Stretch',         detail: '30 sec each' },
      { id: 'wed_cd4', name: "Child's Pose",         detail: '60 sec'      },
    ],
  },

  Thursday: {
    title: 'Lower Strength',
    subtitle: 'Lower Strength + Stability',
    icon: '🏋️',
    circuits: [
      {
        id: 'thu_a',
        name: 'Main Circuit',
        rounds: 4,
        exercises: [
          { id: 'thu_a1', name: 'Front Squat',              sets: 4, reps: '10',     rest: 90 },
          { id: 'thu_a2', name: 'Single Leg Romanian DL',   sets: 4, reps: '10 each', rest: 60 },
          { id: 'thu_a3', name: 'Bulgarian Split Squat',    sets: 4, reps: '10 each', rest: 90 },
          { id: 'thu_a4', name: 'Hip Thrust',               sets: 4, reps: '15',      rest: 60 },
        ]
      },
      {
        id: 'thu_bal',
        name: 'Balance',
        rounds: 3,
        exercises: [
          { id: 'thu_b1', name: 'Single Leg Stand (Eyes Closed)',  sets: 3, reps: '30 sec each', rest: 30 },
        ]
      },
      {
        id: 'thu_mob',
        name: 'Mobility',
        rounds: 1,
        exercises: [
          { id: 'thu_m1', name: '90/90 Hip Stretch',  sets: 1, reps: '60 sec each', rest: 0 },
          { id: 'thu_m2', name: 'Pigeon Stretch',      sets: 1, reps: '90 sec each', rest: 0 },
          { id: 'thu_m3', name: 'Ankle Mobility',      sets: 1, reps: '10 each',     rest: 0 },
        ]
      },
    ],
    cooldown: [
      { id: 'thu_cd1', name: 'Hamstring Stretch',  detail: '60 sec each' },
      { id: 'thu_cd2', name: 'Pigeon Pose',          detail: '90 sec each' },
      { id: 'thu_cd3', name: 'Calf Stretch',          detail: '45 sec each' },
      { id: 'thu_cd4', name: 'Spinal Twist',           detail: '30 sec each' },
    ],
  },

  Friday: {
    title: 'Upper Strength',
    subtitle: 'Upper Strength + Conditioning',
    icon: '🔱',
    circuits: [
      {
        id: 'fri_a',
        name: 'Circuit A',
        rounds: 4,
        exercises: [
          { id: 'fri_a1', name: 'Bench Press',    sets: 4, reps: '10', rest: 90 },
          { id: 'fri_a2', name: 'Cable Row',       sets: 4, reps: '12', rest: 60 },
          { id: 'fri_a3', name: 'Incline Press',   sets: 4, reps: '12', rest: 90 },
          { id: 'fri_a4', name: 'Pull Down',        sets: 4, reps: '12', rest: 60 },
        ]
      },
      {
        id: 'fri_b',
        name: 'Circuit B',
        rounds: 3,
        exercises: [
          { id: 'fri_b1', name: 'Lateral Raise',     sets: 3, reps: '15', rest: 45 },
          { id: 'fri_b2', name: 'Rear Delt Fly',      sets: 3, reps: '15', rest: 45 },
          { id: 'fri_b3', name: 'Bicep Curl',          sets: 3, reps: '12', rest: 45 },
          { id: 'fri_b4', name: 'Tricep Pushdown',     sets: 3, reps: '12', rest: 45 },
        ]
      },
      {
        id: 'fri_emom',
        name: 'EMOM × 6 Rounds',
        rounds: 6,
        exercises: [
          { id: 'fri_e1', name: 'Pushups (Min 1)',          sets: 6, reps: '10', rest: 0 },
          { id: 'fri_e2', name: 'Air Squats (Min 2)',        sets: 6, reps: '15', rest: 0 },
          { id: 'fri_e3', name: 'Mountain Climbers (Min 3)', sets: 6, reps: '20', rest: 0 },
        ]
      },
    ],
    cooldown: [
      { id: 'fri_cd1', name: 'Tricep Stretch',    detail: '30 sec each' },
      { id: 'fri_cd2', name: 'Shoulder Stretch',  detail: '45 sec each' },
      { id: 'fri_cd3', name: 'Chest Opener',       detail: '60 sec'      },
      { id: 'fri_cd4', name: 'Foam Roll Back',     detail: '2 min'       },
    ],
  },

  Saturday: {
    title: 'Recovery + Zone 2',
    subtitle: 'Recovery + Mobility + Zone 2',
    icon: '🌿',
    circuits: [
      {
        id: 'sat_mob',
        name: 'Mobility Flow',
        rounds: 1,
        exercises: [
          { id: 'sat_m1', name: 'Cat Cow',             sets: 1, reps: '10 reps',   rest: 0  },
          { id: 'sat_m2', name: "Child's Pose",         sets: 1, reps: '60 sec',    rest: 0  },
          { id: 'sat_m3', name: 'Hip Opener',           sets: 1, reps: '60 sec each', rest: 0 },
          { id: 'sat_m4', name: 'Deep Squat Hold',      sets: 1, reps: '60 sec',    rest: 0  },
          { id: 'sat_m5', name: "World's Greatest Stretch", sets: 1, reps: '5 each', rest: 0 },
          { id: 'sat_m6', name: 'Spinal Twist',         sets: 1, reps: '60 sec each', rest: 0 },
          { id: 'sat_m7', name: 'Hamstring Stretch',    sets: 1, reps: '60 sec each', rest: 0 },
          { id: 'sat_m8', name: 'Shoulder Stretch',     sets: 1, reps: '45 sec each', rest: 0 },
        ]
      },
      {
        id: 'sat_cardio',
        name: 'Zone 2 Cardio',
        rounds: 1,
        exercises: [
          { id: 'sat_c1', name: 'Incline Treadmill / Brisk Walk', sets: 1, reps: '30–45 min', rest: 0 },
        ]
      },
    ],
    cooldown: [
      { id: 'sat_cd1', name: 'Full Body Stretch Sequence',  detail: '10 min' },
      { id: 'sat_cd2', name: 'Foam Roll Legs',               detail: '3 min'  },
      { id: 'sat_cd3', name: 'Diaphragmatic Breathing',      detail: '3 min'  },
    ],
    cardioNote: 'Target HR: 120–140 bpm. Keep it conversational.',
  },

  Sunday: null, // Special rest day
};

/* ============================================================
   3. STATE & LOCAL STORAGE
   ============================================================ */

const STORAGE_KEY = 'levelup_v1';

// Default state factory
function defaultState() {
  return {
    xp:           0,
    level:        1,
    streak:       0,
    longestStreak: 0,
    totalWorkouts: 0,
    lastWorkoutDate: null,         // 'YYYY-MM-DD'
    completedDays:   {},           // { 'YYYY-MM-DD': { warmup, cooldown, finisher, workout, circuits, exercises } }
    nutrition:       {},           // { 'YYYY-MM-DD': { protein, calories, water, fiber, sleep, steps } }
    notes:           {},           // { 'YYYY-MM-DD': string }
    historyOffset:   0,            // weeks back from current for history page
  };
}

let state = defaultState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state = Object.assign(defaultState(), JSON.parse(raw));
    }
  } catch (e) {
    console.warn('LEVELUP: Failed to load state', e);
    state = defaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('LEVELUP: Failed to save state', e);
  }
}

/* ============================================================
   4. NAVIGATION (SPA ROUTER)
   ============================================================ */

let currentPage = 'home';
// Which day is currently selected in the strip (JS getDay() index: 0=Sun, 1=Mon...)
// Defaults to actual today; can be changed by the strip
let selectedDayIndex = new Date().getDay();

const App = {

  navigate(page) {
    if (page === currentPage) return;

    // Hide current
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.remove('active');
      n.removeAttribute('aria-current');
    });

    // Show target
    const pageEl = document.getElementById(`page-${page}`);
    if (!pageEl) return;
    pageEl.classList.add('active');

    const navBtn = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navBtn) {
      navBtn.classList.add('active');
      navBtn.setAttribute('aria-current', 'page');
    }

    currentPage = page;

    // Render page-specific content
    switch (page) {
      case 'home':      renderHome();      break;
      case 'workout':   renderWorkout();   break;
      case 'nutrition': renderNutrition(); break;
      case 'stats':     renderStats();     break;
      case 'history':
        state.historyOffset = 0;
        renderHistory();
        break;
    }
  },

  // Called by the day-strip buttons
  selectDay(dayIndex) {
    selectedDayIndex = dayIndex;
    updateDayStrip();
    // If already on workout page, re-render for the new day
    if (currentPage === 'workout') {
      renderWorkout();
    } else {
      // Navigate to workout page so the user sees the day's content
      App.navigate('workout');
    }
  },

  prevWeek() {
    state.historyOffset++;
    renderHistory();
  },

  nextWeek() {
    if (state.historyOffset > 0) {
      state.historyOffset--;
      renderHistory();
    }
  },

  /* ----- Timer public API ----- */
  openTimer(seconds = 60) {
    timerState.total    = seconds;
    timerState.remaining = seconds;
    timerState.running  = false;
    updateTimerDisplay();
    document.querySelectorAll('.btn-timer').forEach(b => b.classList.remove('active'));
    const map = { 30: 0, 60: 1, 90: 2 };
    const btns = document.querySelectorAll('.btn-timer');
    if (btns[map[seconds]]) btns[map[seconds]].classList.add('active');
    document.getElementById('timer-overlay').classList.remove('hidden');
    document.getElementById('timer-toggle-btn').innerHTML = '<i class="fa-solid fa-play mr-2"></i>Start';
  },

  closeTimer() {
    timerStop();
    document.getElementById('timer-overlay').classList.add('hidden');
  },

  setTimer(seconds) {
    timerStop();
    timerState.total     = seconds;
    timerState.remaining = seconds;
    timerState.running   = false;
    updateTimerDisplay();
    document.querySelectorAll('.btn-timer').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('timer-toggle-btn').innerHTML = '<i class="fa-solid fa-play mr-2"></i>Start';
  },

  toggleTimer() { timerToggle(); },
  resetTimer()  { timerReset();  },

  /* ----- Gamification public API ----- */
  closeLevelUpModal() {
    document.getElementById('levelup-modal').classList.add('hidden');
  },

  /* ----- Nutrition ----- */
  saveNotes() {
    const today = todayKey();
    state.notes[today] = document.getElementById('daily-notes').value;
    saveState();
    showXPToast('Saved ✓', '📝');
  },

  saveNutritionField(field) {
    const input = document.getElementById(`nut-${field}`);
    if (!input) return;
    const today = todayKey();
    if (!state.nutrition[today]) state.nutrition[today] = {};
    state.nutrition[today][field] = parseFloat(input.value) || 0;
    saveState();
    updateNutritionRings();
  },

};

// Save steps or water from the inline workout-page quick-log
function saveQuickLog(field, key) {
  const input = document.getElementById(`ql-${field}`);
  if (!input) return;
  if (!state.nutrition[key]) state.nutrition[key] = {};
  const val = parseFloat(input.value) || 0;
  state.nutrition[key][field] = val;
  saveState();

  // Live-update the display value and bar
  if (field === 'steps') {
    const pct = Math.min((val / 10000) * 100, 100);
    const valEl = document.getElementById('ql-steps-val');
    const barEl = document.getElementById('ql-steps-bar');
    if (valEl) valEl.textContent = `${(val/1000).toFixed(1)}k`;
    if (barEl) barEl.style.width = `${pct}%`;
  } else if (field === 'water') {
    const pct = Math.min((val / 4) * 100, 100);
    const valEl = document.getElementById('ql-water-val');
    const barEl = document.getElementById('ql-water-bar');
    if (valEl) valEl.textContent = `${val.toFixed(1)}L`;
    if (barEl) barEl.style.width = `${pct}%`;
  }
}

/* ============================================================
   5. HOME PAGE RENDERING
   ============================================================ */

// Update the day strip pills to reflect today / selected / completed state
function updateDayStrip() {
  const todayDow = new Date().getDay(); // 0–6
  // Map JS day index → strip button data-day attribute (same as getDay())
  document.querySelectorAll('.day-pill').forEach(btn => {
    const dow = parseInt(btn.dataset.day, 10);
    btn.classList.remove('today', 'selected', 'done-day');

    if (dow === todayDow)        btn.classList.add('today');
    if (dow === selectedDayIndex) btn.classList.add('selected');

    // Mark days that have a completed workout this week
    const key = getDayKey(dow);
    if (state.completedDays[key]?.workout) btn.classList.add('done-day');
  });
}

function renderHome() {
  const now  = new Date();
  const hour = now.getHours();

  // Greeting
  let greeting;
  if (hour < 12)      greeting = 'Good Morning 👋';
  else if (hour < 17) greeting = 'Good Afternoon 👋';
  else                greeting = 'Good Evening 👋';
  document.getElementById('greeting-text').textContent = greeting;

  // Date display
  const dayName   = DAYS[now.getDay()];
  const dateStr   = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  document.getElementById('day-name').textContent  = dayName;
  document.getElementById('date-sub').textContent  = dateStr;

  // Daily quote — seed by day-of-year for consistency
  const doy = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  document.getElementById('daily-quote').textContent = QUOTES[doy % QUOTES.length];

  // Progression phase
  const phase = getCurrentProgressionPhase();
  document.getElementById('phase-text').textContent = `Week ${phase.week} — ${phase.phase}`;

  // Gamification badges
  document.getElementById('badge-streak').textContent   = state.streak;
  document.getElementById('badge-best').textContent     = state.longestStreak;
  document.getElementById('badge-xp').textContent       = formatXP(state.xp);
  document.getElementById('badge-workouts').textContent = state.totalWorkouts;

  // Level bar
  renderLevelBar();

  // Header level badge
  document.getElementById('header-level-text').textContent = `Lv ${state.level}`;

  // Progress ring (always today on home)
  const progress = getDayProgress(todayKey(), now.getDay());
  setProgressRing('home-ring-circle', HOME_RING_CIRC, progress);
  document.getElementById('ring-percent').textContent = `${Math.round(progress * 100)}%`;

  // Day strip
  updateDayStrip();

  // Today's workout preview card
  renderWorkoutPreview();
}

function renderLevelBar() {
  const xpThisLevel = state.xp % XP_PER_LEVEL;
  const pct = (xpThisLevel / XP_PER_LEVEL) * 100;

  document.getElementById('level-label').textContent  = `Level ${state.level}`;
  document.getElementById('xp-to-next').textContent   = `${xpThisLevel} / ${XP_PER_LEVEL} XP`;
  document.getElementById('level-bar-fill').style.width = `${pct}%`;
  document.getElementById('level-bar-track').setAttribute('aria-valuenow', Math.round(pct));
  document.getElementById('level-desc').textContent   = `${7 - (state.totalWorkouts % 7)} workout days until Level ${state.level + 1}`;
}

function renderWorkoutPreview() {
  const card      = document.getElementById('workout-preview-card');
  const todayDow  = new Date().getDay();
  const dayName   = DAYS[todayDow];
  const todayData = WORKOUTS[dayName];
  const key       = todayKey();
  const dayState  = state.completedDays[key] || {};
  const progress  = getDayProgress(key, todayDow);
  const pct       = Math.round(progress * 100);

  if (dayName === 'Sunday') {
    card.innerHTML = `
      <div class="flex items-center gap-3 mb-3">
        <span class="text-3xl">😴</span>
        <div>
          <div class="font-display font-bold text-base">Recovery Day</div>
          <div class="text-xs text-muted">Rest, Walk, Hydrate</div>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-xs text-muted">Sunday</span>
        <span class="completed-stamp">${dayState.workout ? '✅ Recovered' : '🛌 Rest Day'}</span>
      </div>
    `;
  } else {
    card.innerHTML = `
      <div class="flex items-center gap-3 mb-3">
        <span class="text-3xl">${todayData?.icon || '💪'}</span>
        <div>
          <div class="font-display font-bold text-base">${dayName}</div>
          <div class="text-xs text-muted">${todayData?.subtitle || ''}</div>
        </div>
        <div class="ml-auto">
          ${pct === 100 ? '<span class="completed-stamp">✅ Done!</span>' : `<span class="text-accent font-display font-bold text-lg">${pct}%</span>`}
        </div>
      </div>
      <div class="section-progress-track">
        <div class="section-progress-fill" style="width:${pct}%"></div>
      </div>
      <button class="btn-primary mt-3 w-full" onclick="App.selectDay(${todayDow})">
        ${pct === 100 ? '🏆 View Workout' : '▶ Start Workout'}
      </button>
    `;
  }
}

/* ============================================================
   6. WORKOUT PAGE RENDERING
   ============================================================ */

function renderWorkout() {
  const dow     = selectedDayIndex;
  const dayName = DAYS[dow];
  const key     = getDayKey(dow);
  const content = document.getElementById('workout-content');
  const todayDow = new Date().getDay();
  const isToday  = dow === todayDow;

  updateDayStrip();

  if (dayName === 'Sunday') {
    renderSundayRecovery(content, key, isToday);
    return;
  }

  const data = WORKOUTS[dayName];
  if (!data) {
    content.innerHTML = `<p class="text-muted text-center pt-8">No workout for ${dayName}</p>`;
    return;
  }

  const dayState = state.completedDays[key] || {};
  content.innerHTML = '';

  // --- "Viewing past/future day" banner ---
  if (!isToday) {
    const banner = el('div', 'viewing-banner');
    const diff = dow - todayDow;
    const label = diff < 0 ? `${Math.abs(diff)} day${Math.abs(diff) > 1 ? 's' : ''} ago` :
                              `in ${diff} day${diff > 1 ? 's' : ''}`;
    banner.innerHTML = `<i class="fa-solid fa-circle-info"></i>
      Viewing <strong>${dayName}</strong> (${label}) — tap today's pill to log`;
    content.appendChild(banner);
  }

  // --- Header ---
  const header = el('div', 'workout-page-header');
  header.innerHTML = `
    <div class="workout-day-tag"><i class="fa-solid fa-calendar-day"></i>${dayName.toUpperCase()}</div>
    <h2 class="workout-title">${data.subtitle}</h2>
    <p class="workout-subtitle">${getCurrentProgressionPhase().phase} · ${getCurrentProgressionPhase().note}</p>
  `;
  content.appendChild(header);

  // --- Steps + Water quick log ---
  renderQuickLog(content, key);

  // --- Warmup Section ---
  renderWarmupSection(content, key, dayState);

  // --- Main Circuits ---
  const circuitsLabel = el('div', 'workout-section-label');
  circuitsLabel.innerHTML = `<i class="fa-solid fa-dumbbell text-accent"></i>Main Workout`;
  content.appendChild(circuitsLabel);

  data.circuits.forEach(circuit => {
    content.appendChild(renderCircuitCard(circuit, key, dayState));
  });

  // --- Cooldown ---
  renderCooldownSection(content, data.cooldown, key, dayState);

  // --- Daily Finisher ---
  renderFinisherSection(content, key, dayState);

  // --- Complete Workout Button ---
  const completeBtn = el('button', 'btn-complete');
  const isWorkoutDone = !!dayState.workout;
  completeBtn.disabled = isWorkoutDone;
  completeBtn.id = 'complete-workout-btn';
  completeBtn.innerHTML = isWorkoutDone
    ? '🏆 Workout Completed!'
    : '⚡ Mark Workout Complete';
  completeBtn.onclick = () => completeWorkout(dayName, key);
  content.appendChild(completeBtn);
}

function renderSundayRecovery(container, key, isToday) {
  const dayState = state.completedDays[key] || {};
  const todayDow = new Date().getDay();

  container.innerHTML = `
    ${!isToday ? `<div class="viewing-banner"><i class="fa-solid fa-circle-info"></i>
      Viewing <strong>Sunday</strong> recovery — tap today's pill to log</div>` : ''}

    <div class="workout-page-header">
      <div class="workout-day-tag"><i class="fa-solid fa-moon"></i>SUNDAY</div>
      <h2 class="workout-title">Recovery Day</h2>
      <p class="workout-subtitle">Rest. Recharge. Rebuild.</p>
    </div>

    <div class="recovery-icon-wrap">
      <span class="recovery-icon">😴</span>
      <p class="font-display text-2xl font-bold mt-3">Rest Day</p>
      <p class="text-muted mt-1">Your body grows when you rest.</p>
    </div>

    <div class="mt-4" id="sunday-goals">
      ${['🚶 Walk 10,000 Steps', '🧘 Stretch for 15 min', '💧 Drink 3.5L Water', '😴 Sleep 8+ Hours'].map((g, i) => {
        const checked = dayState[`sunday_${i}`];
        return `
          <div class="recovery-goal-card">
            <div class="recovery-goal-icon">${g.split(' ')[0]}</div>
            <div class="flex-1">
              <div class="font-medium text-sm">${g.slice(2)}</div>
            </div>
            <div class="custom-checkbox${checked ? ' checked' : ''}"
                 role="checkbox"
                 aria-checked="${checked ? 'true' : 'false'}"
                 tabindex="0"
                 onclick="toggleSundayGoal(${i}, '${key}')"
                 onkeydown="if(event.key==='Enter'||event.key===' ')toggleSundayGoal(${i},'${key}')">
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <button class="btn-complete ${dayState.workout ? 'opacity-50' : ''}"
            ${dayState.workout ? 'disabled' : ''}
            onclick="completeSundayRecovery('${key}')">
      ${dayState.workout ? '✅ Recovery Logged!' : '🌿 Log Recovery Day'}
    </button>
  `;
}

/* ============================================================
   7. EXERCISE / CIRCUIT LOGIC
   ============================================================ */

// Inline steps + water quick-log cards shown at the top of every workout day
function renderQuickLog(container, key) {
  const nutData  = state.nutrition[key] || {};
  const steps    = nutData.steps  || 0;
  const water    = nutData.water  || 0;
  const stepsTarget = 10000;
  const waterTarget = 4;
  const stepsPct = Math.min((steps / stepsTarget) * 100, 100);
  const waterPct = Math.min((water / waterTarget) * 100, 100);

  const row = el('div', 'quick-log-row');
  row.innerHTML = `
    <!-- Steps card -->
    <div class="quick-log-card">
      <div class="flex items-center justify-between">
        <div>
          <div class="quick-log-label">Steps</div>
          <div class="quick-log-val" id="ql-steps-val" style="color:#34d399">${(steps/1000).toFixed(1)}k</div>
          <div class="quick-log-target">Goal: 10k</div>
        </div>
        <span class="quick-log-icon">🚶</span>
      </div>
      <div class="quick-log-bar-track">
        <div class="quick-log-bar-fill" id="ql-steps-bar" style="width:${stepsPct}%;background:#34d399"></div>
      </div>
      <input
        type="number"
        id="ql-steps"
        class="quick-log-input"
        value="${steps || ''}"
        placeholder="0"
        min="0"
        step="500"
        aria-label="Log steps"
        oninput="saveQuickLog('steps','${key}')"
      />
    </div>
    <!-- Water card -->
    <div class="quick-log-card">
      <div class="flex items-center justify-between">
        <div>
          <div class="quick-log-label">Water</div>
          <div class="quick-log-val" id="ql-water-val" style="color:#38bdf8">${water.toFixed(1)}L</div>
          <div class="quick-log-target">Goal: 4L</div>
        </div>
        <span class="quick-log-icon">💧</span>
      </div>
      <div class="quick-log-bar-track">
        <div class="quick-log-bar-fill" id="ql-water-bar" style="width:${waterPct}%;background:#38bdf8"></div>
      </div>
      <input
        type="number"
        id="ql-water"
        class="quick-log-input"
        value="${water || ''}"
        placeholder="0.0"
        min="0"
        step="0.25"
        aria-label="Log water in litres"
        oninput="saveQuickLog('water','${key}')"
      />
    </div>
  `;
  container.appendChild(row);
}

function renderWarmupSection(container, key, dayState) {
  const label = el('div', 'workout-section-label');
  label.innerHTML = `<i class="fa-solid fa-fire text-orange-400"></i>Pre-Workout Warmup`;
  container.appendChild(label);

  // XP banner
  const banner = el('div', `xp-section-banner${dayState.warmup ? ' awarded' : ''}`);
  banner.id = 'warmup-xp-banner';
  banner.innerHTML = `<i class="fa-solid fa-star text-yellow-400"></i>+${XP.WARMUP} XP for completing warmup${dayState.warmup ? ' — Earned ✓' : ''}`;
  container.appendChild(banner);

  // Progress bar
  const warmupExercises = dayState.warmupExercises || {};
  const doneCount = Object.values(warmupExercises).filter(Boolean).length;
  const total     = WARMUP_EXERCISES.length;
  const progressWrap = el('div', 'section-progress-wrap');
  progressWrap.innerHTML = `
    <div class="section-progress-track" id="warmup-progress-track">
      <div class="section-progress-fill" id="warmup-progress-fill" style="width:${(doneCount/total)*100}%"></div>
    </div>
    <span class="section-progress-label" id="warmup-progress-label">${doneCount}/${total}</span>
  `;
  container.appendChild(progressWrap);

  // Exercises
  WARMUP_EXERCISES.forEach(ex => {
    const checked = !!warmupExercises[ex.id];
    const card = createExerciseCard(ex, checked, () => toggleWarmupExercise(ex.id, key));
    card.id = `warmup-card-${ex.id}`;
    container.appendChild(card);
  });
}

function renderCooldownSection(container, cooldownData, key, dayState) {
  const label = el('div', 'workout-section-label');
  label.innerHTML = `<i class="fa-solid fa-snowflake text-blue-400"></i>Post-Workout Cooldown`;
  container.appendChild(label);

  const banner = el('div', `xp-section-banner${dayState.cooldown ? ' awarded' : ''}`);
  banner.id = 'cooldown-xp-banner';
  banner.innerHTML = `<i class="fa-solid fa-star text-yellow-400"></i>+${XP.COOLDOWN} XP for completing cooldown${dayState.cooldown ? ' — Earned ✓' : ''}`;
  container.appendChild(banner);

  const cooldownExercises = dayState.cooldownExercises || {};
  const doneCount = Object.values(cooldownExercises).filter(Boolean).length;
  const total     = cooldownData.length;
  const progressWrap = el('div', 'section-progress-wrap');
  progressWrap.innerHTML = `
    <div class="section-progress-track">
      <div class="section-progress-fill" id="cooldown-progress-fill" style="width:${(doneCount/total)*100}%"></div>
    </div>
    <span class="section-progress-label" id="cooldown-progress-label">${doneCount}/${total}</span>
  `;
  container.appendChild(progressWrap);

  cooldownData.forEach(ex => {
    const checked = !!cooldownExercises[ex.id];
    const card = createExerciseCard({ ...ex, name: ex.name, detail: ex.detail }, checked,
      () => toggleCooldownExercise(ex.id, cooldownData, key));
    card.id = `cooldown-card-${ex.id}`;
    container.appendChild(card);
  });
}

function renderCircuitCard(circuit, key, dayState) {
  const card = el('div', 'circuit-card');
  const circuitExercises = (dayState.circuitExercises || {})[circuit.id] || {};
  const doneCount = Object.values(circuitExercises).filter(Boolean).length;
  const total     = circuit.exercises.length;
  const pct       = total ? (doneCount / total) * 100 : 0;

  card.innerHTML = `
    <div class="circuit-header" onclick="toggleCircuit('${circuit.id}')" role="button"
         aria-expanded="false" aria-controls="circuit-body-${circuit.id}" tabindex="0"
         onkeydown="if(event.key==='Enter'||event.key===' ')toggleCircuit('${circuit.id}')">
      <div>
        <div class="circuit-title">${circuit.name}</div>
        <div class="circuit-rounds">${circuit.rounds} ${circuit.rounds === 1 ? 'round' : 'rounds'} · ${circuit.exercises.length} exercises</div>
      </div>
      <div class="flex items-center gap-2">
        ${doneCount === total ? '<span class="text-accent text-sm"><i class="fa-solid fa-circle-check"></i></span>' : `<span class="text-xs text-muted">${doneCount}/${total}</span>`}
        <i class="fa-solid fa-chevron-down circuit-chevron"></i>
      </div>
    </div>
    <div class="circuit-progress-bar">
      <div class="circuit-progress-fill" id="cpf-${circuit.id}" style="width:${pct}%"></div>
    </div>
    <div class="circuit-body" id="circuit-body-${circuit.id}">
      ${circuit.exercises.map(ex => {
        const checked = !!circuitExercises[ex.id];
        return `
          <div class="exercise-card${checked ? ' completed' : ''}" id="exc-${ex.id}">
            <div class="custom-checkbox${checked ? ' checked' : ''}"
                 role="checkbox" aria-checked="${checked}"
                 tabindex="0"
                 onclick="toggleCircuitExercise('${circuit.id}','${ex.id}','${key}')"
                 onkeydown="if(event.key==='Enter'||event.key===' ')toggleCircuitExercise('${circuit.id}','${ex.id}','${key}')">
            </div>
            <div class="exercise-info">
              <div class="exercise-name">${ex.name}</div>
              <div class="exercise-meta">${ex.sets} sets × ${ex.reps}</div>
            </div>
            ${ex.rest ? `
              <button class="exercise-timer-btn" onclick="App.openTimer(${ex.rest})" aria-label="Start ${ex.rest} second rest timer">
                <i class="fa-regular fa-clock"></i>${ex.rest}s
              </button>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;

  return card;
}

function renderFinisherSection(container, key, dayState) {
  const finisher = el('div', 'finisher-card');
  const finisherExercises = dayState.finisherExercises || {};
  const doneCount = Object.values(finisherExercises).filter(Boolean).length;
  const total     = DAILY_FINISHER.length;

  finisher.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <div>
        <div class="font-display font-bold text-accent text-sm tracking-wide">DAILY FINISHER</div>
        <div class="text-xs text-muted mt-0.5">Every. Single. Day.</div>
      </div>
      <div class="text-right">
        <div class="font-display font-bold text-accent text-lg">${doneCount}/${total}</div>
        <div class="text-xs text-muted">+${XP.FINISHER} XP${dayState.finisher ? ' ✓' : ''}</div>
      </div>
    </div>
    <div class="section-progress-track mb-3">
      <div class="section-progress-fill" id="finisher-progress-fill" style="width:${(doneCount/total)*100}%"></div>
    </div>
    ${DAILY_FINISHER.map(ex => `
      <div class="exercise-card${finisherExercises[ex.id] ? ' completed' : ''}" id="fin-card-${ex.id}">
        <div class="custom-checkbox${finisherExercises[ex.id] ? ' checked' : ''}"
             role="checkbox" aria-checked="${!!finisherExercises[ex.id]}"
             tabindex="0"
             onclick="toggleFinisherExercise('${ex.id}','${key}')"
             onkeydown="if(event.key==='Enter'||event.key===' ')toggleFinisherExercise('${ex.id}','${key}')">
        </div>
        <div class="exercise-info">
          <div class="exercise-name">${ex.name}</div>
          <div class="exercise-meta">${ex.detail}</div>
        </div>
      </div>
    `).join('')}
  `;
  container.appendChild(finisher);
}

/* --- Toggle Functions --- */

function toggleCircuit(circuitId) {
  const card  = document.querySelector(`.circuit-card .circuit-header[aria-controls="circuit-body-${circuitId}"]`)?.closest('.circuit-card');
  if (!card) return;
  const open = card.classList.toggle('open');
  card.querySelector('.circuit-header').setAttribute('aria-expanded', open);
}

function toggleCircuitExercise(circuitId, exId, key) {
  if (!state.completedDays[key]) state.completedDays[key] = {};
  if (!state.completedDays[key].circuitExercises) state.completedDays[key].circuitExercises = {};
  if (!state.completedDays[key].circuitExercises[circuitId]) state.completedDays[key].circuitExercises[circuitId] = {};

  const current = state.completedDays[key].circuitExercises[circuitId][exId];
  state.completedDays[key].circuitExercises[circuitId][exId] = !current;
  saveState();

  // Update UI
  const card      = document.getElementById(`exc-${exId}`);
  const checkbox  = card?.querySelector('.custom-checkbox');
  const newVal    = state.completedDays[key].circuitExercises[circuitId][exId];

  if (card)     card.classList.toggle('completed', newVal);
  if (checkbox) {
    checkbox.classList.toggle('checked', newVal);
    checkbox.setAttribute('aria-checked', newVal);
  }

  // Update circuit progress bar
  updateCircuitProgress(circuitId, key);
  updateHomeRing(key);
}

function toggleWarmupExercise(exId, key) {
  if (!state.completedDays[key]) state.completedDays[key] = {};
  if (!state.completedDays[key].warmupExercises) state.completedDays[key].warmupExercises = {};

  const current = state.completedDays[key].warmupExercises[exId];
  state.completedDays[key].warmupExercises[exId] = !current;
  saveState();

  const card     = document.getElementById(`warmup-card-${exId}`);
  const checkbox = card?.querySelector('.custom-checkbox');
  const newVal   = state.completedDays[key].warmupExercises[exId];

  if (card)     card.classList.toggle('completed', newVal);
  if (checkbox) {
    checkbox.classList.toggle('checked', newVal);
    checkbox.setAttribute('aria-checked', newVal);
  }

  // Check if all warmup done
  checkWarmupCompletion(key);
  updateHomeRing(key);
}

function toggleCooldownExercise(exId, cooldownData, key) {
  if (!state.completedDays[key]) state.completedDays[key] = {};
  if (!state.completedDays[key].cooldownExercises) state.completedDays[key].cooldownExercises = {};

  const current = state.completedDays[key].cooldownExercises[exId];
  state.completedDays[key].cooldownExercises[exId] = !current;
  saveState();

  const card     = document.getElementById(`cooldown-card-${exId}`);
  const checkbox = card?.querySelector('.custom-checkbox');
  const newVal   = state.completedDays[key].cooldownExercises[exId];

  if (card)     card.classList.toggle('completed', newVal);
  if (checkbox) {
    checkbox.classList.toggle('checked', newVal);
    checkbox.setAttribute('aria-checked', newVal);
  }

  checkCooldownCompletion(cooldownData, key);
  updateHomeRing(key);
}

function toggleFinisherExercise(exId, key) {
  if (!state.completedDays[key]) state.completedDays[key] = {};
  if (!state.completedDays[key].finisherExercises) state.completedDays[key].finisherExercises = {};

  const current = state.completedDays[key].finisherExercises[exId];
  state.completedDays[key].finisherExercises[exId] = !current;
  saveState();

  const card     = document.getElementById(`fin-card-${exId}`);
  const checkbox = card?.querySelector('.custom-checkbox');
  const newVal   = state.completedDays[key].finisherExercises[exId];

  if (card)     card.classList.toggle('completed', newVal);
  if (checkbox) {
    checkbox.classList.toggle('checked', newVal);
    checkbox.setAttribute('aria-checked', newVal);
  }

  checkFinisherCompletion(key);
  updateHomeRing(key);
}

function toggleSundayGoal(index, key) {
  if (!key) key = getDayKey(0); // fallback to this week's Sunday
  if (!state.completedDays[key]) state.completedDays[key] = {};
  state.completedDays[key][`sunday_${index}`] = !state.completedDays[key][`sunday_${index}`];
  saveState();
  renderWorkout(); // re-render Sunday screen
}

/* --- Progress Checks --- */

function checkWarmupCompletion(key) {
  const warmupExercises = state.completedDays[key]?.warmupExercises || {};
  const done = Object.values(warmupExercises).filter(Boolean).length;
  const total = WARMUP_EXERCISES.length;

  // Update progress bar
  const fill  = document.getElementById('warmup-progress-fill');
  const label = document.getElementById('warmup-progress-label');
  if (fill)  fill.style.width  = `${(done/total)*100}%`;
  if (label) label.textContent = `${done}/${total}`;

  // Award XP once
  if (done === total && !state.completedDays[key]?.warmup) {
    if (!state.completedDays[key]) state.completedDays[key] = {};
    state.completedDays[key].warmup = true;
    awardXP(XP.WARMUP, 'Warmup Complete!');
    saveState();
    const banner = document.getElementById('warmup-xp-banner');
    if (banner) {
      banner.classList.add('awarded');
      banner.innerHTML = `<i class="fa-solid fa-star text-yellow-400"></i>+${XP.WARMUP} XP for completing warmup — Earned ✓`;
    }
  }
}

function checkCooldownCompletion(cooldownData, key) {
  const cooldownExercises = state.completedDays[key]?.cooldownExercises || {};
  const done  = Object.values(cooldownExercises).filter(Boolean).length;
  const total = cooldownData.length;

  const fill  = document.getElementById('cooldown-progress-fill');
  const label = document.getElementById('cooldown-progress-label');
  if (fill)  fill.style.width  = `${(done/total)*100}%`;
  if (label) label.textContent = `${done}/${total}`;

  if (done === total && !state.completedDays[key]?.cooldown) {
    if (!state.completedDays[key]) state.completedDays[key] = {};
    state.completedDays[key].cooldown = true;
    awardXP(XP.COOLDOWN, 'Cooldown Done!');
    saveState();
    const banner = document.getElementById('cooldown-xp-banner');
    if (banner) {
      banner.classList.add('awarded');
      banner.innerHTML = `<i class="fa-solid fa-star text-yellow-400"></i>+${XP.COOLDOWN} XP for completing cooldown — Earned ✓`;
    }
  }
}

function checkFinisherCompletion(key) {
  const finisherExercises = state.completedDays[key]?.finisherExercises || {};
  const done  = Object.values(finisherExercises).filter(Boolean).length;
  const total = DAILY_FINISHER.length;

  const fill = document.getElementById('finisher-progress-fill');
  if (fill) fill.style.width = `${(done/total)*100}%`;

  if (done === total && !state.completedDays[key]?.finisher) {
    if (!state.completedDays[key]) state.completedDays[key] = {};
    state.completedDays[key].finisher = true;
    awardXP(XP.FINISHER, 'Finisher Complete! 🔥');
    saveState();
  }
}

function updateCircuitProgress(circuitId, key) {
  const circuitData = Object.values(WORKOUTS)
    .filter(Boolean)
    .flatMap(w => w.circuits || [])
    .find(c => c.id === circuitId);

  if (!circuitData) return;

  const circuitExercises = (state.completedDays[key]?.circuitExercises || {})[circuitId] || {};
  const done  = Object.values(circuitExercises).filter(Boolean).length;
  const total = circuitData.exercises.length;
  const pct   = total ? (done / total) * 100 : 0;

  const fill = document.getElementById(`cpf-${circuitId}`);
  if (fill) fill.style.width = `${pct}%`;
}

function updateHomeRing(key) {
  if (currentPage !== 'home') return;
  const todayDow = new Date().getDay();
  const progress = getDayProgress(todayKey(), todayDow);
  setProgressRing('home-ring-circle', HOME_RING_CIRC, progress);
  document.getElementById('ring-percent').textContent = `${Math.round(progress * 100)}%`;
}

/* --- Complete Full Workout --- */

function completeWorkout(dayName, key) {
  if (state.completedDays[key]?.workout) return;

  if (!state.completedDays[key]) state.completedDays[key] = {};
  state.completedDays[key].workout = true;
  state.completedDays[key].date    = key;

  // Update streak
  updateStreak(key);

  // Award workout XP
  awardXP(XP.WORKOUT, 'WORKOUT COMPLETE! 🏆');

  state.totalWorkouts++;
  saveState();

  // Update button
  const btn = document.getElementById('complete-workout-btn');
  if (btn) {
    btn.disabled     = true;
    btn.innerHTML    = '🏆 Workout Completed!';
  }

  // Confetti!
  launchConfetti();

  // Update home ring
  updateHomeRing(key);
}

function completeSundayRecovery(key) {
  if (!key) key = getDayKey(0);
  if (state.completedDays[key]?.workout) return;

  if (!state.completedDays[key]) state.completedDays[key] = {};
  state.completedDays[key].workout = true;

  updateStreak(key);
  awardXP(50, 'Recovery Day Complete 🌿');
  state.totalWorkouts++;
  saveState();
  renderWorkout();
}

/* ============================================================
   8. XP & GAMIFICATION
   ============================================================ */

function awardXP(amount, message) {
  state.xp += amount;
  saveState();

  // Show toast
  showXPToast(`+${amount} XP · ${message}`, '⭐');

  // Check level up
  const newLevel = Math.floor(state.xp / XP_PER_LEVEL) + 1;
  if (newLevel > state.level) {
    state.level = newLevel;
    saveState();
    setTimeout(() => showLevelUpModal(newLevel), 1500);
  }

  // Update home badges if on home page
  if (currentPage === 'home') {
    document.getElementById('badge-xp').textContent = formatXP(state.xp);
    renderLevelBar();
  }
  document.getElementById('header-level-text').textContent = `Lv ${state.level}`;
}

function showXPToast(message, icon = '⭐') {
  const toast   = document.getElementById('xp-toast');
  const msgEl   = document.getElementById('xp-toast-msg');
  const iconEl  = document.getElementById('xp-toast-icon');

  msgEl.textContent  = message;
  iconEl.textContent = icon;
  toast.classList.add('show');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 2600);
}

function showLevelUpModal(level) {
  document.getElementById('levelup-new-level').textContent = level;
  document.getElementById('levelup-modal').classList.remove('hidden');
}

function updateStreak(key) {
  const today     = new Date(key);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = dateToKey(yesterday);

  if (state.completedDays[yesterdayKey]?.workout) {
    state.streak++;
  } else if (state.lastWorkoutDate !== key) {
    state.streak = 1;
  }

  if (state.streak > state.longestStreak) {
    state.longestStreak = state.streak;
  }
  state.lastWorkoutDate = key;
  saveState();

  // Update home badges
  if (currentPage === 'home') {
    document.getElementById('badge-streak').textContent = state.streak;
    document.getElementById('badge-best').textContent   = state.longestStreak;
  }
}

function getDayProgress(key, dow) {
  const dayState    = state.completedDays[key] || {};
  // dow defaults to actual today if not provided
  if (dow === undefined) dow = new Date().getDay();
  const dayName     = DAYS[dow];
  const workoutData = WORKOUTS[dayName];

  if (dayName === 'Sunday') {
    const done = [0,1,2,3].filter(i => dayState[`sunday_${i}`]).length;
    return done / 4;
  }

  if (!workoutData) return 0;

  let total = 0;
  let done  = 0;

  total += WARMUP_EXERCISES.length;
  done  += Object.values(dayState.warmupExercises || {}).filter(Boolean).length;

  workoutData.circuits.forEach(circuit => {
    const circEx = (dayState.circuitExercises || {})[circuit.id] || {};
    total += circuit.exercises.length;
    done  += Object.values(circEx).filter(Boolean).length;
  });

  total += workoutData.cooldown.length;
  done  += Object.values(dayState.cooldownExercises || {}).filter(Boolean).length;

  total += DAILY_FINISHER.length;
  done  += Object.values(dayState.finisherExercises || {}).filter(Boolean).length;

  return total ? Math.min(done / total, 1) : 0;
}

function formatXP(xp) {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
  return xp.toString();
}

/* ============================================================
   9. REST TIMER
   ============================================================ */

const timerState = {
  total:     60,
  remaining: 60,
  running:   false,
  interval:  null,
};

function timerToggle() {
  if (timerState.running) {
    timerPause();
  } else {
    timerStart();
  }
}

function timerStart() {
  if (timerState.remaining <= 0) {
    timerReset();
    return;
  }
  timerState.running = true;
  document.getElementById('timer-toggle-btn').innerHTML = '<i class="fa-solid fa-pause mr-2"></i>Pause';

  timerState.interval = setInterval(() => {
    timerState.remaining--;
    updateTimerDisplay();

    if (timerState.remaining <= 0) {
      timerStop();
      timerDone();
    }
  }, 1000);
}

function timerPause() {
  timerState.running = false;
  clearInterval(timerState.interval);
  document.getElementById('timer-toggle-btn').innerHTML = '<i class="fa-solid fa-play mr-2"></i>Resume';
}

function timerStop() {
  timerState.running = false;
  clearInterval(timerState.interval);
}

function timerReset() {
  timerStop();
  timerState.remaining = timerState.total;
  updateTimerDisplay();
  document.getElementById('timer-toggle-btn').innerHTML = '<i class="fa-solid fa-play mr-2"></i>Start';
}

function timerDone() {
  // Vibrate on mobile
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  document.getElementById('timer-toggle-btn').innerHTML = '<i class="fa-solid fa-check mr-2"></i>Done!';
  showXPToast('Rest complete! 💪', '⏱️');
}

function updateTimerDisplay() {
  document.getElementById('timer-display').textContent = timerState.remaining;
  // Update ring
  const circle = document.getElementById('timer-ring-circle');
  if (circle) {
    const pct    = timerState.remaining / timerState.total;
    const offset = TIMER_RING_CIRC * (1 - pct);
    circle.style.strokeDashoffset = offset;
  }
}

/* ============================================================
   10. NUTRITION PAGE
   ============================================================ */

const NUTRITION_FIELDS = [
  { id: 'protein',  label: 'Protein',   unit: 'g',    target: 170, min: 160, max: 180, color: '#22c55e', r: 28 },
  { id: 'calories', label: 'Calories',  unit: 'kcal', target: 2100, min: 2000, max: 2200, color: '#f59e0b', r: 28 },
  { id: 'water',    label: 'Water',     unit: 'L',    target: 4,   min: 3.5, max: 4.5, color: '#38bdf8', r: 28 },
  { id: 'fiber',    label: 'Fiber',     unit: 'g',    target: 40,  min: 35, max: 45, color: '#a78bfa', r: 28 },
  { id: 'sleep',    label: 'Sleep',     unit: 'h',    target: 8,   min: 7.5, max: 8.5, color: '#fb7185', r: 28 },
  { id: 'steps',    label: 'Steps',     unit: 'k',    target: 10,  min: 10, max: 15, color: '#34d399', r: 28 },
];

function renderNutrition() {
  const today    = todayKey();
  const nutData  = state.nutrition[today] || {};
  const grid     = document.getElementById('nutrition-grid');

  grid.innerHTML = NUTRITION_FIELDS.map(field => {
    const val     = nutData[field.id] || 0;
    const circ    = NUTRITION_RING_CIRC(field.r);
    const pct     = Math.min(val / field.target, 1);
    const offset  = circ * (1 - pct);
    const display = field.id === 'steps' ? (val / 1000).toFixed(1) : val;

    return `
      <div class="nutrition-card">
        <div class="nutrition-ring-wrap">
          <svg class="nutrition-ring-svg" viewBox="0 0 72 72" aria-hidden="true">
            <circle class="nutrition-track" cx="36" cy="36" r="${field.r}" />
            <circle class="nutrition-fill" cx="36" cy="36" r="${field.r}"
              style="stroke:${field.color};stroke-dasharray:${circ.toFixed(2)};stroke-dashoffset:${offset.toFixed(2)}"
              id="nut-ring-${field.id}" />
          </svg>
          <div class="nutrition-ring-val">
            <span class="nutrition-ring-number" style="color:${field.color}" id="nut-display-${field.id}">${display}</span>
            <span class="nutrition-ring-unit">${field.unit}</span>
          </div>
        </div>
        <div class="nutrition-label">${field.label}</div>
        <div class="nutrition-target">${field.min}–${field.max}${field.unit}</div>
        <div class="nutrition-input-wrap">
          <input
            type="number"
            id="nut-${field.id}"
            class="nutrition-input"
            value="${val || ''}"
            placeholder="0"
            min="0"
            step="${field.id === 'water' || field.id === 'sleep' ? 0.1 : 1}"
            aria-label="${field.label} intake"
            oninput="App.saveNutritionField('${field.id}')"
          />
        </div>
      </div>
    `;
  }).join('');

  // Load notes
  document.getElementById('daily-notes').value = state.notes[today] || '';
}

function updateNutritionRings() {
  const today   = todayKey();
  const nutData = state.nutrition[today] || {};

  NUTRITION_FIELDS.forEach(field => {
    const val    = nutData[field.id] || 0;
    const circ   = NUTRITION_RING_CIRC(field.r);
    const pct    = Math.min(val / field.target, 1);
    const offset = circ * (1 - pct);

    const ring    = document.getElementById(`nut-ring-${field.id}`);
    const display = document.getElementById(`nut-display-${field.id}`);

    if (ring)    ring.style.strokeDashoffset = offset.toFixed(2);
    if (display) display.textContent = field.id === 'steps' ? (val / 1000).toFixed(1) : val;
  });
}

/* ============================================================
   11. STATS PAGE
   ============================================================ */

function renderStats() {
  renderStatCards();
  renderHeatmap();
  renderWeeklyChart();
}

function renderStatCards() {
  const today = new Date();
  const grid  = document.getElementById('stats-grid');

  // Weekly completion
  const weeklyPct = getWeeklyCompletion(0);
  // Monthly completion
  const monthlyPct = getMonthlyCompletion();

  grid.innerHTML = `
    <div class="stat-card">
      <div class="stat-card-val" style="color:#22c55e">${state.streak}</div>
      <div class="stat-card-label">🔥 Current Streak</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-val" style="color:#f59e0b">${state.longestStreak}</div>
      <div class="stat-card-label">🏆 Longest Streak</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-val" style="color:#a78bfa">${state.xp.toLocaleString()}</div>
      <div class="stat-card-label">⭐ Total XP</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-val" style="color:#38bdf8">${state.level}</div>
      <div class="stat-card-label">⚡ Level</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-val" style="color:#34d399">${weeklyPct}%</div>
      <div class="stat-card-label">📅 This Week</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-val" style="color:#fb7185">${monthlyPct}%</div>
      <div class="stat-card-label">📆 This Month</div>
    </div>
  `;
}

function renderHeatmap() {
  const container = document.getElementById('heatmap-container');
  container.innerHTML = '';

  const today     = new Date();
  const todayTime = today.getTime();
  const weeksBack = 16;

  // Find first Monday of the range
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (weeksBack * 7));
  // Align to Monday
  const dayOfWeek = startDate.getDay();
  const daysToMon = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
  startDate.setDate(startDate.getDate() + daysToMon - 7);

  // Build columns (each column = one week Mon–Sun)
  for (let w = 0; w < weeksBack; w++) {
    const col = el('div', 'heatmap-col');
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(cellDate.getDate() + w * 7 + d);

      const cell = el('div', 'heatmap-cell');
      const key  = dateToKey(cellDate);

      if (cellDate > today) {
        cell.style.background = 'var(--border)';
        cell.style.opacity    = '0.3';
      } else {
        const completed = state.completedDays[key]?.workout;
        const progress  = getDayProgressForKey(key, cellDate);

        if (completed) {
          cell.style.background = '#22c55e';
          cell.title = `${key} ✓`;
        } else if (progress > 0.5) {
          cell.style.background = '#16a34a';
          cell.style.opacity    = '0.7';
          cell.title = `${key} ~${Math.round(progress*100)}%`;
        } else if (progress > 0) {
          cell.style.background = '#166534';
          cell.title = `${key} ~${Math.round(progress*100)}%`;
        } else {
          cell.style.background = '#1e293b';
          cell.title = key;
        }
      }

      col.appendChild(cell);
    }
    container.appendChild(col);
  }
}

function renderWeeklyChart() {
  const chart = document.getElementById('weekly-chart');
  chart.innerHTML = '';

  const today = new Date();

  for (let w = 7; w >= 0; w--) {
    const pct   = getWeeklyCompletion(w);
    const label = w === 0 ? 'Now' : `W-${w}`;

    const wrap = el('div', 'weekly-bar-wrap');
    wrap.innerHTML = `
      <div class="weekly-bar" style="height:${Math.max(pct, 4)}%" title="${pct}%"></div>
      <span class="weekly-bar-label">${label}</span>
    `;
    chart.appendChild(wrap);
  }
}

function getWeeklyCompletion(weeksAgo) {
  const today     = new Date();
  const weekStart = getMondayOfWeek(today, weeksAgo);
  let done = 0, total = 0;

  for (let d = 0; d < 7; d++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + d);
    if (day > today) break;

    // Sunday is rest — don't count as a missed workout
    if (day.getDay() === 0) continue;

    total++;
    if (state.completedDays[dateToKey(day)]?.workout) done++;
  }

  return total ? Math.round((done / total) * 100) : 0;
}

function getMonthlyCompletion() {
  const today = new Date();
  let done = 0, total = 0;

  for (let d = 1; d <= today.getDate(); d++) {
    const day = new Date(today.getFullYear(), today.getMonth(), d);
    if (day.getDay() === 0) continue;
    total++;
    if (state.completedDays[dateToKey(day)]?.workout) done++;
  }

  return total ? Math.round((done / total) * 100) : 0;
}

/* ============================================================
   12. HISTORY PAGE
   ============================================================ */

function renderHistory() {
  const offset    = state.historyOffset || 0;
  const today     = new Date();
  const weekStart = getMondayOfWeek(today, offset);
  const weekEnd   = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Disable next button at current week
  const nextBtn = document.getElementById('history-next-btn');
  if (nextBtn) nextBtn.style.opacity = offset === 0 ? '0.3' : '1';

  // Week label
  const weekNum = getWeekNumber(weekStart);
  document.getElementById('history-week-label').textContent = `Week ${weekNum}`;
  document.getElementById('history-week-dates').textContent =
    `${weekStart.getDate()} ${MONTHS[weekStart.getMonth()].slice(0,3)} – ${weekEnd.getDate()} ${MONTHS[weekEnd.getMonth()].slice(0,3)}`;

  // Day rows
  const grid = document.getElementById('history-week-grid');
  grid.innerHTML = '';

  const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  for (let d = 0; d < 7; d++) {
    const day    = new Date(weekStart);
    day.setDate(day.getDate() + d);
    const key    = dateToKey(day);
    const isFuture = day > today;
    const isToday  = key === todayKey();
    const isRest   = day.getDay() === 0;

    const row  = el('div', `history-day-row${!isFuture && state.completedDays[key]?.workout ? ' completed-day' : ''}${isRest ? ' rest-day' : ''}`);

    let checkHtml, statusText;

    if (isFuture) {
      checkHtml  = `<div class="history-day-check future"><i class="fa-regular fa-clock"></i></div>`;
      statusText = 'Upcoming';
    } else if (isRest) {
      checkHtml  = `<div class="history-day-check future">😴</div>`;
      statusText = 'Rest Day';
    } else if (state.completedDays[key]?.workout) {
      checkHtml  = `<div class="history-day-check done"><i class="fa-solid fa-check"></i></div>`;
      statusText = 'Completed ✓';
    } else {
      checkHtml  = `<div class="history-day-check missed"><i class="fa-solid fa-xmark"></i></div>`;
      statusText = isToday ? 'Today' : 'Missed';
    }

    const workoutName = isRest ? 'Recovery Day' :
      (WORKOUTS[dayNames[d]]?.subtitle || dayNames[d]);

    row.innerHTML = `
      ${checkHtml}
      <div class="history-day-info">
        <div class="history-day-name">${dayNames[d]}${isToday ? ' <span class="text-accent text-xs">(Today)</span>' : ''}</div>
        <div class="history-day-sub">${workoutName}</div>
      </div>
      <div class="text-xs ${state.completedDays[key]?.workout ? 'text-accent' : 'text-muted'}">${statusText}</div>
    `;

    grid.appendChild(row);
  }

  // Monthly summary
  const summary = document.getElementById('history-monthly-summary');
  const monthlyPct = getMonthlyCompletion();
  const weeklyPct  = getWeeklyCompletion(offset);

  summary.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-display font-bold text-sm text-accent">
        <i class="fa-solid fa-chart-pie mr-2"></i>Summary
      </h3>
    </div>
    <div class="flex gap-4">
      <div class="flex-1 text-center">
        <div class="font-display text-2xl font-bold text-accent">${weeklyPct}%</div>
        <div class="text-xs text-muted mt-1">This Week</div>
      </div>
      <div class="w-px bg-border"></div>
      <div class="flex-1 text-center">
        <div class="font-display text-2xl font-bold" style="color:#f59e0b">${monthlyPct}%</div>
        <div class="text-xs text-muted mt-1">This Month</div>
      </div>
      <div class="w-px bg-border"></div>
      <div class="flex-1 text-center">
        <div class="font-display text-2xl font-bold" style="color:#fb7185">${state.totalWorkouts}</div>
        <div class="text-xs text-muted mt-1">Total Done</div>
      </div>
    </div>
  `;
}

/* ============================================================
   13. CONFETTI ENGINE
   ============================================================ */

const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx    = confettiCanvas ? confettiCanvas.getContext('2d') : null;
let confettiParticles = [];
let confettiAnimation = null;

function launchConfetti() {
  if (!confettiCtx) return;

  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const colors = ['#22c55e','#4ade80','#facc15','#fb923c','#60a5fa','#f472b6','#a78bfa'];

  for (let i = 0; i < 120; i++) {
    confettiParticles.push({
      x:     Math.random() * confettiCanvas.width,
      y:     Math.random() * confettiCanvas.height * -0.5,
      w:     Math.random() * 10 + 5,
      h:     Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx:    (Math.random() - 0.5) * 4,
      vy:    Math.random() * 4 + 2,
      rot:   Math.random() * 360,
      rotV:  (Math.random() - 0.5) * 8,
      life:  1.0,
    });
  }

  if (confettiAnimation) cancelAnimationFrame(confettiAnimation);
  animateConfetti();
}

function animateConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiParticles = confettiParticles.filter(p => p.life > 0.01);

  confettiParticles.forEach(p => {
    p.x   += p.vx;
    p.y   += p.vy;
    p.vy  += 0.08; // gravity
    p.rot += p.rotV;
    p.life -= 0.012;

    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rot * Math.PI) / 180);
    confettiCtx.globalAlpha = p.life;
    confettiCtx.fillStyle   = p.color;
    confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    confettiCtx.restore();
  });

  if (confettiParticles.length > 0) {
    confettiAnimation = requestAnimationFrame(animateConfetti);
  } else {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

/* ============================================================
   14. UTILITIES
   ============================================================ */

// Create element with classes
function el(tag, cls = '') {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

// Create exercise card DOM element
function createExerciseCard(ex, checked, onToggle) {
  const card = el('div', `exercise-card${checked ? ' completed' : ''}`);
  card.innerHTML = `
    <div class="custom-checkbox${checked ? ' checked' : ''}"
         role="checkbox"
         aria-checked="${checked}"
         tabindex="0">
    </div>
    <div class="exercise-info">
      <div class="exercise-name">${ex.name}</div>
      <div class="exercise-meta">${ex.detail || ''}</div>
    </div>
  `;
  const checkbox = card.querySelector('.custom-checkbox');
  checkbox.addEventListener('click', onToggle);
  checkbox.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') onToggle();
  });
  return card;
}

// Get today's date key 'YYYY-MM-DD'
function todayKey() {
  return dateToKey(new Date());
}

// Get 'YYYY-MM-DD' for any given JS day-of-week (0=Sun…6=Sat) within the CURRENT week
function getDayKey(dayOfWeek) {
  const today = new Date();
  const todayDow = today.getDay();
  const diff = dayOfWeek - todayDow;
  const d = new Date(today);
  d.setDate(d.getDate() + diff);
  return dateToKey(d);
}

function dateToKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Get Monday of Nth week ago
function getMondayOfWeek(date, weeksAgo = 0) {
  const d    = new Date(date);
  d.setDate(d.getDate() - weeksAgo * 7);
  const dow  = d.getDay(); // 0=Sun, 1=Mon...
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ISO week number
function getWeekNumber(date) {
  const d      = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1  = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

// Get progression phase based on current date
function getCurrentProgressionPhase() {
  const today  = new Date();
  const msWeek = 7 * 24 * 60 * 60 * 1000;
  const weeks  = Math.floor((today - PROGRESSION_EPOCH) / msWeek);
  const idx    = ((weeks % 6) + 6) % 6;
  return PROGRESSION_WEEKS[idx];
}

// Set SVG progress ring offset
function setProgressRing(circleId, circumference, fraction) {
  const circle = document.getElementById(circleId);
  if (!circle) return;
  const offset = circumference * (1 - Math.max(0, Math.min(fraction, 1)));
  circle.style.strokeDashoffset = offset;
}

// Get day progress for arbitrary date+key (for stats/heatmap)
function getDayProgressForKey(key, date) {
  const dayState = state.completedDays[key];
  if (!dayState) return 0;
  if (dayState.workout) return 1;

  const dow = date.getDay();
  if (dow === 0) return 0;

  const dayName    = DAYS[dow];
  const workoutData = WORKOUTS[dayName];
  if (!workoutData) return 0;

  let total = WARMUP_EXERCISES.length + workoutData.cooldown.length + DAILY_FINISHER.length;
  workoutData.circuits.forEach(c => { total += c.exercises.length; });

  let done = 0;
  done += Object.values(dayState.warmupExercises   || {}).filter(Boolean).length;
  done += Object.values(dayState.cooldownExercises || {}).filter(Boolean).length;
  done += Object.values(dayState.finisherExercises || {}).filter(Boolean).length;
  Object.values(dayState.circuitExercises || {}).forEach(cEx => {
    done += Object.values(cEx).filter(Boolean).length;
  });

  return total ? Math.min(done / total, 1) : 0;
}

/* ============================================================
   15. APP INIT
   ============================================================ */

function init() {
  // Load persisted data
  loadState();

  // Set selected day to today
  selectedDayIndex = new Date().getDay();

  // Render initial page
  renderHome();

  // Set active nav
  document.querySelector('.nav-item[data-page="home"]').classList.add('active');
  document.querySelector('.nav-item[data-page="home"]').setAttribute('aria-current', 'page');

  // Update the day strip
  updateDayStrip();

  // Keyboard nav: allow tabbing through nav
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') btn.click();
    });
  });

  // Resize confetti canvas on orientation change
  window.addEventListener('resize', () => {
    confettiCanvas.width  = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  });

  // Close modals on overlay click
  document.getElementById('timer-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) App.closeTimer();
  });
  document.getElementById('levelup-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) App.closeLevelUpModal();
  });

  // Escape key closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      App.closeTimer();
      App.closeLevelUpModal();
    }
  });

  console.log('LEVEL UP initialized ⚡');
}

// Boot
document.addEventListener('DOMContentLoaded', init);
