/**
 * Main chess game hook — orchestrates engine, AI, timers, and Factorial mode
 */
import * as React from "react"
import type { Square, Move, PieceSymbol, Color } from "chess.js"
import { createEngine, type ChessEngine, type GameState } from "../engine/chessEngine"
import { type AIDifficulty } from "../engine/evaluator"
import { generateProblem, getTimeBonus, type MathProblem, type MathDifficulty } from "../engine/factorial"
import { useTimer, type TimerState } from "./useTimer"

export type GameMode = "standard" | "factorial"
export type OpponentType = "ai" | "local"

export interface GameConfig {
  mode: GameMode
  opponent: OpponentType
  aiDifficulty: AIDifficulty
  playerColor: Color
  timeControl: number   // milliseconds
  increment: number     // milliseconds
  mathDifficulty: MathDifficulty
}

export interface ChessGameState {
  gameState: GameState
  timer: TimerState & {
    isTimeout: boolean
    timeoutColor: Color | null
  }
  selectedSquare: Square | null
  legalMoves: Move[]
  isAiThinking: boolean
  mathProblem: MathProblem | null
  isMathPhase: boolean
  mathTimeRemaining: number
  gameStarted: boolean
  gameConfig: GameConfig
  promotionPending: { from: Square; to: Square } | null
}

const DEFAULT_CONFIG: GameConfig = {
  mode: "standard",
  opponent: "ai",
  aiDifficulty: "medium",
  playerColor: "w",
  timeControl: 600000,  // 10 min
  increment: 0,
  mathDifficulty: "medium",
}

export function useChessGame(config: Partial<GameConfig> = {}) {
  const gameConfig = React.useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config])
  const engineRef = React.useRef<ChessEngine>(createEngine())
  const [gameState, setGameState] = React.useState<GameState>(engineRef.current.getState())
  const [selectedSquare, setSelectedSquare] = React.useState<Square | null>(null)
  const [legalMoves, setLegalMoves] = React.useState<Move[]>([])
  const [isAiThinking, setIsAiThinking] = React.useState(false)
  const [isMathPhase, setIsMathPhase] = React.useState(false)
  const [mathProblem, setMathProblem] = React.useState<MathProblem | null>(null)
  const [mathTimeRemaining, setMathTimeRemaining] = React.useState(0)
  const [gameStarted, setGameStarted] = React.useState(false)
  const [promotionPending, setPromotionPending] = React.useState<{ from: Square; to: Square } | null>(null)
  const mathStartTimeRef = React.useRef(0)
  const mathIntervalRef = React.useRef<number | null>(null)
  const aiWorkerRef = React.useRef<Worker | null>(null)
  const makeAiMoveRef = React.useRef<() => void>(() => {})

  const timer = useTimer(gameConfig.timeControl, gameConfig.increment)

  const syncState = React.useCallback(() => {
    setGameState(engineRef.current.getState())
  }, [])

  const isPlayerTurn = React.useCallback(() => {
    const state = engineRef.current.getState()
    if (gameConfig.opponent === "local") return true
    return state.turn === gameConfig.playerColor
  }, [gameConfig.opponent, gameConfig.playerColor])

  const startMathPhase = React.useCallback(() => {
    if (gameConfig.mode !== "factorial") return
    const problem = generateProblem(gameConfig.mathDifficulty)
    setMathProblem(problem)
    setMathTimeRemaining(problem.timeLimit)
    setIsMathPhase(true)
    mathStartTimeRef.current = Date.now()

    if (mathIntervalRef.current) clearInterval(mathIntervalRef.current)
    mathIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - mathStartTimeRef.current
      const remaining = Math.max(0, problem.timeLimit - elapsed)
      setMathTimeRemaining(remaining)
      if (remaining <= 0) {
        if (mathIntervalRef.current) clearInterval(mathIntervalRef.current)
        setIsMathPhase(false)
        setMathProblem(null)

        // Penalty: force a random legal move
        const state = engineRef.current.getState()
        if (!state.isGameOver) {
          const chess = engineRef.current.getRawChess()
          const moves = chess.moves({ verbose: true })
          if (moves.length > 0) {
            const random = moves[Math.floor(Math.random() * moves.length)]
            engineRef.current.makeMove(random.from, random.to, random.promotion)
            syncState()
            // Deduct 3 seconds as additional penalty
            timer.addTime(state.turn, -3000)
            const newState = engineRef.current.getState()
            if (newState.isGameOver) {
              timer.pause()
            } else {
              timer.switchTurn(newState.turn)
              // If AI, trigger AI response
              if (gameConfig.opponent === "ai" && newState.turn !== gameConfig.playerColor) {
                makeAiMoveRef.current()
              }
            }
          }
        }
      }
    }, 100)
  }, [gameConfig.mode, gameConfig.mathDifficulty, gameConfig.opponent, gameConfig.playerColor, syncState, timer])

  const processAiResult = React.useCallback((result: { move: string; evaluation: number }) => {
    const currentState = engineRef.current.getState()
    if (currentState.isGameOver) {
      setIsAiThinking(false)
      return
    }

    if (result.move) {
      const chess = engineRef.current.getRawChess()
      const verbose = chess.moves({ verbose: true }).find((m) => m.san === result.move)
      if (verbose) {
        engineRef.current.makeMove(verbose.from, verbose.to, verbose.promotion)
      } else {
        chess.move(result.move)
      }
      syncState()
      const newState = engineRef.current.getState()
      if (!newState.isGameOver) {
        timer.switchTurn(newState.turn)
        if (gameConfig.mode === "factorial") {
          startMathPhase()
        }
      } else {
        timer.pause()
      }
    }
    setIsAiThinking(false)
  }, [gameConfig.mode, syncState, timer, startMathPhase])

  const makeAiMove = React.useCallback(async () => {
    const state = engineRef.current.getState()
    if (state.isGameOver) return

    setIsAiThinking(true)
    const worker = aiWorkerRef.current
    if (worker) {
      worker.postMessage({ fen: state.fen, difficulty: gameConfig.aiDifficulty })
      return
    }

    try {
      // Import dynamically or assume it's imported at the top (we need to ensure it's imported)
      // Actually we must import it at the top of the file. I will do a separate replace for imports if needed.
      const { findBestMoveAsync } = await import("../engine/evaluator")
      const result = await findBestMoveAsync(state.fen, gameConfig.aiDifficulty)
      
      const currentState = engineRef.current.getState()
      if (currentState.isGameOver) {
        setIsAiThinking(false)
        return
      }
      processAiResult(result)
    } catch (e) {
      console.error(e)
      setIsAiThinking(false)
    }
  }, [gameConfig.aiDifficulty, processAiResult])

  React.useEffect(() => {
    makeAiMoveRef.current = makeAiMove
  }, [makeAiMove])

  const solveMath = React.useCallback((answer: string): boolean => {
    if (!mathProblem) return false
    const numAnswer = parseInt(answer, 10)
    if (numAnswer === mathProblem.answer) {
      if (mathIntervalRef.current) clearInterval(mathIntervalRef.current)
      // Calculate time bonus
      const solveTime = Date.now() - mathStartTimeRef.current
      const bonus = getTimeBonus(solveTime, mathProblem.timeLimit)
      if (bonus > 0) {
        const state = engineRef.current.getState()
        timer.addTime(state.turn, bonus)
      }
      setIsMathPhase(false)
      setMathProblem(null)
      return true
    }
    return false
  }, [mathProblem, timer])

  const executeMove = React.useCallback((from: Square, to: Square, promotion?: PieceSymbol) => {
    const move = engineRef.current.makeMove(from, to, promotion)
    if (!move) return

    syncState()
    setSelectedSquare(null)
    setLegalMoves([])
    setPromotionPending(null)

    const newState = engineRef.current.getState()
    if (newState.isGameOver) {
      timer.pause()
      return
    }

    timer.switchTurn(newState.turn)

    // If AI opponent, trigger AI move
    if (gameConfig.opponent === "ai" && newState.turn !== gameConfig.playerColor) {
      makeAiMove()
    } else if (gameConfig.mode === "factorial") {
      // In local mode or player's next turn, start math phase
      startMathPhase()
    }
  }, [syncState, timer, gameConfig.opponent, gameConfig.playerColor, gameConfig.mode, makeAiMove, startMathPhase])

  const handleSquareClick = React.useCallback((square: Square) => {
    if (gameState.isGameOver || isAiThinking || isMathPhase) return
    if (!isPlayerTurn() && gameConfig.opponent === "ai") return

    const state = engineRef.current.getState()
    const piece = state.board.flat().find((s) => s.square === square)?.piece

    // If a square is already selected
    if (selectedSquare) {
      // Check if clicking on own piece — reselect
      if (piece && piece.color === state.turn) {
        setSelectedSquare(square)
        setLegalMoves(engineRef.current.getLegalMoves(square))
        return
      }

      // Try to make a move
      const isLegal = legalMoves.some((m) => m.to === square)
      if (isLegal) {
        // Check for promotion
        if (engineRef.current.isPromotion(selectedSquare, square)) {
          setPromotionPending({ from: selectedSquare, to: square })
          return
        }
        executeMove(selectedSquare, square)
      }

      setSelectedSquare(null)
      setLegalMoves([])
      return
    }

    // Select a piece
    if (piece && piece.color === state.turn) {
      setSelectedSquare(square)
      setLegalMoves(engineRef.current.getLegalMoves(square))
    }
  }, [gameState.isGameOver, isAiThinking, isMathPhase, isPlayerTurn, gameConfig.opponent, selectedSquare, legalMoves, executeMove])

  const handlePromotion = React.useCallback((piece: PieceSymbol) => {
    if (!promotionPending) return
    executeMove(promotionPending.from, promotionPending.to, piece)
  }, [promotionPending, executeMove])

  const cancelPromotion = React.useCallback(() => {
    setPromotionPending(null)
    setSelectedSquare(null)
    setLegalMoves([])
  }, [])

  // Start the game
  const startGame = React.useCallback(() => {
    engineRef.current = createEngine()
    syncState()
    setGameStarted(true)
    setSelectedSquare(null)
    setLegalMoves([])
    setIsAiThinking(false)
    setIsMathPhase(false)
    setMathProblem(null)
    setPromotionPending(null)
    timer.reset()
    timer.start("w")

    // If player is black, AI makes first move
    if (gameConfig.opponent === "ai" && gameConfig.playerColor === "b") {
      makeAiMove()
    } else if (gameConfig.mode === "factorial") {
      startMathPhase()
    }
  }, [syncState, timer, gameConfig.opponent, gameConfig.playerColor, gameConfig.mode, makeAiMove, startMathPhase])

  const resign = React.useCallback(() => {
    timer.pause()
    // Force game over state through state update
    setGameState((prev) => ({
      ...prev,
      isGameOver: true,
      result: gameConfig.playerColor === "w" ? "black" : "white",
      reason: "resignation",
    }))
  }, [timer, gameConfig.playerColor])

  // Handle timeout
  React.useEffect(() => {
    if (timer.isTimeout && !gameState.isGameOver) {
      timer.pause()
      setGameState((prev) => ({
        ...prev,
        isGameOver: true,
        result: timer.timeoutColor === "w" ? "black" : "white",
        reason: "timeout",
      }))
    }
  }, [timer.isTimeout, timer.timeoutColor, gameState.isGameOver, timer])

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (mathIntervalRef.current) clearInterval(mathIntervalRef.current)
    }
  }, [])

  return {
    gameState,
    timer: {
      whiteTime: timer.whiteTime,
      blackTime: timer.blackTime,
      activeColor: timer.activeColor,
      isRunning: timer.isRunning,
      isTimeout: timer.isTimeout,
      timeoutColor: timer.timeoutColor,
    },
    selectedSquare,
    legalMoves,
    isAiThinking,
    mathProblem,
    isMathPhase,
    mathTimeRemaining,
    gameStarted,
    gameConfig,
    promotionPending,
    handleSquareClick,
    handlePromotion,
    cancelPromotion,
    solveMath,
    startGame,
    resign,
  }
}
