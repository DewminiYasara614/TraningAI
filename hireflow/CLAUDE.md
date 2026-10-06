# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

HireFlow is a recruitment platform. The app is an **Angular 21** workspace in `frontend/` (standalone, zoneless, **no SSR**); the first screen is the Job Application page (`specs/001-job-application/`). Also in the repo:

- `design/` — the Claude Design export (static HTML mockups; the source of truth for UI and brand).
- `.specify/` + `.claude/skills/speckit-*` — GitHub Spec Kit (v0.16.0) scaffolding, configured for Claude with **PowerShell** scripts. The constitution (`.specify/memory/constitution.md`, v2.0.0) holds the standards every plan is gated on.

There is no `package.json` at this level — all npm commands run inside `frontend/`. (An earlier React build of the screen was removed; it is in git history at commit `1f4bfb8`.)

The git repository root is the parent folder (`Training/`); this project lives in `hireflow/`.

## Commands (run from `frontend/`)

```powershell
npm start                     # ng serve → http://localhost:4200 (opens /apply)
npm run build                 # production build → frontend/dist/
npm test                      # ng test (Vitest, single run): domain logic + services
npx ng test --include src/app/features/job-application/domain/validation.spec.ts   # one spec file
npm run lint                  # angular-eslint + stylelint
npm run format                # Prettier (format:check to verify)
```

Reset app data: DevTools console → `localStorage.clear()` (keys: `applications`, `job`).

## Architecture (`frontend/src/app/`)

- `core/storage/storage.service.ts` — Observable `read`/`write` over `localStorage`; the **only** file allowed to touch it (ESLint-enforced). Failures surface as `StorageError` (`quota` / `unavailable` / `unknown`).
- `features/job-application/` — feature-first: `models/`, `data/seed-job.ts` (`SEED_JOB`, seeded into `job`), `domain/` (pure validation/format — unit tested), `services/` (`ApplicationService`, `JobService`), `pages/` (route components fed by resolvers via `withComponentInputBinding`), `components/` (presentational, plus the stateful `application-form` and the CV-specific `cv-file-drop`).
- `shared/ui/` — the small shared set: `button[hf-button]`, `section|aside|div[hf-card]`, `hf-alert`, `hf-text-field`.
- Routes: `/apply` (form) and `/confirmation?id=…` (reads the saved application back, so it survives reload; unknown id → `/apply`). Feature routes are lazy-loaded.
- Conventions (constitution VII): OnPush + signals everywhere, `input()`/`output()`/`model()`, built-in control flow, `hf-` selectors, no `any`, no business logic in templates.
- Styling: component-scoped CSS; every colour/spacing/type value is a custom property from `src/styles/tokens.css` — the only file stylelint allows hex, `rgb()` or named colours in. Two focus treatments: `--focus-ring` (buttons/links) and `--focus-ring-input` / `--focus-ring-error` (fields).
- Tests: unit tests for domain logic and services only; UI/e2e automation is deliberately skipped for the workshop (constitution VII) — verify UI with the review scenarios in `specs/001-job-application/quickstart.md`.

## Spec-driven workflow (Spec Kit)

`/speckit-constitution` → `/speckit-specify` → `/speckit-clarify` (optional) → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` (optional) → `/speckit-implement`. `/speckit-converge` appends unbuilt work back into `tasks.md`; `/speckit-checklist` and `/speckit-taskstoissues` are auxiliary.

- Feature artifacts live in `specs/NNN-short-name/`; `create-new-feature.ps1` also creates a matching git branch.
- The active feature comes from `.specify/feature.json` (or `SPECIFY_FEATURE_DIRECTORY`), **not** the git branch.
- When a requirement changes, change the spec first and let plan → tasks → implement follow; don't hand-patch generated code.

## Design system (from the Claude Design export)

From `design/CLAUDE.md`:

**Product:** HireFlow, a recruitment platform.

Brand:
- Primary blue: `#1D4ED8` (hover `#1E40AF`)
- Neutrals: greys
- Typeface: Inter
- Spacing: 8px grid
- Tone of voice: warm and professional, not corporate-stiff

Rules (apply to every design in this project):
1. WCAG AA contrast at all times.
2. Mobile-first, works down to 360px wide.
3. Reuse a small set of simple components: button, text input, card.
4. No gradients. No heavy drop-shadows.

Standing instruction: **flag any later request that conflicts with the above before building it.**

## Design source

- Visual language: `./design/HireFlow Style Sheet.dc.html` ← source of truth for colour/type/spacing (the export's "Visual Language" file)
- Target screen: `./design/Job Application Page.dc.html` (mobile notes: `./design/Job Application Mobile.dc.html`)
- Structure: `./design/Job Application Wireframes.dc.html`

Read these as HTML before generating UI (`support.js` renders them in a browser; it's generated — don't edit it). Map the visual language to CSS custom properties; no hard-coded hex.

## Conventions

- Data: browser localStorage, no backend; access via an ApplicationService backed by a StorageService (swappable for a real HTTP API later without touching components).
- Implement every state shown in the design (default / validating / submitting / success / error).
- Real content only — no lorem ipsum. Accessibility: labelled inputs, visible focus, sufficient contrast.

## Non-goals

From the spec and constitution v2.0.0 — flag any request for these rather than building it:

- Auth: sign-in, candidate accounts, "apply with" providers.
- CV file upload: only the file's name, size and type are recorded, never its contents.
- A multi-step application wizard.
- Server-sent email.
- Search (including searching or filtering roles).
- A backend, employer-side tooling, automated data retention, duplicate-application detection.
