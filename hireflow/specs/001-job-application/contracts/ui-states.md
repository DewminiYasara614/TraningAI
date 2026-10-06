# Contract: UI States & Copy

Every state below MUST exist (constitution Principle VI) and be covered by a test. Copy is exact.

| State | Trigger | What is shown | Focus |
|-------|---------|---------------|-------|
| Default | Page load / "Start again" | Form, all hints in default text, no alert | Unchanged |
| Validating (errors) | Send with ≥1 invalid field | Alert: "One thing needs fixing before you can send this." / "A few things need fixing before you can send this." + "Check the highlighted fields below."; failing fields marked with messages | Alert |
| Validating (live) | Any change after a failed send | Messages/summary update per change; summary removed when no errors | Unchanged |
| CV dragging | File dragged over drop area | Highlighted drop area | Unchanged |
| CV attached | Valid file chosen/dropped | File row: name, size, "Remove" | Unchanged |
| CV rejected | Invalid file chosen/dropped | CV error: type / size / empty message (see spec) | Unchanged |
| Submitting | Send with all valid | "Send application" `aria-disabled` + `aria-busy`, label "Sending…", further sends ignored | Stays on button |
| Success | Save resolved → `/confirmation?id=…` (also on reload) | Form replaced by "Application sent" card; "Thanks {first}. Dana and the Platform team review applications every Thursday, and you'll hear from us either way by 4 December. We'll reply to {email}."; "Browse other roles", "Start again" | "Application sent" heading |
| Failure | Save rejected | Back to form, all data kept; alert: "We couldn't send your application. Your details are still here — please try again." | Alert |

Field hints and errors: see the table in [spec.md](../spec.md#user-story-2---correct-mistakes-before-sending-priority-p1).

Breakpoints (from design): base = single column; `≤420px` gutter 16px, title 28px, card padding
20/16; `≥900px` two columns with sticky facts panel (280px), title 40px, and name + email side
by side. (The wireframe suggested pairing at 640px; the final design pairs at 900px, which wins.)
