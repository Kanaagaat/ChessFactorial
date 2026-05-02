import * as React from "react"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { useNavigate } from "react-router-dom"
import type { GameType, Visibility } from "../types/domain"

export function Create() {
  const navigate = useNavigate()
  const [type, setType] = React.useState<GameType>("Factorial")
  const [visibility, setVisibility] = React.useState<Visibility>("public")
  const [pin, setPin] = React.useState("")

  const gameTypes: GameType[] = ["Standard", "Blitz", "Bullet", "Factorial"]

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <h2 className="font-serif text-3xl font-bold text-text-primary">Create Game</h2>
      <Card className="card-elevated">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="font-medium">Game Type</label>
            <div className="grid grid-cols-2 gap-3">
              {gameTypes.map((gameType) => (
                <Button key={gameType} variant={type === gameType ? "primary" : "outline"} onClick={() => setType(gameType)} type="button">
                  {gameType}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="font-medium">Visibility</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="vis" checked={visibility === "public"} onChange={() => setVisibility("public")} /> Public
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="vis" checked={visibility === "private"} onChange={() => setVisibility("private")} /> Private (Requires PIN)
              </label>
            </div>
          </div>
          {visibility === "private" && <Input label="PIN" value={pin} onChange={(e) => setPin(e.target.value)} helperText="PIN is required for private rooms." />}

          <Button className="w-full" size="lg" onClick={() => navigate("/gameplay")}>
            Create {type} Match
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
