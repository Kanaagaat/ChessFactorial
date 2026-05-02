import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { MainLayout } from "./layouts/MainLayout"
import { LandingPage } from "./pages/LandingPage"
import { AuthPage } from "./pages/AuthPage"
import { Home } from "./pages/Home"
import { Friends } from "./pages/Friends"
import { History } from "./pages/History"
import { PlaySetup } from "./pages/PlaySetup"
import { Profile } from "./pages/Profile"
import { Gameplay } from "./pages/Gameplay"
import { Analysis } from "./pages/Analysis"
import { Leaderboard } from "./pages/Leaderboard"
import { Shop } from "./pages/Shop"
import { useAppState } from "./state/AppStateProvider"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { auth } = useAppState()

  if (auth.isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-text-secondary text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  return auth.isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/play" element={<PlaySetup />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/history" element={<History />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/analysis" element={<Analysis />} />
        </Route>

        <Route
          path="/gameplay"
          element={
            <ProtectedRoute>
              <Gameplay />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
