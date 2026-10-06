---

description: "Task list for the Job Application Screen (Angular, constitution v2.0.0)"
---

# Tasks: Job Application Screen

**Input**: Design documents from `specs/001-job-application/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Unit tests for domain logic and services only (constitution VII). UI / e2e automation is
deliberately skipped for the workshop; acceptance criteria are verified in review (T040).

**Supersedes**: the 2026-10-01 React task list (git history). All paths below are under
`frontend/`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: user story from spec.md (US1–US4)

---

## Phase 1: Setup

- [x] T001 Scaffold the workspace: `ng new hireflow-frontend --directory frontend --routing --style=css --ssr=false --zoneless --prefix=hf --test-runner=vitest` (no SSR — plan, load-bearing)
- [x] T002 [P] `ng add angular-eslint`; extend `eslint.config.js` with template accessibility rules, component selector `hf-` (element or attribute), and a ban on `localStorage` (`no-restricted-globals` + `no-restricted-properties`) everywhere except `src/app/core/storage/storage.service.ts`
- [x] T003 [P] Prettier (`.prettierrc`, printWidth 100, single quotes) and stylelint (`.stylelintrc.json`: `color-no-hex`, `color-named: never`, `function-disallowed-list` rgb/rgba/hsl/hsla, lifted for `src/styles/tokens.css` only); npm scripts `lint`, `format`, `format:check`
- [x] T004 [P] `src/index.html`: `lang="en-GB"`, title "Senior .NET Engineer — Northgate Labs | HireFlow", Inter from Google Fonts

---

## Phase 2: Foundational

- [x] T005 `src/styles/tokens.css` (research §2 tokens incl. three focus rings) and `src/styles/base.css` (reset, body, `:focus-visible` ring with transparent outline, `.visually-hidden`, reduced motion); import both from `src/styles.css`
- [x] T006 [P] Models, one per file: `features/job-application/models/role.model.ts`, `cv-file.model.ts`, `application.model.ts` (with `ApplicationDraft`, `FieldErrors`)
- [x] T007 [P] `features/job-application/data/seed-job.ts`: `SEED_JOB: Role` with all copy from the design, dates per spec (closes 2026-11-27, reply by 2026-12-04)
- [x] T008 [P] `domain/format.ts` (`formatFileSize`, `formatLongDate`, `formatDayMonth`, `firstName`) + `format.spec.ts`
- [x] T009 [P] `domain/validation.ts` (`validateApplication`, `validateCvFile`, `toCvFile`, messages, limits) + `validation.spec.ts`
- [x] T010 `core/storage/storage-error.ts` + `core/storage/storage.service.ts` (Observable `read`/`write`, error mapping) + `storage.service.spec.ts` (round-trip, missing/malformed → fallback, quota → `quota`, security → `unavailable`)
- [x] T011 `services/application.service.ts` (`submit`, `all`, `byId`; `APPLICATION_LATENCY_MS` token) + `application.service.spec.ts` (trims, stamps id/time/jobTitle, appends, error passes through)
- [x] T012 [P] `services/job.service.ts` (seed on first load / id mismatch; fallback when unreadable) + `job.service.spec.ts`
- [x] T013 [P] Shared UI in `shared/ui/`: `button` (attribute component on `button`/`a`: primary/secondary/ghost, sizes, `busy` → `aria-busy` + `aria-disabled`, ignores activation), `card` (attribute component on `section`/`aside`/`div`: tone, padding), `alert` (role alert, focusable via `focus()`), `text-field` (label, input/textarea, hint↔error, `aria-describedby`, `aria-invalid`, `model()` value)
- [x] T014 App shell `app.ts`/`app.html`/`app.css` (header with HireFlow mark + "All open roles", `<main>` with `<router-outlet>`, footer) and routes: `''` → `/apply`, lazy `job-application.routes.ts`, `**` → `/apply`

**Checkpoint**: `npm test`, `npm run lint`, `ng build` pass.

---

## Phase 3: US1 — Apply for a role (P1) 🎯 MVP

- [x] T015 [P] [US1] `components/role-header`, `role-facts` (`<aside>` card, `<dl>`s, closing date, manager avatar), `role-description` (full text, no truncation)
- [x] T016 [US1] `components/application-form`: fields, CV control, cover note, send + privacy line; state as signals; on valid send → `submitting` (busy button, repeat sends ignored) → `ApplicationService.submit` → emit `sent(application)`; on `StorageError` → back to idle, data kept, failure alert focused (FR-019), cleared on next send
- [x] T017 [US1] `components/application-sent` (accent card, check badge, heading focused on arrival, FR-018 copy, "Browse other roles" link, "Start again" output)
- [x] T018 [US1] `pages/apply-page` (smart: `JobService.current()` → header, facts, description, form; on `sent` navigate to `/confirmation?id=…`; two-column layout ≥900px with sticky facts) and `pages/confirmation-page` (smart: reads `id` query param → `ApplicationService.byId`; unknown/missing → `/apply`; "Start again" → `/apply`)

**Checkpoint**: send a valid application, see the confirmation, reload — still there; `applications` holds one record.

---

## Phase 4: US2 — Correct mistakes (P1)

- [x] T019 [US2] In `application-form`: `tried` signal; errors `computed` from the draft only after the first failed send; summary alert (singular/plural) focused after each failed send; field messages replace hints live (FR-005–FR-009)

---

## Phase 5: US3 — Attach and manage a CV (P2)

- [x] T020 [US3] `components/cv-file-drop` (feature-owned: it depends on the CV rules): `<button>` drop zone opening a hidden file input (`accept=".pdf,.doc,.docx"`), dragging state, first file only, rejection → `rejected` output, file row (type badge, ellipsis name, size, Remove), focus moves to Remove / back to Choose, window-level guard so stray drops don't navigate away
- [x] T021 [US3] Wire `file-drop` into `application-form`: CV group `aria-labelledby`, message `aria-live="polite"`, rejection message has priority and clears on next valid file or Remove

---

## Phase 6: US4 — Cover note (P3)

- [x] T022 [US4] Cover note capped at 500 (slice on every input + `maxlength`), hint "Up to 500 characters." / "N / 500 characters"

---

## Phase 7: Polish & review

- [x] T023 Audit every component stylesheet against `design/Job Application Page.dc.html` (8px grid, 48px controls, 16px input text, breakpoints); `npm run lint` clean (no colour literals outside `tokens.css`, no `localStorage` outside `storage.service.ts`)
- [x] T024 Update `CLAUDE.md`: design-system section from `design/CLAUDE.md` (workbook B3), Angular commands, structure
- [x] T025 Review (workbook Part E): design fidelity side by side, each acceptance criterion, force every state (empty/bad email, thrown storage error, success), persistence across reload — record results in quickstart.md

---

## Dependencies & Execution Order

- Setup → Foundational → US1 → US2 → US3 → US4 → Polish
- T010 → T011/T012; T013 before T015–T021; `application-form` tasks (T016, T019, T021, T022) are sequential
- Parallel: T002–T004; T006–T009; T015 with T017

## Implementation Strategy

MVP = Setup + Foundational + US1 (valid send → confirmation → survives reload), then US2–US4, then
review. Commit after each phase.
