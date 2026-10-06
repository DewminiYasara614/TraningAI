<!--
Sync Impact Report
- Version change: 1.1.0 → 2.0.0 (MAJOR: stack and testing rules redefined for Angular, per the
  Shift Forward lab workbook, step C1)
- Modified principles:
  - V. Swappable Data Layer — services are Angular root-provided; the API returns Observables
- Added principles: VII. Angular Engineering Standards
- Modified sections:
  - Technology & Scope Constraints: React/Vite/Playwright replaced by Angular (standalone,
    zoneless, no SSR) in `frontend/`; UI/e2e automation skipped for the workshop time-box;
    non-goals extended (multi-step wizard, server email, search)
  - Development Workflow: Constitution Check covers Principles I–VII
- Removed sections: none
- Templates: plan-template.md "Constitution Check" reads this file at runtime — no edits required
- Deferred TODOs: none
- Follow-up: the earlier React build at the repo root (`src/`, `tests/`) predates v2.0.0 and is
  superseded by `frontend/`; remove it or keep it as reference by explicit decision
-->

# HireFlow Constitution

## Core Principles

### I. Design Is the Source of Truth

- UI MUST be built from the mockups in `design/`: the visual language in
  `design/HireFlow Style Sheet.dc.html`, layout/structure from the matching `* Wireframes.dc.html`,
  and final look from the screen file (e.g. `design/Job Application Page.dc.html`).
- Design files MUST be read as HTML before generating UI for a screen.
- Colour, type, spacing, and radius values MUST be expressed as CSS custom properties (design
  tokens) derived from the style sheet. Hard-coded hex values in components are prohibited.
- Brand fundamentals: primary `#1D4ED8` (hover `#1E40AF`), grey neutrals, Inter typeface,
  8px spacing grid. All spacing MUST be a multiple of 8px (4px permitted for fine adjustments
  only where the style sheet uses it).
- Copy MUST be warm and professional, not corporate-stiff.

Rationale: a single visual source prevents drift between design and build and lets the brand
change in one place.

### II. Accessible by Default (NON-NEGOTIABLE)

- All text and interactive elements MUST meet WCAG 2.x AA contrast on their actual background.
- Every input MUST have a programmatically associated label; errors MUST be announced and
  associated with their field.
- Every focusable element MUST have a visible focus indicator.
- All functionality MUST be operable by keyboard alone.

Rationale: a recruitment platform serves every candidate; inaccessible flows exclude applicants.

### III. Mobile-First, 360px Floor

- Styles MUST be authored mobile-first, with larger layouts added via min-width breakpoints.
- Every screen MUST be fully usable at 360px viewport width with no horizontal scrolling.

Rationale: many candidates apply from phones; the smallest supported screen defines the baseline.

### IV. Small, Plain Component Set

- UI MUST be composed from a small reusable set — button, text input, card — before any new
  component is introduced. A new component requires a justification in the plan's
  Complexity Tracking.
- Gradients are prohibited. Heavy drop-shadows are prohibited; elevation, if any, MUST be
  subtle and match the style sheet.

Rationale: few, plain components keep the interface consistent and cheap to maintain.

### V. Swappable Data Layer

- There is no backend. Data persists in browser `localStorage`.
- Components MUST NOT access `localStorage` directly. All data access goes through an
  `ApplicationService`, which depends on a `StorageService` abstraction. Both are
  `providedIn: 'root'`.
- Service methods that read or write data MUST return Observables, even though `localStorage` is
  synchronous, so an HTTP implementation is a drop-in replacement.
- Replacing `StorageService` with an HTTP API implementation MUST require no component changes.

Rationale: keeps the prototype honest about its future architecture and makes a real API a
drop-in change.

### VI. Every State, Real Content

- Every state shown in the design MUST be implemented — at minimum default, validating,
  submitting, success, and error where the flow has them.
- Lorem ipsum and placeholder copy are prohibited; use realistic HireFlow content.

Rationale: unhandled states and fake copy hide the real UX problems that matter to candidates.

### VII. Angular Engineering Standards

Structure:
- The Angular application lives in `frontend/` at the repo root, separate from `./design` and the
  Spec Kit artifacts. `ng` commands run from inside `frontend/`.
- Feature-first folders: a feature's components, service and models live together. `shared/`
  holds reusable UI; `core/` holds singletons. Feature routes are lazy-loaded.
- Standalone components everywhere; no NgModules.

Naming (Angular official style guide):
- Files kebab-case, one concept per file, filename matching its main export.
- Classes PascalCase; models are PascalCase interfaces; `any` is prohibited.
- Component selectors use the `hf-` prefix (e.g. `hf-application-form`).

Components:
- `changeDetection: ChangeDetectionStrategy.OnPush`; signal inputs/outputs (`input()`,
  `output()`, `model()`).
- Components stay small; separate data ("smart") from presentational ("dumb") components where it
  helps. No business logic in templates.

State & data:
- Local state with signals (`signal`, `computed`) — derive, don't duplicate.
- Strict TypeScript; typed models throughout.

Templates & reactivity:
- Built-in control flow only (`@if`, `@for` with `track`, `@switch`).
- Prefer signals; when using Observables, use the `async` pipe or clean up with
  `takeUntilDestroyed()`.

Styling & accessibility:
- Component-scoped styles; every colour, type and spacing value via CSS custom properties mapped
  to the design tokens (Principle I).
- Semantic HTML, labelled controls, visible focus, sufficient contrast (Principle II).

Quality gates:
- ESLint (angular-eslint) and Prettier, applied consistently.
- The spec's acceptance criteria are the definition of done. Core logic and services MUST have
  unit tests.
- UI / end-to-end automation is skipped for the workshop build as a deliberate time-box, not a
  production default; a client build keeps it. Principles II and III are verified by review
  instead (Development Workflow).

Rationale: one encoded set of conventions makes every generated change look like this team wrote
it, for this build and every one after it.

## Technology & Scope Constraints

- Client-side web application only; browser `localStorage` is the sole persistence mechanism.
- Fonts load from Google Fonts (Inter) with a system-ui fallback stack.
- Stack: Angular (standalone, zoneless) with strict TypeScript, scaffolded by the Angular CLI in
  `frontend/`. Server-side rendering and prerendering are disabled, so `localStorage` is always
  available. Unit tests run with the CLI's Vitest runner (`ng test`). A new runtime dependency
  beyond the Angular framework and RxJS requires justification in the plan.
- Non-goals: the following are deliberately out of scope. A request for any of them MUST be
  flagged as a constitution change rather than built.
  - Sign-in, candidate accounts, or third-party "apply with" identity providers.
  - A backend or real delivery of applications to employers; "sending" means saving locally.
  - Storing or uploading CV file contents; only the file's name, size, and type are kept.
  - Employer-side tooling: role creation or management, applicant review, admin screens.
  - Automated data-retention enforcement and duplicate-application detection.
  - A multi-step application wizard.
  - Sending email from a server (confirmation or otherwise).
  - Search, including searching or filtering roles.

## Development Workflow

- Features follow the Spec Kit flow: specify → (clarify) → plan → tasks → (analyze) → implement,
  with artifacts in `specs/NNN-short-name/` on a matching branch.
- Every plan MUST pass a Constitution Check against Principles I–VII before design work and again
  after; any violation MUST be justified in Complexity Tracking or removed.
- Any request that conflicts with this constitution MUST be flagged to the requester before it is
  built.
- Review MUST verify token usage (no hard-coded hex), AA contrast, keyboard/focus behaviour,
  360px layout, and that all design states exist.

## Governance

- This constitution supersedes other project practices. `CLAUDE.md` and `design/CLAUDE.md`
  provide runtime guidance and MUST stay consistent with it.
- Amendments are made via `/speckit-constitution`, recorded in the Sync Impact Report, and
  committed with a message naming the new version.
- Versioning follows semantic versioning: MAJOR for removing or redefining a principle, MINOR for
  adding a principle or materially expanding guidance, PATCH for clarifications and wording.
- Compliance is reviewed at every plan's Constitution Check and at code review.

**Version**: 2.0.0 | **Ratified**: 2026-10-01 | **Last Amended**: 2026-10-06
