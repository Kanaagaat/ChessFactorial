import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/Button"
import { Trophy, Frown, Handshake, BarChart3, RotateCcw } from "lucide-react"
import type { GameResult, GameOverReason } from "../../engine/chessEngine"

interface GameOverModalProps {
  isOpen: boolean
  result: GameResult
  reason: GameOverReason
  playerColor: "w" | "b"
  onAnalyze: () => void
  onRematch: () => void
  onExit: () => void
}

const REASON_TEXT: Record<string, string> = {
  checkmate: "Checkmate",
  stalemate: "Stalemate",
  insufficient: "Insufficient Material",
  threefold: "Threefold Repetition",
  "fifty-move": "Fifty-Move Rule",
  timeout: "Time Out",
  resignation: "Resignation",
}

export function GameOverModal({ isOpen, result, reason, playerColor, onAnalyze, onRematch, onExit }: GameOverModalProps) {
  const isWin = result === (playerColor === "w" ? "white" : "black")
  const isLoss = result === (playerColor === "w" ? "black" : "white")

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              className="w-full max-w-sm bg-surface card-elevated rounded-2xl overflow-hidden"
            >
              {/* Result banner */}
              <div className={`p-8 text-center ${
                isWin ? "bg-gradient-to-b from-emerald-600/30 to-transparent" :
                isLoss ? "bg-gradient-to-b from-red-600/20 to-transparent" :
                "bg-gradient-to-b from-amber-600/20 to-transparent"
              }`}>
                <div className="mb-3">
                  {isWin && <Trophy className="w-12 h-12 mx-auto text-amber-400" />}
                  {isLoss && <Frown className="w-12 h-12 mx-auto text-red-400" />}
                  {!isWin && !isLoss && <Handshake className="w-12 h-12 mx-auto text-blue-400" />}
                </div>
                <h2 className="font-serif text-3xl font-bold text-text-primary">
                  {isWin ? "Victory!" : isLoss ? "Defeat" : "Draw"}
                </h2>
                <p className="mt-2 text-text-secondary text-sm">
                  {reason ? REASON_TEXT[reason] || reason : "Game Over"}
                </p>
              </div>

              {/* Actions */}
              <div className="p-6 space-y-3">
                <Button className="w-full" onClick={onAnalyze}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analyze Game
                </Button>
                <Button variant="outline" className="w-full" onClick={onRematch}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Rematch
                </Button>
                <Button variant="ghost" className="w-full" onClick={onExit}>
                  Back to Lobby
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
