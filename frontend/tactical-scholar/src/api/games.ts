/**
 * Games API client — save & fetch game history from the backend
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? ""

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

export interface GameRecord {
  id: number
  pgn: string
  result: "win" | "loss" | "draw" | "resigned"
  mode: "human" | "ai"
  ai_level: number | null
  created_at: string
  analysis: unknown | null
}

export async function saveGame(
  token: string,
  data: { pgn: string; result: string; mode: string; ai_level?: number }
): Promise<GameRecord> {
  const response = await fetch(`${API_BASE}/api/games/save/`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const err = await response.text()
    throw new Error(err || "Failed to save game")
  }
  return response.json()
}

export async function fetchGames(token: string): Promise<GameRecord[]> {
  const response = await fetch(`${API_BASE}/api/games/list/`, {
    headers: authHeaders(token),
  })
  if (!response.ok) throw new Error("Failed to fetch games")
  return response.json()
}

export async function sendGameInvite(
  token: string,
  username: string,
  gameConfig: any,
  gameId: string
) {
  const response = await fetch(`${API_BASE}/api/auth/game/invite/`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ username, gameConfig, gameId }),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Failed to send game invite")
  }
  return response.json()
}
