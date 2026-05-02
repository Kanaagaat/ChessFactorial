/**
 * Factorial Chess — Mental Task Overlay
 * Players must solve math problems before their moves are revealed
 */
import * as React from "react"
import { motion, useAnimation } from "framer-motion"
import { Input } from "../ui/Input"
import { cn } from "../../lib/utils"
import { Brain, Zap, Clock } from "lucide-react"
import type { MathProblem } from "../../engine/factorial"

export interface MentalTaskOverlayProps {
  isActive: boolean
  problem: MathProblem | null
  timeRemainingMs: number
  onSolve: (answer: string) => boolean
}

export function MentalTaskOverlay({ isActive, problem, timeRemainingMs, onSolve }: MentalTaskOverlayProps) {
  const [inputVal, setInputVal] = React.useState("")
  const [error, setError] = React.useState(false)
  const [streak, setStreak] = React.useState(0)
  const controls = useAnimation()
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus()
    } else if (!isActive) {
      setInputVal("")
      setError(false)
    }
  }, [isActive])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal) return

    const isCorrect = onSolve(inputVal)
    if (!isCorrect) {
      setError(true)
      setInputVal("")
      setStreak(0)
      await controls.start({
        x: [-12, 12, -12, 12, -6, 6, 0],
        transition: { duration: 0.4 },
      })
      inputRef.current?.focus()
    } else {
      setStreak((s) => s + 1)
      setError(false)
    }
  }

  const timePercent = problem ? Math.max(0, Math.min(100, (timeRemainingMs / problem.timeLimit) * 100)) : 0
  const isUrgent = timePercent < 30
  const isCritical = timePercent < 15

  if (!isActive || !problem) return null

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 backdrop-blur-lg bg-background/60 rounded-lg">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm p-8 rounded-2xl shadow-2xl border border-primary/20 bg-surface/95 backdrop-blur-xl flex flex-col items-center"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-4 h-4 text-primary" />
          <span className="uppercase tracking-[0.2em] text-[10px] font-semibold text-primary">
            Factorial Challenge
          </span>
          <Brain className="w-4 h-4 text-primary" />
        </div>

        {/* Difficulty badge */}
        <span className={cn(
          "text-[10px] px-2 py-0.5 rounded-full font-medium mb-4",
          problem.difficulty === "easy" && "bg-emerald-500/20 text-emerald-400",
          problem.difficulty === "medium" && "bg-amber-500/20 text-amber-400",
          problem.difficulty === "hard" && "bg-red-500/20 text-red-400",
        )}>
          {problem.difficulty.toUpperCase()}
        </span>

        {/* Problem display */}
        <div className="text-5xl font-bold font-serif text-text-primary mb-2">
          {problem.expression}
        </div>
        <div className="text-lg text-text-secondary mb-6">= ?</div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="w-full">
          <motion.div animate={controls}>
            <Input
              ref={inputRef}
              type="number"
              value={inputVal}
              onChange={(e) => { setInputVal(e.target.value); setError(false) }}
              placeholder="Your answer"
              className={cn(
                "text-center text-2xl font-bold h-14 bg-slate-900/70",
                error && "border-danger focus-visible:ring-danger text-danger animate-pulse"
              )}
              autoComplete="off"
            />
          </motion.div>
          {error && (
            <p className="text-center text-xs text-danger mt-2 animate-pulse">
              Wrong! Try again
            </p>
          )}
        </form>

        {/* Time bar */}
        <div className="w-full mt-6">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1 text-text-secondary">
              <Clock className="w-3 h-3" />
              <span className="text-xs font-mono">{Math.ceil(timeRemainingMs / 1000)}s</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 text-primary">
                <Zap className="w-3 h-3" />
                <span className="text-xs font-bold">{streak} streak</span>
              </div>
            )}
          </div>
          <div className="w-full h-2 bg-text-secondary/20 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full transition-colors",
                isCritical ? "bg-red-500" : isUrgent ? "bg-amber-500" : "bg-primary"
              )}
              style={{ width: `${timePercent}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </div>
        </div>

        {/* Hint */}
        <p className="text-[10px] text-text-secondary/60 mt-4 text-center">
          Solve to unlock your move • Fast answers earn time bonus
        </p>
      </motion.div>
    </div>
  )
}
