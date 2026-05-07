---
name: hotseat-goal-planner
description: Conduct Hotseat-style planning interviews in Codex and produce implementation-ready Codex goal templates. Use when the user asks for Hotseat, a PRD interview, a spec interview, a goal template, or planning before implementation.
disable-model-invocation: false
---

# Hotseat Goal Planner

## Purpose

Hotseat turns an early feature idea into a Codex goal template. The template should be precise enough for a later Codex goal session to implement without rediscovering product intent.

## Boundaries

- Plan and write goal templates.
- Do not implement the feature while running Hotseat.
- Do not edit unrelated project files.
- Keep questions focused and non-obvious.
- Stop after producing the planning artifact unless the user explicitly starts a separate implementation task.

## Goal Tool Usage

When Codex goal tools are available:

1. Call `create_goal` once at the start with objective `Create Hotseat goal template: <feature>`.
2. Treat that goal as the planning goal, not the implementation goal.
3. Do not mark it complete until the goal-template file is written and the final answer names the path.
4. If a token budget is explicitly requested by the user, pass it to `create_goal`; otherwise omit a budget.

The generated template should include a separate `Codex Goal Prompt` section. That section is the implementation goal text a user can paste into `/goal` or use as a goal objective later.

## Interview Pattern

Ask one question at a time. Prefer questions that reveal implementation risk:

- Who is the user and what job are they trying to finish?
- What is explicitly out of scope?
- What existing files, APIs, data models, or workflows must be preserved?
- What failure modes should be handled?
- What should be observable in tests, logs, UI, or generated output?
- What tradeoffs are acceptable?

Use Codex native `request_user_input` for bounded multiple-choice questions whenever that tool is available. Keep each native prompt to one focused question with 2-3 mutually exclusive options, put the recommended option first, and treat Codex native input as single-select plus optional notes unless the active tool schema explicitly supports multi-select.

If `request_user_input` is unavailable, tell the user that native selectable prompts require `default_mode_request_user_input = true` under `[features]` in `~/.codex/config.toml` followed by a Codex restart. Continue with plain text only when the user accepts that fallback.

Use free-form questions for domain details, edge cases, and acceptance criteria.

## Template Format

Write Markdown with this structure:

```markdown
---
title: "<Feature title>"
created: "<ISO timestamp>"
status: "draft"
source: "hotseat-codex-plugin"
codex_goal: true
---

# <Feature title>

## Objective

...

## Background

...

## User Stories

...

## Acceptance Criteria

- [ ] ...

## Constraints

...

## Implementation Notes

...

## Files And Interfaces

...

## Verification Plan

...

## Open Questions

...

## Codex Goal Prompt

<Self-contained implementation prompt for a future Codex goal session.>
```

## Quality Bar

- Acceptance criteria are testable.
- Constraints are explicit.
- The verification plan names concrete commands or checks when known.
- The `Codex Goal Prompt` can stand alone without the interview transcript.
- Open questions are limited to unresolved items that genuinely affect implementation.
