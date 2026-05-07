---
description: Convert notes, a PRD, or a feature description into a Codex goal template.
argument-hint: <source> [--output-dir <path>]
---

# /hotseat:goal-template

Convert existing notes, a PRD, or a feature description into a Codex goal template.

## Arguments

- `source`: feature description or path to notes/PRD (required)
- `--output-dir <path>`: optional output directory, default `docs/goals`

## Workflow

1. Read the provided source when it is a path.
2. Extract the implementation objective, context, requirements, constraints, acceptance criteria, and verification needs.
3. Ask follow-up questions only for gaps that would materially change implementation.
   - Use `request_user_input` for bounded choices when available.
   - If `request_user_input` is unavailable, ask plainly and mention `/hotseat:doctor` for native prompt readiness checks.
4. Write `<output-dir>/<slug>.goal.md` using the Hotseat goal-template format.
5. If goal tools are available, create and complete a short planning goal around generating the template.

The output is a planning artifact only. Do not implement the feature.
