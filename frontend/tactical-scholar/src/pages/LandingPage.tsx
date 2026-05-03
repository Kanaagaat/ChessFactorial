import { Button } from "../components/ui/Button"
import { useNavigate } from "react-router-dom"
import { BrainCircuit, Swords, Zap, Users } from "lucide-react"

export function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-16 md:px-12 flex items-center justify-center">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-0 -left-40 h-96 w-96 rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 md:grid-cols-12 items-center">
        <section className="md:col-span-7 lg:col-span-8">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-6 text-sm font-medium text-primary shadow-sm backdrop-blur-md">
            <Zap className="mr-2 h-4 w-4" />
            V1.0 is Live
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-text-primary to-text-secondary leading-tight tracking-tight">
            Master the <span className="text-primary">Mind.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-text-secondary/90">
            High-stakes real-time chess with a modern academic identity. Tactical Scholar blends tournament pace, social competition, and the intellectual pressure of Factorial Chess.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" className="h-14 px-8 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300" onClick={() => navigate("/auth")}>
              Enter Academy
            </Button>
          </div>
        </section>

        <section className="md:col-span-5 lg:col-span-4 grid auto-rows-[160px] gap-6 sm:grid-cols-2">
          {[
            { Icon: BrainCircuit, title: "Factorial", body: "Solve fast. Move faster.", spanClass: "sm:col-span-2", bg: "bg-surface/60" },
            { Icon: Swords, title: "Modes", body: "Standard & Blitz", spanClass: "", bg: "bg-surface/40" },
            { Icon: Users, title: "Social", body: "Friends & Invites", spanClass: "", bg: "bg-surface/40" },
            { Icon: Zap, title: "Realtime", body: "Live board sync & events", spanClass: "sm:col-span-2", bg: "bg-surface/60" },
          ].map(({ Icon, title, body, spanClass, bg }) => (
            <article key={title} className={`group relative overflow-hidden rounded-3xl border border-white/5 ${bg} p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 ${spanClass}`}>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <Icon className="h-7 w-7 text-primary transition-transform duration-500 group-hover:scale-110" />
                <div>
                  <h3 className="text-2xl font-bold text-text-primary">{title}</h3>
                  <p className="mt-1 text-sm text-text-secondary/80">{body}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}
