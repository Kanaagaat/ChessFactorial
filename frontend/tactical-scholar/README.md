# Tactical Scholar UI System

Premium academic chess UI with a real-time-ready frontend architecture.

## Design Tokens

- **Background**: `#FDFDFB`
- **Surface**: `#F4F1EA`
- **Primary Accent**: `#2E7D32`
- **Text Primary**: `#101820`
- **Text Secondary**: `#6D7781`
- **Danger/Urgent**: `#BF360C`

### Rules

- Green communicates action, active state, and success.
- Orange/red communicates urgency, countdown pressure, and errors.
- Beige surfaces are used for cards, panels, and modals.
- Typography uses serif headlines with Inter body copy.
- Spacing follows an 8px rhythm.

## Core Product Areas

- Landing page with "Master the Mind" hero and academy framing.
- Auth with login/register modes and validation feedback.
- Main app shell with desktop sidebar + mobile bottom nav.
- Home lobby with game slot cards, private PIN modal, and rating widget.
- Factorial gameplay with Math Phase overlay + Move Phase board unlock.
- Friends, History, Create, and Profile pages.

## Reusable Component System

- `components/chess/GameSlotCard.tsx`
- `components/social/FriendItem.tsx`
- `components/history/HistoryRow.tsx`
- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/ui/Modal.tsx`
- `components/ui/EmptyState.tsx`
- `components/ui/Skeleton.tsx`

Each component supports interactive states (default, hover, active, disabled) and error/urgent visual treatment where relevant.

## Realtime + State Architecture

- `state/AppStateProvider.tsx`: global app store/context.
- `realtime/socketClient.ts`: websocket abstraction (mock connection lifecycle now, drop-in replacement later).
- `types/domain.ts`: shared product domain types.

This enables straightforward integration with backend events:

- `lobby:update`
- `invite:received`
- `match:started`
- `match:ended`
- `presence:update`

## Run

- `npm install`
- `npm run dev`
