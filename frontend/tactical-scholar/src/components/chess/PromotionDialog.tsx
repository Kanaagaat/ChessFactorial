import type { PieceSymbol } from "chess.js"
import { cn } from "../../lib/utils"

const PROMO_PIECES: { type: PieceSymbol; symbol: string; label: string }[] = [
  { type: "q", symbol: "♛", label: "Queen" },
  { type: "r", symbol: "♜", label: "Rook" },
  { type: "b", symbol: "♝", label: "Bishop" },
  { type: "n", symbol: "♞", label: "Knight" },
]

interface PromotionDialogProps {
  color: "w" | "b"
  onSelect: (piece: PieceSymbol) => void
  onCancel: () => void
}

export function PromotionDialog({ color, onSelect, onCancel }: PromotionDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-surface card-elevated rounded-xl p-6 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-lg font-semibold text-text-primary">Promote Pawn</h3>
        <div className="flex gap-3">
          {PROMO_PIECES.map(({ type, symbol, label }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center text-4xl transition-all",
                "border border-border-soft hover:border-primary hover:bg-primary/10",
                "hover:scale-110 active:scale-95",
                color === "w"
                  ? "text-slate-100 [text-shadow:_0_2px_6px_rgba(0,0,0,0.5)]"
                  : "text-slate-900 [text-shadow:_0_1px_3px_rgba(255,255,255,0.2)]"
              )}
              title={label}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
