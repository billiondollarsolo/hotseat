/**
 * Interview orchestrator - manages the interview flow between user and AI
 */

import { clearState, loadState } from './state.js';
import { loadContextFiles, formatContextErrors } from './context.js';
import { exploreCodebase, formatStructureSummary, formatFileCountsSummary } from './exploration.js';
import { generatePRDFromCompletion } from './prd.js';
import {
  renderAIText,
  promptQuestion,
  promptFreeText,
  renderCompletionBanner,
  renderErrorBanner,
  createSpinner,
} from '../cli/prompt.js';
import {
  getValidatedProvider,
  type ProviderName,
} from '../providers/index.js';
import {
  InterviewOrchestrator,
  createOrchestratorFromState,
} from './orchestrator.js';

export interface InterviewOptions {
  feature: string;
  firstPrinciples?: boolean;
  contextFiles?: string[];
  provider?: string;
  resume?: boolean;
  baseDir?: string;
}

export interface InterviewResult {
  success: boolean;
  outputPath?: string;
  jsonPath?: string;
  error?: string;
}

export async function runInterview(options: InterviewOptions): Promise<InterviewResult> {
  const baseDir = options.baseDir ?? process.cwd();

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return {
      success: false,
      error: 'Hotseat interviews require an interactive terminal for AskUserQuestion prompts',
    };
  }

  const providerName = normalizeProviderName(options.provider);
  const provider = await getValidatedProvider(providerName);

  let orchestrator: InterviewOrchestrator;
  let currentTurn;

  const spinner = createSpinner(options.resume ? 'Resuming Hotseat...' : 'Starting Hotseat...');

  try {
    spinner.start();

    if (options.resume) {
      const saved = await loadState(baseDir);
      if (!saved) {
        spinner.fail('No Hotseat interview state found');
        return {
          success: false,
          error: 'No Hotseat interview state found',
        };
      }

      orchestrator = createOrchestratorFromState(saved.state, provider, baseDir);
      currentTurn = await orchestrator.resume(
        'Resume the Hotseat interview from the saved state. Ask the next best question or complete the PRD if enough context has already been gathered.'
      );
    } else {
      const contextResult = await loadContextFiles(options.contextFiles ?? [], {
        baseDir,
      });

      if (contextResult.failed.length > 0) {
        spinner.fail('Could not load context files');
        return {
          success: false,
          error: formatContextErrors(contextResult.failed),
        };
      }

      const exploration = await exploreCodebase(baseDir);
      const codebaseSummary = [
        formatStructureSummary(exploration.structure),
        exploration.fileCounts ? formatFileCountsSummary(exploration.fileCounts) : '',
      ].filter(Boolean).join('\n\n');

      orchestrator = new InterviewOrchestrator({
        feature: options.feature,
        provider,
        firstPrinciples: options.firstPrinciples ?? false,
        contextFiles: options.contextFiles ?? [],
        contextContent: contextResult.combinedContent,
        codebaseSummary,
        baseDir,
      });

      currentTurn = await orchestrator.initialize();
    }

    spinner.stop();

    while (!currentTurn.isComplete) {
      renderAIText(currentTurn.text);

      const answer = currentTurn.question
        ? (await promptQuestion(currentTurn.question)).formattedResponse
        : await promptFreeText('Your response:', { header: 'Question' });

      spinner.update('Thinking...');
      spinner.start();
      currentTurn = await orchestrator.sendUserResponse(answer);
      spinner.stop();
    }

    renderAIText(currentTurn.text);

    const completion = await orchestrator.complete();
    if (!completion.success || !completion.slug || !completion.prd) {
      const error = completion.error ?? 'Interview completed without PRD data';
      renderErrorBanner(error);
      return {
        success: false,
        error,
      };
    }

    const output = await generatePRDFromCompletion(completion.slug, completion.prd, {
      baseDir,
      featureName: options.feature,
    });

    if (!output.success || !output.markdownPath) {
      const error = output.error ?? 'Failed to write PRD files';
      renderErrorBanner(error);
      return {
        success: false,
        error,
      };
    }

    await clearState(baseDir);
    await orchestrator.cleanup();

    renderCompletionBanner(completion.slug, output.markdownPath, output.jsonPath);

    return {
      success: true,
      outputPath: output.markdownPath,
      jsonPath: output.jsonPath,
    };
  } catch (error) {
    spinner.stop();
    await provider.cleanup();
    const message = error instanceof Error ? error.message : String(error);
    renderErrorBanner(message);
    return {
      success: false,
      error: message,
    };
  }
}

function normalizeProviderName(provider?: string): ProviderName {
  const name = provider ?? 'claude';
  if (
    name === 'claude' ||
    name === 'opencode' ||
    name === 'cursor' ||
    name === 'codex' ||
    name === 'copilot'
  ) {
    return name;
  }

  throw new Error(`Unsupported provider "${name}"`);
}

// Re-export orchestrator types and functions
export {
  type StructuredQuestion,
  type ParsedAIResponse,
  type OrchestratorConfig,
  type TurnResult,
  type InterviewCompletionResult,
  type OrchestratorEvent,
  type OrchestratorEventHandler,
  STRUCTURED_MARKERS,
  generateSystemPrompt,
  parseAIResponse,
  InterviewOrchestrator,
  createOrchestratorFromState,
} from './orchestrator.js';

// Re-export context loading types and functions
export {
  type ContextFileResult,
  type ContextLoadResult,
  type ContextLoadOptions,
  DEFAULT_MAX_FILE_SIZE,
  SUPPORTED_EXTENSIONS,
  isSupportedExtension,
  resolveFilePath,
  fileExists,
  getFileSize,
  loadContextFile,
  formatFileContent,
  loadContextFiles,
  validateContextPaths,
  formatContextErrors,
} from './context.js';

// Re-export PRD generator types and functions
export {
  type UserStory,
  type PRDData,
  type PRDGeneratorOptions,
  type PRDGenerationResult,
  validatePRDData,
  validateSlug,
  normalizeSlug,
  formatUserStory,
  generateMarkdown,
  getPRDPath,
  writePRDMarkdown,
  generatePRDFromCompletion,
} from './prd.js';

// Re-export error recovery types and functions
export {
  type ErrorCategory,
  type StateSaveResult,
  type ErrorRecoveryOptions,
  type ErrorRecoveryResult,
  type RetryOptions,
  InterviewError,
  NetworkError,
  ProviderError,
  ProcessError,
  StateError,
  TimeoutError,
  UserCancelledError,
  classifyError,
  trySaveState,
  withErrorRecovery,
  withRetry,
  safeExecute,
  formatErrorForUser,
  isRecoverableError,
  getErrorCategory,
} from './error-recovery.js';
