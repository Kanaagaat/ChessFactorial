import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API_BASE = 'http://localhost:8000';

export interface SavedGame {
  id: number;
  pgn: string;
  result: 'win' | 'loss' | 'draw' | 'resigned';
  mode: 'human' | 'ai';
  ai_level: number | null;
  created_at: string;
  analysis?: {
    mistakes: Array<{
      move_number: number;
      label: string;
      explanation: string;
      better_move: string;
    }>;
  } | null;
}

@Injectable({ providedIn: 'root' })
export class GameApiService {
  constructor(private http: HttpClient) {}

  saveGame(payload: { pgn: string; result: string; mode: 'human' | 'ai'; ai_level: number | null }) {
    return this.http.post<SavedGame>(`${API_BASE}/api/games/save/`, payload);
  }

  listGames() {
    return this.http.get<SavedGame[]>(`${API_BASE}/api/games/list/`);
  }

  getGame(id: number) {
    return this.http.get<SavedGame>(`${API_BASE}/api/games/${id}/single/`);
  }

  deleteGame(id: number) {
    return this.http.delete(`${API_BASE}/api/games/${id}/delete/`);
  }

  analyzeGame(id: number) {
    return this.http.post<{ mistakes: Array<{ move_number: number; label: string; explanation: string; better_move: string }> }>(
      `${API_BASE}/api/games/${id}/analyse/`,
      {}
    );
  }
}
