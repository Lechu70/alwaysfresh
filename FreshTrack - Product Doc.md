# FreshTrack — Product Discovery Doc

## Vision

A mobile-first grocery companion that uses AI photo scanning (single items or full hauls) to build your pantry inventory, tracks freshness with smart expiration estimates, nudges you before things go bad, and helps you cook what needs to be used first.

---

## Core Features (Full Product)

### 1. Scan & Identify
- Photo input supports both single items and multi-item hauls (e.g. everything on the counter after shopping)
- AI identifies produce and assigns estimated days-to-expiration
- If uncertain → prompt user to label the item or confirm expiration date
- Always ask for clarification rather than guessing wrong

### 2. Pantry Dashboard
- List of current inventory, color-coded by urgency (green / yellow / red)
- Simple freshness indicator — starts with days-to-turning, later can add a color-coded slider for ripeness window
- Binary inventory for MVP: have it / don't have it (quantities deferred)

### 3. Consumption Tracking
- Manually mark items as "used up" — no re-scan needed for MVP
- Quantities deferred to post-MVP
- Future: household shared inventory

### 4. Notifications
- Push notifications when items hit yellow or red zone
- Dashboard always available to check manually

### 5. Recipe Suggestions
- On-demand (button tap, not automatic)
- Prioritizes items expiring soonest
- AI-generated recipes for MVP; recipe database integration deferred
- Future: dietary filters, cuisine preferences

---

## MVP Scope
App Name: Always Fresh

### In Scope
- [ ] Photo scan (single + multi-item) with AI identification
- [ ] Expiration estimate per item (days to turning)
- [ ] Clarification prompt when AI is uncertain (label or exp date)
- [ ] Pantry dashboard with color-coded urgency (green/yellow/red)
- [ ] Manual "mark as used" action
- [ ] Push notification when item hits yellow or red
- [ ] "Use This First" recipe suggestions (AI-generated, on demand)

### Out of Scope (Post-MVP)
- Quantity tracking
- Household / shared inventory
- Ripeness slider / advanced freshness view
- Recipe database integration
- Dietary / cuisine filters
- Re-scan to auto-update inventory
- Re-scan to detect consumption

---

## Data Model (Sketch)

Designed with future household support in mind — `user_id` on every item from day one so adding shared households later is additive, not a restructure.

```
User
  - user_id
  - name
  - household_id (nullable, for future)

PantryItem
  - item_id
  - user_id
  - name
  - category (produce, dairy, etc.)
  - date_added
  - expiration_estimate (date)
  - status (active / used_up)
  - photo_url (optional)
  - notes

Household (future)
  - household_id
  - name
  - members: [user_id]
```

---

## Tech Stack

- **Frontend:** React Native + Expo (Android first)
- **AI:** Claude Vision API (image recognition + recipe generation)
- **Storage:** Expo SQLite (local device only, no backend for MVP)
- **Auth:** Username input on first launch, stored locally (no login/accounts)
- **Notifications:** Expo Notifications (local push, no server needed)
- **Expiration data:** AI estimate by default; prompts user to enter printed date for packaged goods

---

## Conversation Log Summary

*Discovery session — [date]*

- App idea: AI-powered produce freshness tracker to reduce food waste
- Photo input: single item OR full haul scan, AI interprets, asks for clarification if needed
- Expiration logic: days-to-turning for MVP, visual slider later
- Inventory: binary (have / don't have) for MVP, quantities later
- Notifications: push + dashboard
- Recipes: AI-generated, prioritize soonest-expiring items, on-demand
- Household support: solo for MVP, architect DB for future sharing
- Platform: mobile first always
