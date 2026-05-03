/**
 * Chess engine wrapper around chess.js
 * Provides a clean API for game state management
 */
import { Chess, type Square, type Move, type Color, type PieceSymbol } from "chess.js"

export type PieceColor = "w" | "b"
export type GameResult = "white" | "black" | "draw" | null
export type GameOverReason =
  | "checkmate"
  | "stalemate"
  | "insufficient"
  | "threefold"
  | "fifty-move"
  | "timeout"
  | "resignation"
  | null

export interface BoardSquare {
  square: Square
  piece: { type: PieceSymbol; color: Color } | null
  row: number
  col: number
}

export interface GameState {
  board: BoardSquare[][]
  turn: Color
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
  isGameOver: boolean
  moveHistory: Move[]
  fen: string
  pgn: string
  result: GameResult
  reason: GameOverReason
  lastMove: { from: Square; to: Square } | null
  capturedPieces: { w: PieceSymbol[]; b: PieceSymbol[] }
  moveCount: number
}

export function createEngine(fen?: string) {
  const chess = fen ? new Chess(fen) : new Chess()
  const capturedPieces: { w: PieceSymbol[]; b: PieceSymbol[] } = { w: [], b: [] }
  let lastMoveInfo: { from: Square; to: Square } | null = null

  function getBoard(): BoardSquare[][] {
    const board = chess.board()
    return board.map((row, rowIndex) =>
      row.map((cell, colIndex) => ({
        square: `${"abcdefgh"[colIndex]}${8 - rowIndex}` as Square,
        piece: cell ? { type: cell.type, color: cell.color } : null,
        row: rowIndex,
        col: colIndex,
      }))
    )
  }

  function getResult(): GameResult {
    if (!chess.isGameOver()) return null
    if (chess.isCheckmate()) return chess.turn() === "w" ? "black" : "white"
    return "draw"
  }

  function getReason(): GameOverReason {
    if (!chess.isGameOver()) return null
    if (chess.isCheckmate()) return "checkmate"
    if (chess.isStalemate()) return "stalemate"
    if (chess.isInsufficientMaterial()) return "insufficient"
    if (chess.isThreefoldRepetition()) return "threefold"
    return "fifty-move"
  }

  function getState(): GameState {
    const history = chess.history({ verbose: true })
    return {
      board: getBoard(),
      turn: chess.turn(),
      isCheck: chess.isCheck(),
      isCheckmate: chess.isCheckmate(),
      isStalemate: chess.isStalemate(),
      isDraw: chess.isDraw(),
      isGameOver: chess.isGameOver(),
      moveHistory: history,
      fen: chess.fen(),
      pgn: chess.pgn(),
      result: getResult(),
      reason: getReason(),
      lastMove: lastMoveInfo,
      capturedPieces: { ...capturedPieces },
      moveCount: Math.ceil(history.length / 2),
    }
  }

  function getLegalMoves(square: Square): Move[] {
    return chess.moves({ square, verbose: true })
  }

  function makeMove(from: Square, to: Square, promotion?: PieceSymbol): Move | null {
    try {
      const move = chess.move({ from, to, promotion: promotion || undefined })
      if (move) {
        lastMoveInfo = { from, to }
        if (move.captured) {
          capturedPieces[move.color].push(move.captured as PieceSymbol)
        }
      }
      return move
    } catch {
      return null
    }
  }

  function undoMove(): Move | null {
    const move = chess.undo()
    if (move) {
      if (move.captured) {
        const color = move.color
        const idx = capturedPieces[color].lastIndexOf(move.captured as PieceSymbol)
        if (idx !== -1) capturedPieces[color].splice(idx, 1)
      }
      const history = chess.history({ verbose: true })
      lastMoveInfo = history.length > 0
        ? { from: history[history.length - 1].from, to: history[history.length - 1].to }
        : null
    }
    return move
  }

  function isPromotion(from: Square, to: Square): boolean {
    const piece = chess.get(from)
    if (!piece || piece.type !== "p") return false
    const toRank = parseInt(to[1])
    return (piece.color === "w" && toRank === 8) || (piece.color === "b" && toRank === 1)
  }

  function reset() {
    chess.reset()
    capturedPieces.w = []
    capturedPieces.b = []
    lastMoveInfo = null
  }

  function loadFen(fen: string) {
    chess.load(fen)
    capturedPieces.w = []
    capturedPieces.b = []
    lastMoveInfo = null
  }

  return {
    getState,
    getLegalMoves,
    makeMove,
    undoMove,
    isPromotion,
    reset,
    loadFen,
    getRawChess: () => chess,
  }
}

export type ChessEngine = ReturnType<typeof createEngine>
