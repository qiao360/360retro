# 360retro

A lightweight, real-time collaborative retrospective tool. No accounts required.

![Board with columns, cards, groups, and votes]

## Features

- **Write cards** — add post-its to columns (Went Well, To Improve, Action Items)
- **Hide / Reveal** — cards are hidden by default so participants write independently; reveal all at once
- **Vote** — heart-vote on any card, one vote per person
- **Group** — merge related cards into named groups; votes aggregate at group level
- **Real-time** — all changes sync instantly across participants via WebSockets
- **No accounts** — enter a name on first visit, stored locally; no sign-up needed
- **Share by URL** — create a session, share the link, done

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

### Install & run

```bash
git clone <repo-url>
cd 360retro
pnpm install
pnpm dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## How to use

1. Open http://localhost:5173
2. Enter your name (stored in your browser, no account needed)
3. Type a session name → **Create session**
4. Share the URL with your team
5. Everyone adds cards to the columns
6. Click **Reveal all** when everyone is done writing
7. Group related cards, vote, discuss

### Card actions (hover a card → ··· menu)

| Action | Description |
|--------|-------------|
| Edit | Update the card text |
| Hide / Unhide | Toggle visibility for other participants |
| Start group | Select this card, then click another to merge |
| Delete | Remove the card |

### Group actions

| Action | Description |
|--------|-------------|
| Click title | Rename the group |
| ✕ | Dissolve the group (cards return to column) |
| Click group (in grouping mode) | Add the pending card to this group |

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | Vue 3, TypeScript, Vite, Pinia, Vue Router, TailwindCSS |
| Backend | Node.js, TypeScript, Express, Socket.io |
| Storage | In-memory (no database) |
| Monorepo | pnpm workspaces |

## Project structure

```
360retro/
├── shared/          # Shared TypeScript interfaces (Card, Session, Group…)
├── backend/
│   └── src/
│       ├── index.ts     # Express + Socket.io server
│       ├── storage.ts   # In-memory StorageAdapter (swappable)
│       └── handlers.ts  # All socket event handlers
└── frontend/
    └── src/
        ├── views/       # HomeView, RetroView
        ├── components/  # BoardColumn, PostItCard, CardGroup, VoteButton…
        ├── stores/      # Pinia store (session state)
        └── composables/ # useSocket, useIdentity, useGrouping
```

## Adding persistence

The backend uses a `StorageAdapter` interface in `backend/src/storage.ts`. To persist sessions, implement the interface against any database and swap it in `index.ts` — no frontend changes needed.

```typescript
interface StorageAdapter {
  getSession(id: string): Session | undefined
  saveSession(session: Session): void
}
```

## Scripts

```bash
pnpm dev        # Start backend + frontend (hot reload)
pnpm build      # Build both for production
```
