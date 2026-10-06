# Implementation Plan: Job Application Screen

**Branch**: `001-job-application` | **Date**: 2026-10-01 (re-checked 2026-10-06 against
constitution v1.1.0) | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-job-application/spec.md`

## Summary

A single client-side page where a candidate reads one role (Senior .NET Engineer, Northgate Labs)
and applies with name, email, CV (metadata only) and an optional cover note. Validation runs on
first send, then live; sending shows a submitting state, saves to browser storage through
`ApplicationService` → `StorageService`, and swaps the form for a confirmation. Built with React +
TypeScript + Vite, styled from design tokens as CSS custom properties, matching
`design/Job Application Page.dc.html`.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), targeting ES2022

**Primary Dependencies**: React 18, Vite 5; dev: Vitest, React Testing Library, user-event,
vitest-axe, Playwright, ESLint, stylelint

**Storage**: Browser `localStorage`, key `hireflow:applications:v1`, via `StorageService`

**Testing**: Vitest + RTL (unit/component/a11y), Playwright (e2e at 360px and 1280px)

**Target Platform**: Current evergreen browsers (Chrome, Edge, Firefox, Safari, iOS Safari,
Android Chrome)

**Project Type**: Single-page web application (frontend only, no backend)

**Performance Goals**: Interactive in < 2 s on a mid-range phone over 4G; field feedback on the
same input event

**Constraints**: Works from 360px; WCAG AA; keyboard-operable; no hard-coded hex outside
`tokens.css`; only button / text input / card components (+ justified additions below)

**Scale/Scope**: 1 screen, 1 fixed role, ~6 components, applications stored per browser

All items resolved in [research.md](./research.md); no NEEDS CLARIFICATION remain.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Pre-research | Post-design |
|-----------|------|--------------|-------------|
| I. Design is the source of truth | UI derived from design files; tokens as CSS custom properties; no hard-coded hex | PASS | PASS — `tokens.css` from style sheet; stylelint `color-no-hex` outside it |
| II. Accessible by default | AA contrast, labels, announced errors, visible focus, keyboard-only | PASS | PASS — native controls, `aria-describedby`/`aria-invalid`, alert focus, CV drop area is a `<button>`, axe in tests |
| III. Mobile-first, 360px | Mobile-first CSS, no horizontal scroll at 360px | PASS | PASS — min-width breakpoints (900px) + ≤420px tightening; Playwright 360px check |
| IV. Small, plain component set | Button, text input, card; no gradients/heavy shadows | PASS | PASS with justification — see Complexity Tracking (textarea, file drop) |
| V. Swappable data layer | Components never touch storage; ApplicationService → StorageService | PASS | PASS — see [contracts/services.md](./contracts/services.md); context-injected services |
| VI. Every state, real content | Default/validating/submitting/success/error; no lorem ipsum | PASS | PASS — [contracts/ui-states.md](./contracts/ui-states.md); copy from design + spec |

| Scope & stack (v1.1.0) | Adopted stack only; runtime deps justified; no constitution non-goals built | PASS | PASS — runtime deps are React + React DOM only; CV contents never stored (FR-013); no sign-in, backend, employer tooling, retention or duplicate checks |

No unjustified violations. Gate passed.

## Project Structure

### Documentation (this feature)

```text
specs/001-job-application/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── services.md
│   ├── storage-schema.md
│   └── ui-states.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks output
```

### Source Code (repository root)

```text
index.html
package.json
vite.config.ts            # also Vitest config
playwright.config.ts
src/
├── main.tsx              # mounts <App/> inside <ServicesProvider>
├── App.tsx               # page shell: header, main, footer
├── styles/
│   ├── tokens.css        # the only file allowed hex values
│   └── base.css          # reset, body, focus-visible ring
├── content/
│   └── role.ts           # Role data (copy from design; spec dates)
├── domain/
│   ├── types.ts          # Role, ApplicationDraft, CvFile, Application, FieldErrors
│   ├── validation.ts     # validateApplication, validateCvFile
│   └── format.ts         # formatFileSize, formatDate, firstName
├── services/
│   ├── StorageService.ts         # interface + StorageError
│   ├── LocalStorageService.ts
│   ├── ApplicationService.ts     # interface + LocalApplicationService
│   └── ServicesContext.tsx       # createServices, ServicesProvider, useServices
├── components/
│   ├── Button/           # primary / secondary / ghost; disabled + busy
│   ├── TextField/        # label, input|textarea, hint/error, counter slot
│   ├── Card/
│   ├── FileDrop/         # CV picker + drag area + file row (composes Button)
│   └── Alert/            # error summary / failure alert (role="alert")
└── features/job-application/
    ├── RoleHeader.tsx
    ├── RoleFacts.tsx
    ├── RoleDescription.tsx
    ├── ApplicationForm.tsx       # form state machine, validation wiring
    ├── ApplicationSent.tsx
    └── JobApplicationPage.tsx
tests/
└── e2e/job-application.spec.ts
```

Unit and component tests sit next to their source as `*.test.ts(x)`.

**Structure Decision**: Single frontend project at the repo root. `domain/` is pure logic,
`services/` is the swappable data layer, `components/` is the small shared set, and
`features/job-application/` composes them into the screen.

## Complexity Tracking

| Addition | Why Needed | Simpler Alternative Rejected Because |
|----------|------------|-------------------------------------|
| `TextField` multiline (textarea) variant | Cover note is multi-line | A single-line input can't hold a 500-char note; it's a variant of text input, not a new component |
| `FileDrop` component | CV attach with drag-and-drop and file row (spec US3) | No base component handles files; built from Button + Card styling, no new visual language |
| `Alert` component | Error summary and failure alert (FR-006, FR-019) | Inline text can't meet `role="alert"` + focus requirements cleanly; styled as a tinted card variant |
