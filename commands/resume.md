---
description: "Resume an interrupted specification interview"
allowed-tools: ["AskUserQuestion", "Read", "Write", "Glob", "Grep", "Bash(ls:*)", "Bash(cat:*)"]
hide-from-slash-command-tool: "true"
---

# Hotseat Resume Command

Resume an interrupted specification interview.

## STEP 1: SCAN FOR INTERRUPTED INTERVIEWS

First, scan for all existing interview state files:

```bash
ls -la .claude/hotseat-*.md 2>/dev/null || echo "NO_STATE_FILES"
```

## STEP 2: HANDLE RESULTS

### If NO state files exist:

Tell the user:

> No interrupted interviews found.
>
> To start a new interview, use:
> ```
> /hotseat:plan "your feature name"
> ```

Then STOP - do not continue.

### If state files exist:

For each `.claude/hotseat-*.md` file found, read the YAML frontmatter to extract:
- `feature_name` - The human-readable feature name
- `started_at` - When the interview was started

Then present the list to the user using AskUserQuestion with options like:
- Option 1: "Feature Name A (started: 2026-01-15)"
- Option 2: "Feature Name B (started: 2026-01-17)"
- etc.

## STEP 3: RESUME SELECTED INTERVIEW

Once the user selects an interview:

1. Read the full state file content
2. Read the draft spec file at `.claude/hotseat-draft.md` if it exists
3. The state file contains the full interview prompt after the YAML frontmatter
4. Continue the interview from where it left off

Tell the user:
> Resuming interview for: [FEATURE_NAME]
>
> I'll review the draft spec and continue with the next question.

Then read the draft spec to understand what's already been gathered, and ask the next appropriate question using AskUserQuestion.

## INTERVIEW RULES (same as /hotseat:plan)

1. EVERY question must use AskUserQuestion - plain text questions won't work
2. Ask NON-OBVIOUS questions (not "what should it do?" but "how should X handle Y?")
3. Continue until user says "done" or "finalize"
4. Update the draft spec file regularly using the Write tool

## FINALIZATION CONSTRAINTS - CRITICAL

When the user says "done", "finalize", "finished", or similar:

### ALLOWED ACTIONS (Read and Write ONLY):
- Read any files needed to compile the final spec
- Write the final spec to {output-dir}/{slug}.md
- Write the JSON spec to {output-dir}/{slug}.json
- Write the progress file to {output-dir}/{slug}-progress.txt
- Delete the state file at .claude/hotseat-{slug}.md using Write with empty content

### FORBIDDEN ACTIONS (DO NOT USE):
- NO Bash tool calls - do not run any commands
- NO Edit tool calls - do not modify existing code
- NO Task tool calls - do not launch subagents
- NO implementation of any kind - you are ONLY writing spec documents

### FINALIZATION SEQUENCE:
1. Write the final markdown spec file
2. Write the JSON spec file
3. Write the progress file with all phases marked as [PENDING]
4. Delete the state file (.claude/hotseat-{slug}.md)
5. Output <promise>SPEC COMPLETE</promise>
6. STOP IMMEDIATELY - do not continue with any other actions

### CRITICAL: SPEC COMPLETE MEANS STOP
After outputting <promise>SPEC COMPLETE</promise>, you MUST stop. Do not:
- Offer to implement the feature
- Suggest next steps for implementation
- Make any code changes
- Run any commands

The spec is the deliverable. Implementation is a separate task.
