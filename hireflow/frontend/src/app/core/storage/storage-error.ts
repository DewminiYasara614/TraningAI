export type StorageErrorKind = 'unavailable' | 'quota' | 'unknown';

export class StorageError extends Error {
  readonly kind: StorageErrorKind;

  constructor(kind: StorageErrorKind, options?: { cause?: unknown }) {
    super(`Storage failed (${kind})`, options);
    this.name = 'StorageError';
    this.kind = kind;
  }
}
