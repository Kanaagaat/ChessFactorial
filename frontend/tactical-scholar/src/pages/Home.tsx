import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { useAppState } from "../state/AppStateProvider"
import { Skeleton } from "../components/ui/Skeleton"
import { cn } from "../lib/utils"
import { Brain, Swords, Zap, Trophy, BarChart3, Users, ChevronRight } from "lucide-react"

const QUICK_PLAY = [
  { mode: "standard", opponent: "ai", difficulty: "medium", time: 600000, label: "Quick Play", desc: "10 min vs AI", icon: Swords, color: "from-emerald-600/20 to-emerald-800/10" },
  { mode: "factorial", opponent: "ai", difficulty: "medium", time: 600000, label: "Factorial Chess", desc: "Solve math + play chess", icon: Brain, color: "from-violet-600/20 to-violet-800/10" },
  { mode: "standard", opponent: "ai", difficulty: "hard", time: 180000, label: "Blitz Challenge", desc: "3 min vs Hard AI", icon: Zap, color: "from-amber-600/20 to-amber-800/10" },
  { mode: "standard", opponent: "local", difficulty: "medium", time: 300000, label: "Local 2-Player", desc: "Play with a friend", icon: Users, color: "from-blue-600/20 to-blue-800/10" },
]

export function Home() {
  const { state } = useAppState()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const t = window.setTimeout(() => setIsLoading(false), 400)
    return () => window.clearTimeout(t)
  }, [])

  const handleQuickPlay = (qp: typeof QUICK_PLAY[number]) => {
    navigate("/gameplay", {
      state: {
        config: {
          mode: qp.mode,
          opponent: qp.opponent,
          aiDifficulty: qp.difficulty,
          playerColor: "w",
          timeControl: qp.time,
          increment: 0,
          mathDifficulty: "medium",
        },
      },
    })
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-text-primary">
          Welcome back, {state.me.username}
        </h2>
        <p className="text-text-secondary mt-1">Ready for your next game?</p>
      </div>

      {/* Quick Play */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl font-semibold">Quick Play</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate("/play")}>
            Custom Game <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)
            : QUICK_PLAY.map((qp) => {
                const Icon = qp.icon
                return (
                  <button
                    key={qp.label}
                    onClick={() => handleQuickPlay(qp)}
                    className={cn(
                      "text-left rounded-2xl border border-border-soft p-5 transition-all",
                      "hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40",
                      "bg-gradient-to-br", qp.color
                    )}
                  >
                    <Icon className="w-7 h-7 text-primary mb-3" />
                    <h4 className="font-semibold text-text-primary">{qp.label}</h4>
                    <p className="text-xs text-text-secondary mt-1">{qp.desc}</p>
                  </button>
                )
              })}
        </div>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Rating", value: state.me.rating, icon: Trophy, color: "text-amber-400" },
          { label: "Games", value: state.me.gamesPlayed, icon: BarChart3, color: "text-primary" },
          { label: "Win Rate", value: state.me.gamesPlayed > 0 ? `${state.me.winRate}%` : "—", icon: Swords, color: "text-blue-400" },
          { label: "Wins", value: state.me.gamesWon, icon: Trophy, color: "text-violet-400" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="card-elevated">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-text-secondary">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Matches */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl font-semibold">Recent Matches</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <Card className="card-elevated">
          <CardContent className="p-0 divide-y divide-border-soft/50">
            {state.history.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">No matches yet. Start playing!</div>
            ) : (
              state.history.slice(0, 5).map((match) => (
                <div key={match.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      match.result === "Win" ? "bg-primary" : match.result === "Loss" ? "bg-danger" : "bg-text-secondary"
                    )} />
                    <div>
                      <span className="font-medium text-sm">{match.opponent}</span>
                      <span className="text-xs text-text-secondary ml-2">{match.gameType} • {match.playedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-xs font-semibold", match.result === "Win" ? "text-primary" : match.result === "Loss" ? "text-danger" : "text-text-secondary")}>
                      {match.result}
                    </span>
                    <span className={cn("text-xs font-mono", match.ratingChange > 0 ? "text-primary" : match.ratingChange < 0 ? "text-danger" : "text-text-secondary")}>
                      {match.ratingChange > 0 ? `+${match.ratingChange}` : match.ratingChange}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
