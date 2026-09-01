/**
 * Host capabilities the engine does not implement (clock, persistence).
 */

export interface Clock {
  now(): number;
  /** Schedule the next frame; rAF in the browser, setTimeout in a TUI. */
  nextFrame(cb: (timeMs: number) => void): () => void;
  every(ms: number, cb: () => void): () => void;
}

export interface SaveStorage {
  read(): string | null;
  write(data: string): void;
  clear(): void;
}
