export interface AuthTokens {
  access: string
  refresh: string
}

export interface AuthUser {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  rating: number
  games_won: number
  games_played: number
}

const API_BASE = import.meta.env.VITE_API_BASE ?? ""

function jsonHeaders(token?: string) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function parseJson(response: Response) {
  const text = await response.text()
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return null
  }
}

export async function login(payload: { username: string; password: string }) {
  const response = await fetch(`${API_BASE}/api/auth/token/login/`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  })

  const data = await parseJson(response)
  if (!response.ok) {
    throw data ?? { detail: "Unable to sign in." }
  }
  return data as AuthTokens
}

export async function register(payload: {
  first_name: string
  last_name: string
  username: string
  email: string
  password: string
}) {
  const response = await fetch(`${API_BASE}/api/auth/register/`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  })

  const data = await parseJson(response)
  if (!response.ok) {
    throw data ?? { detail: "Unable to register." }
  }
  return data as { user: AuthUser } & AuthTokens
}

export async function fetchMe(accessToken: string) {
  const response = await fetch(`${API_BASE}/api/auth/me/`, {
    method: "GET",
    headers: jsonHeaders(accessToken),
  })

  const data = await parseJson(response)
  if (!response.ok) {
    throw data ?? { detail: "Unable to load current user." }
  }
  return data as AuthUser
}
