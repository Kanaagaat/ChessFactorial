/**
 * Play Setup Page — Choose game mode, AI difficulty, time control, and color
 */
import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import { cn } from "../lib/utils"
import {
  Brain, Swords, Crown, Shuffle,
  Clock, Bot, Users, ChevronRight, X,
} from "lucide-react"
import type { GameMode, GameConfig } from "../hooks/useChessGame"
import type { AIDifficulty } from "../engine/evaluator"
import type { MathDifficulty } from "../engine/factorial"
import { useAppState } from "../state/AppStateProvider"
import { fetchFriends } from "../api/friends"
import { sendGameInvite } from "../api/games"

const GAME_MODES: { id: GameMode; label: string; icon: typeof Brain; desc: string; color: string }[] = [
  { id: "standard", label: "Standard Chess", icon: Swords, desc: "Classic chess with full rules", color: "emerald" },
  { id: "factorial", label: "Factorial Chess", icon: Brain, desc: "Solve math to unlock moves", color: "violet" },
]

const AI_LEVELS: { id: AIDifficulty; label: string; desc: string; elo: string }[] = [
  { id: "easy", label: "Beginner", desc: "For learning", elo: "~800" },
  { id: "medium", label: "Intermediate", desc: "Casual play", elo: "~1200" },
  { id: "hard", label: "Advanced", desc: "Competitive", elo: "~1600" },
  { id: "master", label: "Master", desc: "Expert play", elo: "~2000" },
]

const TIME_CONTROLS: { label: string; time: number; increment: number; category: string }[] = [
  { label: "1+0", time: 60000, increment: 0, category: "Bullet" },
  { label: "3+0", time: 180000, increment: 0, category: "Blitz" },
  { label: "3+2", time: 180000, increment: 2000, category: "Blitz" },
  { label: "5+0", time: 300000, increment: 0, category: "Blitz" },
  { label: "10+0", time: 600000, increment: 0, category: "Rapid" },
  { label: "15+10", time: 900000, increment: 10000, category: "Rapid" },
]

const MATH_LEVELS: { id: MathDifficulty; label: string; desc: string }[] = [
  { id: "easy", label: "Easy", desc: "Simple arithmetic & small factorials" },
  { id: "medium", label: "Medium", desc: "Larger factorials & powers" },
  { id: "hard", label: "Hard", desc: "Complex expressions" },
]

export function PlaySetup() {
  const { auth } = useAppState()
  const navigate = useNavigate()
  const [mode, setMode] = React.useState<GameMode>("standard")
  const [opponent, setOpponent] = React.useState<"ai" | "local">("ai")
  const [difficulty, setDifficulty] = React.useState<AIDifficulty>("medium")
  const [timeIdx, setTimeIdx] = React.useState(3) // 5+0
  const [color, setColor] = React.useState<"w" | "b" | "random">("w")
  const [mathDiff, setMathDiff] = React.useState<MathDifficulty>("medium")
  const [friends, setFriends] = React.useState<any[]>([])
  const [showFriendModal, setShowFriendModal] = React.useState(false)
  const [inviteError, setInviteError] = React.useState("")
  const [inviteSuccess, setInviteSuccess] = React.useState("")
  const [inviteLoading, setInviteLoading] = React.useState(false)

  const handleStart = () => {
    const tc = TIME_CONTROLS[timeIdx]
    const playerColor = color === "random" ? (Math.random() < 0.5 ? "w" : "b") : color

    const config: GameConfig = {
      mode,
      opponent,
      aiDifficulty: difficulty,
      playerColor,
      timeControl: tc.time,
      increment: tc.increment,
      mathDifficulty: mathDiff,
    }

    navigate("/gameplay", { state: { config } })
  }

  const fetchFriendList = React.useCallback(async () => {
    if (!auth.accessToken) return
    try {
      const results = await fetchFriends(auth.accessToken)
      setFriends(results)
    } catch (err) {
      console.error(err)
    }
  }, [auth.accessToken])

  React.useEffect(() => {
    fetchFriendList()
  }, [fetchFriendList])

  const handleChallengeFriend = async (friend: any) => {
    if (!auth.accessToken) return
    setInviteLoading(true)
    setInviteError("")
    setInviteSuccess("")
    const tc = TIME_CONTROLS[timeIdx]
    const playerColor = color === "random" ? (Math.random() < 0.5 ? "w" : "b") : color
    const gameId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10)
    const gameConfig = {
      mode,
      opponent: 'human',
      playerColor,
      timeControl: tc.time,
      increment: tc.increment,
      mathDifficulty: mathDiff,
    }

    try {
      await sendGameInvite(auth.accessToken, friend.username, gameConfig, gameId)
      setInviteSuccess(`Invite sent to ${friend.username}`)
      setInviteLoading(false)
      setShowFriendModal(false)
    } catch (err: any) {
      console.error(err)
      setInviteError(err?.message ?? 'Unable to send invite')
      setInviteLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-text-primary">New Game</h2>
        <p className="text-text-secondary mt-1">Configure your match</p>
      </div>

      {/* Game Mode */}
      <Card className="card-elevated">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" /> Game Mode
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GAME_MODES.map((m) => {
              const Icon = m.icon
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "text-left p-4 rounded-xl border transition-all",
                    mode === m.id
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                      : "border-border-soft hover:border-text-secondary/40 hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={cn("w-5 h-5", mode === m.id ? "text-primary" : "text-text-secondary")} />
                    <span className="font-semibold text-sm">{m.label}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{m.desc}</p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Opponent */}
      <Card className="card-elevated">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Opponent
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setOpponent("ai")}
              className={cn(
                "p-4 rounded-xl border transition-all text-center",
                opponent === "ai" ? "border-primary bg-primary/10" : "border-border-soft hover:bg-white/5"
              )}
            >
              <Bot className={cn("w-6 h-6 mx-auto mb-1", opponent === "ai" ? "text-primary" : "text-text-secondary")} />
              <span className="text-sm font-medium">vs AI</span>
            </button>
            <button
              onClick={() => setOpponent("local")}
              className={cn(
                "p-4 rounded-xl border transition-all text-center",
                opponent === "local" ? "border-primary bg-primary/10" : "border-border-soft hover:bg-white/5"
              )}
            >
              <Users className={cn("w-6 h-6 mx-auto mb-1", opponent === "local" ? "text-primary" : "text-text-secondary")} />
              <span className="text-sm font-medium">Local 2P</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* AI Difficulty */}
      {opponent === "ai" && (
        <Card className="card-elevated">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" /> AI Difficulty
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {AI_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setDifficulty(level.id)}
                  className={cn(
                    "p-3 rounded-xl border transition-all text-left",
                    difficulty === level.id ? "border-primary bg-primary/10" : "border-border-soft hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{level.label}</span>
                    <span className="text-[10px] text-text-secondary bg-text-secondary/10 px-1.5 py-0.5 rounded">
                      {level.elo}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">{level.desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Control */}
      <Card className="card-elevated">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Time Control
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {TIME_CONTROLS.map((tc, idx) => (
              <button
                key={tc.label}
                onClick={() => setTimeIdx(idx)}
                className={cn(
                  "p-3 rounded-xl border transition-all text-center",
                  timeIdx === idx ? "border-primary bg-primary/10" : "border-border-soft hover:bg-white/5"
                )}
              >
                <div className="font-mono font-bold text-sm">{tc.label}</div>
                <div className="text-[10px] text-text-secondary">{tc.category}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Selection (AI only) */}
      {opponent === "ai" && (
        <Card className="card-elevated">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" /> Play As
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "w" as const, label: "White", icon: "♔" },
                { id: "random" as const, label: "Random", icon: "?" },
                { id: "b" as const, label: "Black", icon: "♚" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={cn(
                    "p-4 rounded-xl border transition-all text-center",
                    color === c.id ? "border-primary bg-primary/10" : "border-border-soft hover:bg-white/5"
                  )}
                >
                  <div className="text-3xl mb-1">
                    {c.id === "random" ? <Shuffle className="w-7 h-7 mx-auto text-text-secondary" /> : c.icon}
                  </div>
                  <span className="text-xs font-medium">{c.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Math Difficulty (Factorial mode only) */}
      {mode === "factorial" && (
        <Card className="card-elevated border-violet-500/20">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" /> Math Difficulty
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {MATH_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setMathDiff(level.id)}
                  className={cn(
                    "p-3 rounded-xl border transition-all text-center",
                    mathDiff === level.id ? "border-violet-400 bg-violet-500/10" : "border-border-soft hover:bg-white/5"
                  )}
                >
                  <span className="font-medium text-sm block">{level.label}</span>
                  <span className="text-[10px] text-text-secondary">{level.desc}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        <Button size="lg" className="w-full text-lg h-14" onClick={handleStart}>
          {mode === "factorial" && <Brain className="w-5 h-5 mr-2" />}
          {mode === "standard" && <Swords className="w-5 h-5 mr-2" />}
          Start Game
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full text-lg h-14"
          onClick={() => setShowFriendModal(true)}
          disabled={friends.length === 0}
        >
          <Users className="w-5 h-5 mr-2" />
          Challenge a Friend
        </Button>
      </div>

      {showFriendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-surface border border-border-soft shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border-soft">
              <div>
                <h3 className="text-xl font-semibold text-text-primary">Challenge a Friend</h3>
                <p className="text-sm text-text-secondary">Select a friend to send a private game invite.</p>
              </div>
              <button
                className="text-text-secondary hover:text-text-primary"
                onClick={() => setShowFriendModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {inviteError && <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-sm text-danger">{inviteError}</div>}
              {inviteSuccess && <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/20 p-3 text-sm text-emerald-500">{inviteSuccess}</div>}
              {friends.length === 0 ? (
                <div className="text-sm text-text-secondary">You don’t have friends yet. Add some in the Friends hub first.</div>
              ) : (
                <div className="grid gap-3">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between gap-3 p-4 rounded-3xl border border-border-soft bg-background">
                      <div>
                        <div className="font-medium text-text-primary">{friend.username}</div>
                        <div className="text-xs text-text-secondary">{friend.rating ?? 1200} ELO</div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleChallengeFriend(friend)}
                        disabled={inviteLoading}
                      >
                        {inviteLoading ? 'Sending…' : 'Invite'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
