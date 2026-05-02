import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Chess } from 'chess.js';
import { GameApiService, SavedGame } from '../core/game-api.service';
import { ChessBoardComponent } from '../shared/chess-board.component';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, ChessBoardComponent],
  template: `
    <section class="history-layout">
      <article class="panel games">
        <h1>Game History</h1>
        <div *ngIf="loading">
          <div class="skeleton" *ngFor="let _ of skeletonRows"></div>
        </div>
        <button *ngFor="let game of games" (click)="load(game)" class="row">
          <span>#{{ game.id }} · {{ game.result }}</span>
          <small>AI {{ game.ai_level ?? '-' }} · {{ game.created_at | date: 'short' }}</small>
        </button>
      </article>

      <article class="panel replay" *ngIf="selectedGame">
        <h2>Replay #{{ selectedGame.id }}</h2>
        <app-chess-board [fen]="replayFen" />
        <div class="actions">
          <button (click)="prev()">Prev</button>
          <button (click)="next()">Next</button>
          <button (click)="analyze()">Analyze with Coach</button>
        </div>
        <div class="coach" *ngIf="mistakes.length">
          <h3>Top mistakes</h3>
          <div *ngFor="let m of mistakes" class="mistake">
            <strong>Move {{ m.move_number }} — {{ m.label }}</strong>
            <p>{{ m.explanation }}</p>
            <small>Better: {{ m.better_move }}</small>
          </div>
        </div>
      </article>
    </section>
  `,
  styles: [`
    .history-layout{ display:grid; grid-template-columns:320px minmax(0,1fr); gap:16px; }
    .games,.replay{ padding:16px; }
    .row{ display:flex; justify-content:space-between; width:100%; margin-top:8px; padding:10px; border:1px solid var(--border); background:transparent; color:var(--text-primary); border-radius:10px; cursor:pointer; }
    .actions{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:12px; }
    .actions button{ border:1px solid var(--border); border-radius:10px; padding:10px; background:transparent; color:var(--text-primary); cursor:pointer; }
    .mistake{ border-top:1px solid var(--border); padding-top:10px; margin-top:10px; }
    .skeleton{ height:44px; border-radius:10px; background:rgba(16,185,129,.15); margin-top:8px; animation:pulse 1.2s infinite; }
    @keyframes pulse { 0%,100%{opacity:.55} 50%{opacity:1} }
    @media (max-width: 1100px){ .history-layout{ grid-template-columns:1fr; } }
  `]
})
export class HistoryPageComponent implements OnInit {
  loading = true;
  skeletonRows = [1, 2, 3, 4];
  games: SavedGame[] = [];
  selectedGame: SavedGame | null = null;
  replayFen = '8/8/8/8/8/8/8/8 w - - 0 1';
  private replay = new Chess();
  private moves: string[] = [];
  private pointer = 0;
  mistakes: Array<{ move_number: number; label: string; explanation: string; better_move: string }> = [];

  constructor(private gamesApi: GameApiService) {}

  ngOnInit() {
    this.gamesApi.listGames().subscribe({
      next: (games) => {
        this.games = games;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  load(game: SavedGame) {
    this.selectedGame = game;
    this.replay = new Chess();
    this.replay.loadPgn(game.pgn);
    this.moves = this.replay.history();
    this.pointer = 0;
    this.replay.reset();
    this.replayFen = this.replay.fen();
    this.mistakes = game.analysis?.mistakes ?? [];
  }

  next() {
    if (!this.moves[this.pointer]) return;
    this.replay.move(this.moves[this.pointer]);
    this.pointer += 1;
    this.replayFen = this.replay.fen();
  }

  prev() {
    this.replay.undo();
    this.pointer = Math.max(0, this.pointer - 1);
    this.replayFen = this.replay.fen();
  }

  analyze() {
    if (!this.selectedGame) return;
    this.gamesApi.analyzeGame(this.selectedGame.id).subscribe({
      next: (res) => (this.mistakes = res.mistakes)
    });
  }
}
