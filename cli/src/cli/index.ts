#!/usr/bin/env node
/**
 * Hotseat CLI - AI-Powered Planning Interview Tool
 * CLI entry point
 */

import { Command } from 'commander';
import { realpathSync } from 'fs';
import { fileURLToPath } from 'url';
import { VERSION } from '../index.js';
import { runInterview } from '../core/interview.js';

export interface CLIOptions {
  resume?: boolean;
  firstPrinciples?: boolean;
  context?: string[];
  provider?: string;
}

export interface CLIResult {
  action: 'interview' | 'resume' | 'error';
  feature?: string;
  options: CLIOptions;
}

/**
 * Example usage strings for help output
 */
export const EXAMPLES = `
Examples:
  $ hotseat "user authentication system"
      Start a new interview to plan a user authentication feature

  $ hotseat "payment processing" --provider claude
      Use Claude as the AI provider for the interview

  $ hotseat "API refactoring" --context docs/api-spec.md
      Include reference documentation in the AI context

  $ hotseat "dashboard redesign" --context design.md requirements.txt
      Include multiple reference files

  $ hotseat "new feature" --first-principles
      Start with foundational questions before detailed planning

  $ hotseat --resume
      Continue a previously interrupted interview session
`;

/**
 * Detailed description for the CLI
 */
export const DESCRIPTION = `AI-Powered Planning Interview Tool

Hotseat conducts interactive interviews with AI assistants to help you plan
software features. Through a series of guided questions, Hotseat generates
comprehensive Product Requirements Documents (PRDs) in both Markdown and
JSON formats.

Output files are saved to ./hotseat/ directory:
  - {slug}.md   - Human-readable PRD in Markdown format
  - {slug}.json - Machine-readable PRD for programmatic use`;

export function createProgram(): Command {
  const program = new Command();

  program
    .name('hotseat')
    .description(DESCRIPTION)
    .version(VERSION, '-v, --version', 'Display the current version')
    .argument('[feature]', 'Feature description to plan (e.g., "user authentication")')
    .option(
      '-r, --resume',
      'Resume a previously interrupted interview session from ./hotseat/state.yaml'
    )
    .option(
      '-f, --first-principles',
      'Begin with foundational questions that challenge assumptions before detailed planning'
    )
    .option(
      '-c, --context <files...>',
      'Reference documents to include in AI context (supports multiple files)'
    )
    .option(
      '-p, --provider <name>',
      'AI provider to use: claude, opencode, cursor, codex, copilot (default: claude)',
      'claude'
    )
    .addHelpText('after', EXAMPLES)
    .showHelpAfterError('(use --help for available options)');

  return program;
}

export function runCLI(argv: string[] = process.argv): CLIResult {
  const program = createProgram();

  let result: CLIResult = {
    action: 'error',
    options: {},
  };

  program.action((feature: string | undefined, options: CLIOptions) => {
    if (options.resume) {
      result = {
        action: 'resume',
        options,
      };
      console.log('Resuming previous interview session...');
      return;
    }

    if (!feature) {
      console.error('Error: Please provide a feature description or use --resume');
      console.error('Usage: hotseat "feature description"');
      result = {
        action: 'error',
        options,
      };
      return;
    }

    result = {
      action: 'interview',
      feature,
      options,
    };
    console.log(`Starting interview for: ${feature}`);
  });

  program.parse(argv);
  return result;
}

export async function runCLICommand(argv: string[] = process.argv): Promise<number> {
  const result = runCLI(argv);

  if (result.action === 'error') {
    return 1;
  }

  const interviewResult = await runInterview({
    feature: result.feature ?? '',
    resume: result.action === 'resume',
    firstPrinciples: result.options.firstPrinciples,
    contextFiles: result.options.context,
    provider: result.options.provider,
  });

  return interviewResult.success ? 0 : 1;
}

/**
 * Get the full help text output
 * Useful for testing and programmatic access
 */
export function getHelpText(): string {
  const program = createProgram();
  return program.helpInformation();
}

/**
 * Available AI providers
 */
export const PROVIDERS = ['claude', 'opencode', 'cursor', 'codex', 'copilot'] as const;
export type ProviderName = (typeof PROVIDERS)[number];

/**
 * Check if a string is a valid provider name
 */
export function isValidProvider(name: string): name is ProviderName {
  return PROVIDERS.includes(name as ProviderName);
}

// Only run if this is the main module
// Use realpathSync to handle symlinks (e.g., when installed globally via npm)
function isMain(): boolean {
  try {
    const currentFile = fileURLToPath(import.meta.url);
    const executedFile = realpathSync(process.argv[1]);
    return currentFile === executedFile;
  } catch {
    return false;
  }
}

if (isMain()) {
  runCLICommand().then((exitCode) => {
    process.exitCode = exitCode;
  }).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
