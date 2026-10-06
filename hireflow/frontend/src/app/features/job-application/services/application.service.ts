import { inject, Injectable, InjectionToken } from '@angular/core';
import { map, Observable, switchMap, timer } from 'rxjs';
import { StorageService } from '../../../core/storage/storage.service';
import { Application } from '../models/application.model';
import { CvFile } from '../models/cv-file.model';
import { Role } from '../models/role.model';

export const APPLICATIONS_KEY = 'applications';

/** Simulated round-trip so the submitting state is visible; an HTTP implementation drops it. */
export const APPLICATION_LATENCY_MS = new InjectionToken<number>('APPLICATION_LATENCY_MS', {
  providedIn: 'root',
  factory: () => 600,
});

export interface SubmitInput {
  role: Role;
  /** Raw; the service trims. */
  fullName: string;
  /** Raw; the service trims. */
  email: string;
  coverNote: string;
  cv: CvFile;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly storage = inject(StorageService);
  private readonly latencyMs = inject(APPLICATION_LATENCY_MS);

  /** Appends a new application. Emits the saved record; errors with StorageError if it can't be saved. */
  submit(input: SubmitInput): Observable<Application> {
    const application: Application = {
      id: crypto.randomUUID(),
      roleId: input.role.id,
      jobTitle: input.role.title,
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      coverNote: input.coverNote,
      cv: { name: input.cv.name, sizeBytes: input.cv.sizeBytes, type: input.cv.type },
      submittedAt: new Date().toISOString(),
    };

    return timer(this.latencyMs).pipe(
      switchMap(() => this.all()),
      switchMap((existing) => this.storage.write(APPLICATIONS_KEY, [...existing, application])),
      map(() => application),
    );
  }

  /** All applications sent from this browser, oldest first. */
  all(): Observable<Application[]> {
    return this.storage
      .read<unknown>(APPLICATIONS_KEY, [])
      .pipe(map((value) => (Array.isArray(value) ? (value as Application[]) : [])));
  }

  byId(id: string): Observable<Application | undefined> {
    return this.all().pipe(map((applications) => applications.find((a) => a.id === id)));
  }
}
