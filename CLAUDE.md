# Always Fresh — Project Context for Claude Code

## What is this?
A mobile-first grocery freshness tracking webapp. Users scan or manually add groceries, the app tracks expiration dates, notifies them before things go bad, and suggests recipes based on what needs to be used first.

## Tech Stack
- **Framework:** React 19 + Vite 7
- **Styling:** Tailwind CSS v3
- **Routing:** React Router v7
- **Storage:** localStorage (no backend, no database for MVP)
- **AI:** Claude API (Vision for scan, text for recipe generation) — not yet integrated
- **Font:** DM Sans from Google Fonts
- **Hosting:** Netlify (auto-deploys from GitHub)

## Design Rules
- Mobile-first, always. Max-width 430px centered on desktop.
- Primary color: #16a34a (green-600)
- Always use the mockup HTML files in Mocks/ as the source of truth for UI
- Clean, minimal, card-based UI
- Bottom navigation always visible on main screens

## Folder Structure
```
src/
  pages/
    FirstLaunch.jsx      → name input on first visit
    Home.jsx             → expiring soon + recipe previews + scan button
    Pantry.jsx           → full inventory, color-coded urgency groups, mark as used, FAB
    Recipes.jsx          → recipe cards matched to pantry items + search bar
    AddItem.jsx          → manual form to add item (name*, category*, expiration*, notes)
    Camera.jsx           → full-screen camera + file upload fallback
    ScanResults.jsx      → AI results screen (mock), inline edit, confirm all
  components/
    BottomNav.jsx        → 3-tab nav (Home, Pantry, Recipes)
    AddItemSheet.jsx     → bottom sheet with 2 options: Manual Input or Scan Items
  store/
    pantry.js            → localStorage CRUD (getItems, addItem, markUsed) + seed data
  utils/
    pantryUtils.js       → daysLeft(), getUrgency(), formatExpiry()
    recipeData.js        → 12 recipe templates (id, title, emoji, triggers, steps)
    recipeGenerator.js   → generateRecipes() — scores recipes by pantry item matches
Mocks/                   → HTML mockup files for reference
```

## Data Model (localStorage)
```js
// User
localStorage.getItem('userName') // string

// Pantry items — key: 'alwaysfresh_pantry'
localStorage.getItem('alwaysfresh_pantry') // JSON array
[{
  item_id,          // auto-generated (Math.random hex)
  name,             // string - required
  category,         // string - required (Produce, Dairy, Meat, Bakery, Frozen, Pantry, Other)
  date_added,       // ISO date string YYYY-MM-DD - auto
  expiration_date,  // ISO date string YYYY-MM-DD - required
  status,           // "active" | "used_up"
  emoji,            // string - auto-assigned by category
  notes             // string - optional
}]
```

## Key Implementation Details
- **Local date handling:** Always store dates as YYYY-MM-DD via `localIso()` (uses getFullYear/getMonth/getDate). Parse with `new Date(y, m-1, d)` to avoid UTC offset bugs — never use `new Date('YYYY-MM-DD')`.
- **Urgency thresholds:** red ≤ 2 days, yellow 3–5 days, green 6+ days
- **Seed data:** Loaded on first run (when localStorage is empty): Strawberries (0d), Spinach (1d), Whole Milk (3d), Carrots (4d), Apples (7d), Cheddar Cheese (12d)
- **Recipe matching:** `generateRecipes(items, count, shuffle)` — scores RECIPE_TEMPLATES by substring-matching active pantry item names against trigger keywords. Only returns recipes with score > 0. count=null returns all matches.
- **FAB overlay pattern:** `fixed left-1/2 -translate-x-1/2 w-full max-w-[430px] pointer-events-none` wrapper + `pointer-events-auto` on button — keeps FAB aligned within 430px column on desktop.
- **Bottom sheet:** Always mounted (not conditionally rendered), opacity + translate-y transition, backdrop click closes.
- **Camera:** getUserMedia({ video: { facingMode: 'environment' } }), streamRef for cleanup. Falls back to file upload when camera unavailable. getUserMedia requires HTTPS on non-localhost (use ngrok for phone camera testing).

## Screen Flow
1. First visit → FirstLaunch (enter name) → Home
2. Home / Pantry FAB → "Scan Items" → Camera → ScanResults → confirm → Pantry
3. Home / Pantry FAB → "Add Manually" → AddItem form → Pantry
4. Home → "Expiring Soon" → See all → Pantry
5. Home → "Recommended Recipes" → Recipes
6. Pantry → mark item as used → removed from list

## Expiration Color Coding
- 🔴 Red: 0–2 days left
- 🟡 Yellow: 3–5 days left
- 🟢 Green: 6+ days left

## Categories
Produce, Dairy, Meat, Bakery, Frozen, Pantry, Other

## MVP Rules
- No backend, no auth, no accounts
- Binary inventory: active or used_up (no quantities)
- Push notifications: deferred
- Household sharing: deferred

## Claude API Usage (not yet integrated)
- **Scan:** Send image to Claude Vision, ask it to identify items and estimate expiration dates
- **Recipes:** Currently uses static template matching; Claude API integration is next
- API key will be stored in .env as VITE_CLAUDE_API_KEY (never commit this)

## Completed Phases
- ✅ Phase 1 — Foundation: routing, RequireAuth guard, FirstLaunch, placeholder pages, BottomNav, Tailwind + DM Sans setup
- ✅ Phase 2 — Pantry Dashboard: 3 urgency groups, ItemCard with color borders, mark-as-used, seed data, real localStorage store
- ✅ Phase 3 — Add Item flow: FAB bottom sheet (2 options), AddItem manual form, AddItemSheet component, "See all →" always visible on Home
- ✅ Phase 4 — Recipes screen: recipe cards matched to pantry items, search bar by ingredient, suggestion chips, expandable steps, shuffle/refresh
- ✅ Phase 5 — Scan flow: Camera screen (getUserMedia + file fallback), AnalyzingOverlay, ScanResults with mock items, inline editing, validation, confirm all → pantry

## Remaining Work
- [ ] Claude Vision API integration (replace mock items in ScanResults)
- [ ] Claude API recipe generation (replace static templates in recipeGenerator)
- [ ] RecipeDetail screen (full recipe view)
- [ ] Local push notifications for expiring items
- [ ] Deploy to Netlify

## Dev Server
```
npm run dev -- --host
# Network: http://192.168.0.89:5173 (phone + PC must be on same WiFi)
# For camera on phone: use ngrok for HTTPS tunnel
```
