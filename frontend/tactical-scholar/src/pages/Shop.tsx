import * as React from "react"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { cn } from "../lib/utils"
import { Crown, Sparkles, Palette, Lock, Check } from "lucide-react"

interface Skin {
  id: string; name: string; preview: string; price: string; isPro: boolean; owned: boolean
}

const SKINS: Skin[] = [
  { id: "classic", name: "Classic", preview: "♔♕♖♗♘♙", price: "Free", isPro: false, owned: true },
  { id: "neon", name: "Neon Glow", preview: "♔♕♖♗♘♙", price: "500 coins", isPro: false, owned: false },
  { id: "royal", name: "Royal Gold", preview: "♔♕♖♗♘♙", price: "Pro", isPro: true, owned: false },
  { id: "midnight", name: "Midnight", preview: "♚♛♜♝♞♟", price: "300 coins", isPro: false, owned: false },
  { id: "crystal", name: "Crystal", preview: "♔♕♖♗♘♙", price: "Pro", isPro: true, owned: false },
  { id: "wooden", name: "Wooden", preview: "♔♕♖♗♘♙", price: "200 coins", isPro: false, owned: false },
]

const PRO_FEATURES = [
  "Unlimited AI Analysis after every game",
  "All premium piece skins unlocked",
  "Advanced Factorial Chess difficulty modes",
  "Priority matchmaking in online games",
  "Custom board themes & backgrounds",
  "Ad-free experience",
]

export function Shop() {
  const [activeSkin, setActiveSkin] = React.useState("classic")

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-bold text-text-primary flex items-center gap-3">
          <Palette className="w-8 h-8 text-primary" /> Shop
        </h2>
        <p className="text-text-secondary mt-1">Customize your experience</p>
      </div>

      {/* Pro Banner */}
      <Card className="overflow-hidden border-amber-500/30">
        <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-violet-600/20 p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-amber-400" />
                <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Tactical Scholar Pro</span>
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3">Unlock Your Full Potential</h3>
              <ul className="space-y-2">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check className="w-4 h-4 text-primary shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-text-primary mb-1">$4.99<span className="text-lg text-text-secondary">/mo</span></div>
              <Button size="lg" className="mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold">
                <Sparkles className="w-4 h-4 mr-2" /> Upgrade to Pro
              </Button>
              <p className="text-[10px] text-text-secondary mt-2">Cancel anytime • 7-day free trial</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Piece Skins */}
      <div>
        <h3 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" /> Piece Skins
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {SKINS.map((skin) => (
            <Card key={skin.id} className={cn(
              "card-elevated transition-all cursor-pointer",
              activeSkin === skin.id && "border-primary ring-1 ring-primary"
            )} onClick={() => skin.owned && setActiveSkin(skin.id)}>
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-3 tracking-wider">{skin.preview}</div>
                <h4 className="font-medium text-sm">{skin.name}</h4>
                <div className="mt-2">
                  {skin.owned ? (
                    activeSkin === skin.id
                      ? <span className="text-xs text-primary font-semibold">Active</span>
                      : <Button size="sm" variant="ghost" className="text-xs">Select</Button>
                  ) : skin.isPro ? (
                    <span className="text-xs text-amber-400 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" /> Pro Only
                    </span>
                  ) : (
                    <Button size="sm" variant="outline" className="text-xs">{skin.price}</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
