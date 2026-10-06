# Contract: Application & Storage Services

**Principle V**: components depend only on `ApplicationService`. `ApplicationService` depends only
on `StorageService`. Replacing `LocalStorageService` with an HTTP-backed implementation MUST NOT
require component changes.

## StorageService

```ts
interface StorageService {
  /** Returns all saved applications (empty array if none or unreadable data). */
  loadApplications(): Promise<Application[]>;
  /** Appends one application. Rejects with StorageError if it cannot be persisted. */
  saveApplication(application: Application): Promise<void>;
}

class StorageError extends Error {
  readonly kind: "unavailable" | "quota" | "unknown";
}
```

Behaviour of `LocalStorageService`:
- Key: `hireflow:applications:v1` (see [storage-schema.md](./storage-schema.md)).
- `loadApplications`: missing key → `[]`; unparseable JSON or non-array → `[]` (never throws).
- `saveApplication`: read-modify-write of the array; any exception from `localStorage` access is
  wrapped in `StorageError` (`QuotaExceededError` → `"quota"`, `SecurityError`/missing storage →
  `"unavailable"`).

## ApplicationService

```ts
interface SubmitInput {
  roleId: string;
  fullName: string;   // raw; service trims
  email: string;      // raw; service trims
  coverNote: string;  // ≤ 500 chars
  cv: CvFile;
}

interface ApplicationService {
  /** Persists a new application. Resolves with the saved record; rejects with StorageError. */
  submit(input: SubmitInput): Promise<Application>;
  /** All applications sent from this browser. */
  list(): Promise<Application[]>;
}
```

Behaviour:
- `submit` assigns `id` and `submittedAt`, trims name/email, then calls
  `StorageService.saveApplication`.
- `submit` does **not** re-validate user input (the form validates first); it MAY assert
  invariants and reject programmer errors.
- The local implementation awaits a configurable `latencyMs` (default ~600, tests 0) before
  resolving, so the submitting state is visible and timing mirrors a network call.

## Wiring

- `createServices({ storage?, latencyMs?, clock?, idGenerator? })` returns
  `{ applicationService }`; the app root provides it via `ServicesProvider` (React context);
  components read it with `useServices()`.
- Tests provide an in-memory `StorageService` fake, including one that always rejects to exercise
  FR-019.
