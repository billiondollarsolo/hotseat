---
description: "Explain the hotseat workflow"
---

# Hotseat Plan Help

Please explain the following to the user:

## What is Hotseat Plan?

**Hotseat plans. Ralph does.**

Hotseat Plan is an interactive specification gathering workflow that conducts in-depth feature interviews using the AskUserQuestion tool and generates comprehensive technical specifications. Use it with [ralph-loop](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/ralph-loop) for a complete planning-to-implementation workflow.

Based on the technique described by @trq212: Start with a minimal spec, have Claude interview you about technical implementation, UI/UX, concerns, and trade-offs, then generate a complete specification.

**Key Features:**
- Adaptive questioning based on responses
- Non-obvious, in-depth questions covering technical, UX, and trade-off considerations
- Continuous interview until you say "done" or "finalize"
- Running draft maintained throughout
- Final spec output in structured markdown format

## Available Commands

### /hotseat:plan <FEATURE_NAME> [OPTIONS]

Start a specification interview for a feature.

**Usage:**
```
/hotseat:plan "user authentication"
/hotseat:plan "payment processing" --context docs/PRD.md
/hotseat:plan "search feature" --output-dir specs/features --max-questions 20
```

**Options:**
- `--context <file>` - Initial context file (PRD, requirements, etc.)
- `--output-dir <dir>` - Output directory for specs (default: docs/specs)
- `--max-questions <n>` - Maximum question rounds (default: unlimited)

### /hotseat:resume

Resume an interrupted specification interview.

**Usage:**
```
/hotseat:resume
```

If you have interrupted interviews (session ended mid-interview), this command will:
1. List all in-progress interviews with feature names and timestamps
2. Let you select which interview to resume
3. Continue the interview from where you left off

If no interrupted interviews exist, it will suggest using `/hotseat:plan` to start a new one.

### /hotseat:cleanup

Clean up all Hotseat interview state files.

**Usage:**
```
/hotseat:cleanup
```

This command removes all interview state files from `.claude/hotseat-*.md`. Use this when you want to:
- Abandon all in-progress interviews
- Reset Hotseat to a clean state

Note: This does NOT delete completed specs in `docs/specs/`.

### /hotseat:help

Show this help message.

## Interview Flow

1. **Initialization** - Creates state file and draft spec
2. **Interview** - Asks non-obvious questions via AskUserQuestion tool
3. **Draft Updates** - Maintains running draft every 2-3 questions
4. **Finalization** - When you say "done" or "finalize", writes final spec

## Question Types

The interview covers:

- **Technical Implementation** - Data models, APIs, auth, error handling, integration
- **User Experience** - Flows, edge cases, accessibility, error states
- **Trade-offs** - Performance, security, scalability, MVP scope, technical debt

## Output

- **Draft (during interview):** `.claude/hotseat-draft.md`
- **Final spec:** `docs/specs/{feature-slug}.md`

## Example Session

```
You: /hotseat:plan "file upload feature"
Claude: [Asks about file types, size limits, storage backend via AskUserQuestion]
You: [Answers]
Claude: [Asks about virus scanning, thumbnail generation]
You: [Answers]
Claude: [Asks about error handling, retry logic]
You: done
Claude: [Writes final spec to docs/specs/file-upload-feature.md]
```

## Canceling an Interview

To cancel an active interview, delete the state file or use the cleanup command:
```bash
# Remove all Hotseat state files
rm .claude/hotseat-*.md

# Or use the cleanup command
/hotseat:cleanup
```

## Using the Spec

After the interview completes, use the spec in a new Claude session:
```bash
cat docs/specs/your-feature.md | claude
# Or: "Read docs/specs/your-feature.md and implement it"
```

## Complete Workflow: Hotseat + Ralph

1. **Hotseat plans** - Generate comprehensive spec: `/hotseat:plan "my feature"`
2. **Ralph does** - Implement iteratively: `/ralph-loop`

Hotseat plans. Ralph does. Ship faster.
