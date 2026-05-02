import * as React from "react"
import { Card, CardContent } from "../components/ui/Card"
import { Avatar } from "../components/ui/Avatar"
import { Button } from "../components/ui/Button"
import { cn } from "../lib/utils"
import { Trophy, Medal, Crown, MapPin, Filter } from "lucide-react"

interface LeaderboardEntry {
  rank: number; username: string; rating: number; wins: number; games: number; city: string; delta: number
}

const DATA: LeaderboardEntry[] = [
  { rank: 1, username: "GrandMasterKZ", rating: 2450, wins: 342, games: 410, city: "Almaty", delta: 15 },
  { rank: 2, username: "FactorialKing", rating: 2380, wins: 298, games: 380, city: "Almaty", delta: 22 },
  { rank: 3, username: "BishopStorm", rating: 2310, wins: 275, games: 360, city: "Astana", delta: 0 },
  { rank: 4, username: "KnightRider99", rating: 2285, wins: 260, games: 345, city: "Shymkent", delta: -8 },
  { rank: 5, username: "QueenGambit_Pro", rating: 2240, wins: 245, games: 330, city: "Almaty", delta: 12 },
  { rank: 6, username: "TacticalScholar", rating: 2200, wins: 230, games: 310, city: "Karaganda", delta: 18 },
  { rank: 7, username: "EndgameWizard", rating: 2180, wins: 220, games: 300, city: "Astana", delta: 0 },
  { rank: 8, username: "PawnStormKZ", rating: 2150, wins: 210, games: 290, city: "Almaty", delta: -5 },
  { rank: 9, username: "CheckmateHero", rating: 2100, wins: 198, games: 278, city: "Aktau", delta: 9 },
  { rank: 10, username: "CastleMaster", rating: 2080, wins: 190, games: 270, city: "Pavlodar", delta: 7 },
]

const CITIES = ["All", "Almaty", "Astana", "Shymkent", "Karaganda", "Aktau", "Pavlodar"]

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
  return <span className="text-sm font-mono text-text-secondary w-5 text-center">{rank}</span>
}

export function Leaderboard() {
  const [city, setCity] = React.useState("All")
  const filtered = city === "All" ? DATA : DATA.filter((e) => e.city === city)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-text-primary flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-400" /> Leaderboard
        </h2>
        <p className="text-text-secondary mt-1">Top scholars across Kazakhstan</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-text-secondary shrink-0" />
        {CITIES.map((c) => (
          <Button key={c} variant={city === c ? "primary" : "outline"} size="sm" onClick={() => setCity(c)} className="shrink-0">
            {c !== "All" && <MapPin className="w-3 h-3 mr-1" />}{c}
          </Button>
        ))}
      </div>

      <Card className="card-elevated overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border-soft text-xs font-semibold text-text-secondary uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Player</div>
            <div className="col-span-2 text-right">Rating</div>
            <div className="col-span-2 text-right hidden sm:block">Win%</div>
            <div className="col-span-2 text-right">Trend</div>
          </div>
          {filtered.map((entry, idx) => (
            <div key={entry.username} className={cn(
              "grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors hover:bg-white/5",
              idx < filtered.length - 1 && "border-b border-border-soft/50",
              entry.rank <= 3 && "bg-amber-500/5"
            )}>
              <div className="col-span-1"><RankBadge rank={entry.rank} /></div>
              <div className="col-span-5 flex items-center gap-2">
                <Avatar fallback={entry.username} size="sm" />
                <div>
                  <span className="font-medium text-sm">{entry.username}</span>
                  <div className="text-[10px] text-text-secondary flex items-center gap-1 sm:hidden">
                    <MapPin className="w-2.5 h-2.5" />{entry.city}
                  </div>
                </div>
              </div>
              <div className="col-span-2 text-right font-mono font-bold text-primary text-sm">{entry.rating}</div>
              <div className="col-span-2 text-right hidden sm:block text-sm text-text-secondary">{Math.round((entry.wins / entry.games) * 100)}%</div>
              <div className="col-span-2 text-right">
                {entry.delta > 0 && <span className="text-xs text-primary font-mono">+{entry.delta}</span>}
                {entry.delta < 0 && <span className="text-xs text-danger font-mono">{entry.delta}</span>}
                {entry.delta === 0 && <span className="text-xs text-text-secondary">—</span>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
