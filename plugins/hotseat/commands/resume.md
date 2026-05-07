---
description: Resume or continue an existing Hotseat goal-template draft.
argument-hint: [path]
---

# /hotseat:resume

Resume or continue a Hotseat planning interview or goal-template draft.

## Arguments

- `path`: optional existing `.goal.md` draft or output directory

## Workflow

1. Resolve the draft to resume:
   - If `path` is a file, read that file.
   - If `path` is a directory, list recent `*.goal.md` files in that directory and ask the user which one to resume.
   - If no path is provided, look for recent `*.goal.md` files under `docs/goals`, then `hotseat`, newest first.
   - If multiple likely drafts exist, ask the user to choose before editing.
2. If goal tools are available and no Hotseat planning goal is active, create one for resuming the selected template.
3. Inspect the draft against the Hotseat goal-template sections: Objective, Background, User Stories, Acceptance Criteria, Constraints, Implementation Notes, Files And Interfaces, Verification Plan, Open Questions, and Codex Goal Prompt.
4. Identify missing sections, weak acceptance criteria, unresolved constraints, stale open questions, or verification gaps.
5. Ask the next most useful planning question before editing unless the user explicitly asks to finalize.
   - Use `request_user_input` for bounded choices when available.
   - If `request_user_input` is unavailable, ask plainly and mention `/hotseat:doctor` for native prompt readiness checks.
6. Update the existing goal-template file in place, preserving its structure and frontmatter.
7. Re-read the updated file and verify required sections are present.
8. Mark the planning goal complete only after the user confirms the template is ready or the template has no major gaps.

Do not implement the planned feature during this command.
