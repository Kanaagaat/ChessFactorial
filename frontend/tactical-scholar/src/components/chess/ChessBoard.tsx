/**
 * Interactive chess board component
 * Supports click-to-move, legal move highlights, last move, and check indicators
 */
import * as React from "react"
import type { Square, Move, Color } from "chess.js"
import type { BoardSquare } from "../../engine/chessEngine"
import { cn } from "../../lib/utils"

// Unicode chess pieces with proper rendering
const PIECE_MAP: Record<string, string> = {
  wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
  bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟",
}

interface ChessBoardProps {
  board: BoardSquare[][]
  selectedSquare: Square | null
  legalMoves: Move[]
  lastMove: { from: Square; to: Square } | null
  isCheck: boolean
  turn: Color
  flipped?: boolean
  disabled?: boolean
  onSquareClick: (square: Square) => void
}

export function ChessBoard({
  board,
  selectedSquare,
  legalMoves,
  lastMove,
  isCheck,
  turn,
  flipped = false,
  disabled = false,
  onSquareClick,
}: ChessBoardProps) {
  const legalTargets = React.useMemo(
    () => new Set(legalMoves.map((m) => m.to)),
    [legalMoves]
  )
  const captureTargets = React.useMemo(
    () => new Set(legalMoves.filter((m) => m.captured).map((m) => m.to)),
    [legalMoves]
  )

  // Find king square for check highlight
  const kingSquare = React.useMemo(() => {
    if (!isCheck) return null
    for (const row of board) {
      for (const cell of row) {
        if (cell.piece && cell.piece.type === "k" && cell.piece.color === turn) {
          return cell.square
        }
      }
    }
    return null
  }, [board, isCheck, turn])

  const renderBoard = React.useMemo(() => {
    const rows = flipped ? [...board].reverse() : board
    return rows.map((row) => {
      const cols = flipped ? [...row].reverse() : row
      return cols
    })
  }, [board, flipped])

  const files = flipped ? "hgfedcba" : "abcdefgh"
  const ranks = flipped ? "12345678" : "87654321"

  return (
    <div className="relative select-none">
      {/* Board container with border */}
      <div className="rounded-lg overflow-hidden shadow-2xl border-2 border-emerald-900/50">
        {/* Coordinates - top */}
        <div className="flex bg-slate-900/80">
          <div className="w-6" />
          {files.split("").map((f) => (
            <div key={f} className="flex-1 text-center text-[10px] text-emerald-400/60 font-mono py-0.5">
              {f}
            </div>
          ))}
          <div className="w-6" />
        </div>

        <div className="flex">
          {/* Coordinates - left */}
          <div className="flex flex-col bg-slate-900/80 w-6">
            {ranks.split("").map((r) => (
              <div key={r} className="flex-1 flex items-center justify-center text-[10px] text-emerald-400/60 font-mono">
                {r}
              </div>
            ))}
          </div>

          {/* Board grid */}
          <div className="grid grid-cols-8 aspect-square flex-1">
            {renderBoard.flatMap((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isDark = (cell.row + cell.col) % 2 === 1
                const isSelected = selectedSquare === cell.square
                const isLegalTarget = legalTargets.has(cell.square)
                const isCaptureTarget = captureTargets.has(cell.square)
                const isLastMoveSquare = lastMove?.from === cell.square || lastMove?.to === cell.square
                const isKingInCheck = kingSquare === cell.square
                const pieceKey = cell.piece ? `${cell.piece.color}${cell.piece.type.toUpperCase()}` : null

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    className={cn(
                      "relative flex items-center justify-center aspect-square transition-colors duration-75",
                      // Base colors
                      isDark
                        ? "bg-emerald-700/40 hover:bg-emerald-600/50"
                        : "bg-slate-700/30 hover:bg-slate-600/40",
                      // Selection
                      isSelected && "!bg-amber-500/50 ring-2 ring-inset ring-amber-400",
                      // Last move highlight
                      isLastMoveSquare && !isSelected && (isDark ? "!bg-amber-600/30" : "!bg-amber-400/25"),
                      // Check highlight
                      isKingInCheck && "!bg-red-600/60 ring-2 ring-inset ring-red-400 animate-pulse",
                      // Disabled
                      disabled && "pointer-events-none",
                    )}
                    onClick={() => onSquareClick(cell.square)}
                    aria-label={`${cell.square}${cell.piece ? ` ${cell.piece.color === "w" ? "white" : "black"} ${cell.piece.type}` : ""}`}
                  >
                    {/* Piece */}
                    {pieceKey && (
                      <span
                        className={cn(
                          "text-[min(6vw,3rem)] md:text-[min(5.5vw,3.5rem)] leading-none drop-shadow-lg transition-transform",
                          cell.piece!.color === "w"
                            ? "text-slate-100 [text-shadow:_0_2px_8px_rgba(0,0,0,0.5)]"
                            : "text-slate-900 [text-shadow:_0_1px_3px_rgba(255,255,255,0.15)]",
                          isSelected && "scale-110",
                        )}
                      >
                        {PIECE_MAP[pieceKey]}
                      </span>
                    )}

                    {/* Legal move dot */}
                    {isLegalTarget && !isCaptureTarget && !cell.piece && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[26%] h-[26%] rounded-full bg-emerald-400/40" />
                      </div>
                    )}

                    {/* Capture ring */}
                    {(isCaptureTarget || (isLegalTarget && cell.piece)) && (
                      <div className="absolute inset-[6%] rounded-full border-[3px] border-emerald-400/50" />
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Coordinates - right */}
          <div className="flex flex-col bg-slate-900/80 w-6">
            {ranks.split("").map((r) => (
              <div key={r} className="flex-1 flex items-center justify-center text-[10px] text-emerald-400/60 font-mono">
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* Coordinates - bottom */}
        <div className="flex bg-slate-900/80">
          <div className="w-6" />
          {files.split("").map((f) => (
            <div key={f} className="flex-1 text-center text-[10px] text-emerald-400/60 font-mono py-0.5">
              {f}
            </div>
          ))}
          <div className="w-6" />
        </div>
      </div>
    </div>
  )
}
