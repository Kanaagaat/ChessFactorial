import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { useAppState } from "../state/AppStateProvider"
import { Users, UserPlus, Search, Check, X, Swords } from "lucide-react"
import { fetchFriends, fetchPendingRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, searchUsers } from "../api/friends"
import { socketClient } from "../realtime/socketClient"

export function Friends() {
  const { auth } = useAppState()
  const [friends, setFriends] = React.useState<any[]>([])
  const [requests, setRequests] = React.useState<any[]>([])
  const [query, setQuery] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<any[]>([])
  const [addUsername, setAddUsername] = React.useState("")
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")
  const [searchError, setSearchError] = React.useState("")

  const loadData = React.useCallback(async () => {
    if (!auth.accessToken) return
    try {
      const [f, r] = await Promise.all([
        fetchFriends(auth.accessToken),
        fetchPendingRequests(auth.accessToken),
      ])
      setFriends(f)
      setRequests(r)
    } catch (e) {
      console.error(e)
    }
  }, [auth.accessToken])

  const searchUsersByName = React.useCallback(async (query: string) => {
    if (!auth.accessToken || !query.trim()) {
      setSearchResults([])
      setSearchError("")
      return
    }
    try {
      const results = await searchUsers(auth.accessToken, query)
      setSearchResults(results)
      setSearchError("")
    } catch (err) {
      console.error(err)
      setSearchError("Unable to search users")
    }
  }, [auth.accessToken])

  React.useEffect(() => {
    loadData()
    
    const unsubscribe = socketClient.onNotification((event) => {
      if (event.type === 'friend_request_received' || event.type === 'friend_request_accepted') {
        loadData()
      }
    })
    return () => unsubscribe()
  }, [loadData])

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.accessToken || !addUsername.trim()) return
    try {
      setError("")
      setSuccess("")
      await sendFriendRequest(auth.accessToken, addUsername)
      setSuccess(`Request sent to ${addUsername}`)
      setAddUsername("")
      setSearchQuery("")
      setSearchResults([])
      loadData()
    } catch (e: any) {
      setError("User not found or request already sent")
    }
  }

  const handleAccept = async (id: number) => {
    if (!auth.accessToken) return
    try {
      await acceptFriendRequest(auth.accessToken, id)
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleReject = async (id: number) => {
    if (!auth.accessToken) return
    try {
      await rejectFriendRequest(auth.accessToken, id)
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await searchUsersByName(searchQuery)
  }

  const filteredFriends = friends.filter(f => 
    f.username.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-3xl font-bold text-text-primary">Friends & Scholars</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Friends List */}
        <div className="md:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input placeholder="Search friends..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 bg-surface/50 border-border-soft" />
          </div>

          <Card className="card-elevated bg-surface/50 border-border-soft">
            <CardHeader>
              <CardTitle className="text-lg">My Friends ({friends.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {friends.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p>You haven't added any friends yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFriends.map((f) => (
                    <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border-soft">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {f.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">{f.username}</div>
                          <div className="text-xs text-text-secondary font-mono">{f.rating} ELO</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => alert("Go to Play setup to challenge")}>
                        <Swords className="w-4 h-4 mr-2" /> Challenge
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-elevated bg-surface/50 border-border-soft">
            <CardHeader>
              <CardTitle className="text-lg">Discover Scholars</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearchSubmit} className="space-y-3">
                <Input
                  placeholder="Search users by username"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button className="w-full" type="submit">
                  <Search className="w-4 h-4 mr-2" /> Search Users
                </Button>
                {searchError && <p className="text-xs text-danger">{searchError}</p>}
              </form>
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border-soft">
                      <div>
                        <div className="font-medium text-text-primary">{user.username}</div>
                        <div className="text-xs text-text-secondary">{user.rating ?? 1200} ELO</div>
                      </div>
                      <Button size="sm" onClick={() => { setAddUsername(user.username); }}>
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          <Card className="card-elevated bg-surface border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Add Friend</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendRequest} className="space-y-3">
                <Input 
                  placeholder="Username" 
                  value={addUsername} 
                  onChange={(e) => setAddUsername(e.target.value)}
                />
                <Button className="w-full" type="submit">
                  <UserPlus className="w-4 h-4 mr-2" /> Send Request
                </Button>
                {error && <p className="text-xs text-danger">{error}</p>}
                {success && <p className="text-xs text-emerald-400">{success}</p>}
              </form>
            </CardContent>
          </Card>

          {requests.length > 0 && (
            <Card className="card-elevated bg-surface border-border-soft">
              <CardHeader>
                <CardTitle className="text-lg">Friend Requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {requests.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-2 rounded-md bg-background border border-border-soft">
                    <span className="text-sm font-medium">{req.sender.username}</span>
                    <div className="flex gap-1">
                      <Button variant="primary" size="sm" className="h-10 w-10" onClick={() => handleAccept(req.id)}>
                        <Check className="w-5 h-5" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-10 w-10" onClick={() => handleReject(req.id)}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
