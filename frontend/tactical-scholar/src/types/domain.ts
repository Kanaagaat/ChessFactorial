export type GameType = "Standard" | "Blitz" | "Bullet" | "Factorial";

export type Visibility = "public" | "private";

export interface PlayerProfile {
  id: string;
  username: string;
  rating: number;
}

export interface GameSlot {
  id: string;
  host: PlayerProfile;
  gameType: GameType;
  timeControl: string;
  isPrivate: boolean;
  isJoined?: boolean;
}

export interface Friend {
  id: string;
  username: string;
  rating: number;
  status: "online" | "offline";
  lastSeen?: string;
}

export interface Invite {
  id: string;
  sender: PlayerProfile;
  gameType: GameType;
  timeControl: string;
}

export interface MatchHistoryItem {
  id: string;
  opponent: string;
  result: "Win" | "Loss" | "Draw";
  ratingChange: number;
  gameType: GameType;
  playedAt: string;
}
