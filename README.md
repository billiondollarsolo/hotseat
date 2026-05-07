<img src="hotseat-banner.png" alt="Hotseat Logo" width="1000" />

# Hotseat

**Hotseat puts you in the "hotseat" and asks you questions to build comprehensive specifications.**

Interactive specification interview workflow that conducts in-depth feature interviews and generates comprehensive specs. Available as a Claude Code plugin, a Codex plugin/skill, and a standalone CLI that works with multiple AI providers.

## Table of Contents

- [Overview](#overview)
- [Choose an Interface](#choose-an-interface)
- [Installation](#installation)
  - [Claude Code Plugin](#claude-code-plugin)
  - [Codex Plugin](#codex-plugin)
  - [Standalone CLI](#standalone-cli)
- [Quick Start](#quick-start)
- [Plugin Commands](#plugin-commands)
- [CLI Usage](#cli-usage)
- [Output Files](#output-files)
- [Interview Process](#interview-process)
- [First Principles Mode](#first-principles-mode)
- [Configuration](#configuration)
- [Programmatic Usage](#programmatic-usage)
- [Complete Workflow: Hotseat + Ralph](#complete-workflow-hotseat--ralph)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [License](#license)
- [Credits](#credits)

## Overview

Hotseat follows a spec-first planning pattern popularized by [@trq212](https://twitter.com/trq212): start with a rough feature idea, have the agent interview you about the important product and technical details, then use the resulting spec in a fresh implementation session.

Hotseat automates this workflow by:
- Conducting structured interviews about your feature
- Generating comprehensive PRDs in Markdown and JSON formats
- Supporting resume of interrupted sessions
- Optionally challenging assumptions with first-principles questioning

## Choose an Interface

Hotseat has three entry points:

| Interface | Best for | Output |
|-----------|----------|--------|
| Claude Code plugin | Claude Code users who want an AskUserQuestion-driven spec interview | PRD Markdown, structured JSON, and Ralph progress file |
| Codex plugin/skill | Codex users who want a goal-template planning interview before implementation | `docs/goals/{slug}.goal.md` |
| Standalone CLI | Terminal use across Claude, OpenCode, Cursor, Codex, or Copilot providers | `./hotseat/{slug}.md` and `./hotseat/{slug}.json` |

Use the plugin surfaces when you are already inside an agent session. Use the CLI when you want provider selection, terminal prompts, or output independent of a plugin install.

## Installation

### Claude Code Plugin

```bash
# Add the marketplace
/plugin marketplace add billiondollarsolo/hotseat

# Install the plugin
/plugin install hotseat
```

### Codex Plugin

This repository also includes a Codex-native plugin under `plugins/hotseat`. It is separate from the Claude Code plugin and outputs Codex goal-template Markdown files.

Clone the repository first if you do not already have it locally:

```bash
git clone https://github.com/billiondollarsolo/hotseat.git
cd hotseat
```

From this repository root, add the local Codex marketplace:

```bash
codex plugin marketplace add .
```

Then install or enable the `hotseat` plugin from Codex's plugin UI. The plugin exposes:

| Command | Purpose |
|---------|---------|
| `/hotseat:plan` | Run a Hotseat interview and write `docs/goals/{slug}.goal.md` |
| `/hotseat:goal-template` | Convert notes or a PRD into a Codex goal template |
| `/hotseat:resume` | Continue an existing Hotseat goal-template draft |
| `/hotseat:doctor` | Check command registration and native prompt readiness |

The generated `.goal.md` file includes a `Codex Goal Prompt` section intended for Codex CLI's `/goal` workflow.

The Codex skill can also be triggered conversationally after the plugin is installed. For example:

```text
Use Hotseat to plan a billing alerts feature.
```

If you only say `use Hotseat`, Codex should ask what feature, change, or project you want to plan.

For native selectable interview prompts in Codex Default mode, enable Codex's `request_user_input` feature:

```toml
[features]
default_mode_request_user_input = true
```

Then restart Codex before testing `/hotseat:plan`. You can verify the effective flag with:

```bash
codex features list | rg default_mode_request_user_input
```

Current Codex native prompts should be treated as single-select plus optional notes. Use the standalone CLI if you need terminal checkbox-style multi-select prompts today.

To check readiness in the current Codex session, run:

```bash
/hotseat:doctor
```

`/hotseat:doctor` reports whether the plugin metadata is visible and whether native selectable prompts are available in the active session. `/hotseat:plan` also checks for the `request_user_input` tool before the first interview question. If the tool is unavailable, it explains the feature-flag requirement and only continues with plain-text questions if you accept that fallback.

If a local edit is not picked up, remove and re-add the local marketplace so Codex refreshes its plugin cache:

```bash
codex plugin marketplace remove hotseat
codex plugin marketplace add .
```

Then reinstall or re-enable `hotseat` from Codex's plugin UI and restart Codex CLI before testing `/hotseat:plan`.

### Standalone CLI

The CLI works with multiple AI providers. Run it directly with npx:

```bash
npx @mjtechguy/hotseat "user authentication"
```

**Prerequisites:** At least one AI CLI tool must be installed:

| Provider | CLI Command | Installation |
|----------|-------------|--------------|
| Claude Code | `claude` | [anthropic.com](https://anthropic.com) |
| OpenCode | `opencode` | [opencode.dev](https://opencode.dev) |
| Cursor | `cursor` or `agent` | [cursor.sh](https://cursor.sh) |
| Codex | `codex` | `npm install -g @openai/codex` or `brew install --cask codex` |
| GitHub Copilot | `gh` with Copilot extension | [github.com/copilot](https://github.com/copilot) |

## Quick Start

**Plugin (Claude Code):**
```bash
/hotseat:plan "user authentication"
```

**Plugin (Codex):**
```bash
/hotseat:plan "user authentication"
```

**CLI:**
```bash
npx @mjtechguy/hotseat "user authentication"
```

## Plugin Commands

The command names are shared between the Claude Code and Codex plugins, but their outputs differ:

- Claude Code plugin: writes PRD files under `docs/specs` by default.
- Codex plugin: writes Codex goal templates under `docs/goals` by default.

### Codex Plugin Commands

#### `/hotseat:plan <FEATURE_NAME> [OPTIONS]`

Start a Hotseat interview in Codex and write a Codex goal template.

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--context <path>` | Reference file or directory to inspect | none |
| `--output-dir <dir>` | Output directory for goal templates | `docs/goals` |
| `--max-questions <n>` | Maximum question rounds | `8` |
| `--first-principles` | Challenge the premise before implementation planning | `false` |

When `request_user_input` is available, bounded interview questions use Codex's native selectable prompt UI. When it is unavailable, `/hotseat:plan` should explain the feature-flag requirement and continue only if you accept plain-text questions.

**Example:**

```bash
/hotseat:plan "user authentication" --context docs/auth-notes.md --first-principles
```

#### `/hotseat:goal-template <SOURCE> [--output-dir <dir>]`

Convert existing notes, a PRD, or a feature description into a Codex goal template.

#### `/hotseat:resume [path]`

Resume a draft `.goal.md` planning artifact.

#### `/hotseat:doctor`

Check whether the local Codex plugin metadata, marketplace entry, and native prompt feature flag are ready for `/hotseat:plan`.

### Claude Code Plugin Commands

### `/hotseat:plan <FEATURE_NAME> [OPTIONS]`

Start a specification interview for a feature.

**Arguments:**
- `FEATURE_NAME` (required) - Name of the feature to spec out

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--context <file>` | Initial context file (PRD, requirements, etc.) | none |
| `--output-dir <dir>` | Output directory for generated specs | `docs/specs` |
| `--max-questions <n>` | Maximum question rounds (0 = unlimited) | `0` |
| `--first-principles` | Challenge assumptions before detailed spec gathering | `false` |
| `-h, --help` | Show help | - |

**Examples:**

```bash
# Basic interview
/hotseat:plan "user authentication"

# With existing context
/hotseat:plan "payment processing" --context docs/PRD.md

# Custom output location
/hotseat:plan "search feature" --output-dir specs/features

# Limit to 15 questions
/hotseat:plan "caching layer" --max-questions 15

# Challenge assumptions first
/hotseat:plan "new dashboard" --first-principles

# Combined options
/hotseat:plan "api gateway" --context docs/arch.md --first-principles --max-questions 20
```

### `/hotseat:resume`

Resume an interrupted specification interview.

```bash
/hotseat:resume
```

If you have interviews that were interrupted (session ended mid-interview), this command will:
1. List all in-progress interviews with feature names and timestamps
2. Let you select which interview to resume
3. Continue the interview from where you left off

### `/hotseat:cleanup`

Clean up all Hotseat interview state files.

```bash
/hotseat:cleanup
```

Removes all interview state files from `.claude/hotseat-*.md`. Use this to:
- Abandon all in-progress interviews
- Reset Hotseat to a clean state

Note: This does NOT delete completed specs in `docs/specs/`.

### `/hotseat:help`

Display help documentation about the Hotseat workflow.

## CLI Usage

### Basic Usage

```bash
npx @mjtechguy/hotseat "user authentication system"
```

### Command Reference

```
Usage: npx @mjtechguy/hotseat [options] [feature]

Arguments:
  feature                          Feature description to plan

Options:
  -v, --version                    Display the current version
  -r, --resume                     Resume a previously interrupted interview
  -f, --first-principles           Begin with foundational questions
  -c, --context <files...>         Reference documents to include
  -p, --provider <name>            AI provider: claude, opencode, cursor, codex, copilot
  -h, --help                       Display help
```

### Examples

```bash
# With AI provider selection
npx @mjtechguy/hotseat "feature description" --provider claude
npx @mjtechguy/hotseat "feature description" --provider opencode
npx @mjtechguy/hotseat "feature description" --provider cursor
npx @mjtechguy/hotseat "feature description" --provider codex

# With context files
npx @mjtechguy/hotseat "feature description" --context docs/spec.md
npx @mjtechguy/hotseat "feature description" --context docs/spec.md docs/api.md

# First principles mode
npx @mjtechguy/hotseat "feature description" --first-principles

# Resume an interrupted interview
npx @mjtechguy/hotseat --resume
```

### Using Codex CLI

Install and sign in to Codex first:

```bash
npm install -g @openai/codex
codex login
```

Then run Hotseat with the Codex provider:

```bash
npx @mjtechguy/hotseat "user authentication system" --provider codex
```

Codex runs through `codex exec --json`, and Hotseat saves the Codex thread id in `./hotseat/state.yaml`. That lets `npx @mjtechguy/hotseat --resume` continue the same Codex session, including Codex goals when they are available.

## Output Files

### Claude Code Plugin Output

The Claude Code plugin generates three files when the interview is finalized:

| File | Location | Description |
|------|----------|-------------|
| Markdown PRD | `{output-dir}/{feature-slug}.md` | Human-readable specification |
| Structured JSON | `{output-dir}/{feature-slug}.json` | Machine-readable spec for tooling |
| Progress File | `{output-dir}/{feature-slug}-progress.txt` | Empty file for Ralph to track learnings |

**Example:** For `/hotseat:plan "user authentication"`:
- `docs/specs/user-authentication.md`
- `docs/specs/user-authentication.json`
- `docs/specs/user-authentication-progress.txt`

### Codex Plugin Output

The Codex plugin writes one goal-template Markdown file by default:

| File | Location | Description |
|------|----------|-------------|
| Goal template | `docs/goals/{feature-slug}.goal.md` | Codex goal-oriented implementation template |

Each goal template includes frontmatter, objective, user stories, acceptance criteria, constraints, verification plan, and a `Codex Goal Prompt` section for the Codex CLI `/goal` workflow.

### CLI Output

The CLI generates PRD files in the `./hotseat/` directory:

| File | Description |
|------|-------------|
| `./hotseat/{feature-slug}.md` | Markdown PRD with overview, user stories, and technical notes |
| `./hotseat/{feature-slug}.json` | JSON PRD for programmatic use |

### JSON Structure

The JSON output follows the [snarktank/ralph](https://github.com/snarktank/ralph) format:

```json
{
  "project": "user-authentication",
  "branchName": "ralph/user-authentication",
  "description": "User authentication with email/password and OAuth",
  "userStories": [
    {
      "id": "US-001",
      "category": "setup",
      "title": "Database schema for users",
      "description": "As a developer, I want user tables created so that I can store credentials",
      "acceptanceCriteria": [
        "Migration creates users table with id, email, password_hash columns",
        "Unique constraint on email column",
        "npm run migrate completes without errors"
      ],
      "passes": false,
      "notes": ""
    }
  ]
}
```

**Category values:**
- `setup` - Initial setup, configuration, scaffolding
- `core` - Core feature functionality
- `integration` - Connecting with other systems
- `polish` - UI refinements, error handling, edge cases

## Interview Process

### How It Works

1. **Initialization**: Creates state files to track interview progress

2. **Interview Loop**:
   - AI asks probing questions using interactive prompts
   - Interview continues until you say "done" or "finalize"
   - Draft spec updated every 2-3 questions
   - Questions adapt based on your answers
   - If interrupted, use resume to continue

3. **Completion Detection**: When you say "done", "finalize", "finished", "that's all", "complete", or "wrap up"

4. **Finalization**: Generates all output files

### Interview Coverage

The interview systematically covers:

**Scope Definition**
- What is explicitly OUT of scope?
- MVP vs full vision boundaries
- Related features to avoid touching

**User Stories**
- Discrete stories completable in one coding session
- Verifiable acceptance criteria (not vague)
  - Good: "API returns 200 for valid input", "Response < 200ms"
  - Bad: "Works correctly", "Is fast", "Handles errors"

**Technical Implementation**
- Data models and storage
- API design (endpoints, methods, auth)
- Integration with existing systems
- Error handling and edge cases

**User Experience**
- User flows and journeys
- Edge cases and error states
- Accessibility considerations

**Trade-offs**
- Performance requirements
- Security considerations
- Scalability expectations

**Implementation Phases**
- 2-4 incremental phases
- Verification command for each phase
- Minimum viable first phase

## First Principles Mode

Use `--first-principles` to challenge assumptions before diving into details:

**Plugin:**
```bash
/hotseat:plan "new feature" --first-principles
```

**CLI:**
```bash
npx @mjtechguy/hotseat "new feature" --first-principles
```

**Phase 1 - Challenge the Approach (3-5 questions):**
- "What specific problem have you observed that led to this idea?"
- "What happens if we don't build this at all?"
- "What's the absolute simplest thing that might solve this?"
- "What would have to be true for this to be the wrong approach?"
- "Is there an existing solution we could use instead?"

**Phase 2 - Detailed Spec:** Only proceeds after validating the approach is sound.

## Configuration

### CLI Configuration

The CLI stores configuration in `./hotseat/config.yaml`:

```yaml
# Hotseat CLI Configuration
# Default AI provider (claude, opencode, cursor, codex, copilot)
defaultProvider: claude

# Output directory for generated PRDs
outputDirectory: ./hotseat
```

Set `defaultProvider: codex` if you want `npx @mjtechguy/hotseat "feature"` to use Codex without passing `--provider codex` each time.

Interview progress is saved to `./hotseat/state.yaml`, allowing you to:
- Resume interrupted interviews with `npx @mjtechguy/hotseat --resume`
- Recover from network errors or crashes
- Continue multi-session planning work

State is automatically cleared after successful PRD generation.

### Plugin Runtime Files

During a plugin interview:

| File | Purpose |
|------|---------|
| `.claude/hotseat-{slug}.md` | Interview state (iteration count, paths, settings) |
| `.claude/hotseat-draft.md` | Running draft spec updated throughout |

## Programmatic Usage

The CLI can also be used as a library:

```typescript
import { runInterview, exploreCodebase, generateMarkdown } from '@mjtechguy/hotseat';

// Explore codebase
const exploration = await exploreCodebase('/path/to/project');
console.log(exploration.summary);

// Generate PRD
const prd = {
  overview: 'Feature overview...',
  userStories: [...],
  technicalNotes: '...'
};
const markdown = generateMarkdown(prd, 'feature-slug');
```

### Supported File Types for Context

Hotseat supports the following file types for `--context`:

- **Markdown**: `.md`, `.markdown`
- **Text**: `.txt`, `.text`
- **Code**: `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.rb`, `.go`, `.rs`, `.java`
- **Config**: `.json`, `.yaml`, `.yml`, `.toml`, `.ini`, `.conf`
- **Web**: `.html`, `.css`, `.scss`, `.less`
- **Other**: `.xml`, `.sql`, `.graphql`, `.gql`, `.sh`, `.bash`, `.zsh`

## Complete Workflow: Hotseat + Ralph

```
+------------------+     +------------------+
|   Hotseat Plans     | --> |   Ralph Does     |
|                  |     |                  |
| /hotseat:plan       |     | /ralph-loop      |
| "my feature"     |     |                  |
+------------------+     +------------------+
        |                       |
        v                       v
  +-----------+          +-----------+
  | .md spec  |          | Working   |
  | .json     |          | Code      |
  | progress  |          |           |
  +-----------+          +-----------+
```

1. **Hotseat plans** - Generate comprehensive spec:
   ```bash
   /hotseat:plan "my feature"
   # or
   npx @mjtechguy/hotseat "my feature"
   ```

2. **Ralph does** - Implement iteratively:
   ```bash
   /ralph-loop
   ```

The generated spec includes a pre-formatted Ralph Loop command with phases and verification steps.

Use with [ralph-loop](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/ralph-loop) for a complete planning-to-implementation workflow.

## Troubleshooting

### Codex does not show `/hotseat:*` commands

Refresh the local marketplace and restart Codex:

```bash
codex plugin marketplace remove hotseat
codex plugin marketplace add .
```

Then reinstall or re-enable the `hotseat` plugin from Codex's plugin UI.

### Codex asks plain-text questions instead of native prompts

Enable native user input in `~/.codex/config.toml`:

```toml
[features]
default_mode_request_user_input = true
```

Restart Codex, then verify:

```bash
codex features list | rg default_mode_request_user_input
```

You can also run `/hotseat:doctor` from Codex to check the current session.

### `npx @mjtechguy/hotseat` cannot find an AI provider

Install and sign in to at least one supported provider CLI: `claude`, `opencode`, `cursor` or `agent`, `codex`, or `gh` with the Copilot extension. You can also select a provider explicitly:

```bash
npx @mjtechguy/hotseat "my feature" --provider codex
```

### Generated files are not where expected

- Claude Code plugin output defaults to `docs/specs`.
- Codex plugin output defaults to `docs/goals`.
- Standalone CLI output defaults to `./hotseat`.

Use `--output-dir` where supported to write somewhere else.

## Development

### Plugin Development

To develop and test the plugin locally:

```bash
# Run Claude Code with the plugin loaded from local directory
cc --plugin-dir /path/to/hotseat

# Example: if you cloned the repo to ~/projects/hotseat
cc --plugin-dir ~/projects/hotseat
```

For Codex plugin development, add this repository as a local marketplace from the repo root:

```bash
codex plugin marketplace add .
```

After changing plugin metadata or command files, bump `plugins/hotseat/.codex-plugin/plugin.json` and refresh the local marketplace:

```bash
codex plugin marketplace remove hotseat
codex plugin marketplace add .
```

### Plugin Structure

```
hotseat/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata (name, version, author)
├── commands/
│   ├── plan.md              # Main command (/hotseat:plan)
│   ├── resume.md            # Resume interrupted interviews (/hotseat:resume)
│   ├── cleanup.md           # Clean up state files (/hotseat:cleanup)
│   └── help.md              # Help documentation (/hotseat:help)
├── hooks/
│   └── hooks.json           # Hook configuration (minimal)
├── scripts/
│   └── setup-hotseat.sh        # Interview initialization
└── README.md
```

### CLI Development

#### Prerequisites

- Node.js >= 18.0.0
- npm

#### Setup

```bash
# Clone the repository
git clone https://github.com/billiondollarsolo/hotseat.git
cd hotseat/cli

# Install dependencies
npm install
```

#### Running Locally

During development, use `npm run dev` to run the CLI directly without building:

```bash
# Run CLI with a feature description
npm run dev "user authentication system"

# With options
npm run dev "feature name" -- --provider claude --first-principles

# Resume an interrupted session
npm run dev -- --resume

# Show help
npm run dev -- --help
```

Note: Use `--` before CLI flags to pass them through npm to the script.

#### Building

```bash
# Compile TypeScript to JavaScript
npm run build

# Output is written to ./dist/
```

#### Type Checking

```bash
npm run typecheck
```

#### Linting

```bash
# Check for lint errors
npm run lint

# Auto-fix lint errors
npm run lint:fix
```

### Testing

The CLI uses [Vitest](https://vitest.dev/) as its test framework.

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run a specific test file
npm test src/core/prd.test.ts

# Run tests with coverage
npm test -- --coverage
```

#### Test Structure

| Type | Location | Description |
|------|----------|-------------|
| Unit | `src/**/*.test.ts` | Tests for individual modules |
| Integration | `src/integration/` | Tests for interview flow with mocked providers |
| E2E | `src/e2e/` | Tests against real AI CLI providers |
| Snapshot | `src/core/prd.snapshot.test.ts` | Validates PRD output formats |

### CLI Project Structure

```
cli/
├── src/
│   ├── index.ts              # Public API exports
│   ├── cli/                  # CLI interface (Commander.js, Inquirer)
│   ├── core/                 # Core logic (orchestrator, state, PRD generation)
│   ├── providers/            # AI provider implementations
│   └── utils/                # Utility functions
├── dist/                     # Compiled output
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## License

MIT

---

**Version:** 1.2.0 (Plugin) | 0.1.0 (CLI)
**Author:** mjtechguy

## Credits

Hotseat builds on the interactive planning pattern used by the [Lisa plugin](https://github.com/blencorp/lisa) and adapts it for Hotseat's spec, PRD, and Codex goal-template workflows.
