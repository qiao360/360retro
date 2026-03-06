# 360retro

Collaborative retrospective tool. Real-time, no accounts.

## Stack

- **Frontend**: Vue 3 + TypeScript, Vite, Pinia, Vue Router, TailwindCSS, Socket.io-client
- **Backend**: Node.js + TypeScript, Express, Socket.io, in-memory storage
- **Shared**: `shared/types.ts` — single source of truth for all data types

## Structure

```
shared/types.ts        # All TypeScript interfaces
backend/src/
  index.ts             # Express + Socket.io server (port 3000)
  storage.ts           # In-memory StorageAdapter
  handlers.ts          # All socket event handlers
frontend/src/
  views/               # Page-level components (HomeView, RetroView)
  components/          # Reusable UI components
  stores/retro.ts      # Pinia store — mirrors server session state
  composables/useSocket.ts  # Socket.io lifecycle + event helpers
```

## Dev commands

```bash
pnpm install           # install all workspaces
pnpm dev               # start backend (:3000) + frontend (:5173)
pnpm --filter backend dev
pnpm --filter frontend dev
```

## Code style

- Keep components focused: one responsibility per file
- No `any` — use types from `shared/types.ts`
- Socket events are the source of truth; Pinia store only mirrors server state
- Backend handlers in `handlers.ts`, not in `index.ts`
- No database yet — `StorageAdapter` interface in `storage.ts` makes it swappable
