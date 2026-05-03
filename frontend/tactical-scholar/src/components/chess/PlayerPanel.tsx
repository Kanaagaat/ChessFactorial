import { Avatar } from "../ui/Avatar"
import { cn } from "../../lib/utils"
import { formatTime } from "../../hooks/useTimer"
import { Bot, User, Loader2 } from "lucide-react"

interface PlayerPanelProps {
  name: string
  rating?: number
  time: number
  isActive: boolean
  isAi?: boolean
  isThinking?: boolean
  capturedPieces?: string[]
  materialAdvantage?: number
  isTop?: boolean
}

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 }
const PIECE_DISPLAY: Record<string, string> = {
  p: "♟", n: "♞", b: "♝", r: "♜", q: "♛",
}

export function PlayerPanel({
  name,
  rating,
  time,
  isActive,
  isAi = false,
  isThinking = false,
  capturedPieces = [],
  materialAdvantage = 0,
  isTop = false,
}: PlayerPanelProps) {
  const isLowTime = time < 30000
  const isCritical = time < 10000

  // Sort captured pieces for display
  const sortedCaptures = [...capturedPieces].sort(
    (a, b) => (PIECE_VALUES[b] || 0) - (PIECE_VALUES[a] || 0)
  )

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 p-3 rounded-xl border transition-all duration-300",
        isActive
          ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border-soft bg-surface/50",
        isTop ? "flex-row" : "flex-row"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative">
          <Avatar fallback={name} size="sm" />
          {isAi && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <Bot className="w-2.5 h-2.5 text-slate-950" />
            </div>
          )}
          {!isAi && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-text-primary truncate">{name}</span>
            {rating && (
              <span className="text-xs font-semibold text-text-secondary bg-text-secondary/10 px-1.5 py-0.5 rounded">
                {rating}
              </span>
            )}
          </div>
          {/* Captured pieces */}
          <div className="flex items-center gap-0 mt-0.5 min-h-[18px]">
            {sortedCaptures.map((p, i) => (
              <span key={i} className="text-xs opacity-60">
                {PIECE_DISPLAY[p] || ""}
              </span>
            ))}
            {materialAdvantage > 0 ? (
              <span className="text-[10px] text-primary font-bold ml-1">+{materialAdvantage}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isThinking && (
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        )}
        <div
          className={cn(
            "font-mono text-lg font-bold px-3 py-1 rounded-lg min-w-[80px] text-center transition-all",
            isActive
              ? isCritical
                ? "bg-red-500/20 text-red-400 animate-pulse"
                : isLowTime
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-primary/15 text-primary"
              : "bg-text-secondary/10 text-text-secondary"
          )}
        >
          {formatTime(time)}
        </div>
      </div>
    </div>
  )
}
