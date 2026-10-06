# Research: Job Application Screen

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-06 (Angular re-plan; earlier React research
is in git history)

## 1. Framework and workspace

- **Decision**: Angular CLI 21 workspace in `frontend/`, created with
  `ng new hireflow-frontend --directory frontend --routing --style=css --ssr=false --zoneless
  --prefix=hf --test-runner=vitest`.
- **Rationale**: Constitution v2.0.0 (Principle VII, workbook C1). Zoneless + signals + OnPush is
  the current Angular default and keeps change detection explicit. SSR is declined so
  `localStorage` always exists (workbook B4).
- **Alternatives considered**: SSR with `isPlatformBrowser` guards (extra code for no benefit on a
  client-only prototype); Karma (the CLI's Vitest runner is the default and faster).

## 2. Styling and design tokens

- **Decision**: Global `src/styles/tokens.css` with CSS custom properties derived from
  `design/HireFlow Style Sheet.dc.html`, plus component-scoped styles. stylelint
  (`color-no-hex`, `color-named: never`, `function-disallowed-list: rgb/rgba/hsl/hsla`) runs on
  every CSS file except `tokens.css`.
- **Token set**: primary `#1D4ED8`, primary-hover `#1E40AF`, primary-tint `#EFF6FF`, text
  `#1C1A17`, text-secondary `#57534B`, text-muted `#78716A`, border `#E7E5E0`, border-input
  `#D6D3CD`, border-hover `#A8A29B`, surface `#FFFFFF`, page `#FAF9F7`, error `#B91C1C`,
  error-tint `#FEF2F2`; radius 6px (controls) / 8px (cards); spacing 2/4/8/12/16/20/24/32/40/56/80
  (12 and 20 only where the style sheet uses them); Inter 400/500/600/700.
- **Focus rings** (two treatments, as in the style sheet):
  - `--focus-ring: 0 0 0 2px #FFFFFF, 0 0 0 4px #1D4ED8` — buttons, links, the CV drop area.
  - `--focus-ring-input: inset 0 0 0 1px #1D4ED8, 0 0 0 3px rgba(29,78,216,.32)` — fields.
  - `--focus-ring-error: inset 0 0 0 1px #B91C1C, 0 0 0 3px rgba(185,28,28,.28)` — invalid fields.
  - `:focus-visible` keeps `outline: 2px solid transparent` so forced-colours mode still shows focus.
- **Breakpoints** (from the design): base mobile; `≤420px` gutters 16px, title 28px, card padding
  20/16; `≥900px` two columns (`minmax(0,1fr) 280px`, 56px gap), sticky facts, title 40px, name +
  email side by side.

## 3. Persistence (Principle V, workbook Part D)

- **Decision**: `StorageService` (root) wraps `localStorage` with the workbook's `read<T>(key,
  fallback)` / `write<T>(key, value)` shape, but returns Observables and maps failures to a typed
  `StorageError` (`unavailable | quota | unknown`). `ApplicationService` (root) reads and appends to
  the `applications` array and looks records up by id. `JobService` reads the role from `job`,
  seeding `SEED_JOB` on first load (or when the stored seed's id differs) and falling back to
  `SEED_JOB` if storage is unreadable.
- **Rationale**: Observables make components API-ready (workbook D2 note); a typed error drives
  the FR-019 failure alert. Malformed stored JSON reads as the fallback rather than crashing.
- **Alternatives considered**: synchronous services (workbook D2 as written — would need
  component changes for HTTP); IndexedDB (only needed for file blobs, which are a non-goal).

## 4. Submitting state

- **Decision**: `ApplicationService.submit()` returns `Observable<Application>` with a
  configurable delay (`APPLICATION_LATENCY_MS` injection token, default 600 ms, 0 in tests). The
  form holds `status: 'idle' | 'submitting'`; a send while submitting is ignored, and the send
  button uses `aria-disabled` + `aria-busy` (not `disabled`) so keyboard focus is not lost.
- **Rationale**: FR-015 and Principle VI need a visible submitting state; the delay lives in the
  service, so an HTTP swap removes it without touching components.

## 5. Validation

- **Decision**: Pure functions in `domain/validation.ts` — `validateApplication(draft)` returns a
  `FieldErrors` map with the spec's exact messages; `validateCvFile(file)` checks type (by
  extension), empty and > 10 × 1024 × 1024 bytes. Email regex from the design:
  `^[^\s@]+@[^\s@]+\.[^\s@]+$` on the trimmed value.
- **Rationale**: Pure functions are unit-tested directly (constitution VII quality gate) and
  reused for "on send" and "live after first attempt" modes.

## 6. Accessibility mechanics

- Each input has `<label for>`; hint/error text is referenced by `aria-describedby`; failing
  inputs get `aria-invalid="true"`.
- Error summary and failure alert are `role="alert"`, `tabindex="-1"`, focused after a failed
  send (via `afterNextRender`).
- The CV drop area is a `<button type="button">` that opens a hidden file input; the CV group is
  labelled via `aria-labelledby`; its message is `aria-live="polite"` so rejections are announced.
- The confirmation heading has `tabindex="-1"` and receives focus on arrival (FR-017).
- Focus moves to "Remove" after a file is attached and back to "Choose a file" after removal.

## 7. Testing

- **Decision**: `ng test` (Vitest, jsdom) for `domain/` and `services/`. UI/e2e automation is
  skipped for the workshop (constitution VII); Principles II/III and the acceptance criteria are
  checked in review (workbook Part E) with the quickstart scenarios.

## 8. Lint and format

- **Decision**: `angular-eslint` (via `ng add angular-eslint@21`) with the template accessibility
  rules, a `no-restricted-globals`/`no-restricted-properties` ban on `localStorage` outside
  `core/storage/storage.service.ts`, and Prettier (`printWidth` 100, single quotes — the CLI default).

## 9. Ids and timestamps

- `crypto.randomUUID()` for ids, ISO 8601 `submittedAt`.
