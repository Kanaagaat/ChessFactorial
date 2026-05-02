import { Outlet, Link, useLocation } from "react-router-dom"
import { Home, Users, History, Swords, User, LogOut, Bell, Trophy, ShoppingBag, BarChart3 } from "lucide-react"
import { cn } from "../lib/utils"
import { useAppState } from "../state/AppStateProvider"

export function MainLayout() {
  const location = useLocation()
  const { state, signOut } = useAppState()

  const navItems = [
    { name: "Home", path: "/home", icon: Home },
    { name: "Play", path: "/play", icon: Swords },
    { name: "Friends", path: "/friends", icon: Users },
    { name: "History", path: "/history", icon: History },
    { name: "Rankings", path: "/leaderboard", icon: Trophy },
    { name: "Shop", path: "/shop", icon: ShoppingBag },
    { name: "Profile", path: "/profile", icon: User },
  ]

  // Mobile nav shows fewer items
  const mobileNavItems = navItems.filter((item) =>
    ["/home", "/play", "/leaderboard", "/profile", "/shop"].includes(item.path)
  )

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border-soft bg-surface">
        <div className="p-6">
          <Link to="/home" className="block">
            <h1 className="font-serif text-2xl font-bold text-text-primary tracking-tight">
              Tactical Scholar
            </h1>
            <p className="text-[10px] text-primary font-semibold tracking-widest uppercase mt-0.5">
              Factorial Chess Academy
            </p>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-text-secondary")} />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border-soft">
          <button
            className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
            onClick={signOut}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-border-soft bg-surface/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
          <div className="md:hidden">
            <h1 className="font-serif text-lg font-bold">Tactical Scholar</h1>
          </div>
          <div className="hidden md:flex flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-text-primary">{state.me.username}</div>
              <div className="text-[10px] text-primary font-semibold">{state.me.rating} ELO</div>
            </div>
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              state.connection === "online" ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"
            )}>
              {state.connection}
            </span>
            <button className="relative p-2 rounded-full hover:bg-white/5 text-text-secondary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden border-t border-border-soft bg-surface/95 backdrop-blur-sm flex items-center justify-around p-1.5 pb-safe shrink-0">
        {mobileNavItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg min-w-[56px] transition-colors",
                isActive ? "text-primary" : "text-text-secondary"
              )}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
