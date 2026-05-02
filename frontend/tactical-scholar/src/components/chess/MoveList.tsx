import type { Move } from "chess.js"
import { cn } from "../../lib/utils"

interface MoveListProps {
  moves: Move[]
  className?: string
}

export function MoveList({ moves, className }: MoveListProps) {
  const pairs: { num: number; white: Move; black?: Move }[] = []

  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    })
  }

  return (
    <div className={cn("flex flex-col overflow-hidden", className)}>
      <div className="px-4 py-3 border-b border-border-soft font-serif font-semibold text-sm flex items-center gap-2">
        <span>Move History</span>
        <span className="text-xs font-sans font-normal text-text-secondary bg-primary/10 rounded-full px-2 py-0.5">
          {moves.length} moves
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-sm font-mono">
        {pairs.length === 0 && (
          <div className="text-center text-text-secondary text-xs py-6">No moves yet</div>
        )}
        {pairs.map((pair, index) => (
          <div
            key={pair.num}
            className={cn(
              "flex items-center py-1.5 px-2 rounded-md transition-colors",
              index === pairs.length - 1 ? "bg-primary/10" : "hover:bg-white/5"
            )}
          >
            <span className="text-text-secondary w-8 text-xs">{pair.num}.</span>
            <span className={cn("w-16", getMoveClass(pair.white))}>{pair.white.san}</span>
            <span className={cn("w-16", pair.black && getMoveClass(pair.black))}>
              {pair.black?.san ?? "..."}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function getMoveClass(move: Move): string {
  if (move.san.includes("#")) return "text-red-400 font-bold"
  if (move.san.includes("+")) return "text-amber-400"
  if (move.captured) return "text-primary"
  return "text-text-primary"
}
