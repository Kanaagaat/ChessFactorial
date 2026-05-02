# ♟ Tactical Scholar — Factorial Chess Academy

> **A modern chess platform where intellectual challenge meets competitive play.**
> Solve math problems to unlock your moves in the unique **Factorial Chess** mode.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.2-06B6D4?logo=tailwindcss)

---

## 🎯 What is Tactical Scholar?

Tactical Scholar is a **premium chess web application** that goes beyond traditional chess platforms by introducing **Factorial Chess** — a game mode where players must solve mental math challenges (factorials, powers, arithmetic) before each move is revealed on the board. Faster answers earn bonus time.

This isn't just another chess site. It's a platform designed for players who want to **train both their tactical chess skills and mental arithmetic** simultaneously.

### Who is this for?
- **Students** preparing for math competitions who want to practice under pressure
- **Chess enthusiasts** looking for a fresh competitive challenge
- **Developers and tech workers** who want a brain-training game that combines logic with strategy

---

## ✨ Features

### 🧠 Factorial Chess (Unique Mode)
- Solve math problems (factorials, powers, roots) before each move
- 3 difficulty levels for math challenges
- Time bonuses for fast answers
- Board is blurred until the math challenge is solved

### ♟ Full Chess Engine
- Complete rule validation (castling, en passant, pawn promotion, check/checkmate/stalemate)
- All draw conditions (threefold repetition, insufficient material, 50-move rule)
- Interactive board with legal move highlighting, capture rings, and check indicators
- Powered by **chess.js**

### 🤖 AI Opponent (4 Difficulty Levels)
- **Beginner** (~800 ELO) — For learning
- **Intermediate** (~1200 ELO) — Casual play
- **Advanced** (~1600 ELO) — Competitive
- **Master** (~2000 ELO) — Expert play
- Built-in minimax AI with alpha-beta pruning and piece-square tables

### 📊 AI Coach (Post-Game Analysis)
- Move-by-move analysis with classifications:
  - ✨ Brilliant, ⭐ Best, ✅ Good, 💡 Inaccuracy, ⚠️ Mistake, ❌ Blunder
- "Better move" suggestions for every suboptimal play
- Board navigation to replay any position
- Game summary with move distribution stats

### ⏱ Time Controls
- Bullet (1+0), Blitz (3+0, 3+2, 5+0), Rapid (10+0, 15+10)
- Visual timer with color transitions (green → amber → red pulse)

### 🏆 Leaderboard
- Global rankings with city-based filtering (Almaty, Astana, etc.)
- Win rate, rating trends, and rank badges (🥇🥈🥉)

### 🛍 Shop & Pro Features
- Piece skin marketplace (Classic, Neon, Royal Gold, etc.)
- **Tactical Scholar Pro** subscription ($4.99/mo):
  - Unlimited AI analysis
  - All premium skins
  - Advanced Factorial difficulty
  - Priority matchmaking

### 🔐 Authentication
- JWT-based login/register
- Session persistence with token refresh
- Protected routes with loading states

### 🎨 Design
- **Dark mode glassmorphism** aesthetic
- **Inter** (body) + **Playfair Display** (headings) typography
- Multi-radial gradient backgrounds
- Framer Motion animations throughout
- Fully responsive (mobile bottom nav, desktop sidebar)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 6 |
| Build | Vite 8 |
| Styling | TailwindCSS v4 |
| Animation | Framer Motion 12 |
| Routing | React Router DOM 7 |
| Chess Logic | chess.js |
| AI | Custom minimax with α-β pruning |
| Icons | Lucide React |
| Backend | Django REST + JWT (separate service) |

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/ChessFactorial.git
cd ChessFactorial/frontend/tactical-scholar

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

The app runs at `http://localhost:5173` by default.

> **Note:** The chess gameplay (AI, Factorial mode, analysis) works fully client-side.
> Authentication requires the Django backend running at `http://127.0.0.1:8000`.

---

## 📁 Project Structure

```
src/
├── engine/          # Chess logic, AI, and math problem generation
│   ├── chessEngine.ts    # chess.js wrapper
│   ├── evaluator.ts      # Minimax AI with piece-square tables
│   └── factorial.ts      # Math problem generator
├── hooks/           # Custom React hooks
│   ├── useChessGame.ts   # Game orchestration hook
│   └── useTimer.ts       # Chess clock hook
├── components/
│   ├── chess/       # Board, overlays, move list, player panels
│   ├── ui/          # Button, Card, Input, Modal, Avatar, Skeleton
│   ├── social/      # Friend item
│   └── history/     # History row
├── pages/           # 11 pages (Landing, Auth, Home, Play, Gameplay, Analysis, etc.)
├── layouts/         # MainLayout with sidebar + responsive nav
├── state/           # Global React Context (auth + app state)
├── api/             # Auth HTTP client
├── realtime/        # WebSocket client (simulated)
├── types/           # TypeScript domain models
└── lib/             # Utility functions
```

---

## 💡 Why Tactical Scholar?

Most chess platforms focus purely on the game. Tactical Scholar adds an **intellectual meta-layer** through Factorial Chess that:

1. **Creates a unique niche** — No other platform combines math challenges with chess
2. **Improves retention** — Players train two skills at once
3. **Enables monetization** — Pro features, piece skins, and advanced difficulty modes
4. **Scales socially** — City-based leaderboards create local competition

---

## 📝 License

MIT

---

*Built with ❤️ for nFactorial*
