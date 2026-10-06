import { Injectable } from '@angular/core';
import { defer, Observable, of } from 'rxjs';
import { StorageError, StorageErrorKind } from './storage-error';

function kindOf(error: unknown): StorageErrorKind {
  const name = error instanceof Error || error instanceof DOMException ? error.name : '';
  if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED') return 'quota';
  if (name === 'SecurityError') return 'unavailable';
  return 'unknown';
}

/**
 * Key/value persistence over localStorage — the only code allowed to touch it (ESLint-enforced).
 * Observable on purpose: an HTTP-backed replacement needs no changes in the services above it.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  /** The parsed value at `key`, or `fallback` when missing, unreadable or malformed. Never errors. */
  read<T>(key: string, fallback: T): Observable<T> {
    return defer(() => {
      try {
        const raw = this.storage().getItem(key);
        return of(raw === null ? fallback : (JSON.parse(raw) as T));
      } catch {
        return of(fallback);
      }
    });
  }

  /** Stores `value` as JSON. Errors with a StorageError if it cannot be persisted. */
  write<T>(key: string, value: T): Observable<void> {
    return defer(() => {
      try {
        this.storage().setItem(key, JSON.stringify(value));
        return of(undefined);
      } catch (error) {
        throw error instanceof StorageError
          ? error
          : new StorageError(kindOf(error), { cause: error });
      }
    });
  }

  private storage(): Storage {
    // Reading window.localStorage itself throws when storage is disabled.
    const storage = typeof window === 'undefined' ? undefined : window.localStorage;
    if (!storage) throw new StorageError('unavailable');
    return storage;
  }
}
