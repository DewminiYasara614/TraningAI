# Research: Job Application Screen

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-01

The repo has no application code, so every Technical Context item started as an unknown. Each is
resolved below.

## 1. UI framework and language

- **Decision**: React 18 + TypeScript (strict), built with Vite.
- **Rationale**: The design prototypes are React components (`DCLogic` on `window.React`), so
  their state model (`name`, `email`, `note`, `file`, `tried`, `submitted`, `dragging`) ports
  directly. TypeScript gives compile-time checks on the service contracts that Principle V depends
  on. Vite gives a zero-config dev server and static build. Node 22 / npm 11 are already installed.
- **Alternatives considered**: Vanilla TS + DOM (no dependency, but hand-rolled re-rendering for
  live validation and state swaps adds code and bugs); Next.js (SSR/routing not needed for one
  client-only screen); Svelte/Vue (no carry-over from the React prototypes).

## 2. Styling and design tokens

- **Decision**: One global `tokens.css` defining CSS custom properties derived from
  `design/HireFlow Style Sheet.dc.html`, plus CSS Modules per component. Lint rule (stylelint
  `color-no-hex` scoped to everything except `tokens.css`) enforces "no hard-coded hex".
- **Rationale**: Principle I requires tokens as custom properties. CSS Modules keep component
  styles local with no runtime cost. Breakpoints match the design: base (mobile), `≤420px`
  tightening, `≥900px` two-column with sticky facts panel.
- **Alternatives considered**: Tailwind (tokens end up in a JS config rather than CSS custom
  properties; utility-heavy markup diverges from the design files); CSS-in-JS (runtime cost, no
  benefit here).
- **Token set** (values from the style sheet): primary `#1D4ED8`, primary-hover `#1E40AF`,
  primary-tint `#EFF6FF`, text `#1C1A17`, text-secondary `#57534B`, text-muted `#78716A`,
  border `#E7E5E0`, border-input `#D6D3CD`, border-hover `#A8A29B`, surface `#FFFFFF`,
  page `#FAF9F7`, error `#B91C1C`, error-tint `#FEF2F2`; radius 6px (controls) / 8px (cards);
  spacing scale 4/8/16/24/32/40/56/80; Inter 400/500/600/700.
- **Focus rings** (two treatments, as in the style sheet):
  - `--focus-ring: 0 0 0 2px #FFFFFF, 0 0 0 4px #1D4ED8` — buttons, links, the CV drop area and
    every other non-input control (solid primary ring with a 2px white offset; ≥ 3:1 against
    surface and page).
  - `--focus-ring-input: inset 0 0 0 1px #1D4ED8, 0 0 0 3px rgba(29,78,216,.32)` — text inputs
    and textarea, where the primary border carries the contrast and the halo is decorative.
  - `--focus-ring-error: inset 0 0 0 1px #B91C1C, 0 0 0 3px rgba(185,28,28,.28)` — a focused
    input in its error state.
  - `:focus-visible` keeps `outline: 2px solid transparent` instead of `outline: none`, so forced-
    colours (Windows high contrast) mode, which drops box-shadows, still shows focus.
  - *Revised 2026-10-06*: the earlier single halo token was applied to all controls; on buttons
    it measured ~1.7:1 and did not match the design (analysis finding C1).

## 3. Persistence (Principle V)

- **Decision**: `ApplicationService` (domain: validate-free save + list) depends on a
  `StorageService` interface; the shipped implementation is `LocalStorageService`, keyed
  `hireflow:applications:v1`, storing a JSON array of `Application` records. Services are provided
  to components via React context so tests can inject fakes.
- **Rationale**: Exactly the layering the constitution and CLAUDE.md prescribe. CV is stored as
  metadata only (spec FR-013), so each record is well under 1 KB — `localStorage` quota is not a
  practical concern. A versioned key allows schema migration later.
- **Failure handling**: `localStorage.setItem` can throw (quota, private mode, disabled storage).
  `LocalStorageService` converts any throw into a typed `StorageError`; the UI maps it to the
  FR-019 failure alert.
- **Alternatives considered**: IndexedDB (only needed for file blobs, which were ruled out);
  components calling `localStorage` directly (forbidden by Principle V).

## 4. Submitting state

- **Decision**: `ApplicationService.submit()` is `async` and the UI awaits it. The local
  implementation resolves after a short artificial delay (~600 ms, configurable, 0 in tests) so
  the submitting state is perceivable and the async contract matches a future HTTP API.
- **Rationale**: FR-015 and Principle VI require a visible submitting state; an instant
  synchronous save would never show it. Keeping the delay inside the service (not the component)
  means swapping to HTTP removes it with no component change.
- **Double-send guard**: the form holds a `status` of `idle | submitting | success`; `submit` is a
  no-op unless `idle`, and the button is `disabled` + `aria-busy` while submitting (SC-007).

## 5. Validation

- **Decision**: Pure functions in `src/domain/validation.ts`: `validateApplication(draft)` returns
  a `FieldErrors` map; `validateCvFile(file)` returns an error for type/size/empty at selection
  time. Messages are the exact strings in the spec. Email regex as in the design:
  `^[^\s@]+@[^\s@]+\.[^\s@]+$` on the trimmed value.
- **Rationale**: Pure functions are trivially unit-testable and reused for both "on send" and
  "live after first attempt" modes (FR-005/FR-007).
- **File type check**: accept if extension is `.pdf`, `.doc` or `.docx` (case-insensitive) —
  MIME types for DOC/DOCX are unreliable across OSes and drag-and-drop, so the extension is the
  primary check.

## 6. Accessibility mechanics

- **Decision**:
  - Each input has `<label for>`; hint/error text has an id referenced by `aria-describedby`;
    failing inputs get `aria-invalid="true"`.
  - Error summary is a `role="alert"` region with `tabIndex={-1}`, focused after a failed send.
  - The CV drop area is a real `<button type="button">` (keyboard and screen-reader operable)
    that opens a visually hidden `<input type="file" accept=".pdf,.doc,.docx">`; drag events are
    attached to the button's wrapper. The CV group is labelled via `aria-labelledby`.
  - The confirmation heading has `tabIndex={-1}` and receives focus on success (FR-017).
  - Visible focus via `:focus-visible` using the focus-ring token on every interactive element.
- **Rationale**: Satisfies Principle II and FR-009/FR-021 using native elements wherever possible.

## 7. Testing

- **Decision**:
  - **Vitest + React Testing Library + @testing-library/user-event** for unit (validation,
    services, formatters) and component/integration tests (form flows, error states, CV handling,
    submitting/success/failure).
  - **vitest-axe** for automated a11y checks on each rendered state.
  - **Playwright** (Chromium) for end-to-end: full flow at 360px and 1280px, keyboard-only flow,
    reload persistence, no horizontal scroll at 360px.
- **Rationale**: Each success criterion (SC-002–SC-007) maps to an automated test; SC-001 and
  SC-006 contrast are validated via quickstart manual checks plus axe.
- **Alternatives considered**: Jest (slower, extra config with Vite); Cypress (heavier than needed).

## 8. Content and routing

- **Decision**: Role content lives in `src/content/role.ts` as a typed `Role` object (copy from
  the design, dates per spec clarifications). No router: single page. "All open roles" / "Browse
  other roles" link to `/roles` placeholder; footer links to `#`.
- **Rationale**: Spec assumes one fixed role; a router adds nothing yet.

## 9. Application IDs and timestamps

- **Decision**: `crypto.randomUUID()` for ids; `submittedAt` as ISO 8601 string. Both obtained via
  injectable `clock`/`idGenerator` defaults so tests are deterministic.

## 10. Page state on reload

- **Decision**: The page always opens on the empty form in its default state. Sent applications
  stay in storage (spec scenario 1.4) but are not read on load; `ApplicationService.list()` is used
  only by tests and future features.
- **Rationale**: Candidates are anonymous and repeat applications are saved separately, so there
  is no "current" application to restore. It matches "Start again" (FR-020) and keeps the first
  render independent of storage, so a storage failure can't break page load.
- **Alternatives considered**: Re-showing the latest confirmation (couples page load to storage
  and hides the form from a second applicant on a shared device); a "You applied on {date}" note
  (new UI and copy not in the design).
- **Status**: Raised as a `/speckit-clarify` question on 2026-10-06 and not yet answered; this is
  the recommended default. If the answer differs, update the spec and re-run `/speckit-tasks`.
