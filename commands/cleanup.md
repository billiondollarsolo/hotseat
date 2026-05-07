---
description: "Clean up all Hotseat interview state files"
allowed-tools: ["Bash(rm:*)", "Bash(ls:*)"]
hide-from-slash-command-tool: "true"
---

# Hotseat Cleanup Command

Remove all Hotseat interview state files to reset the plugin state.

## STEP 1: CHECK FOR STATE FILES

First, check what state files exist:

```bash
ls -la .claude/hotseat-*.md 2>/dev/null || echo "NO_STATE_FILES"
```

## STEP 2: HANDLE RESULTS

### If NO state files exist:

Tell the user:

> No Hotseat state files found. Nothing to clean up.

Then STOP.

### If state files exist:

List the files that will be deleted, then delete them:

```bash
rm .claude/hotseat-*.md
```

Also clean up the draft file if it exists:

```bash
rm -f .claude/hotseat-draft.md
```

Then confirm to the user:

> Hotseat cleanup complete. Deleted all interview state files.
>
> To start a new interview, use:
> ```
> /hotseat:plan "your feature name"
> ```

## IMPORTANT NOTES

- This command only deletes state files in `.claude/`
- It does NOT delete any completed specs in `docs/specs/`
- Completed specifications are permanent and unaffected by cleanup
- Use this when you want to abandon all in-progress interviews
