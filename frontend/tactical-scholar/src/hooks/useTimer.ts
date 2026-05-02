/**
 * Chess clock hook — manages time for both players
 */
import * as React from "react"
import type { Color } from "chess.js"

export interface TimerState {
  whiteTime: number  // milliseconds remaining
  blackTime: number
  activeColor: Color | null
  isRunning: boolean
}

export function useTimer(initialTimeMs: number, incrementMs: number = 0) {
  const [state, setState] = React.useState<TimerState>({
    whiteTime: initialTimeMs,
    blackTime: initialTimeMs,
    activeColor: null,
    isRunning: false,
  })
  const intervalRef = React.useRef<number | null>(null)
  const lastTickRef = React.useRef<number>(0)

  const clearTimer = React.useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const tick = React.useCallback(() => {
    const now = Date.now()
    const elapsed = now - lastTickRef.current
    lastTickRef.current = now

    setState((prev) => {
      if (!prev.activeColor || !prev.isRunning) return prev

      const key = prev.activeColor === "w" ? "whiteTime" : "blackTime"
      const newTime = Math.max(0, prev[key] - elapsed)

      if (newTime <= 0) {
        return { ...prev, [key]: 0, isRunning: false }
      }
      return { ...prev, [key]: newTime }
    })
  }, [])

  const start = React.useCallback((color: Color) => {
    clearTimer()
    lastTickRef.current = Date.now()
    setState((prev) => ({ ...prev, activeColor: color, isRunning: true }))
    intervalRef.current = window.setInterval(tick, 100)
  }, [clearTimer, tick])

  const switchTurn = React.useCallback((newActiveColor: Color) => {
    clearTimer()
    // Add increment to the player who just moved
    setState((prev) => {
      const movedColor = newActiveColor === "w" ? "b" : "w"
      const key = movedColor === "w" ? "whiteTime" : "blackTime"
      return {
        ...prev,
        [key]: prev[key] + incrementMs,
        activeColor: newActiveColor,
        isRunning: true,
      }
    })
    lastTickRef.current = Date.now()
    intervalRef.current = window.setInterval(tick, 100)
  }, [clearTimer, incrementMs, tick])

  const pause = React.useCallback(() => {
    clearTimer()
    setState((prev) => ({ ...prev, isRunning: false }))
  }, [clearTimer])

  const addTime = React.useCallback((color: Color, ms: number) => {
    setState((prev) => {
      const key = color === "w" ? "whiteTime" : "blackTime"
      return { ...prev, [key]: prev[key] + ms }
    })
  }, [])

  const reset = React.useCallback((timeMs?: number) => {
    clearTimer()
    setState({
      whiteTime: timeMs ?? initialTimeMs,
      blackTime: timeMs ?? initialTimeMs,
      activeColor: null,
      isRunning: false,
    })
  }, [clearTimer, initialTimeMs])

  const isTimeout = state.whiteTime <= 0 || state.blackTime <= 0
  const timeoutColor: Color | null = state.whiteTime <= 0 ? "w" : state.blackTime <= 0 ? "b" : null

  React.useEffect(() => {
    return clearTimer
  }, [clearTimer])

  return {
    ...state,
    start,
    switchTurn,
    pause,
    addTime,
    reset,
    isTimeout,
    timeoutColor,
  }
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
