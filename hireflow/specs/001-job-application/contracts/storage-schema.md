# Contract: Browser Storage Schema

**Key**: `hireflow:applications:v1`
**Value**: JSON array of `Application`, oldest first.

```json
[
  {
    "id": "3f2b8c1e-6a0d-4b7e-9c2f-1d5e8a7b6c40",
    "roleId": "northgate-senior-dotnet",
    "fullName": "Ravi Shah",
    "email": "ravi.shah@example.com",
    "coverNote": "I led the decomposition of a similar .NET monolith at my last company.",
    "cv": { "name": "Ravi Shah CV.pdf", "sizeBytes": 860160, "type": "pdf" },
    "submittedAt": "2026-10-01T14:32:05.000Z"
  }
]
```

Rules:
- No CV file contents are ever stored (spec FR-013).
- Readers MUST tolerate a missing key or malformed value by treating it as `[]`.
- A breaking schema change MUST use a new key suffix (`:v2`) with a migration from `:v1`.
