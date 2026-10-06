# Quickstart: Job Application Screen

Validation guide proving the feature works end to end. Details live in
[data-model.md](./data-model.md) and [contracts/](./contracts/).

## Prerequisites

- Node.js 20+ and npm; Angular CLI (`npm install -g @angular/cli`)

## Run

```powershell
cd frontend
npm install
npm start            # ng serve → http://localhost:4200 (opens /apply)
npm run build        # production build to frontend/dist/
```

## Automated checks

```powershell
cd frontend
npm test             # ng test (Vitest): domain logic + services
npm run lint         # angular-eslint + stylelint
npm run format:check # Prettier
```

## Manual validation scenarios (workbook Part E)

Reset first: DevTools → Application → Local Storage → delete `applications` (or run
`localStorage.clear()`), then reload.

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 1 | Happy path (SC-001, SC-004) | Fill "Ravi Shah", "ravi@example.com", attach a small PDF, send | "Sending…" briefly → `/confirmation?id=…` with "Thanks Ravi." and "We'll reply to ravi@example.com."; `applications` has 1 record with CV details only |
| 2 | Reload confirmation (US1-4) | Reload on the confirmation | Same confirmation |
| 3 | Fresh form (US1-6) | Go to `/apply` | Empty form, no errors |
| 4 | Empty send (SC-002) | Send an empty form | Plural summary, three field messages, focus on summary |
| 5 | Live fix (SC-003) | After #4, type a name | Name error clears immediately |
| 6 | Email rule | "ravi@example" + send | "Add a domain, like name@company.com." |
| 7 | Bad CV | `.png`; 12 MB PDF; 0-byte PDF | Type / size / empty message; nothing attached |
| 8 | Cover note cap | Paste 600 characters | 500 kept; "500 / 500 characters" |
| 9 | Double send (SC-007) | Click send rapidly | One record saved |
| 10 | Storage failure (FR-019) | DevTools console: `Storage.prototype.setItem = () => { throw new DOMException('full','QuotaExceededError') }`, then send a valid form | Failure alert, data kept; send again after reload succeeds |
| 11 | Keyboard only (SC-005) | Tab through; Space on "Choose a file"; Enter to send | Every control reachable with a visible ring |
| 12 | 360px (SC-005) | Device toolbar 360×740 | No horizontal scroll in any state |
| 13 | Unknown confirmation | Open `/confirmation?id=nope` | Redirected to `/apply` |

## Review results

**2026-10-06 — workbook Part E, run against `ng serve` in Chromium at 360px and 1280px.**
82/82 scripted review checks passed (a one-off walkthrough, not a committed e2e suite):

| Part E check | Result |
|---|---|
| Design fidelity | Screenshots match `Job Application Page.dc` at both widths: layout, type, colour, spacing, two-column ≥900px with sticky facts, error and success states |
| Acceptance criteria | Required fields + email format validated before send (SC-002/003); record persists and survives reload (SC-004); every state handled; one record per send (SC-007). SC-001 (< 2 min) not timed with a person — the flow is 4 inputs + 1 click |
| States | Validation (empty send, bad email), error (storage throwing on `applications`), submitting (`Sending…`, `aria-busy`), success — all reached; focus moves to summary / failure alert / confirmation heading |
| Persistence | `applications` holds `{ id, roleId, jobTitle, fullName, email, coverNote, cv{name,sizeBytes,type}, submittedAt }`; reload on `/confirmation` keeps the confirmation; `job` seeded |
| Accessibility | axe WCAG 2.1 A/AA: 0 violations in default, validation, save-failure and success states; Tab reaches every control with a visible ring; no horizontal scroll at 360px |
| Routing | `/` → `/apply`; "Start again" → empty `/apply`; `/confirmation?id=nope` → `/apply` |

Not covered: scenario 7's real mouse drag-and-drop (file chooser path verified), and timing SC-001
with a real candidate.
