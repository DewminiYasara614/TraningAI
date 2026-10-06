---

description: "Task list for the Job Application Screen"
---

# Tasks: Job Application Screen

**Input**: Design documents from `specs/001-job-application/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included. The plan (Technical Context, research §7) commits to Vitest + RTL + vitest-axe
and Playwright, and each success criterion maps to an automated check. Write each story's tests
first and confirm they fail before implementing.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested
independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story from spec.md (US1–US4)
- Single project at repo root: `src/`, `tests/e2e/`; unit/component tests sit beside source as
  `*.test.ts(x)`

## Key references (read before starting)

- Visual design: `design/Job Application Page.dc.html` (markup, spacing, breakpoints, prototype
  logic in the `data-dc-script` block), `design/HireFlow Style Sheet.dc.html` (tokens)
- Exact copy and messages: spec.md (User Story 2 field table, Edge Cases, FR-018) and
  `contracts/ui-states.md`
- Service interfaces: `contracts/services.md`; storage shape: `contracts/storage-schema.md`
- Constitution rules that every task must respect: no hex outside `src/styles/tokens.css`,
  components never touch `localStorage`, WCAG AA, works at 360px, only Button/TextField/Card plus
  the justified FileDrop/Alert

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and tooling

- [ ] T001 Initialize a Vite React + TypeScript project at the repo root (no nested folder). `package.json` (name `hireflow`, `"type": "module"`) and all dependencies are already installed — create `index.html` (title "Senior .NET Engineer — Northgate Labs | HireFlow", `<div id="root">`) and `tsconfig.json` with `"strict": true`, target ES2022
- [x] T002 Add npm scripts in `package.json`: `dev` (vite), `build` (`tsc --noEmit && vite build`), `preview`, `test` (`vitest run`), `test:watch` (`vitest`), `test:e2e` (`playwright test`), `lint` (`eslint . && stylelint "src/**/*.css"`)
- [ ] T003 [P] Configure Vitest inside `vite.config.ts` (environment `jsdom`, `globals: true`, `setupFiles: ["src/test/setup.ts"]`, `css.modules` enabled) — `vitest`, `jsdom`, Testing Library and `vitest-axe` are already installed
- [ ] T004 [P] Create `src/test/setup.ts` that imports `@testing-library/jest-dom/vitest`, extends `expect` with `vitest-axe` matchers, and clears `localStorage` after each test
- [ ] T005 [P] Configure ESLint (flat config `eslint.config.js`: typescript-eslint recommended, react-hooks, jsx-a11y recommended) and ban `localStorage` everywhere except `src/services/LocalStorageService.ts` and test files, using both `no-restricted-globals` and `no-restricted-properties` (so `window.localStorage` / `globalThis.localStorage` are caught too)
- [ ] T006 [P] Configure stylelint in `.stylelintrc.json` (`stylelint-config-standard`, `color-no-hex: true`, `color-named: "never"`, `function-disallowed-list: ["rgb", "rgba", "hsl", "hsla"]`, `declaration-no-important: true`) with an `overrides` entry lifting the three colour rules for `src/styles/tokens.css` only
- [ ] T007 [P] Create `playwright.config.ts` (`@playwright/test` is already installed; run `npx playwright install chromium` if the browser is missing): `testDir: "tests/e2e"`, Chromium only, `webServer` runs `npm run dev` on port 5173, projects `mobile-360` (viewport 360×740) and `desktop` (1280×800)
- [x] T008 [P] Add `.gitignore` (`node_modules`, `dist`, `test-results`, `playwright-report`, `.vite`) — do this first: `node_modules/` is already installed and currently untracked

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tokens, base components, domain types, services and page shell that every story uses

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Styles

- [ ] T009 Create `src/styles/tokens.css` with `:root` custom properties from research.md §2: colours (`--color-primary #1D4ED8`, `--color-primary-hover #1E40AF`, `--color-primary-tint #EFF6FF`, `--color-text #1C1A17`, `--color-text-secondary #57534B`, `--color-text-muted #78716A`, `--color-border #E7E5E0`, `--color-border-input #D6D3CD`, `--color-border-hover #A8A29B`, `--color-surface #FFFFFF`, `--color-page #FAF9F7`, `--color-error #B91C1C`, `--color-error-tint #FEF2F2`), the three focus tokens from research.md §2 (`--focus-ring`, `--focus-ring-input`, `--focus-ring-error`), spacing `--space-1..--space-10` (4/8/16/24/32/40/56/80), radii `--radius-control 6px` / `--radius-card 8px`, font family `Inter, system-ui, sans-serif`, and the type sizes used in the design (12/13/14/15/16/18/24/28/32/40px)
- [ ] T010 Create `src/styles/base.css`: box-sizing reset, `body` (page background, text colour, Inter, `-webkit-font-smoothing`), link colours with hover, and a global `:focus-visible { outline: 2px solid transparent; box-shadow: var(--focus-ring); }` rule (the transparent outline keeps focus visible in forced-colours mode); add the Google Fonts Inter 400/500/600/700 `<link>` tags to `index.html`

### Domain

- [ ] T011 [P] Create `src/domain/types.ts` with `Role`, `ApplicationDraft`, `CvFile` (`name`, `sizeBytes`, `type: "pdf" | "doc" | "docx"`), `Application`, `FieldErrors`, and `FormStatus = "idle" | "submitting" | "success"` exactly as in data-model.md
- [ ] T012 [P] Create `src/content/role.ts` exporting `role: Role` with all copy from `design/Job Application Page.dc.html` (header, facts, intro paragraphs, three sections, hiring manager Dana Kowalski / DK), `id: "northgate-senior-dotnet"`, `closesOn: "2026-11-27"`, `replyBy: "2026-12-04"`, `reviewDay: "Thursday"`
- [ ] T013 [P] Create `src/domain/format.ts`: `formatFileSize(bytes)` (> 1 MiB → one-decimal "2.3 MB", else `max(1, round(KB))` + " KB"), `formatLongDate(iso)` → "27 November 2026", `formatDayMonth(iso)` → "4 December", `firstName(fullName)` → first whitespace-separated word or "there"; plus `src/domain/format.test.ts` covering each, including 0/500 bytes, 1 MiB boundary, single/blank names
- [ ] T014 [P] Create `src/domain/validation.ts` with `validateApplication(draft): FieldErrors` using the exact messages from the spec field table (trimmed name/email; email regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`; CV required) and `src/domain/validation.test.ts` covering empty, whitespace-only, missing-domain and valid cases

### Services (Principle V)

- [ ] T015 [P] Create `src/services/StorageService.ts`: `StorageService` interface and `StorageError` class with `kind: "unavailable" | "quota" | "unknown"` per contracts/services.md
- [ ] T016 Create `src/services/LocalStorageService.ts` implementing `StorageService` on key `hireflow:applications:v1` (tolerate missing/malformed data as `[]`; wrap any thrown error in `StorageError`, mapping `QuotaExceededError` → `quota`, `SecurityError`/missing `localStorage` → `unavailable`) and `src/services/LocalStorageService.test.ts` (round-trip, malformed JSON, non-array, quota throw, unavailable)
- [ ] T017 Create `src/services/ApplicationService.ts`: `ApplicationService` interface + `LocalApplicationService` (constructor takes `storage`, `latencyMs`, `clock`, `idGenerator`; `submit` trims name/email, assigns `id` + ISO `submittedAt`, awaits latency, calls `saveApplication`, resolves the saved record; `list` delegates) and `src/services/ApplicationService.test.ts` using an in-memory fake storage (trimming, id/time injection, rejection passes through as `StorageError`)
- [ ] T018 Create `src/services/ServicesContext.tsx`: `createServices({ storage?, latencyMs = 600, clock?, idGenerator? })`, `ServicesProvider`, `useServices()` (throws if used outside provider); add `src/test/fakes.ts` with `InMemoryStorage` and `FailingStorage` (always rejects with `StorageError("quota")`) and a `renderWithServices(ui, options)` helper defaulting to `latencyMs: 0`

### Base components (constitution Principle IV)

- [ ] T019 [P] Create `src/components/Button/Button.tsx` + `Button.module.css`: variants `primary` (48px, filled), `secondary` (40px, outline), `ghost` (32px, text), sizes per design; props `busy` (sets `aria-busy`, disables, swaps children for `busyLabel`) and `fullWidth`; tokens only; plus `Button.test.tsx` (renders, disabled while busy, axe passes)
- [ ] T020 [P] Create `src/components/TextField/TextField.tsx` + `TextField.module.css`: props `id`, `label`, `optionalLabel?`, `hint`, `error?`, `multiline?`, `rows?`, `value`, `onChange`, `type`, `placeholder`, `maxLength?`; renders `<label for>`, input/textarea (48px tall, 16px text, hover/error borders from tokens; focus uses `--focus-ring-input`, or `--focus-ring-error` when `error` is set, overriding the global ring), hint/error `<span id>` linked by `aria-describedby`, `aria-invalid` when `error`; plus `TextField.test.tsx` (label association, error replaces hint, axe)
- [ ] T021 [P] Create `src/components/Card/Card.tsx` + `Card.module.css`: surface, 1px border, 8px radius, padding 24px (20/16 at ≤420px), `as` prop for `section`/`aside`, `tone="accent"` variant with primary border for the success card; no shadows
- [ ] T022 [P] Create `src/components/Alert/Alert.tsx` + `Alert.module.css`: `role="alert"`, `tabIndex={-1}`, forwarded ref (so callers can focus it), `title` + `children`, error-tint background with error border; plus `Alert.test.tsx` (role, focusable, axe)

### Page shell

- [ ] T023 Create `src/App.tsx` (header with HireFlow mark + "All open roles" link to `/roles`; `<main>`; footer "Powered by HireFlow", Privacy `#`, Accessibility `#`) with `src/App.module.css` (max-width 1040px, gutters 24px → 16px at ≤420px), and `src/main.tsx` mounting `<ServicesProvider value={createServices()}><App/></ServicesProvider>` and importing `tokens.css` then `base.css`

**Checkpoint**: `npm run build`, `npm test` and `npm run lint` pass; the shell renders.

---

## Phase 3: User Story 1 - Apply for a role (Priority: P1) 🎯 MVP

**Goal**: A candidate reads the role and sends a complete application, sees the submitting state
and the confirmation, and the application survives reload.

**Independent Test**: Fill name, email and choose a CV via the file picker; send; see "Sending…"
then "Application sent" with "Thanks {first}"; reload and find one record under
`hireflow:applications:v1`.

### Tests for User Story 1 ⚠️ (write first, confirm they fail)

- [ ] T024 [P] [US1] Component test `src/features/job-application/JobApplicationPage.test.tsx`: renders role header, all six facts (closing date "27 November 2026"), intro and three section headings; axe passes
- [ ] T025 [P] [US1] Component test `src/features/job-application/ApplicationForm.submit.test.tsx`: valid fill + file upload → button shows "Sending…" and is disabled/aria-busy → success card with "Thanks Ravi.", "by 4 December", "We'll reply to ravi@example.com."; focus on "Application sent" heading; 5 rapid clicks save exactly one record (SC-007); "Start again" shows empty form and keeps the stored record
- [ ] T026 [P] [US1] Component test `src/features/job-application/ApplicationForm.failure.test.tsx`: with `FailingStorage`, valid send → failure alert text from Edge Cases, focus on alert, all field values and attached CV still present; next send attempt clears the alert
- [ ] T027 [P] [US1] E2E test `tests/e2e/job-application.spec.ts` — "happy path": fill, `setInputFiles` with a small PDF buffer, send, confirm success copy, reload, assert the page shows the empty form in its default state (research.md §10) and the `localStorage` record has CV metadata only (no contents)

### Implementation for User Story 1

- [ ] T028 [P] [US1] Create `src/features/job-application/RoleHeader.tsx` (company · team, `<h1>` title, summary; title 32px → 28px at ≤420px → 40px at ≥900px) with CSS module
- [ ] T029 [P] [US1] Create `src/features/job-application/RoleFacts.tsx` as a `Card as="aside"`: Salary, Location, Contract, Team, divider, Applications close (`formatLongDate`), hiring manager avatar initials + name + role; use a `<dl>` for label/value pairs
- [ ] T030 [P] [US1] Create `src/features/job-application/RoleDescription.tsx`: full intro paragraphs and `<h2>` sections, no truncation (FR-002), 16px / 1.7 line height
- [ ] T031 [US1] Create `src/features/job-application/ApplicationForm.tsx` + CSS module: `Card as="section"` with "Apply for this role" `<h2>` and "Takes about five minutes. We reply to every application."; Full name and Email `TextField`s (default hints from spec; name+email side by side at ≥900px); a minimal CV control (visually hidden `<input type="file" accept=".pdf,.doc,.docx">` opened by a "Choose a file" `Button`, showing name + `formatFileSize` once chosen); Cover note `TextField multiline rows=5` with "(optional)" label; "Send application" primary `Button` (full width on mobile, `min-width` 176px) with privacy line beside/below (FR-022)
- [ ] T032 [US1] In `ApplicationForm.tsx`, implement the state machine from data-model.md: `status` idle → submitting → success; on send run `validateApplication` and do nothing if errors (error display comes in US2); while submitting the button is `busy` with `busyLabel="Sending…"` and further sends are ignored; call `useServices().applicationService.submit()` with `roleId` and a `CvFile` derived from the chosen `File` (metadata only); on `StorageError` return to idle, keep all state, render the failure `Alert` and focus it (FR-019); clear the alert on the next send
- [ ] T033 [US1] Create `src/features/job-application/ApplicationSent.tsx`: `Card tone="accent"` with check badge, `<h2 tabIndex={-1}>Application sent</h2>` focused on mount, exact copy from FR-018 using `firstName`, `role.reviewDay`, `formatDayMonth(role.replyBy)` and the email; "Browse other roles" (link styled as primary, href `/roles`) and "Start again" secondary button calling `onReset`
- [ ] T034 [US1] Create `src/features/job-application/JobApplicationPage.tsx` + CSS module composing RoleHeader, RoleFacts, RoleDescription and either ApplicationForm or ApplicationSent; mobile order header → facts → description → form; at ≥900px two-column grid `minmax(0,1fr) 280px`, 56px gap, facts in column 2 `position: sticky; top: 32px`; "Start again" remounts an empty form (FR-020); render it from `src/App.tsx`

**Checkpoint**: US1 tests pass; quickstart scenarios 1, 7, 8 and 12 behave as described.

---

## Phase 4: User Story 2 - Correct mistakes before sending (Priority: P1)

**Goal**: Failed sends show a summary and per-field messages, focus moves to the summary, and
messages update live after the first attempt.

**Independent Test**: Send an empty form → plural summary, three field errors, focus on summary;
type a name → name error clears, summary still plural; fix all → summary disappears.

### Tests for User Story 2 ⚠️

- [ ] T035 [P] [US2] Component test `src/features/job-application/ApplicationForm.validation.test.tsx`: no errors shown while typing before first send (FR-005); empty send → plural summary + "Check the highlighted fields below." + three exact messages, `aria-invalid` on name/email, focus on summary; single remaining error → singular wording; fixing each field clears its message on the same change (SC-003); "ravi@example" → "Add a domain, like name@company.com."; whitespace-only name → "Enter your name."; axe passes in error state
- [ ] T036 [P] [US2] E2E test in `tests/e2e/job-application.spec.ts` — "keyboard only": Tab from page top through every control (visible focus asserted via `:focus-visible` box-shadow), trigger send with Enter, verify focus lands on the summary, fix fields by keyboard, open the file chooser with Space (`page.waitForEvent('filechooser')`), send

### Implementation for User Story 2

- [ ] T037 [US2] In `ApplicationForm.tsx`, add `tried` state: on a failed send set `tried`, store `validateApplication` result, and render the error-summary `Alert` (title chosen by error count per spec; body "Check the highlighted fields below.") above the fields; focus the alert via its ref after render
- [ ] T038 [US2] In `ApplicationForm.tsx`, once `tried` is true re-run `validateApplication` on every name/email/note change and on CV choose/remove (FR-007); pass each field's message to `TextField error`/the CV control so it replaces the hint, and remove the summary when there are no errors
- [ ] T039 [US2] Make the CV control's error accessible: CV group labelled "CV" via `aria-labelledby`, its hint/error `<span id>` referenced by `aria-describedby` on the trigger button, error border on the control when the CV error is present (FR-009)

**Checkpoint**: US1 and US2 tests pass; quickstart scenarios 2–4 and 9 behave as described.

---

## Phase 5: User Story 3 - Attach and manage a CV (Priority: P2)

**Goal**: Full CV control: picker or drag-and-drop, dragging state, file row with Remove, and
rejection of wrong type, oversize and empty files.

**Independent Test**: Attach via picker and via drop; see name and size; Remove brings back the
drop area; dropping `.png`, 12MB PDF and 0-byte PDF each shows its message and attaches nothing.

### Tests for User Story 3 ⚠️

- [ ] T040 [P] [US3] Unit tests in `src/domain/validation.test.ts` for `validateCvFile`: `.pdf/.PDF/.doc/.docx` accepted; `.png` → "That file type isn't supported. Use PDF, DOC or DOCX."; 10MB + 1 byte → "That file is over 10MB. Try a smaller version."; exactly 10MB accepted; 0 bytes → "That file looks empty. Try another file."
- [ ] T041 [P] [US3] Component test `src/components/FileDrop/FileDrop.test.tsx`: Enter/Space and click open the hidden input; `dragOver` sets the dragging state and `dragLeave`/`drop` clears it; dropping several files uses only the first; valid file → row with truncated name, size and "Remove"; Remove → drop area returns and `onChange(null)` fires; invalid file → `onReject(message)` and nothing attached; axe passes in each state

### Implementation for User Story 3

- [ ] T042 [US3] Add `validateCvFile(file: { name; size }): string | null` and `toCvFile(file: File): CvFile` (type from lower-cased extension) to `src/domain/validation.ts`
- [ ] T043 [US3] Create `src/components/FileDrop/FileDrop.tsx` + `FileDrop.module.css`: empty state is a `<button type="button">` drop zone ("Choose a file" / "or drag it here · PDF, DOC or DOCX up to 10MB", 1.5px dashed input border, page background, primary border + tint on hover and while dragging, error border when `error`); hidden `<input type="file" accept=".pdf,.doc,.docx">`; attached state is a bordered row with type badge (PDF/DOC/DOCX), ellipsis-truncated name, `formatFileSize`, and a ghost "Remove" `Button`; props `value`, `onChange`, `onReject`, `error`, `hintId`, `labelledBy`; reset the input value after each pick so re-choosing the same file fires
- [ ] T044 [US3] Replace the minimal CV control in `src/features/job-application/ApplicationForm.tsx` with `FileDrop`: rejection messages show in the CV hint/error slot (taking priority over the "required" message) and clear on the next valid pick or Remove; after a failed send, Remove shows "Attach your CV to apply."

**Checkpoint**: US1–US3 tests pass; quickstart scenario 5 behaves as described.

---

## Phase 6: User Story 4 - Write an optional cover note (Priority: P3)

**Goal**: Live character counter and a hard 500-character cap.

**Independent Test**: Empty note shows "Up to 500 characters."; typing shows "N / 500 characters";
pasting 600 characters keeps 500.

### Tests for User Story 4 ⚠️

- [ ] T045 [P] [US4] Component test `src/features/job-application/ApplicationForm.note.test.tsx`: default hint, live "N / 500 characters", paste of 600 chars keeps the first 500 and shows "500 / 500 characters", sent application stores the note, empty note is valid

### Implementation for User Story 4

- [ ] T046 [US4] In `ApplicationForm.tsx`, slice cover note input to 500 characters on every change (covers typing and paste) and set the `TextField` hint to "Up to 500 characters." when empty or "{n} / 500 characters" otherwise; also pass `maxLength={500}`

**Checkpoint**: All four stories pass their tests.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T047 [P] E2E test in `tests/e2e/job-application.spec.ts` — "360px layout" (mobile-360 project): `document.documentElement.scrollWidth <= 360` in default, error and success states; facts card appears before the description
- [ ] T048 [P] E2E test in `tests/e2e/job-application.spec.ts` — "desktop layout" (desktop project): facts panel in the right column and still visible (sticky) after scrolling to the form
- [ ] T049 [P] Add `@axe-core/playwright` and an e2e test running axe (WCAG 2 AA tags) on default, error, submitting-failure and success states at both viewports (SC-006)
- [ ] T050 Audit every CSS module against `design/Job Application Page.dc.html` (spacing on the 8px grid, 48px controls, 16px input text, breakpoints ≤420px and ≥900px) and confirm `npm run lint` reports no hex outside `tokens.css`, no `!important`, and no `localStorage` outside `LocalStorageService.ts`
- [ ] T051 Update `CLAUDE.md`: replace "no application code" with the real commands from quickstart.md (`npm run dev`, `npm test`, single-test examples, `npm run test:e2e`, `npm run lint`), summarise the `domain/` → `services/` → `components/` → `features/` layering, and replace the "Non-goals" placeholder with the list in constitution v1.1.0
- [ ] T053 [P] E2E test in `tests/e2e/job-application.spec.ts` — "focus rings": with `page.emulateMedia({ forcedColors: "active" })` and without, Tab to "Choose a file", "Send application", an input and a link, and assert each has a visible indicator (non-`none` outline in forced colours; `--focus-ring` box-shadow on buttons/links and `--focus-ring-input` on inputs otherwise) (Constitution II, research §2)
- [ ] T052 Run every scenario in `specs/001-job-application/quickstart.md` and record any deviation as a follow-up task

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: none. T008 first; T001 (T002 already done); T003–T007 in parallel after T001
- **Foundational (Phase 2)**: depends on Setup; blocks all stories. T009 → T010; T011–T015 in
  parallel; T016 needs T015; T017 needs T016; T018 needs T017; T019–T022 need T009 and run in
  parallel; T023 needs T018 and T021
- **User stories (Phases 3–6)**: depend on Foundational
- **Polish (Phase 7)**: depends on the stories it checks

### User Story Dependencies

- **US1 (P1)**: needs Foundational only. Delivers the MVP, including a minimal CV picker so a
  valid application can be sent
- **US2 (P1)**: builds on `ApplicationForm.tsx` from US1 (T031–T032); independently testable by
  sending invalid forms
- **US3 (P2)**: needs US1's form; replaces its minimal CV control. T044 also touches the CV error
  wiring from US2 (T039) — if US3 is built before US2, T044 shows only the rejection messages
- **US4 (P3)**: needs US1's form only

### Within Each Story

- Tests first, confirm they fail
- Domain/validation before components, components before form wiring
- Tasks editing `ApplicationForm.tsx` (T031, T032, T037, T038, T039, T044, T046) are sequential

### Parallel Opportunities

- Setup: T003–T008
- Foundational: T011–T015 together; T019–T022 together
- US1: tests T024–T027 together; views T028–T030 together
- US2: tests T035–T036 together
- US3: tests T040–T041 together, then T042 → T043 → T044
- Polish: T047–T049 and T053 together

---

## Parallel Example: User Story 1

```text
# Tests (write first):
Task: "T024 Component test for page content in src/features/job-application/JobApplicationPage.test.tsx"
Task: "T025 Component test for submit/success in src/features/job-application/ApplicationForm.submit.test.tsx"
Task: "T026 Component test for save failure in src/features/job-application/ApplicationForm.failure.test.tsx"
Task: "T027 E2E happy path in tests/e2e/job-application.spec.ts"

# Read-only views:
Task: "T028 RoleHeader in src/features/job-application/RoleHeader.tsx"
Task: "T029 RoleFacts in src/features/job-application/RoleFacts.tsx"
Task: "T030 RoleDescription in src/features/job-application/RoleDescription.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup → Phase 2 Foundational
2. Phase 3 US1
3. **Stop and validate**: quickstart scenarios 1, 7, 8, 12
4. Demo: a candidate can apply end to end (invalid sends are silently blocked until US2)

### Incremental Delivery

1. Setup + Foundational → shell renders, services tested
2. + US1 → end-to-end apply (MVP)
3. + US2 → full error handling and keyboard flow
4. + US3 → drag-and-drop and file checks
5. + US4 → cover note counter
6. Polish → layout, a11y and quickstart sign-off

---

## Notes

- [P] = different files, no dependency on incomplete tasks
- Commit after each task or logical group
- Any request that conflicts with the constitution must be flagged before building
