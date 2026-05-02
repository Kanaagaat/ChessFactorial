/**
 * Factorial Chess — Mental math challenge system
 * Generates math problems that must be solved before each move
 */

export type MathDifficulty = "easy" | "medium" | "hard"

export interface MathProblem {
  expression: string
  answer: number
  difficulty: MathDifficulty
  timeLimit: number // milliseconds
}

function factorial(n: number): number {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const generators: Record<MathDifficulty, (() => MathProblem)[]> = {
  easy: [
    // Simple factorial
    () => {
      const n = randomInt(3, 5)
      return { expression: `${n}!`, answer: factorial(n), difficulty: "easy", timeLimit: 15000 }
    },
    // Addition
    () => {
      const a = randomInt(10, 50)
      const b = randomInt(10, 50)
      return { expression: `${a} + ${b}`, answer: a + b, difficulty: "easy", timeLimit: 10000 }
    },
    // Multiplication
    () => {
      const a = randomInt(2, 12)
      const b = randomInt(2, 12)
      return { expression: `${a} × ${b}`, answer: a * b, difficulty: "easy", timeLimit: 10000 }
    },
    // Square
    () => {
      const n = randomInt(2, 10)
      return { expression: `${n}²`, answer: n * n, difficulty: "easy", timeLimit: 10000 }
    },
  ],
  medium: [
    // Larger factorial
    () => {
      const n = randomInt(5, 7)
      return { expression: `${n}!`, answer: factorial(n), difficulty: "medium", timeLimit: 20000 }
    },
    // Factorial division
    () => {
      const n = randomInt(5, 7)
      const d = randomInt(2, 4)
      const ans = factorial(n) / factorial(d)
      return { expression: `${n}! ÷ ${d}!`, answer: ans, difficulty: "medium", timeLimit: 20000 }
    },
    // Triple multiplication
    () => {
      const a = randomInt(2, 9)
      const b = randomInt(2, 9)
      const c = randomInt(2, 9)
      return { expression: `${a} × ${b} × ${c}`, answer: a * b * c, difficulty: "medium", timeLimit: 15000 }
    },
    // Power
    () => {
      const base = randomInt(2, 5)
      const exp = randomInt(2, 4)
      return { expression: `${base}^${exp}`, answer: Math.pow(base, exp), difficulty: "medium", timeLimit: 15000 }
    },
    // Square root
    () => {
      const n = randomInt(2, 12)
      return { expression: `√${n * n}`, answer: n, difficulty: "medium", timeLimit: 12000 }
    },
  ],
  hard: [
    // Large factorial
    () => {
      const n = randomInt(6, 8)
      return { expression: `${n}!`, answer: factorial(n), difficulty: "hard", timeLimit: 25000 }
    },
    // Permutation-style
    () => {
      const n = randomInt(5, 8)
      const r = randomInt(2, 3)
      const ans = factorial(n) / factorial(n - r)
      return { expression: `${n}! ÷ ${n - r}!`, answer: ans, difficulty: "hard", timeLimit: 25000 }
    },
    // Complex arithmetic
    () => {
      const a = randomInt(11, 25)
      const b = randomInt(11, 25)
      const c = randomInt(2, 9)
      return { expression: `${a} × ${b} + ${c}`, answer: a * b + c, difficulty: "hard", timeLimit: 20000 }
    },
    // Factorial + arithmetic
    () => {
      const n = randomInt(4, 6)
      const add = randomInt(1, 20)
      return { expression: `${n}! + ${add}`, answer: factorial(n) + add, difficulty: "hard", timeLimit: 20000 }
    },
  ],
}

export function generateProblem(difficulty: MathDifficulty): MathProblem {
  const genList = generators[difficulty]
  const gen = genList[Math.floor(Math.random() * genList.length)]
  return gen()
}

/**
 * Get time bonus (ms) for solving quickly
 */
export function getTimeBonus(solveTimeMs: number, timeLimitMs: number): number {
  const ratio = solveTimeMs / timeLimitMs
  if (ratio < 0.25) return 5000 // Very fast: +5s
  if (ratio < 0.5) return 3000  // Fast: +3s
  if (ratio < 0.75) return 1000 // Normal: +1s
  return 0                       // Slow: no bonus
}
