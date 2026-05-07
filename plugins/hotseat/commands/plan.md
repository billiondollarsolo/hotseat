---
description: Run a Hotseat planning interview and write a Codex goal-template Markdown file.
argument-hint: <feature> [--context <path>] [--output-dir <path>] [--max-questions <n>] [--first-principles]
---

# /hotseat:plan

Conduct a Hotseat planning interview and write a Codex goal template.

## Arguments

- `feature`: feature, change, or project to plan (required)
- `--context <path>`: optional reference file or directory to inspect
- `--output-dir <path>`: optional output directory, default `docs/goals`
- `--max-questions <n>`: optional question limit, default `8`
- `--first-principles`: challenge the premise before implementation planning

## Workflow

1. Parse the requested feature and options. If no feature is provided, ask for one before continuing.
2. If goal tools are available, create a goal named `Create Hotseat goal template: <feature>`.
3. Check native-input readiness before the first interview question:
   - If the `request_user_input` tool is listed in the available tools, use it for bounded questions.
   - If it is not listed, tell the user Codex native prompts are unavailable in this session and continue with plain text only if they agree.
   - When native prompts are unavailable in Default mode, tell the user to set `default_mode_request_user_input = true` under `[features]` in `~/.codex/config.toml`, restart Codex, and retry.
4. Read only relevant context files. Prefer concise summaries over large pasted excerpts.
5. Interview the user before writing. Ask one focused question at a time.
   - For bounded choices, call `request_user_input` with exactly one question whenever the tool is available.
   - Use 2-3 mutually exclusive choices and put the recommended option first.
   - Treat Codex native input as single-select plus optional notes unless the active tool schema explicitly supports multi-select.
   - Use free-form chat questions only for domain details, edge cases, acceptance criteria, or when `request_user_input` is unavailable.
6. Gather enough detail to define the implementation goal, constraints, acceptance criteria, risks, and verification plan.
7. Write a Markdown goal template to `<output-dir>/<feature-slug>.goal.md`.
8. Verify the written file includes every required output section before final response.
9. Mark the Hotseat planning goal complete only after the template is written and verified.

## Output Contract

The generated file must be usable as a starter prompt for Codex CLI goal-based work. It must include:

- YAML frontmatter with `title`, `created`, `status`, `source`, and `codex_goal`
- `Objective`
- `Background`
- `User Stories`
- `Acceptance Criteria`
- `Constraints`
- `Implementation Notes`
- `Files And Interfaces`
- `Verification Plan`
- `Open Questions`
- `Codex Goal Prompt`

The `Codex Goal Prompt` section should be a self-contained prompt that a user can paste into `/goal` or use as the objective for a Codex goal. Do not implement the feature during this command.

## Native Input Requirements

Codex native selectable prompts require the `request_user_input` tool. In Default mode, Codex may need this feature flag:

```toml
[features]
default_mode_request_user_input = true
```

After changing Codex feature flags or plugin metadata, the user must restart Codex before testing `/hotseat:plan` again.

## Final Response

After writing the file, respond with:

- the goal-template path
- a short summary of the planned goal
- any open questions that remain

Do not offer to implement the feature in the same turn.
