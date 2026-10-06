import type { Application, CvFile } from "../domain/types";
import type { StorageService } from "./StorageService";

export interface SubmitInput {
  roleId: string;
  /** Raw; the service trims. */
  fullName: string;
  /** Raw; the service trims. */
  email: string;
  coverNote: string;
  cv: CvFile;
}

export interface ApplicationService {
  /** Persists a new application. Resolves with the saved record; rejects with StorageError. */
  submit(input: SubmitInput): Promise<Application>;
  /** All applications sent from this browser. */
  list(): Promise<Application[]>;
}

export interface LocalApplicationServiceOptions {
  storage: StorageService;
  /** Artificial delay so the submitting state is perceivable, mirroring a network call. */
  latencyMs?: number;
  clock?: () => Date;
  idGenerator?: () => string;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class LocalApplicationService implements ApplicationService {
  private readonly storage: StorageService;
  private readonly latencyMs: number;
  private readonly clock: () => Date;
  private readonly idGenerator: () => string;

  constructor({ storage, latencyMs = 600, clock, idGenerator }: LocalApplicationServiceOptions) {
    this.storage = storage;
    this.latencyMs = latencyMs;
    this.clock = clock ?? (() => new Date());
    this.idGenerator = idGenerator ?? (() => crypto.randomUUID());
  }

  async submit(input: SubmitInput): Promise<Application> {
    const application: Application = {
      id: this.idGenerator(),
      roleId: input.roleId,
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      coverNote: input.coverNote,
      cv: { name: input.cv.name, sizeBytes: input.cv.sizeBytes, type: input.cv.type },
      submittedAt: this.clock().toISOString(),
    };

    if (this.latencyMs > 0) await wait(this.latencyMs);
    await this.storage.saveApplication(application);
    return application;
  }

  list(): Promise<Application[]> {
    return this.storage.loadApplications();
  }
}
