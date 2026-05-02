import { Card, CardContent } from "../components/ui/Card"
import { Avatar } from "../components/ui/Avatar"
import { Button } from "../components/ui/Button"
import { useAppState } from "../state/AppStateProvider"
import { useNavigate } from "react-router-dom"
import { cn } from "../lib/utils"
import { Trophy, Swords, Target, TrendingUp, Clock, ChevronRight } from "lucide-react"

export function Profile() {
  const { state } = useAppState()
  const navigate = useNavigate()
  const me = state.me

  const stats = [
    { label: "ELO Rating", value: me.rating, icon: Trophy, color: "text-amber-400" },
    { label: "Games Played", value: me.gamesPlayed, icon: Swords, color: "text-primary" },
    { label: "Games Won", value: me.gamesWon, icon: Target, color: "text-emerald-400" },
    { label: "Win Rate", value: me.gamesPlayed > 0 ? `${me.winRate}%` : "—", icon: TrendingUp, color: "text-blue-400" },
  ]

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Profile Card */}
      <Card className="card-elevated">
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <Avatar fallback={me.username} size="lg" className="w-24 h-24 text-3xl" />
          <div className="flex-1 space-y-2">
            <h2 className="font-serif text-3xl font-bold">{me.username}</h2>
            {me.email && <div className="text-sm text-text-secondary">{me.email}</div>}
            {(me.firstName || me.lastName) && (
              <div className="text-sm text-text-secondary">{me.firstName} {me.lastName}</div>
            )}
            <div className="text-xs text-text-secondary">ID: {me.id}</div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="card-elevated">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={cn("p-2.5 rounded-xl bg-white/5", stat.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-text-secondary">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Games */}
      <Card className="card-elevated">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-soft">
            <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Recent Games
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
              All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="divide-y divide-border-soft/50">
            {state.history.length === 0 ? (
              <div className="p-8 text-center text-text-secondary text-sm">
                No games yet. Play your first game!
              </div>
            ) : (
              state.history.slice(0, 5).map((match) => (
                <div key={match.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      match.result === "Win" ? "bg-primary" : match.result === "Loss" ? "bg-danger" : "bg-text-secondary"
                    )} />
                    <div>
                      <span className="font-medium text-sm">{match.opponent}</span>
                      <div className="text-[10px] text-text-secondary">{match.gameType} • {match.playedAt}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-sm font-semibold", match.result === "Win" ? "text-primary" : match.result === "Loss" ? "text-danger" : "text-text-secondary")}>
                      {match.result}
                    </div>
                    <div className={cn("text-xs font-mono", match.ratingChange > 0 ? "text-primary" : match.ratingChange < 0 ? "text-danger" : "text-text-secondary")}>
                      {match.ratingChange > 0 ? `+${match.ratingChange}` : match.ratingChange}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
