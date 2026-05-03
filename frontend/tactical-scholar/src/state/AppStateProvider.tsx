import * as React from "react";
import type { MatchHistoryItem, PlayerProfile } from "../types/domain";
import { socketClient, type ConnectionState } from "../realtime/socketClient";
import { login, register, refreshToken as refreshAuthToken, fetchMe, type AuthUser } from "../api/auth";
import { fetchGames, saveGame, type GameRecord } from "../api/games";

interface AuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  error?: string;
}

interface UserProfile extends PlayerProfile {
  friendsCount: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface AppState {
  me: UserProfile;
  connection: ConnectionState;
  history: MatchHistoryItem[];
}

const guestProfile: UserProfile = {
  id: "guest",
  username: "Guest",
  rating: 1200,
  friendsCount: 0,
  gamesPlayed: 0,
  gamesWon: 0,
  winRate: 100,
};

const initialState: AppState = {
  me: guestProfile,
  connection: "connecting",
  history: [],
};

interface AppStateContextValue {
  state: AppState;
  auth: AuthState;
  signIn: (credentials: { username: string; password: string }) => Promise<void>;
  signUp: (payload: { first_name: string; last_name: string; username: string; email: string; password: string }) => Promise<void>;
  signOut: () => void;
  recordGame: (data: { pgn: string; result: string; mode: string; ai_level?: number }) => Promise<void>;
  refreshProfile: () => Promise<void>;
  simulateDisconnect: () => void;
}

const AppStateContext = React.createContext<AppStateContextValue | null>(null);

function normalizeUser(user: AuthUser): UserProfile {
  const winRate = user.games_played > 0
    ? Math.round((user.games_won / user.games_played) * 100)
    : 100;
  return {
    id: String(user.id),
    username: user.username,
    rating: user.rating ?? 1200,
    friendsCount: 0,
    gamesPlayed: user.games_played ?? 0,
    gamesWon: user.games_won ?? 0,
    winRate,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
  };
}

function gameRecordToHistory(game: GameRecord): MatchHistoryItem {
  const resultMap: Record<string, "Win" | "Loss" | "Draw"> = {
    win: "Win", loss: "Loss", draw: "Draw", resigned: "Loss",
  };
  const result = resultMap[game.result] ?? "Draw";

  // Estimate rating change
  let ratingChange = 0;
  if (result === "Win") ratingChange = 10;
  else if (result === "Loss") ratingChange = -8;

  // Format time ago
  const createdAt = new Date(game.created_at);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  let playedAt: string;
  if (diffMin < 1) playedAt = "Just now";
  else if (diffMin < 60) playedAt = `${diffMin}m ago`;
  else if (diffMin < 1440) playedAt = `${Math.floor(diffMin / 60)}h ago`;
  else playedAt = `${Math.floor(diffMin / 1440)}d ago`;

  return {
    id: String(game.id),
    opponent: game.mode === "ai" ? `AI (Lvl ${game.ai_level ?? "?"})` : "Human",
    result,
    ratingChange,
    gameType: game.mode === "ai" ? "Standard" : "Standard",
    playedAt,
  };
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AppState>(initialState);
  const [auth, setAuth] = React.useState<AuthState>({
    isAuthenticated: false,
    isInitializing: true,
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  });

  // Load game history from backend
  const loadHistory = React.useCallback(async (token: string) => {
    try {
      const games = await fetchGames(token);
      const history = games.map(gameRecordToHistory);
      setState((prev) => ({ ...prev, history }));
    } catch {
      // Silently fail — history will be empty
    }
  }, []);

  const setAuthenticatedUser = React.useCallback((user: AuthUser) => {
    setState((prev) => ({ ...prev, me: normalizeUser(user) }));
    setAuth((prev) => ({ ...prev, isAuthenticated: true, error: undefined }));
  }, []);

  const persistTokens = React.useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setAuth((prev) => ({ ...prev, accessToken, refreshToken }));
    socketClient.setToken(accessToken);
  }, []);

  const refreshAccessToken = React.useCallback(async (refreshToken: string) => {
    const data = await refreshAuthToken({ refresh: refreshToken });
    persistTokens(data.access, data.refresh);
    return data.access;
  }, [persistTokens]);

  const fetchMeWithRefresh = React.useCallback(async (accessToken: string, refreshToken: string | null) => {
    try {
      return await fetchMe(accessToken);
    } catch {
      if (!refreshToken) throw new Error("No refresh token available")
      const nextAccess = await refreshAccessToken(refreshToken);
      return await fetchMe(nextAccess);
    }
  }, [refreshAccessToken]);

  const signIn = React.useCallback(async (credentials: { username: string; password: string }) => {
    const data = await login(credentials);
    persistTokens(data.access, data.refresh);
    const user = await fetchMe(data.access);
    setAuthenticatedUser(user);
    loadHistory(data.access);
  }, [persistTokens, setAuthenticatedUser, loadHistory]);

  const signUp = React.useCallback(async (payload: { first_name: string; last_name: string; username: string; email: string; password: string }) => {
    const data = await register(payload);
    persistTokens(data.access, data.refresh);
    setAuthenticatedUser(data.user);
  }, [persistTokens, setAuthenticatedUser]);

  const signOut = React.useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAuth({ isAuthenticated: false, isInitializing: false, accessToken: null, refreshToken: null });
    setState({ ...initialState, connection: state.connection });
    socketClient.setToken(null);
  }, [state.connection]);

  // Save a completed game to backend & refresh profile
  const recordGame = React.useCallback(async (data: { pgn: string; result: string; mode: string; ai_level?: number }) => {
    let token = auth.accessToken;
    if (!token) return;
    try {
      await saveGame(token, data);
      const user = await fetchMe(token);
      setAuthenticatedUser(user);
      await loadHistory(token);
    } catch (err) {
      if (!auth.refreshToken) {
        console.error("Failed to save game:", err);
        return;
      }
      try {
        token = await refreshAccessToken(auth.refreshToken);
        await saveGame(token, data);
        const user = await fetchMe(token);
        setAuthenticatedUser(user);
        await loadHistory(token);
      } catch (refreshErr) {
        console.error("Failed to save game after refresh:", refreshErr);
      }
    }
  }, [auth.accessToken, auth.refreshToken, loadHistory, refreshAccessToken, setAuthenticatedUser]);

  // Manually refresh profile from backend
  const refreshProfile = React.useCallback(async () => {
    let token = auth.accessToken;
    if (!token) return;
    try {
      const user = await fetchMe(token);
      setAuthenticatedUser(user);
      await loadHistory(token);
    } catch {
      if (!auth.refreshToken) return;
      try {
        token = await refreshAccessToken(auth.refreshToken);
        const user = await fetchMe(token);
        setAuthenticatedUser(user);
        await loadHistory(token);
      } catch {
        // ignore
      }
    }
  }, [auth.accessToken, auth.refreshToken, loadHistory, refreshAccessToken, setAuthenticatedUser]);

  React.useEffect(() => {
    socketClient.connect();
    return socketClient.onConnectionState((connection) => {
      setState((prev) => ({ ...prev, connection }));
    });
  }, []);

  // Session restore — runs once on mount
  const hasRestoredRef = React.useRef(false);
  React.useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const restoreSession = async () => {
      const token = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      if (!token) {
        setAuth((prev) => ({ ...prev, isInitializing: false }));
        return;
      }

      try {
        const user = await fetchMeWithRefresh(token, refreshToken);
        setState((prev) => ({ ...prev, me: normalizeUser(user) }));
        setAuth((prev) => ({
          ...prev,
          isAuthenticated: true,
          isInitializing: false,
          accessToken: localStorage.getItem("accessToken"),
          refreshToken: localStorage.getItem("refreshToken"),
        }));
        socketClient.setToken(localStorage.getItem("accessToken"));
        loadHistory(localStorage.getItem("accessToken") ?? "");
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setAuth({ isAuthenticated: false, isInitializing: false, accessToken: null, refreshToken: null });
      }
    };

    restoreSession();
  }, [loadHistory]);

  const value = React.useMemo(
    () => ({
      state,
      auth,
      signIn,
      signUp,
      signOut,
      recordGame,
      refreshProfile,
      simulateDisconnect: () => socketClient.simulateDisconnect(),
    }),
    [state, auth, signIn, signUp, signOut, recordGame, refreshProfile],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = React.useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }
  return context;
}
