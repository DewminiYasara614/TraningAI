# Quickstart: Job Application Screen

Validation guide proving the feature works end to end. Details live in
[data-model.md](./data-model.md) and [contracts/](./contracts/).

## Prerequisites

- Node.js 22+ and npm 11+
- Playwright browsers (first run only): `npx playwright install chromium`

## Run

```powershell
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build to dist/
npm run preview      # serve dist/
```

## Automated checks

```powershell
npm run lint                      # ESLint + stylelint (no hard-coded hex outside tokens.css)
npm test                          # Vitest unit + component + axe
npx vitest run src/domain/validation.test.ts   # single test file
npx vitest run -t "shows plural summary"       # single test by name
npm run test:e2e                  # Playwright, 360px + 1280px
```

## Manual validation scenarios

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 1 | Happy path (SC-001, SC-004) | Fill name "Ravi Shah", email "ravi@example.com", attach a small PDF, send | "Sending…" briefly, then "Application sent" with "Thanks Ravi." and "We'll reply to ravi@example.com." Reload: DevTools → Application → Local Storage → `hireflow:applications:v1` has 1 record with CV metadata only |
| 2 | Empty send (SC-002) | Click "Send application" on an empty form | Plural summary, 3 field errors, focus on summary |
| 3 | Live fix (SC-003) | After #2, type a name | Name error clears immediately; summary still plural (2 left) |
| 4 | Email rule | Enter "ravi@example" and send | "Add a domain, like name@company.com." |
| 5 | Bad CV | Drop a `.png`; then a 12MB PDF; then a 0-byte PDF | Type / size / empty messages; nothing attached |
| 6 | Cover note cap | Paste 600 characters | 500 kept; hint "500 / 500 characters" |
| 7 | Double send (SC-007) | Fill valid form, click send rapidly 5× | One record saved |
| 8 | Storage failure | DevTools: run `Storage.prototype.setItem = () => { throw new DOMException('', 'QuotaExceededError') }`, then send a valid form | Failure alert; all fields and CV still filled |
| 9 | Keyboard only (SC-005) | Tab through the whole page; open file picker with Enter/Space; send | Every control reachable with visible focus ring; flow completes |
| 10 | 360px (SC-005) | DevTools device toolbar at 360×740 | No horizontal scroll; single column; facts above description |
| 11 | Contrast (SC-006) | Run axe DevTools in default, error, success states | No contrast violations |
| 12 | Start again | From success, click "Start again" | Empty form, no errors; stored record count unchanged |
