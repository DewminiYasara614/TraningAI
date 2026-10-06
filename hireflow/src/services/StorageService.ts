import type { Application } from "../domain/types";

export type StorageErrorKind = "unavailable" | "quota" | "unknown";

export class StorageError extends Error {
  readonly kind: StorageErrorKind;

  constructor(kind: StorageErrorKind, options?: { cause?: unknown }) {
    super(`Application storage failed (${kind})`, options);
    this.name = "StorageError";
    this.kind = kind;
  }
}

/** Persistence boundary. Swap the implementation for an HTTP API without touching components. */
export interface StorageService {
  /** Returns all saved applications (empty array if none or unreadable data). */
  loadApplications(): Promise<Application[]>;
  /** Appends one application. Rejects with StorageError if it cannot be persisted. */
  saveApplication(application: Application): Promise<void>;
}
