/**
 * Gameplay Page — Full chess game with AI, timers, Factorial mode
 */
import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ChessBoard } from "../components/chess/ChessBoard"
import { MentalTaskOverlay } from "../components/chess/MentalTaskOverlay"
import { MoveList } from "../components/chess/MoveList"
import { PlayerPanel } from "../components/chess/PlayerPanel"
import { PromotionDialog } from "../components/chess/PromotionDialog"
import { GameOverModal } from "../components/chess/GameOverModal"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { useChessGame, type GameConfig } from "../hooks/useChessGame"
import { useAppState } from "../state/AppStateProvider"
import { Flag, RotateCcw, Brain } from "lucide-react"

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 }

const DEFAULT_CONFIG: GameConfig = {
  mode: "standard",
  opponent: "ai",
  aiDifficulty: "medium",
  playerColor: "w",
  timeControl: 600000,
  increment: 0,
  mathDifficulty: "medium",
}

export function Gameplay() {
  const location = useLocation()
  const navigate = useNavigate()
  const { recordGame } = useAppState()
  const config: GameConfig = (location.state as { config?: GameConfig })?.config ?? DEFAULT_CONFIG

  const game = useChessGame(config)
  const [showGameOver, setShowGameOver] = React.useState(false)
  const gameSavedRef = React.useRef(false)

  // Auto-start game
  React.useEffect(() => {
    if (!game.gameStarted) {
      game.startGame()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Show game over modal & save game
  React.useEffect(() => {
    if (game.gameState.isGameOver && game.gameStarted) {
      // Save game to backend (only once)
      if (!gameSavedRef.current) {
        gameSavedRef.current = true
        const isPlayerWin = game.gameState.result === (config.playerColor === "w" ? "white" : "black")
        const isDraw = game.gameState.result === "draw"
        const backendResult = isDraw ? "draw" : isPlayerWin ? "win" : "loss"

        const AI_LEVEL_MAP: Record<string, number> = { easy: 1, medium: 2, hard: 3, master: 4 }

        recordGame({
          pgn: game.gameState.pgn || "1. e4 *",
          result: backendResult,
          mode: config.opponent === "ai" ? "ai" : "human",
          ai_level: config.opponent === "ai" ? AI_LEVEL_MAP[config.aiDifficulty] : undefined,
        })
      }

      const timer = window.setTimeout(() => setShowGameOver(true), 600)
      return () => window.clearTimeout(timer)
    }
  }, [game.gameState.isGameOver, game.gameStarted])

  const isFlipped = config.playerColor === "b"

  const topPlayerName = config.opponent === "ai"
    ? (isFlipped ? "You" : `AI (${config.aiDifficulty})`)
    : (isFlipped ? "White" : "Black")

  const bottomPlayerName = config.opponent === "ai"
    ? (isFlipped ? `AI (${config.aiDifficulty})` : "You")
    : (isFlipped ? "Black" : "White")

  const topTime = isFlipped ? game.timer.whiteTime : game.timer.blackTime
  const bottomTime = isFlipped ? game.timer.blackTime : game.timer.whiteTime
  const topColor = isFlipped ? "w" : "b"
  const bottomColor = isFlipped ? "b" : "w"

  const topCaptured = game.gameState.capturedPieces[topColor]
  const bottomCaptured = game.gameState.capturedPieces[bottomColor]

  const getMaterialScore = (pieces: string[]) => pieces.reduce((sum, p) => sum + (PIECE_VALUES[p] || 0), 0)
  const topMaterial = getMaterialScore(topCaptured)
  const bottomMaterial = getMaterialScore(bottomCaptured)
  const topMaterialAdvantage = Math.max(0, topMaterial - bottomMaterial)
  const bottomMaterialAdvantage = Math.max(0, bottomMaterial - topMaterial)

  return (
    <div className="h-screen w-screen bg-background p-3 md:p-6 overflow-hidden">
      <div className="h-full flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto">
        {/* Left sidebar - players + controls (desktop) */}
        <div className="hidden lg:flex flex-col gap-3 w-56 shrink-0">
          <PlayerPanel
            name={topPlayerName}
            time={topTime}
            isActive={game.timer.activeColor === topColor}
            isAi={config.opponent === "ai" && topColor !== config.playerColor}
            isThinking={game.isAiThinking && game.gameState.turn === topColor}
            capturedPieces={topCaptured}
            materialAdvantage={topMaterialAdvantage}
            isTop
          />

          <div className="flex-1" />

          {/* Game info */}
          {config.mode === "factorial" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Brain className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-violet-300 font-medium">Factorial Mode</span>
            </div>
          )}

          {/* Controls */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/play")}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> New
            </Button>
            <Button variant="danger" size="sm" className="text-xs text-white border-none" onClick={game.resign} disabled={game.gameState.isGameOver}>
              <Flag className="w-3.5 h-3.5 mr-1" /> Resign
            </Button>
          </div>

          <PlayerPanel
            name={bottomPlayerName}
            time={bottomTime}
            isActive={game.timer.activeColor === bottomColor}
            isAi={config.opponent === "ai" && bottomColor !== config.playerColor}
            isThinking={game.isAiThinking && game.gameState.turn === bottomColor}
            capturedPieces={bottomCaptured}
          />
        </div>

        {/* Center - Board */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          {/* Mobile top player */}
          <div className="lg:hidden w-full max-w-[min(90vw,500px)] mb-2">
            <PlayerPanel
              name={topPlayerName}
              time={topTime}
              isActive={game.timer.activeColor === topColor}
              isAi={config.opponent === "ai" && topColor !== config.playerColor}
              isThinking={game.isAiThinking && game.gameState.turn === topColor}
              capturedPieces={topCaptured}
              materialAdvantage={topMaterialAdvantage}
              isTop
            />
          </div>

          {/* Chess board wrapper */}
          <div className="relative w-full max-w-[min(80vh,600px)] mx-auto">
            <ChessBoard
              board={game.gameState.board}
              selectedSquare={game.selectedSquare}
              legalMoves={game.legalMoves}
              lastMove={game.gameState.lastMove}
              isCheck={game.gameState.isCheck}
              turn={game.gameState.turn}
              flipped={isFlipped}
              disabled={game.isAiThinking || game.isMathPhase || game.gameState.isGameOver}
              onSquareClick={game.handleSquareClick}
            />

            {/* Factorial overlay */}
            <MentalTaskOverlay
              isActive={game.isMathPhase}
              problem={game.mathProblem}
              timeRemainingMs={game.mathTimeRemaining}
              onSolve={game.solveMath}
            />

            {/* AI thinking indicator */}
            {game.isAiThinking && !game.isMathPhase && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-sm border border-border-soft rounded-full px-4 py-1.5 flex items-center gap-2 shadow-lg">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-text-secondary">AI thinking...</span>
              </div>
            )}
          </div>

          {/* Mobile bottom player */}
          <div className="lg:hidden w-full max-w-[min(90vw,500px)] mt-2">
            <PlayerPanel
              name={bottomPlayerName}
              time={bottomTime}
              isActive={game.timer.activeColor === bottomColor}
              isAi={config.opponent === "ai" && bottomColor !== config.playerColor}
              capturedPieces={bottomCaptured}
              materialAdvantage={bottomMaterialAdvantage}
            />
          </div>

          {/* Mobile controls */}
          <div className="lg:hidden flex gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/play")}>
              <RotateCcw className="w-4 h-4 mr-1" /> New
            </Button>
            <Button variant="danger" size="sm" className="text-white border-none" onClick={game.resign} disabled={game.gameState.isGameOver}>
              <Flag className="w-4 h-4 mr-1" /> Resign
            </Button>
          </div>
        </div>

        {/* Right sidebar - Move list */}
        <div className="hidden lg:flex w-60 shrink-0">
          <Card className="card-elevated flex-1 flex flex-col overflow-hidden">
            <MoveList moves={game.gameState.moveHistory} className="flex-1" />
          </Card>
        </div>
      </div>

      {/* Promotion dialog */}
      {game.promotionPending && (
        <PromotionDialog
          color={game.gameState.turn}
          onSelect={game.handlePromotion}
          onCancel={game.cancelPromotion}
        />
      )}

      {/* Game over modal */}
      <GameOverModal
        isOpen={showGameOver}
        result={game.gameState.result}
        reason={game.gameState.reason}
        playerColor={config.playerColor}
        onAnalyze={() => navigate("/analysis", { state: { pgn: game.gameState.pgn, moves: game.gameState.moveHistory } })}
        onRematch={() => {
          setShowGameOver(false)
          gameSavedRef.current = false
          game.startGame()
        }}
        onExit={() => navigate("/home")}
      />
    </div>
  )
}
