# LEVEL UP — Workout Tracker

A mobile-first fitness game that makes working out feel like leveling up in an RPG. Built with zero dependencies beyond CDN resources

## Features

### Gamification
- **XP System** — earn XP for warmup (+10), cooldown (+10), daily finisher (+20), and completing full workouts (+100)
- **Level System** — level up every 7 completed workout days
- **Streaks** — track current and longest streak
- **Confetti** — full confetti burst on workout completion
- **XP Toast** — animated XP gain notifications
- **Level Up Modal** — celebration screen when you reach a new level

### Smart Workout System
- **Auto-detects today's day** — opens the correct workout automatically
- **Full week of workouts** — Mon–Sat unique training programs; Sunday is a gamified recovery day
- **Warmup section** — 8-exercise pre-workout routine
- **Cooldown section** — day-specific stretches
- **Daily Finisher** — 5 exercises shown every workout day
- **Collapsible circuits** — clean UX for multi-circuit days
- **Rest timer** — floating overlay with 30/60/90s presets and SVG countdown ring

### Progression System (auto-rotates every 6 weeks)
| Week | Phase |
|------|-------|
| 1 | Learn Movement — focus on form |
| 2 | Increase Weight 5% |
| 3 | Add One Extra Set |
| 4 | Increase Weight Again |
| 5 | Deload — reduce volume 40% |
| 6 | Restart Heavier |

### Nutrition Dashboard
- Track Protein, Calories, Water, Fiber, Sleep, Steps
- Animated SVG progress rings per metric
- Daily notes field
- All data persists via localStorage

### Stats & History
- Weekly and monthly completion percentages
- GitHub-style activity heatmap (16 weeks)
- Weekly completion bar chart
- Full history with week navigation (Mon–Sun)

### Design
- Dark mode only (`#0f172a` background)
- Syne + DM Sans font pairing
- `#22c55e` accent with gradient effects
- Mobile-first, optimized for 390px, scales to desktop
- Sticky bottom navigation (5 tabs)
- Smooth page transitions and micro-animations

## Workout Schedule

| Day | Workout |
|-----|---------|
| Monday | Lower Body Strength + Conditioning |
| Tuesday | Upper Strength + Mobility |
| Wednesday | Athletic Conditioning + Core |
| Thursday | Lower Strength + Stability |
| Friday | Upper Strength + Conditioning |
| Saturday | Recovery + Mobility + Zone 2 |
| Sunday | Rest Day (gamified recovery) |

## Tech Stack

| Tool | Usage |
|------|-------|
| HTML5 | Structure, ARIA semantics |
| CSS3 | Animations, SVG rings, layout |
| Vanilla JS ES6 | All app logic, SPA routing |
| TailwindCSS CDN | Utility classes |
| Font Awesome | Icons |
| Google Fonts | Syne + DM Sans |
| localStorage | All data persistence |

## Deployment

### GitHub Pages

1. Fork or create a new repository
2. Upload all four files to the root:
   - `index.html`
   - `style.css`
   - `app.js`
   - `README.md`
3. Go to **Settings → Pages → Source → Deploy from branch → main / root**
4. Your app will be live at `https://yourusername.github.io/repo-name`

No build step. No npm. No config. It just works.

### Local Development

```bash
# Serve locally (any static server works)
npx serve .
# or
python3 -m http.server 3000
# then open http://localhost:3000
```

> Opening `index.html` directly as a `file://` URL works too — the app has no server-side dependencies.

## Data & Privacy

All data is stored locally in your browser via `localStorage` under the key `levelup_v1`. Nothing is sent to any server. Clear your browser data to reset the app.

## License

MIT — use it, fork it, make it yours.
