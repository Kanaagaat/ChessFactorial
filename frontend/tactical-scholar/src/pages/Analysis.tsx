/**
 * Post-Game Analysis Page — AI Coach reviews your moves
 */
import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Chess, type Move } from "chess.js"
import { ChessBoard } from "../components/chess/ChessBoard"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import { createEngine } from "../engine/chessEngine"
import { classifyMove, evaluatePosition } from "../engine/evaluator"
import { cn } from "../lib/utils"
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  BarChart3, ArrowLeft, Lightbulb, Star, AlertTriangle, XCircle, Sparkles
} from "lucide-react"

interface MoveAnalysis {
  move: Move
  classification: string
  bestMove: string
  evalDiff: number
  eval: number
}

const CLASS_CONFIG: Record<string, { label: string; color: string; icon: typeof Star; bg: string }> = {
  brilliant: { label: "Brilliant", color: "text-cyan-400", icon: Sparkles, bg: "bg-cyan-500/10" },
  best: { label: "Best", color: "text-emerald-400", icon: Star, bg: "bg-emerald-500/10" },
  good: { label: "Good", color: "text-green-400", icon: Star, bg: "bg-green-500/10" },
  inaccuracy: { label: "Inaccuracy", color: "text-amber-400", icon: Lightbulb, bg: "bg-amber-500/10" },
  mistake: { label: "Mistake", color: "text-orange-400", icon: AlertTriangle, bg: "bg-orange-500/10" },
  blunder: { label: "Blunder", color: "text-red-400", icon: XCircle, bg: "bg-red-500/10" },
}

export function Analysis() {
  const location = useLocation()
  const navigate = useNavigate()
  const { moves } = (location.state as { moves?: Move[] }) || {}
  const [currentMoveIdx, setCurrentMoveIdx] = React.useState(-1)
  const [analysis, setAnalysis] = React.useState<MoveAnalysis[]>([])
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const engineRef = React.useRef(createEngine())

  // Replay engine for navigation
  const replayChess = React.useMemo(() => new Chess(), [])

  // Run analysis on mount
  React.useEffect(() => {
    if (!moves || moves.length === 0) return
    setIsAnalyzing(true)

    const results: MoveAnalysis[] = []
    const analyzeChess = new Chess()
    let isCancelled = false

    const runAnalysis = async () => {
      // Analyze each move
      for (let i = 0; i < moves.length; i++) {
        if (isCancelled) return
        const move = moves[i]
        const fen = analyzeChess.fen()

        try {
          // Dynamically import to ensure we have the async function available
          const { classifyMoveAsync } = await import("../engine/evaluator")
          const classification = await classifyMoveAsync(fen, move.san)
          const evalScore = evaluatePosition(analyzeChess) / 100
          results.push({
            move,
            classification: classification.classification,
            bestMove: classification.bestMove,
            evalDiff: classification.evalDiff,
            eval: evalScore,
          })
        } catch {
          results.push({
            move,
            classification: "good",
            bestMove: move.san,
            evalDiff: 0,
            eval: 0,
          })
        }

        analyzeChess.move(move.san)
        // Update state incrementally
        setAnalysis([...results])
      }
      setIsAnalyzing(false)
    }

    runAnalysis()

    return () => {
      isCancelled = true
    }
  }, [moves])

  // Navigate to specific move
  React.useEffect(() => {
    replayChess.reset()
    if (moves && currentMoveIdx >= 0) {
      for (let i = 0; i <= currentMoveIdx && i < moves.length; i++) {
        replayChess.move(moves[i].san)
      }
    }
    engineRef.current.loadFen(replayChess.fen())
  }, [currentMoveIdx, moves, replayChess])

  const boardState = engineRef.current.getState()

  const currentAnalysis = currentMoveIdx >= 0 && currentMoveIdx < analysis.length
    ? analysis[currentMoveIdx]
    : null

  // Summary stats
  const stats = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const a of analysis) {
      counts[a.classification] = (counts[a.classification] || 0) + 1
    }
    return counts
  }, [analysis])

  if (!moves || moves.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <BarChart3 className="w-12 h-12 mx-auto text-text-secondary mb-4" />
        <h2 className="font-serif text-2xl font-bold mb-2">No Game to Analyze</h2>
        <p className="text-text-secondary mb-6">Play a game first, then come here to review your moves.</p>
        <Button onClick={() => navigate("/play")}>Start a Game</Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/home")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h2 className="font-serif text-2xl font-bold text-text-primary flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Game Analysis
          </h2>
          <p className="text-sm text-text-secondary">
            {isAnalyzing ? "Analyzing moves..." : `${moves.length} moves analyzed`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Board */}
        <div className="lg:col-span-5">
          <div className="max-w-[400px] mx-auto">
            <ChessBoard
              board={boardState.board}
              selectedSquare={null}
              legalMoves={[]}
              lastMove={boardState.lastMove}
              isCheck={boardState.isCheck}
              turn={boardState.turn}
              disabled
              onSquareClick={() => {}}
            />
          </div>
          {/* Navigation */}
          <div className="flex justify-center gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setCurrentMoveIdx(-1)} disabled={currentMoveIdx < 0}>
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMoveIdx((i) => Math.max(-1, i - 1))} disabled={currentMoveIdx < 0}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="flex items-center px-3 text-sm text-text-secondary font-mono">
              {currentMoveIdx + 1} / {moves.length}
            </span>
            <Button variant="outline" size="sm" onClick={() => setCurrentMoveIdx((i) => Math.min(moves.length - 1, i + 1))} disabled={currentMoveIdx >= moves.length - 1}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMoveIdx(moves.length - 1)} disabled={currentMoveIdx >= moves.length - 1}>
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Analysis panel */}
        <div className="lg:col-span-7 space-y-4">
          {/* Current move info */}
          {currentAnalysis && (
            <Card className="card-elevated">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  {(() => {
                    const config = CLASS_CONFIG[currentAnalysis.classification] || CLASS_CONFIG.good
                    const Icon = config.icon
                    return (
                      <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg", config.bg)}>
                        <Icon className={cn("w-4 h-4", config.color)} />
                        <span className={cn("text-sm font-semibold", config.color)}>{config.label}</span>
                      </div>
                    )
                  })()}
                  <span className="font-mono text-lg font-bold">
                    {currentAnalysis.move.color === "w" ? `${Math.ceil((currentMoveIdx + 1) / 2)}.` : `${Math.ceil(currentMoveIdx / 2 + 1)}...`}
                    {currentAnalysis.move.san}
                  </span>
                </div>
                {currentAnalysis.classification !== "best" && currentAnalysis.classification !== "brilliant" && (
                  <p className="text-sm text-text-secondary">
                    <Lightbulb className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
                    Better move: <span className="font-mono font-semibold text-primary">{currentAnalysis.bestMove}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Move list with classifications */}
          <Card className="card-elevated max-h-[400px] overflow-y-auto">
            <CardContent className="p-4">
              <div className="space-y-1">
                {analysis.map((a, idx) => {
                  const config = CLASS_CONFIG[a.classification] || CLASS_CONFIG.good
                  const Icon = config.icon
                  const moveNum = Math.floor(idx / 2) + 1
                  const isWhite = a.move.color === "w"

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentMoveIdx(idx)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all text-left",
                        currentMoveIdx === idx ? "bg-primary/10 border border-primary/30" : "hover:bg-white/5"
                      )}
                    >
                      <span className="text-text-secondary text-xs w-8 font-mono">
                        {isWhite ? `${moveNum}.` : ""}
                      </span>
                      <Icon className={cn("w-3.5 h-3.5 shrink-0", config.color)} />
                      <span className="font-mono font-medium">{a.move.san}</span>
                      <span className={cn("text-[10px] ml-auto", config.color)}>{config.label}</span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {!isAnalyzing && analysis.length > 0 && (
            <Card className="card-elevated">
              <CardContent className="p-5">
                <h3 className="font-serif text-lg font-semibold mb-3">Summary</h3>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(CLASS_CONFIG).map(([key, config]) => {
                    const count = stats[key] || 0
                    if (count === 0) return null
                    const Icon = config.icon
                    return (
                      <div key={key} className={cn("rounded-lg p-3 text-center", config.bg)}>
                        <Icon className={cn("w-4 h-4 mx-auto mb-1", config.color)} />
                        <div className={cn("text-lg font-bold", config.color)}>{count}</div>
                        <div className="text-[10px] text-text-secondary">{config.label}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
