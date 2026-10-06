import type { Application } from "../domain/types";
import { StorageError, type StorageErrorKind, type StorageService } from "./StorageService";

export const APPLICATIONS_KEY = "hireflow:applications:v1";

function kindOf(error: unknown): StorageErrorKind {
  if (error instanceof DOMException || (error instanceof Error && "name" in error)) {
    const { name } = error as { name: string };
    if (name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED") return "quota";
    if (name === "SecurityError") return "unavailable";
  }
  return "unknown";
}

function defaultStorage(): Storage {
  // Reading window.localStorage itself throws when storage is disabled.
  if (typeof window === "undefined" || !window.localStorage) {
    throw new StorageError("unavailable");
  }
  return window.localStorage;
}

/** The only module allowed to touch localStorage (enforced by ESLint). */
export class LocalStorageService implements StorageService {
  private readonly getStorage: () => Storage;

  constructor(getStorage: () => Storage = defaultStorage) {
    this.getStorage = getStorage;
  }

  async loadApplications(): Promise<Application[]> {
    try {
      const raw = this.getStorage().getItem(APPLICATIONS_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Application[]) : [];
    } catch {
      return [];
    }
  }

  async saveApplication(application: Application): Promise<void> {
    try {
      const storage = this.getStorage();
      const existing = await this.loadApplications();
      storage.setItem(APPLICATIONS_KEY, JSON.stringify([...existing, application]));
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError(kindOf(error), { cause: error });
    }
  }
}
