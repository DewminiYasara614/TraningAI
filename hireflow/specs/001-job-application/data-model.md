# Data Model: Job Application Screen

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-01

## Role (static content)

| Field | Type | Example / Notes |
|-------|------|-----------------|
| id | string | `"northgate-senior-dotnet"` |
| company | string | `"Northgate Labs"` |
| team | string | `"Platform"` |
| title | string | `"Senior .NET Engineer (Remote, UK)"` |
| summary | string | One-line summary from the design |
| salary | string | `"£78,000 – £92,000"` (display string; not used numerically) |
| location | string | `"Remote, UK"` |
| contract | string | `"Permanent, full time"` |
| teamSize | string | `"Platform, 9 people"` |
| closesOn | ISO date | `"2026-11-27"` → displayed "27 November 2026" |
| replyBy | ISO date | `"2026-12-04"` → displayed "4 December" |
| reviewDay | string | `"Thursday"` |
| hiringManager | `{ name, role, initials }` | `{ "Dana Kowalski", "Hiring manager", "DK" }` |
| description | `{ intro: string[]; sections: { heading; body }[] }` | Intro paragraphs + "What you'll do", "What we're looking for", "How we hire" |

## ApplicationDraft (in-memory form state)

| Field | Type | Rules |
|-------|------|-------|
| fullName | string | Required after trim |
| email | string | Required after trim; matches `^[^\s@]+@[^\s@]+\.[^\s@]+$` |
| coverNote | string | 0–500 chars; input is truncated to 500 |
| cv | `CvFile \| null` | Required |

## CvFile (metadata only — FR-013)

| Field | Type | Rules |
|-------|------|-------|
| name | string | Original file name |
| sizeBytes | number | 1 ≤ size ≤ 10 × 1024 × 1024 |
| type | `"pdf" \| "doc" \| "docx"` | From extension, case-insensitive |

Display size: `> 1 MiB` → one decimal MB ("2.3 MB"); otherwise `max(1, round(KB))` KB.

## Application (persisted)

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Generated on submit |
| roleId | string | References `Role.id` |
| fullName | string | Trimmed |
| email | string | Trimmed |
| coverNote | string | May be `""` |
| cv | CvFile | Metadata only |
| submittedAt | string (ISO 8601) | Set on submit |

Persisted as a JSON array under storage key `hireflow:applications:v1` — see
[contracts/storage-schema.md](./contracts/storage-schema.md). Duplicates are allowed.

## Validation errors

`FieldErrors = Partial<Record<"fullName" | "email" | "cv", string>>` — messages exactly as in the
spec's field table. CV selection errors (type, size, empty) are a separate `cvSelectionError`
shown in the CV field and cleared on next valid selection or removal.

## Form state machine

```text
            send (invalid)                       
   ┌─────── idle ──────────────► idle(tried=true, errors shown, focus → summary)
   │         │ send (valid)                │ edit → re-validate live
   │         ▼                             │ send (valid)
   │     submitting ◄──────────────────────┘
   │      │       │
   │  save ok   save fails (StorageError)
   │      ▼       └──► idle(tried, data kept, failure alert shown)
   │   success (focus → "Application sent")
   │      │ "Start again"
   └──────┘ (empty draft, tried=false, no errors)
```

- `send` while `submitting` or `success` is ignored.
- The failure alert clears on the next send attempt.
- `dragging` is an independent boolean on the CV field (true between dragover and dragleave/drop).
