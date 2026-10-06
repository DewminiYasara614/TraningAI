import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import type { Application } from "../domain/types";
import { createServices, ServicesProvider, type CreateServicesOptions } from "../services/ServicesContext";
import { StorageError, type StorageService } from "../services/StorageService";

export class InMemoryStorage implements StorageService {
  applications: Application[] = [];

  async loadApplications(): Promise<Application[]> {
    return [...this.applications];
  }

  async saveApplication(application: Application): Promise<void> {
    this.applications.push(application);
  }
}

/** Holds every save open until `release()`, so tests can inspect the submitting state without timing races. */
export class DeferredStorage extends InMemoryStorage {
  private pending: (() => void)[] = [];

  async saveApplication(application: Application): Promise<void> {
    await new Promise<void>((resolve) => this.pending.push(resolve));
    await super.saveApplication(application);
  }

  release() {
    this.pending.splice(0).forEach((resolve) => resolve());
  }
}

export class FailingStorage implements StorageService {
  async loadApplications(): Promise<Application[]> {
    return [];
  }

  async saveApplication(): Promise<void> {
    throw new StorageError("quota");
  }
}

export function renderWithServices(
  ui: ReactElement,
  { services, ...options }: { services?: CreateServicesOptions } & Omit<RenderOptions, "wrapper"> = {},
) {
  const storage = services?.storage ?? new InMemoryStorage();
  const value = createServices({ latencyMs: 0, ...services, storage });
  return {
    storage,
    ...render(<ServicesProvider value={value}>{ui}</ServicesProvider>, options),
  };
}

/** A File of the given size without allocating its contents in the test. */
export function makeFile(name: string, sizeBytes: number, type = "application/pdf"): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: sizeBytes });
  return file;
}
