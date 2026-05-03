import { findBestMove, type AIDifficulty } from "./evaluator"

interface AiRequest {
  fen: string
  difficulty: AIDifficulty
}

interface AiResponse {
  move: string
  evaluation: number
}

self.addEventListener("message", async (event: MessageEvent<AiRequest>) => {
  try {
    const { fen, difficulty } = event.data
    const result = findBestMove(fen, difficulty)
    const response: AiResponse = { move: result.move, evaluation: result.evaluation }
    self.postMessage(response)
  } catch {
    self.postMessage({ move: "", evaluation: 0 })
  }
})

export {}
