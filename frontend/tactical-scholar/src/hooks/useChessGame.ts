/**
 * Main chess game hook — orchestrates engine, AI, timers, and Factorial mode
 */
import * as React from "react"
import type { Square, Move, PieceSymbol, Color } from "chess.js"
import { createEngine, type ChessEngine, type GameState } from "../engine/chessEngine"
import { findBestMove, type AIDifficulty } from "../engine/evaluator"
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

  const timer = useTimer(gameConfig.timeControl, gameConfig.increment)

  const syncState = React.useCallback(() => {
    setGameState(engineRef.current.getState())
  }, [])

  const isPlayerTurn = React.useCallback(() => {
    const state = engineRef.current.getState()
    if (gameConfig.opponent === "local") return true
    return state.turn === gameConfig.playerColor
  }, [gameConfig.opponent, gameConfig.playerColor])

  // Start factorial math phase
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
        // Time ran out — lose the move (auto random move or skip)
        setIsMathPhase(false)
        setMathProblem(null)
      }
    }, 100)
  }, [gameConfig.mode, gameConfig.mathDifficulty])

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

  // AI move
  const makeAiMove = React.useCallback(() => {
    const state = engineRef.current.getState()
    if (state.isGameOver) return

    setIsAiThinking(true)
    // Use setTimeout to not block UI
    window.setTimeout(() => {
      const currentState = engineRef.current.getState()
      if (currentState.isGameOver) {
        setIsAiThinking(false)
        return
      }
      const result = findBestMove(currentState.fen, gameConfig.aiDifficulty)
      if (result.move) {
        // Parse the SAN move to get from/to squares
        const chess = engineRef.current.getRawChess()
        const verbose = chess.moves({ verbose: true }).find((m) => m.san === result.move)
        if (verbose) {
          engineRef.current.makeMove(verbose.from, verbose.to, verbose.promotion)
        } else {
          // Fallback: try direct SAN move
          chess.move(result.move)
        }
        syncState()
        const newState = engineRef.current.getState()
        if (!newState.isGameOver) {
          timer.switchTurn(newState.turn)
          // Start math phase for player's turn in factorial mode
          if (gameConfig.mode === "factorial") {
            startMathPhase()
          }
        } else {
          timer.pause()
        }
      }
      setIsAiThinking(false)
    }, 300 + Math.random() * 500) // Simulate thinking time
  }, [gameConfig.aiDifficulty, gameConfig.mode, syncState, timer, startMathPhase])

  // Handle square click
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
  }, [gameState.isGameOver, isAiThinking, isMathPhase, isPlayerTurn, gameConfig.opponent, selectedSquare, legalMoves])

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
