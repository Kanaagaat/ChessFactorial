import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chess, Move, PieceSymbol, Square } from 'chess.js';
import { delay, Subscription } from 'rxjs';
import { ChessBoardComponent } from '../shared/chess-board.component';
import { StockfishService } from '../core/stockfish.service';
import { GameApiService } from '../core/game-api.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-play-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ChessBoardComponent],
  template: `
    <section class="layout">
      <article class="panel controls">
        <h1>Play Chess</h1>

        <div class="fieldset">
          <label>
            <input type="radio" name="mode" [(ngModel)]="mode" [value]="'human'" />
            vs Human
          </label>
          <label>
            <input type="radio" name="mode" [(ngModel)]="mode" [value]="'computer'" />
            vs Computer
          </label>
        </div>

        <label *ngIf="mode === 'computer'">Difficulty
          <select [(ngModel)]="level">
            <option [ngValue]="2">Easy (depth 2)</option>
            <option [ngValue]="6">Medium (depth 6)</option>
            <option [ngValue]="14">Hard (depth 14)</option>
          </select>
        </label>

        <button type="button" (click)="newGame()">New game</button>
        <button type="button" (click)="resign()" [disabled]="chess.isGameOver()">Resign</button>
        <button type="button" (click)="flipBoard()">Flip board</button>

        <div class="status-box">
          <p><strong>Turn:</strong> {{ turnLabel }}</p>
          <p><strong>Status:</strong> {{ status }}</p>
        </div>
        <p *ngIf="message" class="message">{{ message }}</p>
      </article>

      <app-chess-board
        [fen]="chess.fen()"
        [orientation]="boardOrientation"
        [selected]="selected"
        [legalMoves]="legalMoves"
        [lastMove]="lastMove"
        (squareClick)="onSquareClick($event)"
      />

      <article class="panel pgn">
        <h2>Move History</h2>
        <ol class="moves">
          <li *ngFor="let move of moveHistory; let i = index">{{ i + 1 }}. {{ move }}</li>
        </ol>
      </article>
    </section>
  `,
  styles: [`
    .layout{ display:grid; gap:16px; grid-template-columns:280px minmax(0,1fr) 320px; align-items:start; }
    .controls,.pgn{ padding:16px; }
    h1,h2{ margin:0 0 12px; }
    .fieldset{ display:flex; flex-wrap:wrap; gap:10px; margin-bottom:12px; }
    .fieldset label{ display:flex; align-items:center; gap:8px; color:var(--text-secondary); cursor:pointer; }
    label{ display:block; margin-bottom:12px; color:var(--text-secondary); }
    select,button{ width:100%; margin-top:8px; border-radius:10px; border:1px solid var(--border); background:var(--panel); color:var(--text-primary); padding:10px; }
    button{ cursor:pointer; transition:all .2s ease; }
    button:hover:not(:disabled){ border-color:var(--primary); box-shadow:0 8px 20px rgba(16,185,129,.2); }
    .status-box{ margin-top:16px; padding:14px; border-radius:14px; background:rgba(30,41,59,.05); }
    .moves{ list-style:none; padding:0; margin:0; display:grid; gap:8px; }
    .moves li{ padding:12px; border-radius:12px; background:var(--panel); color:var(--text-secondary); }
    .message{ color:var(--primary); font-weight:600; margin-top:12px; }
    @media (max-width: 1100px){ .layout{ grid-template-columns:1fr; } .controls,.pgn{ order:2; } app-chess-board{ order:1; justify-self:center; } }
  `]
})
export class PlayPageComponent {
  chess = new Chess();
  selected: Square | null = null;
  legalMoves: Square[] = [];
  lastMove: { from: Square; to: Square } | null = null;
  status = 'White to move';
  message = '';
  level = 6;
  mode: 'human' | 'computer' = 'computer';
  isFlipped = false;
  private aiSubscription: Subscription | null = null;
  private moveAudio = new Audio('https://lichess1.org/assets/_fX61M6/sound/standard/Move.ogg');

  constructor(
    private stockfish: StockfishService,
    private gamesApi: GameApiService,
    private auth: AuthService
  ) {
    this.newGame();
  }

  get boardOrientation() {
    return this.isFlipped ? 'black' : 'white';
  }

  get turnLabel() {
    return this.chess.turn() === 'w' ? 'White' : 'Black';
  }

  get moveHistory() {
    return this.chess.history({ verbose: false });
  }

  onSquareClick(square: Square) {
    if (this.chess.isGameOver()) return;
    if (this.mode === 'computer' && this.chess.turn() === 'b') return;

    if (this.selected === square) {
      this.selected = null;
      this.legalMoves = [];
      return;
    }

    if (!this.selected) {
      const piece = this.chess.get(square);
      if (!piece || piece.color !== this.chess.turn()) return;
      this.selected = square;
      this.legalMoves = this.chess.moves({ square, verbose: true }).map((m) => m.to as Square);
      return;
    }

    const move = this.chess.move({ from: this.selected, to: square, promotion: 'q' as PieceSymbol });
    if (!move) {
      this.selected = null;
      this.legalMoves = [];
      return;
    }

    this.consumeMove(move);
    this.selected = null;
    this.legalMoves = [];
    this.checkEndAndMaybeSave();

    if (!this.chess.isGameOver() && this.mode === 'computer') {
      this.queueAiMove();
    }
  }

  newGame() {
    this.aiSubscription?.unsubscribe();
    this.stockfish.stop();
    this.chess.reset();
    this.selected = null;
    this.legalMoves = [];
    this.lastMove = null;
    this.message = '';
    this.status = 'White to move';
  }

  resign() {
    if (this.chess.isGameOver()) return;
    const loser = this.chess.turn() === 'w' ? 'White' : 'Black';
    const winner = this.chess.turn() === 'w' ? 'Black' : 'White';
    this.message = `${loser} resigned. ${winner} wins.`;
    this.status = 'Game over';
    this.chess.load(this.chess.fen());
    if (this.auth.isAuthenticated()) {
      const result = this.chess.turn() === 'w' ? 'loss' : 'win';
      this.gamesApi
        .saveGame({ pgn: this.chess.pgn(), result, mode: this.mode === 'computer' ? 'ai' : 'human', ai_level: this.mode === 'computer' ? this.level : null })
        .subscribe();
    }
  }

  flipBoard() {
    this.isFlipped = !this.isFlipped;
  }

  private queueAiMove() {
    this.message = 'Computer is thinking...';
    this.status = 'Black is thinking';
    this.aiSubscription?.unsubscribe();
    this.aiSubscription = this.stockfish.getBestMove(this.chess.fen(), this.level)
      .pipe(delay(400))
      .subscribe({
        next: (bestMove) => {
          if (!bestMove) {
            this.message = 'AI could not find a move.';
            return;
          }
          const from = bestMove.slice(0, 2) as Square;
          const to = bestMove.slice(2, 4) as Square;
          const move = this.chess.move({ from, to, promotion: 'q' as PieceSymbol });
          if (move) {
            this.consumeMove(move);
            this.checkEndAndMaybeSave();
          }
        },
        error: () => {
          this.message = 'AI engine failed. Try a new game.';
          this.status = 'Game paused';
        }
      });
  }

  private consumeMove(move: Move) {
    this.lastMove = { from: move.from as Square, to: move.to as Square };
    this.status = this.chess.turn() === 'w' ? 'White to move' : 'Black to move';
    this.moveAudio.currentTime = 0;
    this.moveAudio.play().catch(() => null);
  }

  private checkEndAndMaybeSave() {
    if (this.chess.isCheckmate()) this.message = 'Checkmate';
    else if (this.chess.isStalemate()) this.message = 'Stalemate';
    else if (this.chess.isDraw()) this.message = 'Draw';
    else if (this.chess.inCheck()) this.message = 'Check';
    else this.message = '';

    if (!this.chess.isGameOver() || !this.auth.isAuthenticated()) return;

    const result = this.chess.isCheckmate() ? (this.chess.turn() === 'w' ? 'loss' : 'win') : 'draw';
    this.gamesApi
      .saveGame({ pgn: this.chess.pgn(), result, mode: this.mode === 'computer' ? 'ai' : 'human', ai_level: this.mode === 'computer' ? this.level : null })
      .subscribe({ next: () => { this.message = `${this.message} • saved`; } });
  }
}
