/**
 * Play Setup Page — Choose game mode, AI difficulty, time control, and color
 */
import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import { cn } from "../lib/utils"
import {
  Brain, Swords, Zap, Timer, Crown, Shuffle,
  Clock, Bot, Users, ChevronRight,
} from "lucide-react"
import type { GameMode, GameConfig } from "../hooks/useChessGame"
import type { AIDifficulty } from "../engine/evaluator"
import type { MathDifficulty } from "../engine/factorial"

const GAME_MODES: { id: GameMode; label: string; icon: typeof Brain; desc: string; color: string }[] = [
  { id: "standard", label: "Standard Chess", icon: Swords, desc: "Classic chess with full rules", color: "emerald" },
  { id: "factorial", label: "Factorial Chess", icon: Brain, desc: "Solve math to unlock moves", color: "violet" },
]

const AI_LEVELS: { id: AIDifficulty; label: string; desc: string; elo: string }[] = [
  { id: "easy", label: "Beginner", desc: "For learning", elo: "~800" },
  { id: "medium", label: "Intermediate", desc: "Casual play", elo: "~1200" },
  { id: "hard", label: "Advanced", desc: "Competitive", elo: "~1600" },
  { id: "master", label: "Master", desc: "Expert play", elo: "~2000" },
]

const TIME_CONTROLS: { label: string; time: number; increment: number; category: string }[] = [
  { label: "1+0", time: 60000, increment: 0, category: "Bullet" },
  { label: "3+0", time: 180000, increment: 0, category: "Blitz" },
  { label: "3+2", time: 180000, increment: 2000, category: "Blitz" },
  { label: "5+0", time: 300000, increment: 0, category: "Blitz" },
  { label: "10+0", time: 600000, increment: 0, category: "Rapid" },
  { label: "15+10", time: 900000, increment: 10000, category: "Rapid" },
]

const MATH_LEVELS: { id: MathDifficulty; label: string; desc: string }[] = [
  { id: "easy", label: "Easy", desc: "Simple arithmetic & small factorials" },
  { id: "medium", label: "Medium", desc: "Larger factorials & powers" },
  { id: "hard", label: "Hard", desc: "Complex expressions" },
]

export function PlaySetup() {
  const navigate = useNavigate()
  const [mode, setMode] = React.useState<GameMode>("standard")
  const [opponent, setOpponent] = React.useState<"ai" | "local">("ai")
  const [difficulty, setDifficulty] = React.useState<AIDifficulty>("medium")
  const [timeIdx, setTimeIdx] = React.useState(3) // 5+0
  const [color, setColor] = React.useState<"w" | "b" | "random">("w")
  const [mathDiff, setMathDiff] = React.useState<MathDifficulty>("medium")

  const handleStart = () => {
    const tc = TIME_CONTROLS[timeIdx]
    const playerColor = color === "random" ? (Math.random() < 0.5 ? "w" : "b") : color

    const config: GameConfig = {
      mode,
      opponent,
      aiDifficulty: difficulty,
      playerColor,
      timeControl: tc.time,
      increment: tc.increment,
      mathDifficulty: mathDiff,
    }

    navigate("/gameplay", { state: { config } })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-text-primary">New Game</h2>
        <p className="text-text-secondary mt-1">Configure your match</p>
      </div>

      {/* Game Mode */}
      <Card className="card-elevated">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" /> Game Mode
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GAME_MODES.map((m) => {
              const Icon = m.icon
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "text-left p-4 rounded-xl border transition-all",
                    mode === m.id
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                      : "border-border-soft hover:border-text-secondary/40 hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={cn("w-5 h-5", mode === m.id ? "text-primary" : "text-text-secondary")} />
                    <span className="font-semibold text-sm">{m.label}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{m.desc}</p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Opponent */}
      <Card className="card-elevated">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Opponent
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setOpponent("ai")}
              className={cn(
                "p-4 rounded-xl border transition-all text-center",
                opponent === "ai" ? "border-primary bg-primary/10" : "border-border-soft hover:bg-white/5"
              )}
            >
              <Bot className={cn("w-6 h-6 mx-auto mb-1", opponent === "ai" ? "text-primary" : "text-text-secondary")} />
              <span className="text-sm font-medium">vs AI</span>
            </button>
            <button
              onClick={() => setOpponent("local")}
              className={cn(
                "p-4 rounded-xl border transition-all text-center",
                opponent === "local" ? "border-primary bg-primary/10" : "border-border-soft hover:bg-white/5"
              )}
            >
              <Users className={cn("w-6 h-6 mx-auto mb-1", opponent === "local" ? "text-primary" : "text-text-secondary")} />
              <span className="text-sm font-medium">Local 2P</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* AI Difficulty */}
      {opponent === "ai" && (
        <Card className="card-elevated">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" /> AI Difficulty
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {AI_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setDifficulty(level.id)}
                  className={cn(
                    "p-3 rounded-xl border transition-all text-left",
                    difficulty === level.id ? "border-primary bg-primary/10" : "border-border-soft hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{level.label}</span>
                    <span className="text-[10px] text-text-secondary bg-text-secondary/10 px-1.5 py-0.5 rounded">
                      {level.elo}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">{level.desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Control */}
      <Card className="card-elevated">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Time Control
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {TIME_CONTROLS.map((tc, idx) => (
              <button
                key={tc.label}
                onClick={() => setTimeIdx(idx)}
                className={cn(
                  "p-3 rounded-xl border transition-all text-center",
                  timeIdx === idx ? "border-primary bg-primary/10" : "border-border-soft hover:bg-white/5"
                )}
              >
                <div className="font-mono font-bold text-sm">{tc.label}</div>
                <div className="text-[10px] text-text-secondary">{tc.category}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Selection (AI only) */}
      {opponent === "ai" && (
        <Card className="card-elevated">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" /> Play As
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "w" as const, label: "White", icon: "♔" },
                { id: "random" as const, label: "Random", icon: "?" },
                { id: "b" as const, label: "Black", icon: "♚" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={cn(
                    "p-4 rounded-xl border transition-all text-center",
                    color === c.id ? "border-primary bg-primary/10" : "border-border-soft hover:bg-white/5"
                  )}
                >
                  <div className="text-3xl mb-1">
                    {c.id === "random" ? <Shuffle className="w-7 h-7 mx-auto text-text-secondary" /> : c.icon}
                  </div>
                  <span className="text-xs font-medium">{c.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Math Difficulty (Factorial mode only) */}
      {mode === "factorial" && (
        <Card className="card-elevated border-violet-500/20">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" /> Math Difficulty
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {MATH_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setMathDiff(level.id)}
                  className={cn(
                    "p-3 rounded-xl border transition-all text-center",
                    mathDiff === level.id ? "border-violet-400 bg-violet-500/10" : "border-border-soft hover:bg-white/5"
                  )}
                >
                  <span className="font-medium text-sm block">{level.label}</span>
                  <span className="text-[10px] text-text-secondary">{level.desc}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start Button */}
      <Button size="lg" className="w-full text-lg h-14" onClick={handleStart}>
        {mode === "factorial" && <Brain className="w-5 h-5 mr-2" />}
        {mode === "standard" && <Swords className="w-5 h-5 mr-2" />}
        Start Game
        <ChevronRight className="w-5 h-5 ml-1" />
      </Button>
    </div>
  )
}
