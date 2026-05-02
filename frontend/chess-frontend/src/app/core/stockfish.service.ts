import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const STOCKFISH_CDN = 'https://cdn.jsdelivr.net/npm/stockfish@16.0.0/src/stockfish.js';

@Injectable({ providedIn: 'root' })
export class StockfishService {
  private worker: Worker | null = null;
  private readyPromise: Promise<void> | null = null;

  private async fetchSource(): Promise<string> {
    const response = await fetch(STOCKFISH_CDN);
    if (!response.ok) {
      throw new Error(`Failed to load Stockfish from CDN (${response.status})`);
    }
    return response.text();
  }

  private async createWorkerFromSource(source: string): Promise<Worker> {
    const blob = new Blob([source], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    return new Worker(url);
  }

  private async createWorker(): Promise<Worker> {
    try {
      return new Worker(STOCKFISH_CDN);
    } catch {
      const source = await this.fetchSource();
      return this.createWorkerFromSource(source);
    }
  }

  private ensureWorker(): Promise<Worker> {
    if (this.worker) {
      return Promise.resolve(this.worker);
    }

    this.readyPromise = new Promise<void>((resolve, reject) => {
      this.createWorker()
        .then((worker) => {
          this.worker = worker;
          const onReady = (event: MessageEvent) => {
            if (typeof event.data === 'string' && event.data.trim() === 'readyok') {
              worker.removeEventListener('message', onReady);
              resolve();
            }
          };

          worker.addEventListener('message', onReady);
          worker.postMessage('uci');
          worker.postMessage('isready');
        })
        .catch(reject);
    });

    return this.readyPromise.then(() => this.worker as Worker);
  }

  getBestMove(fen: string, depth: number): Observable<string> {
    return new Observable<string>((subscriber) => {
      let worker: Worker | null = null;
      let cancelled = false;

      this.ensureWorker()
        .then((w) => {
          if (cancelled) return;
          worker = w;

          const onMessage = (event: MessageEvent) => {
            const data = event.data;
            if (typeof data !== 'string') {
              return;
            }
            if (data.startsWith('bestmove')) {
              const bestMove = data.split(' ')[1] || '';
              subscriber.next(bestMove);
              subscriber.complete();
            }
          };

          worker.addEventListener('message', onMessage);
          worker.postMessage('ucinewgame');
          worker.postMessage(`position fen ${fen}`);
          worker.postMessage(`go depth ${depth}`);

          subscriber.add(() => {
            cancelled = true;
            worker?.removeEventListener('message', onMessage);
          });
        })
        .catch((err) => subscriber.error(err));
    });
  }

  stop() {
    if (this.worker) {
      this.worker.postMessage('stop');
    }
  }
}
