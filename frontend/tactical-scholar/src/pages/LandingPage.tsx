import { Button } from "../components/ui/Button"
import { useNavigate } from "react-router-dom"
import { BrainCircuit, Swords, Zap, Users } from "lucide-react"

export function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen px-4 py-16 md:px-12">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-12">
        <section className="md:col-span-7 lg:col-span-8">
          <p className="mb-4 text-xs uppercase tracking-[0.24em] text-text-secondary">Tactical Scholar Academy</p>
          <h1 className="text-5xl md:text-7xl font-bold text-text-primary leading-tight">Master the Mind</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-text-secondary">
            High-stakes real-time chess with a modern academic identity. Tactical Scholar blends tournament pace, social competition, and the intellectual pressure of Factorial Chess.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Enter Academy
            </Button>
            <Button variant="outline" size="lg">
              Explore Curriculum
            </Button>
          </div>
        </section>

        <section className="md:col-span-5 lg:col-span-4 grid auto-rows-[140px] gap-4 sm:grid-cols-2">
          {[
            { Icon: BrainCircuit, title: "Factorial Chess", body: "Solve fast. Move faster.", spanClass: "sm:col-span-2" },
            { Icon: Swords, title: "Modes", body: "Standard • Blitz • Bullet • Factorial", spanClass: "" },
            { Icon: Users, title: "Social Play", body: "Invites, friends, and private rooms", spanClass: "" },
            { Icon: Zap, title: "Realtime", body: "Live board sync and instant feedback", spanClass: "sm:col-span-2" },
          ].map(({ Icon, title, body, spanClass }) => (
            <article key={title} className={`bento-card rounded-2xl p-5 ${spanClass}`}>
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 text-2xl">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{body}</p>
            </article>
          ))}
        </section>
      </div>
      <div className="mx-auto mt-12 max-w-7xl rounded-xl border border-border-soft bg-surface/70 p-4 text-sm text-text-secondary backdrop-blur-md">
        Modes: Standard, Blitz, Bullet, Factorial.
      </div>
    </div>
  )
}
