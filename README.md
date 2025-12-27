# Scrtch 🧂🍞

**Scrtch** is a recipe app built around how people *actually* cook:
recipes evolve, timing matters, and context is everything.

Instead of treating recipes as static posts, Scrtch treats them as **living documents**: forkable, annotated, and usable in real kitchens.

---

## ✨ Core Ideas ✨

### Recipes are living documents

* Fork recipes instead of overwriting them
* Track lineage (what changed, and why)
* Keep private, unlisted, or public versions
* Trace variations back to an original

Think: *GitHub, but for family recipes and potlucks.*

---

### Make Mode (the heart of Scrtch)

Cooking isn’t scrolling.

Make Mode:

* Focuses on **one step at a time**
* Lets you mark steps done (with catch-up options)
* Supports **timers tied to steps**
* Suggests overlapping timers (e.g. “start icing in 20 minutes”)
* Keeps your hands off the screen as much as possible

Built for:

* Dough rises
* Rest periods
* “Do this while that bakes”

---

### Forking, not copying

When you fork a recipe:

* You create a new branch with its own notes and timing
* The original stays intact
* Forks can themselves be forked (with guardrails planned)

This supports:

* Dietary tweaks (nut-free, less sugar, spice level)
* Equipment differences (convection vs standard ovens)
* Event-specific variants (holiday, potluck, crowd size)

---

### Small, intentional social spaces

Scrtch is **not** a social feed.

Planned direction:

* Small hubs for events (e.g. holiday dinners, potlucks)
* Claim dishes, share prep notes, coordinate timing
* No follower economy, no algorithm

More “shared kitchen counter”, less “content platform”.

---

## Tech Stack (current)

* **React + TypeScript**
* **Vite**
* In-memory recipe store (for rapid iteration)
* React Router
* No backend yet (Firestore planned)

This repo intentionally prioritizes **UX exploration** over backend permanence.

---

## Current Status

Scrtch is in **active prototyping**.

Implemented:

* Recipe list & detail views
* Forking with lineage
* Make Mode with:

  * step completion
  * catch-up logic
  * multiple timers
  * overlapping timer suggestions

Next planned steps:

* Firestore persistence
* Recipe editor UI
* Fork confirmation flow (prevent fork-of-fork spam)
* Event / potluck hubs
* Snapshot sharing (read-only recipe states)

---

## Local Development

```bash
npm install
npm run dev
```

Runs locally at `http://localhost:5173`

---

## Philosophy

Scrtch is designed around:

* Cooking as process, not content
* Quiet tools over performative social features
* Respect for how recipes evolve over time

---
