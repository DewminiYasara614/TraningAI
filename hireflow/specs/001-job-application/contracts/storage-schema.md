# Contract: Browser Storage Schema

## `applications`

JSON array of `Application`, oldest first (workbook Part D key name).

```json
[
  {
    "id": "3f2b8c1e-6a0d-4b7e-9c2f-1d5e8a7b6c40",
    "roleId": "northgate-senior-dotnet",
    "jobTitle": "Senior .NET Engineer (Remote, UK)",
    "fullName": "Ravi Shah",
    "email": "ravi.shah@example.com",
    "coverNote": "I led the decomposition of a similar .NET monolith at my last company.",
    "cv": { "name": "Ravi Shah CV.pdf", "sizeBytes": 860160, "type": "pdf" },
    "submittedAt": "2026-10-06T14:32:05.000Z"
  }
]
```

## `job`

The seeded `Role` object (`SEED_JOB`). Re-seeded when missing, malformed, or when its `id` differs
from `SEED_JOB.id`.

## Rules

- No CV file contents are ever stored (spec FR-013).
- Readers treat a missing or malformed value as the fallback (`[]` / `SEED_JOB`).
- Reset: delete the keys or run `localStorage.clear()` and reload.
