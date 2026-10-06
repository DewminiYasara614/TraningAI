# Contract: Storage & Application Services

**Principle V**: components depend on `ApplicationService` and `JobService` only; those depend on
`StorageService`. Swapping `StorageService` for an HTTP implementation MUST NOT change components.
All three are `@Injectable({ providedIn: 'root' })`.

## StorageService (`core/storage/storage.service.ts`)

```ts
class StorageService {
  /** Parsed value at `key`, or `fallback` when missing, unreadable or malformed. Never errors. */
  read<T>(key: string, fallback: T): Observable<T>;
  /** Stores `value` as JSON. Errors with StorageError if it cannot be persisted. */
  write<T>(key: string, value: T): Observable<void>;
}

class StorageError extends Error {
  readonly kind: 'unavailable' | 'quota' | 'unknown';
}
```

- The only file allowed to touch `localStorage` (ESLint-enforced).
- `QuotaExceededError` → `quota`; `SecurityError` or missing storage → `unavailable`.

## ApplicationService (`features/job-application/services/application.service.ts`)

```ts
interface SubmitInput {
  role: Role;         // supplies roleId + jobTitle
  fullName: string;   // raw; service trims
  email: string;      // raw; service trims
  coverNote: string;
  cv: CvFile;
}

class ApplicationService {
  submit(input: SubmitInput): Observable<Application>; // errors with StorageError
  all(): Observable<Application[]>;
  byId(id: string): Observable<Application | undefined>;
}
```

- `submit` assigns `id` + `submittedAt`, trims name/email, appends to `applications`, and emits
  the saved record after `APPLICATION_LATENCY_MS` (default 600; tests provide 0).

## JobService (`features/job-application/services/job.service.ts`)

```ts
class JobService {
  current(): Observable<Role>; // seeded SEED_JOB on first load; SEED_JOB if storage unreadable
}
```
