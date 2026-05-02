import * as React from "react"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { EmptyState } from "../components/ui/EmptyState"
import { useAppState } from "../state/AppStateProvider"
import { Users, UserPlus, Search } from "lucide-react"

export function Friends() {
  const { state } = useAppState()
  const [query, setQuery] = React.useState("")

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-3xl font-bold text-text-primary">Friends</h2>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" /> Add Friend
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <Input placeholder="Search scholars..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
      </div>

      <EmptyState
        title="Friends feature coming soon"
        description="Multiplayer and social features are in development. Stay tuned!"
      />

      <Card className="card-elevated">
        <CardContent className="p-5 text-center">
          <Users className="w-10 h-10 text-text-secondary mx-auto mb-3" />
          <p className="text-sm text-text-secondary">
            Friend count: <span className="font-bold text-text-primary">{state.me.friendsCount}</span>
          </p>
          <p className="text-xs text-text-secondary mt-2">
            Online multiplayer with friends is coming in the next update.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
