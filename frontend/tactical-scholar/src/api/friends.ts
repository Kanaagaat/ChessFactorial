const API_BASE = import.meta.env.VITE_API_BASE ?? ""

export async function fetchFriends(token: string) {
  const res = await fetch(`${API_BASE}/api/auth/friends/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to fetch friends")
  return res.json()
}

export async function fetchPendingRequests(token: string) {
  const res = await fetch(`${API_BASE}/api/auth/friends/requests/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to fetch requests")
  return res.json()
}

export async function sendFriendRequest(token: string, username: string) {
  const res = await fetch(`${API_BASE}/api/auth/friends/send/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  })
  if (!res.ok) throw new Error("Failed to send request")
  return res.json()
}

export async function acceptFriendRequest(token: string, id: number) {
  const res = await fetch(`${API_BASE}/api/auth/friends/accept/${id}/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to accept")
  return res.json()
}

export async function rejectFriendRequest(token: string, id: number) {
  const res = await fetch(`${API_BASE}/api/auth/friends/reject/${id}/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to reject")
  return res.json()
}

export async function searchUsers(token: string, query: string) {
  const res = await fetch(`${API_BASE}/api/auth/users/search/?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to search users")
  return res.json()
}
