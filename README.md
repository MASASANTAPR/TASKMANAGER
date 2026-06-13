# My Progress — Personal Dashboard

A complete personal dashboard for tracking finance, fitness, and tasks. Built with Next.js 14, Tailwind CSS, and Recharts. All data lives in `localStorage` — no backend, no account needed.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Customization

### Change accent color
Go to **Settings → Appearance → Accent Color** and pick from Indigo, Emerald, Violet, Rose, or Amber.

To add more colors, edit `src/lib/constants.ts` → `ACCENT_COLORS` array (look for the `// CUSTOMIZE:` comment), then add a matching entry in `src/lib/utils.ts` → `getAccentClasses`.

### Change currency
Go to **Settings → Profile → Currency** and select from the dropdown.

To add more currencies, edit `src/lib/constants.ts` → `CURRENCY_OPTIONS`.

### Change goals
Go to **Settings → Goals** and update your:
- Monthly Income Goal
- Monthly Savings Goal
- Weekly Workout Goal
- Weekly Task Goal

### Manage categories
Go to **Settings** to add/remove:
- Finance Categories
- Task Categories
- Workout Types

### Reset all data
Go to **Settings → Danger Zone → Clear All Data**.

This removes all `localStorage` keys: `mp_transactions`, `mp_workouts`, `mp_tasks`, `mp_goals`, `mp_settings`.

You can also reset manually in the browser console:
```js
['mp_transactions','mp_workouts','mp_tasks','mp_goals','mp_settings'].forEach(k => localStorage.removeItem(k))
location.reload()
```

## Default values
All defaults live in `src/lib/constants.ts`. Every array is marked with a `// CUSTOMIZE:` comment for easy searching.

## Tech Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** — utility-first styling, dark mode via `next-themes`
- **Recharts** — donut, bar, and line charts
- **lucide-react** — icons
- **date-fns** — date math and formatting
- **localStorage** — all persistence (no backend)
