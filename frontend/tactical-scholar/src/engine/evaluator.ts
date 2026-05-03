/**
 * Chess position evaluator + minimax AI with alpha-beta pruning
 * Used for built-in AI opponent and basic analysis
 */
import { Chess, type Color } from "chess.js"

// Piece values in centipawns
const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
}

// Piece-square tables (from white's perspective, flipped for black)
const PST: Record<string, number[]> = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20,
  ],
}

function getPstValue(piece: string, color: Color, square: number): number {
  const table = PST[piece]
  if (!table) return 0
  // For black, flip the table vertically
  const index = color === "w" ? square : 63 - square
  return table[index]
}

/**
 * Evaluate a position from white's perspective
 * Positive = white advantage, negative = black advantage
 */
export function evaluatePosition(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === "w" ? -99999 : 99999
  }
  if (chess.isDraw() || chess.isStalemate()) return 0

  let score = 0
  const board = chess.board()

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (!piece) continue

      const squareIndex = row * 8 + col
      const material = PIECE_VALUES[piece.type] || 0
      const positional = getPstValue(piece.type, piece.color, squareIndex)
      const value = material + positional

      score += piece.color === "w" ? value : -value
    }
  }

  // Mobility bonus
  const currentMoves = chess.moves().length
  const mobilityBonus = currentMoves * 2
  score += chess.turn() === "w" ? mobilityBonus : -mobilityBonus

  return score
}

/**
 * Minimax with alpha-beta pruning
 */
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  nodesSearched: { count: number }
): number {
  nodesSearched.count++

  if (depth === 0 || chess.isGameOver()) {
    return evaluatePosition(chess)
  }

  const moves = chess.moves()

  if (isMaximizing) {
    let maxEval = -Infinity
    for (const move of moves) {
      chess.move(move)
      const evaluation = minimax(chess, depth - 1, alpha, beta, false, nodesSearched)
      chess.undo()
      maxEval = Math.max(maxEval, evaluation)
      alpha = Math.max(alpha, evaluation)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of moves) {
      chess.move(move)
      const evaluation = minimax(chess, depth - 1, alpha, beta, true, nodesSearched)
      chess.undo()
      minEval = Math.min(minEval, evaluation)
      beta = Math.min(beta, evaluation)
      if (beta <= alpha) break
    }
    return minEval
  }
}

export type AIDifficulty = "easy" | "medium" | "hard" | "master"

const DEPTH_MAP: Record<AIDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  master: 4,
}

/**
 * Find the best move for the current position
 */
export function findBestMove(fen: string, difficulty: AIDifficulty): { move: string; evaluation: number } {
  const chess = new Chess(fen)
  const depth = DEPTH_MAP[difficulty]
  const isWhite = chess.turn() === "w"
  const moves = chess.moves()

  if (moves.length === 0) {
    return { move: "", evaluation: 0 }
  }

  // For easy difficulty, add randomness
  if (difficulty === "easy" && Math.random() < 0.3) {
    const randomMove = moves[Math.floor(Math.random() * moves.length)]
    return { move: randomMove, evaluation: 0 }
  }

  let bestMove = moves[0]
  let bestEval = isWhite ? -Infinity : Infinity
  const nodesSearched = { count: 0 }

  for (const move of moves) {
    chess.move(move)
    const evaluation = minimax(chess, depth - 1, -Infinity, Infinity, !isWhite, nodesSearched)
    chess.undo()

    if (isWhite ? evaluation > bestEval : evaluation < bestEval) {
      bestEval = evaluation
      bestMove = move
    }
  }

  // For medium difficulty, sometimes pick 2nd best
  if (difficulty === "medium" && Math.random() < 0.15 && moves.length > 1) {
    const otherMoves = moves.filter((m) => m !== bestMove)
    bestMove = otherMoves[Math.floor(Math.random() * otherMoves.length)]
  }

  return { move: bestMove, evaluation: bestEval }
}

/**
 * Async API-based Stockfish evaluation for faster, non-blocking AI
 */
export async function findBestMoveAsync(fen: string, difficulty: AIDifficulty): Promise<{ move: string; evaluation: number }> {
  const API_DEPTH_MAP: Record<AIDifficulty, number> = {
    easy: 2,
    medium: 5,
    hard: 10,
    master: 15,
  }
  try {
    const depth = API_DEPTH_MAP[difficulty]
    const res = await fetch("https://chess-api.com/v1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen, depth })
    })
    if (!res.ok) throw new Error("API error")
    const data = await res.json()
    
    if (difficulty === "easy" && Math.random() < 0.3) {
      const c = new Chess(fen)
      const moves = c.moves()
      if (moves.length > 0) {
        return { move: moves[Math.floor(Math.random() * moves.length)], evaluation: 0 }
      }
    }
    
    return { move: data.san || data.move, evaluation: data.eval || 0 }
  } catch (e) {
    console.warn("AI fallback to JS engine", e)
    return findBestMove(fen, difficulty)
  }
}

/**
 * Analyze a move: compare player's move eval vs best move eval
 */
export function classifyMove(
  fen: string,
  playedMove: string,
  depth: number = 3
): { classification: string; bestMove: string; evalDiff: number } {
  const chess = new Chess(fen)
  const isWhite = chess.turn() === "w"
  const nodesSearched = { count: 0 }

  // Evaluate best move
  const best = findBestMove(fen, "hard")

  // Evaluate played move
  chess.move(playedMove)
  const playedEval = minimax(chess, depth - 1, -Infinity, Infinity, isWhite, nodesSearched)
  chess.undo()

  // Evaluate best move
  chess.move(best.move)
  const bestEval = minimax(chess, depth - 1, -Infinity, Infinity, isWhite, nodesSearched)
  chess.undo()

  const evalDiff = Math.abs(bestEval - playedEval)

  let classification: string
  if (playedMove === best.move || evalDiff < 10) {
    classification = evalDiff === 0 && Math.abs(bestEval) > 200 ? "brilliant" : "best"
  } else if (evalDiff < 50) {
    classification = "good"
  } else if (evalDiff < 100) {
    classification = "inaccuracy"
  } else if (evalDiff < 250) {
    classification = "mistake"
  } else {
    classification = "blunder"
  }

  return { classification, bestMove: best.move, evalDiff }
}

/**
 * Async move analysis using API for best move and fast local eval for diff
 */
export async function classifyMoveAsync(
  fen: string,
  playedMove: string,
  depth: number = 3
): Promise<{ classification: string; bestMove: string; evalDiff: number }> {
  const chess = new Chess(fen)
  const isWhite = chess.turn() === "w"
  const nodesSearched = { count: 0 }

  // Get best move from fast API
  const best = await findBestMoveAsync(fen, "hard")

  // Fast path if player found the best move
  if (playedMove === best.move || playedMove === best.move.replace(/[^a-zA-Z0-9]/g, "")) {
    return { classification: "best", bestMove: best.move, evalDiff: 0 }
  }

  // Local fallback for diff evaluation
  try {
    chess.move(playedMove)
    const playedEval = minimax(chess, depth - 1, -Infinity, Infinity, isWhite, nodesSearched)
    chess.undo()

    chess.move(best.move)
    const bestEval = minimax(chess, depth - 1, -Infinity, Infinity, isWhite, nodesSearched)
    chess.undo()

    const evalDiff = Math.abs(bestEval - playedEval)

    let classification: string
    if (evalDiff < 10) {
      classification = "best"
    } else if (evalDiff < 50) {
      classification = "good"
    } else if (evalDiff < 100) {
      classification = "inaccuracy"
    } else if (evalDiff < 250) {
      classification = "mistake"
    } else {
      classification = "blunder"
    }

    return { classification, bestMove: best.move, evalDiff }
  } catch (e) {
    return { classification: "good", bestMove: best.move, evalDiff: 0 }
  }
}
