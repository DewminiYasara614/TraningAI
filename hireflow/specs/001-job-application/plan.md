# Implementation Plan: Job Application Screen

**Branch**: `001-job-application` | **Date**: 2026-10-06 (re-planned for Angular under constitution
v2.0.0; the 2026-10-01 React plan is in git history) | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-job-application/spec.md`

## Summary

One role page where a candidate reads the Senior .NET Engineer role and applies with name, email,
CV (details only) and an optional note. Validation runs on first send, then live; sending shows a
submitting state, saves through `ApplicationService` → `StorageService` to `localStorage`, and
navigates to a confirmation that survives reload. Standards come from the constitution and
`CLAUDE.md` and are not restated here.

## Technical Context

**Language/Version**: TypeScript (strict) via Angular CLI 21 workspace in `frontend/`

**Primary Dependencies**: Angular (standalone, zoneless, router), RxJS — nothing else at runtime

**Storage**: `localStorage` key `applications` (array) and `job` (seeded role), via `StorageService`

**Testing**: `ng test` (Vitest) for domain logic and services; UI/e2e skipped (constitution VII)

**Target Platform**: Evergreen desktop and mobile browsers

**Project Type**: Single-page web app, browser-only

**Performance Goals**: Field feedback on the same input event; submit round-trip ≈ 600 ms simulated

**Constraints**: **No SSR / prerendering** (load-bearing: `localStorage` must always exist);
360px floor; WCAG AA; tokens only

**Scale/Scope**: 2 routes, 1 fixed role, ~10 components

## Feature decisions

- **No SSR.** Workspace created with `--ssr=false`; nothing guards `localStorage` for a server.
- **Routes** (lazy-loaded feature `job-application.routes.ts`):
  - `/apply` — the role and the form (default; `''` and unknown paths redirect here).
  - `/confirmation?id=<applicationId>` — the "Application sent" state, read back from storage so
    it survives reload (spec US1-4). Missing or unknown id → redirect to `/apply` (spec edge case).
- **Design sources**: build from `design/Job Application Page.dc.html` (final look),
  structure from `design/Job Application Wireframes.dc.html`, tokens from
  `design/HireFlow Style Sheet.dc.html` (the export's "Visual Language" file). Token values and
  focus treatment: [research.md §2](./research.md).
- **Persistence**: `ApplicationService.submit()` appends to the `applications` array and returns
  an Observable (with a ~600 ms delay so the submitting state is visible). The role is a
  `SEED_JOB` constant seeded into `job` on first load and read back through `JobService`.
- **Data shape**: `Application { id, roleId, jobTitle, fullName, email, coverNote, cv: { name,
  sizeBytes, type }, submittedAt }`. Reconciled with the page: the workbook's `phone` is dropped
  (the design has no phone field); `cv` is added (details only, spec FR-013). See
  [data-model.md](./data-model.md).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Pre-research | Post-design |
|-----------|--------------|-------------|
| I. Design is the source of truth | PASS | PASS — `styles/tokens.css` from the style sheet; stylelint bans hex/rgb/named colours elsewhere |
| II. Accessible by default | PASS | PASS — native controls, `aria-describedby`/`aria-invalid`, focusable alerts, CV drop area is a `<button>` |
| III. Mobile-first, 360px | PASS | PASS — min-width breakpoints (900px) + ≤420px tightening |
| IV. Small, plain component set | PASS | PASS with justification — see Complexity Tracking |
| V. Swappable data layer | PASS | PASS — Observable `StorageService`/`ApplicationService`, root-provided; ESLint bans `localStorage` outside `storage.service.ts` |
| VI. Every state, real content | PASS | PASS — [contracts/ui-states.md](./contracts/ui-states.md) |
| VII. Angular standards | PASS | PASS — `frontend/`, feature-first, standalone + OnPush + signals, `hf-` prefix, angular-eslint + Prettier, unit tests for domain/services |

No unjustified violations. Gate passed.

## Project Structure

### Documentation (this feature)

```text
specs/001-job-application/
├── plan.md · research.md · data-model.md · quickstart.md · tasks.md
├── contracts/ (services.md, storage-schema.md, ui-states.md)
└── checklists/ (requirements.md, ux.md)
```

### Source Code

```text
frontend/
├── src/
│   ├── index.html · main.ts · styles.css (imports tokens + base)
│   ├── styles/ tokens.css (only file with colour literals) · base.css
│   └── app/
│       ├── app.ts · app.config.ts · app.routes.ts      # shell: header, <router-outlet>, footer
│       ├── core/storage/ storage.service.ts · storage-error.ts
│       ├── shared/ui/ button · text-field · card · alert
│       └── features/job-application/
│           ├── job-application.routes.ts
│           ├── models/ role.model.ts · application.model.ts · cv-file.model.ts
│           ├── data/ seed-job.ts
│           ├── domain/ validation.ts · format.ts           (+ .spec.ts)
│           ├── services/ application.service.ts · job.service.ts   (+ .spec.ts)
│           ├── pages/ apply-page · confirmation-page        # smart (route) components
│           └── components/ role-header · role-facts · role-description · role-page-layout · application-form · application-sent · cv-file-drop
└── eslint.config.js · .prettierrc · .stylelintrc.json
```

**Structure Decision**: Angular workspace in `frontend/` (constitution VII). Pages are smart
components that talk to services; everything under `components/` and `shared/ui/` is
presentational except `application-form`, which owns form state and calls `ApplicationService`.

## Complexity Tracking

| Addition | Why Needed | Simpler Alternative Rejected Because |
|----------|------------|-------------------------------------|
| `text-field` multiline variant | Cover note is multi-line | A variant of text input, not a new component |
| `cv-file-drop` component | CV attach with drag-and-drop and file row (spec US3) | No base component handles files; composes button + card styling |
| `alert` component | Error summary and failure alert (FR-006, FR-019) | Needs `role="alert"` + programmatic focus; styled as a tinted card |
