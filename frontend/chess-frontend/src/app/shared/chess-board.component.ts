import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Square } from 'chess.js';

interface BoardSquare {
  square: Square;
  piece: string;
  isDark: boolean;
}

const PIECES: Record<string, string> = {
  p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
  P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔'
};

@Component({
  selector: 'app-chess-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="board panel">
      <div
        class="tile"
        *ngFor="let tile of board"
        [class.dark]="tile.isDark"
        [class.selected]="selected === tile.square"
        [class.last]="isLastMove(tile.square)"
        [class.legal]="legalMoves.includes(tile.square)"
        (click)="choose(tile.square)">
        <span class="dot" *ngIf="legalMoves.includes(tile.square) && !tile.piece"></span>
        <span class="piece">{{ tile.piece }}</span>
      </div>
    </div>
  `,
  styles: [`
    .board { display:grid; grid-template-columns:repeat(8,1fr); width:min(92vmin,640px); aspect-ratio:1; overflow:hidden; }
    .tile { position:relative; display:grid; place-items:center; font-size:clamp(28px,5.4vmin,48px); cursor:pointer; }
    .tile:not(.dark){ background:var(--light-square); color:#0f172a; }
    .tile.dark { background:var(--dark-square); color:#f8fafc; }
    .tile.selected{ outline:3px solid var(--primary); outline-offset:-3px; }
    .tile.last{ box-shadow: inset 0 0 0 3px rgba(16,185,129,.35); }
    .tile.legal{ box-shadow: inset 0 0 0 2px rgba(16,185,129,.55); }
    .piece{ user-select:none; }
    .dot{ width:14px; height:14px; border-radius:50%; background:rgba(16,185,129,.75); position:absolute; }
  `]
})
export class ChessBoardComponent {
  @Input() fen = '';
  @Input() orientation: 'white' | 'black' = 'white';
  @Input() selected: Square | null = null;
  @Input() legalMoves: Square[] = [];
  @Input() lastMove: { from: Square; to: Square } | null = null;
  @Output() squareClick = new EventEmitter<Square>();

  get board(): BoardSquare[] {
    if (!this.fen) return [];
    const rows = this.fen.split(' ')[0].split('/');
    const tiles: BoardSquare[] = [];
    const ranks = this.orientation === 'white'
      ? [8, 7, 6, 5, 4, 3, 2, 1]
      : [1, 2, 3, 4, 5, 6, 7, 8];

    for (const rank of ranks) {
      const row = rows[8 - rank];
      let fileIndex = 0;
      for (const ch of row) {
        const repeats = Number(ch);
        if (!Number.isNaN(repeats)) {
          for (let i = 0; i < repeats; i += 1) {
            const file = this.orientation === 'white'
              ? String.fromCharCode(97 + fileIndex)
              : String.fromCharCode(104 - fileIndex);
            const square = `${file}${rank}` as Square;
            const darkIndex = this.orientation === 'white' ? fileIndex : 7 - fileIndex;
            tiles.push({ square, piece: '', isDark: (darkIndex + rank) % 2 === 0 });
            fileIndex += 1;
          }
        } else {
          const file = this.orientation === 'white'
            ? String.fromCharCode(97 + fileIndex)
            : String.fromCharCode(104 - fileIndex);
          const square = `${file}${rank}` as Square;
          const darkIndex = this.orientation === 'white' ? fileIndex : 7 - fileIndex;
          tiles.push({ square, piece: PIECES[ch] ?? '', isDark: (darkIndex + rank) % 2 === 0 });
          fileIndex += 1;
        }
      }
    }
    return tiles;
  }

  choose(square: Square) {
    this.squareClick.emit(square);
  }

  isLastMove(square: Square) {
    return this.lastMove?.from === square || this.lastMove?.to === square;
  }
}
