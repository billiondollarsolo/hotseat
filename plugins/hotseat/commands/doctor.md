---
description: Check Codex-native Hotseat readiness for slash commands and native user prompts.
argument-hint: ""
---

# /hotseat:doctor

Check whether the Codex-native Hotseat plugin is ready to run reliable interviews.

## Workflow

1. Inspect the Hotseat plugin metadata:
   - Confirm `plugins/hotseat/.codex-plugin/plugin.json` exists.
   - Confirm it declares both `"skills": "./skills/"` and `"commands": "./commands/"`.
2. Inspect local marketplace metadata:
   - Confirm `.agents/plugins/marketplace.json` points at `./plugins/hotseat`.
3. Check native input readiness:
   - If the `request_user_input` tool is listed in the available tools, report that native selectable prompts are available in this session.
   - If it is not listed, report that `/hotseat:plan` will fall back to plain-text questions in this session.
   - Tell the user to enable `default_mode_request_user_input = true` under `[features]` in `~/.codex/config.toml` and restart Codex when native prompts are unavailable in Default mode.
4. Check plugin refresh guidance:
   - If command files or plugin metadata changed recently, tell the user to remove and re-add the local marketplace, reinstall or re-enable the plugin, and restart Codex.
5. Do not modify files during this command unless the user explicitly asks for a fix.

## Final Response

Respond with:

- `Native prompts`: available or unavailable
- `Plugin metadata`: pass or specific missing field
- `Marketplace`: pass or specific issue
- `Next action`: the smallest action the user should take before running `/hotseat:plan`
