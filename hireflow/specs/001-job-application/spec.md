# Feature Specification: Job Application Screen

**Feature Branch**: `001-job-application`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: "Build the HireFlow Job Application screen. The visual design is in
./design/Job Application Page.dc - reference it, but this spec is about behaviour."

**Design reference**: `design/Job Application Page.dc.html` (final screen),
`design/Job Application Mobile.dc.html` (mobile behaviour notes),
`design/Job Application Wireframes.dc.html` (structure; options 1a + 2b were taken forward).
Layout, colour and type come from those files and the style sheet; this spec covers behaviour only.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Apply for a role (Priority: P1)

A candidate opens the page for a single role (Senior .NET Engineer at Northgate Labs), reads about
it, fills in their name and email, attaches their CV, optionally writes a cover note, and sends the
application. They see a confirmation that addresses them by first name and tells them what happens
next.

**Why this priority**: This is the whole purpose of the screen. Without it there is no product.

**Independent Test**: Open the page, complete all required fields with valid values, send, and
confirm the confirmation appears and the application is retained after a page reload.

**Acceptance Scenarios**:

1. **Given** the page has loaded, **When** the candidate views it, **Then** they see the role
   header (company · team, title, one-line summary), the role facts (salary, location, contract,
   team, closing date, hiring manager), the full role description, and the application form.
2. **Given** a valid name, email and CV, **When** the candidate selects "Send application",
   **Then** the form enters a submitting state in which it cannot be sent again, and on completion
   is replaced by the "Application sent" confirmation.
3. **Given** the confirmation is shown, **Then** it greets the candidate by the first word of the
   name they entered ("Thanks Ravi."), states the review cadence and reply-by date, and offers
   "Browse other roles" and "Start again".
4. **Given** an application was sent, **When** the page is reloaded, **Then** the application is
   still held in the candidate's browser storage, and the same "Application sent" confirmation is
   shown again.
6. **Given** a candidate opens the application page afresh, **Then** an empty form is shown in its
   default state, even if applications were sent earlier from this browser.
5. **Given** the confirmation is shown, **When** the candidate selects "Start again", **Then** an
   empty form is shown in its default state; the previously sent application is kept.

---

### User Story 2 - Correct mistakes before sending (Priority: P1)

A candidate who tries to send an incomplete or invalid form is told exactly what to fix, field by
field, with a summary at the top, and the messages update as they correct each field.

**Why this priority**: Equal to P1 — sending bad data or failing silently would undermine every
application. The design shows this as a primary state.

**Independent Test**: Send an empty form, confirm the summary and per-field messages, then fix
fields one at a time and confirm each message clears immediately.

**Acceptance Scenarios**:

1. **Given** an untouched form, **When** the candidate types in or leaves any field, **Then** no
   error is shown (errors appear only after the first send attempt).
2. **Given** one or more required fields are missing or invalid, **When** the candidate selects
   "Send application", **Then** nothing is sent; an alert summary appears above the fields reading
   "One thing needs fixing before you can send this." (one error) or "A few things need fixing
   before you can send this." (two or more), followed by "Check the highlighted fields below.";
   and each failing field is marked and shows its specific message in place of its hint.
3. **Given** a failed send attempt, **When** the candidate edits any field, **Then** validation
   re-runs on every change: fixed fields return to their normal hint, and the summary updates its
   wording or disappears when nothing is left to fix.
4. **Given** a failed send attempt, **Then** keyboard focus moves to the error summary so screen
   reader and keyboard users learn of the errors immediately.

Field rules and messages:

| Field | Rule | Default hint | Error message |
|-------|------|--------------|---------------|
| Full name | Required; not only whitespace | "As it appears on your CV." | "Enter your name." |
| Email | Required | "We'll only use this about your application." | "Enter your email address." |
| Email | Must look like `local@domain.tld` | — | "Add a domain, like name@company.com." |
| CV | Required | "PDF, DOC or DOCX, up to 10MB." | "Attach your CV to apply." |
| Cover note | Optional; max 500 characters | "Up to 500 characters." | — (cannot exceed) |

---

### User Story 3 - Attach and manage a CV (Priority: P2)

A candidate attaches their CV either by choosing a file or by dragging one onto the drop area,
sees the file name and size, and can remove it and choose another.

**Why this priority**: Required to apply, but the mechanics of attaching are secondary to the
end-to-end flow and validation.

**Independent Test**: Attach a valid file via the picker and via drag-and-drop; confirm name and
size are shown; remove it and confirm the drop area returns.

**Acceptance Scenarios**:

1. **Given** no file is attached, **When** the candidate activates the drop area ("Choose a file")
   by click, tap or keyboard, **Then** the device file picker opens, limited to PDF, DOC and DOCX.
2. **Given** no file is attached, **When** the candidate drags a file over the drop area, **Then**
   the area shows a highlighted "dragging" state, which clears on drag-leave or drop.
3. **Given** a valid file is chosen or dropped, **Then** the drop area is replaced by a file row
   showing the file name (truncated with an ellipsis if long), its size ("840 KB", "2.3 MB"; sizes
   under 1 KB show as "1 KB"), and a "Remove" action.
4. **Given** a file is attached, **When** the candidate selects "Remove", **Then** the drop area
   returns; if a send has already been attempted, the CV error "Attach your CV to apply." shows.
5. **Given** a file that is not PDF/DOC/DOCX or is larger than 10MB, **When** it is chosen or
   dropped, **Then** it is not attached and the CV field shows an error explaining why
   ("That file type isn't supported. Use PDF, DOC or DOCX." / "That file is over 10MB. Try a
   smaller version.").
6. **Given** several files are dropped at once, **Then** only the first is considered.

---

### User Story 4 - Write an optional cover note (Priority: P3)

A candidate adds a short note for the hiring manager and can see how much of the 500-character
allowance they have used.

**Why this priority**: Optional enhancement; applications are valid without it.

**Independent Test**: Type into the cover note and confirm the counter; paste a longer text and
confirm it is capped at 500 characters.

**Acceptance Scenarios**:

1. **Given** the note is empty, **Then** its hint reads "Up to 500 characters."
2. **Given** the candidate has typed N characters, **Then** the hint reads "N / 500 characters".
3. **Given** the candidate types or pastes text that would exceed 500 characters, **Then** the note
   keeps only the first 500 characters.

---

### Edge Cases

- **Closing date**: the design's dates (closes 29 August 2026, reply by 5 September) are already
  past. The build uses future dates instead — closes **27 November 2026**, reply by
  **4 December 2026** — keeping the design's one-week gap. Behaviour after closing (a "closed"
  state) is out of scope for this build.
- **Storage unavailable or full**: if the application cannot be saved, the form returns from the
  submitting state with everything the candidate entered intact, and shows an error alert:
  "We couldn't send your application. Your details are still here — please try again."
- **Whitespace-only input**: a name of only spaces fails "Enter your name."; name and email are
  trimmed before validation and saving.
- **Single-word or unusual names**: the confirmation uses the first whitespace-separated word; if
  none can be derived it reads "Thanks there."
- **Double send**: repeated activation of "Send application" during submitting has no effect;
  exactly one application is saved.
- **Same person applies twice**: each sent application is saved separately; no duplicate check in
  this build.
- **Empty (0-byte) file**: treated as invalid ("That file looks empty. Try another file.").
- **Keyboard-only use**: every control, including the CV drop area and "Remove", is reachable and
  operable by keyboard with a visible focus indicator.
- **Dropping a file while one is attached**: the file row does not accept drops; the candidate
  removes the current CV first. A file dropped anywhere outside the drop area is ignored and never
  replaces the page (so nothing typed is lost).
- **Confirmation without an application**: opening the confirmation directly, without a sent
  application to show, takes the candidate to the empty form.

## Requirements *(mandatory)*

### Functional Requirements

**Page content**

- **FR-001**: The screen MUST display one role: header (company · team, title, summary), facts
  (salary, location, contract, team, closing date, hiring manager name and role) and the full
  description with its "What you'll do", "What we're looking for" and "How we hire" sections, as
  written in the design, except that the closing date reads "27 November 2026" (see Edge Cases).
- **FR-002**: The description MUST be shown in full (no truncation or "read more").
- **FR-003**: "All open roles" (header) and "Browse other roles" (confirmation) MUST link to the
  open roles listing location; building that listing is out of scope.

**Form and validation**

- **FR-004**: The form MUST collect Full name (required), Email (required), CV file (required)
  and Cover note (optional, max 500 characters).
- **FR-005**: Validation MUST NOT display errors before the first send attempt. Exception: a CV
  file that is rejected when chosen or dropped (FR-011) shows its message immediately.
- **FR-006**: On a send attempt with failures, the system MUST block sending, show the error
  summary (singular/plural wording per User Story 2), mark each failing field with its message,
  and move focus to the summary.
- **FR-007**: After the first failed attempt, validation MUST re-run on every field change and on
  CV attach/remove, updating field messages and the summary immediately.
- **FR-008**: Email MUST be accepted only if it has a non-empty local part, an "@", and a domain
  containing a dot, with no spaces.
- **FR-009**: Each field's error MUST be programmatically associated with that field, and the
  summary MUST be announced to assistive technology when it appears.

**CV attachment**

- **FR-010**: Candidates MUST be able to attach a CV by file picker or drag-and-drop, with a
  visible dragging state.
- **FR-011**: The system MUST accept only PDF, DOC or DOCX files of 1 byte to 10MB, rejecting
  others at selection time with the messages in User Story 3 / Edge Cases.
- **FR-012**: An attached CV MUST be shown with name, human-readable size and a "Remove" action.
- **FR-013**: The saved application MUST retain only the CV's file name, size and type, not the
  file contents. The 10MB limit still applies at selection time.

**Cover note**

- **FR-014**: The cover note MUST cap input at 500 characters and display the live count per
  User Story 4.

**Sending and confirmation**

- **FR-015**: On a valid send, the system MUST enter a submitting state in which "Send
  application" is disabled and visibly indicates progress, and further sends are ignored.
- **FR-016**: The system MUST save the application in the candidate's browser so it survives a
  reload.
- **FR-017**: On success the form MUST be replaced by the confirmation, and focus MUST move to the
  "Application sent" heading.
- **FR-018**: The confirmation copy MUST greet the candidate by first name and state that
  applications are reviewed every Thursday with a reply either way by 4 December. The design's
  "We've sent a copy to {email}." MUST be replaced with "We'll reply to {email}.", since no email
  is sent in this build. Full copy: "Thanks {first name}. Dana and the Platform team review
  applications every Thursday, and you'll hear from us either way by 4 December. We'll reply to
  {email}."
- **FR-019**: On save failure the system MUST leave the submitting state, keep all entered data
  (including the attached CV), and show the failure alert from Edge Cases. The candidate can retry
  by sending again; the alert clears on that next send attempt.
- **FR-020**: "Start again" MUST return an empty form in its default state (no errors shown)
  without deleting previously sent applications.

**General**

- **FR-021**: The screen MUST be fully usable from 360px width upward, and all functionality MUST
  be operable by keyboard alone.
- **FR-022**: The privacy line ("Your details go to Northgate Labs only. We delete applications
  six months after the role closes.") MUST appear beside or beneath the send action.

### Key Entities

- **Role**: the job being applied for — company, team, title, summary, salary range, location,
  contract type, team size, closing date, hiring manager (name, role), description sections,
  review cadence and reply-by date. Fixed content for this build.
- **Application**: one candidate's submission for a Role — role reference, full name, email,
  cover note (may be empty), CV details (file name, size, type — not the file itself), and the
  date/time it was sent.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A candidate with their CV to hand can complete and send the application — page load
  to confirmation — in under 2 minutes (comfortably inside the page's "Takes about five minutes"
  promise).
- **SC-002**: 100% of send attempts with a missing or invalid required field are blocked and show
  a specific message for every failing field.
- **SC-003**: After a failed attempt, each corrected field's error clears on the same change that
  fixes it, with no extra action from the candidate.
- **SC-004**: 100% of successfully sent applications are still present after a page reload.
- **SC-005**: The full flow — read, fill, attach CV, fix errors, send — can be completed using only
  a keyboard, and at a 360px-wide viewport without horizontal scrolling.
- **SC-006**: Every text and control on the screen, in every state, meets WCAG AA contrast.
- **SC-007**: Rapidly activating "Send application" multiple times results in exactly one saved
  application.

## Assumptions

- The screen shows a single, fixed role (Senior .NET Engineer, Northgate Labs); role content is
  part of the build, not loaded from elsewhere. Multiple roles and role management are out of
  scope.
- Candidates are anonymous; there is no sign-in, account, or "apply with LinkedIn" option.
- There is no backend: "sending" means saving the application in the candidate's own browser
  (per the constitution's swappable data layer). No one at Northgate Labs actually receives it in
  this build.
- Automatic deletion six months after closing (stated in the privacy line) is not enforced in this
  build.
- No duplicate-application detection.
- A saved application cannot reopen or download the CV, because only its details are kept.

## Non-goals

This build deliberately does not include:

- Sign-in or candidate accounts (auth).
- CV file upload: the candidate attaches a CV, but the file is never uploaded or stored — only its
  name, size and type are recorded.
- A multi-step application wizard; the application is one form.
- Server-sent email, including a confirmation email.
- Search, including searching or filtering roles.

## Clarifications

### Session 2026-10-01

- Q: The role's closing date has passed — accept, show closed, or move dates? → A: Move the sample
  role's dates into the future (closes 27 November 2026, reply by 4 December 2026).
- Q: Should the saved application keep the CV file or only its details? → A: Only name, size and
  type.
- Q: Keep, reword or remove "We've sent a copy to {email}"? → A: Reword to "We'll reply to
  {email}."
- Validation happens on send then live, exactly as prototyped in the design; no on-blur
  validation.
- The open roles listing and the Privacy / Accessibility footer pages are separate features; their
  links may point to placeholders.
- The submitting state is not drawn in the design; it is required by the constitution (Principle
  VI) and will follow the existing button styling.

### Session 2026-10-06

- Q: After sending, what does a reload show? → A: The same confirmation (from the saved
  application); opening the form afresh always shows an empty form.
- Q: Do CV file rejections wait for the first send attempt like other errors? → A: No — they show
  as soon as the file is chosen or dropped (FR-005 exception).
- Q: When does the save-failure alert clear? → A: On the next send attempt (retry).
- Q: Can a file be dropped onto the attached-file row to replace the CV? → A: No; remove first.
- Q: What is the completion-time target? → A: Under 2 minutes (lab workbook step C2).
