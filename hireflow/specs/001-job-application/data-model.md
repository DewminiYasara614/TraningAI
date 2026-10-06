# Data Model: Job Application Screen

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-06

## Role (seeded content — `SEED_JOB`)

| Field | Type | Example / Notes |
|-------|------|-----------------|
| id | string | `"northgate-senior-dotnet"` |
| company | string | `"Northgate Labs"` |
| team | string | `"Platform"` |
| title | string | `"Senior .NET Engineer (Remote, UK)"` |
| summary | string | One-line summary from the design |
| salary | string | `"£78,000 – £92,000"` (display only) |
| location | string | `"Remote, UK"` |
| contract | string | `"Permanent, full time"` |
| teamSize | string | `"Platform, 9 people"` |
| closesOn | ISO date | `"2026-11-27"` → "27 November 2026" |
| replyBy | ISO date | `"2026-12-04"` → "4 December" |
| reviewDay | string | `"Thursday"` |
| hiringManager | `{ name, role, initials }` | `{ "Dana Kowalski", "Hiring manager", "DK" }` |
| description | `{ intro: string[]; sections: { heading; body }[] }` | Intro + three sections |

Seeded into `localStorage["job"]` on first load; see [storage-schema.md](./contracts/storage-schema.md).

## ApplicationDraft (form state, in memory)

| Field | Type | Rules |
|-------|------|-------|
| fullName | string | Required after trim |
| email | string | Required after trim; `^[^\s@]+@[^\s@]+\.[^\s@]+$` |
| coverNote | string | 0–500 chars; input truncated to 500 |
| cv | `CvFile \| null` | Required |

## CvFile (details only — FR-013)

| Field | Type | Rules |
|-------|------|-------|
| name | string | Original file name |
| sizeBytes | number | 1 ≤ size ≤ 10 × 1024 × 1024 |
| type | `"pdf" \| "doc" \| "docx"` | From extension, case-insensitive |

Display size: `> 1 MiB` → one-decimal MB ("2.3 MB"); otherwise `max(1, round(KB))` KB.

## Application (persisted)

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Generated on submit |
| roleId | string | `Role.id` |
| jobTitle | string | `Role.title` at time of applying (workbook data shape) |
| fullName | string | Trimmed |
| email | string | Trimmed |
| coverNote | string | May be `""` |
| cv | CvFile | Details only |
| submittedAt | string (ISO 8601) | Set on submit |

Reconciled with the workbook's suggested shape `{ id, jobTitle, fullName, email, phone, coverNote,
submittedAt }`: `phone` is omitted because the design has no phone field; `roleId` and `cv` are
added.

## FieldErrors

`Partial<Record<"fullName" | "email" | "cv", string>>` with the spec's messages. CV selection
errors (type, size, empty) are a separate `cvRejection` shown in the CV field and cleared on the
next valid selection or removal.

## Form and route states

```text
/apply                                                     /confirmation?id=…
 idle ── send (invalid) ─► idle(tried, errors, focus summary)
  │ send (valid)                 │ edit → re-validate live
  ▼                              ▼
 submitting ──── save ok ────────────────────────────────►  success (focus heading)
  │ save fails (StorageError)                                 │ "Start again" → /apply (empty)
  └► idle(tried, data kept, failure alert, focus alert)       │ reload → same confirmation
                                                              │ no/unknown id → /apply
```

- A send while submitting is ignored. The failure alert clears on the next send attempt.
