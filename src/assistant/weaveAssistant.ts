/**
 * Weave AI Assistant Service
 * Core service for AI operations using the Weave framework
 */

import { logError, logInfo } from '@weaveai/shared';
import { HTTPClient } from '@weaveai/core';
import * as vscode from 'vscode';
import { ConfigurationManager } from '../config/configManager';

export interface WeaveAnalysisResult {
  type: 'analysis' | 'suggestion' | 'completion';
  content: string;
  details?: Record<string, unknown>;
  language?: string;
  timestamp: Date;
}

export interface WeaveCodeContext {
  code: string;
  language: string;
  fileName: string;
  line: number;
  column: number;
}

/**
 * Weave AI Assistant
 * Provides AI-powered code assistance
 */
export class WeaveAssistant {
  private config: ConfigurationManager;
  private httpClient: HTTPClient;
  private isInitialized: boolean = false;

  constructor(config: ConfigurationManager) {
    this.config = config;
    this.httpClient = new HTTPClient({
      timeout: 30000,
      logging: false,
      headers: {
        Authorization: `Bearer ${config.getApiKey()}`,
      },
    });
  }

  /**
   * Initialize the assistant
   */
  async initialize(): Promise<void> {
    try {
      // Validate configuration
      const apiKey = this.config.getApiKey();
      const provider = this.config.getProvider();

      if (!apiKey && provider !== 'local') {
        throw new Error(`API key not configured for ${provider}`);
      }

      this.isInitialized = true;
      logInfo('WeaveAssistant initialized successfully');
    } catch (error) {
      logError('Failed to initialize WeaveAssistant:', error);
      throw error;
    }
  }

  /**
   * Generate an optimized prompt
   */
  async generatePrompt(context: WeaveCodeContext): Promise<WeaveAnalysisResult> {
    this.ensureInitialized();

    const systemPrompt = `You are an expert at creating optimized prompts for AI models.
Analyze the provided code and generate a clear, concise prompt that describes its purpose and functionality.`;

    const userPrompt = `Analyze this ${context.language} code and generate an optimized prompt that describes it:

\`\`\`${context.language}
${context.code}
\`\`\`

Generate a prompt that:
1. Clearly describes what the code does
2. Mentions key inputs and outputs
3. Includes any important constraints or edge cases
4. Is concise but complete`;

    return this.callWeaveAPI(systemPrompt, userPrompt, 'analysis', context);
  }

  /**
   * Analyze code for insights
   */
  async analyzeCode(context: WeaveCodeContext): Promise<WeaveAnalysisResult> {
    this.ensureInitialized();

    const systemPrompt = `You are a senior software engineer. Provide insightful analysis of code quality,
potential issues, and improvements.`;

    const userPrompt = `Analyze this ${context.language} code:

\`\`\`${context.language}
${context.code}
\`\`\`

Provide analysis including:
1. Code quality assessment
2. Potential bugs or issues
3. Performance considerations
4. Readability and maintainability
5. Best practice recommendations`;

    return this.callWeaveAPI(systemPrompt, userPrompt, 'analysis', context);
  }

  /**
   * Suggest code optimizations
   */
  async suggestOptimization(context: WeaveCodeContext): Promise<WeaveAnalysisResult> {
    this.ensureInitialized();

    const systemPrompt = `You are an expert at optimizing code. Provide specific, actionable optimization suggestions
with example improvements where appropriate.`;

    const userPrompt = `Suggest optimizations for this ${context.language} code:

\`\`\`${context.language}
${context.code}
\`\`\`

For each suggestion:
1. Explain the current inefficiency
2. Provide the optimized approach
3. Show a code example if applicable
4. Estimate the performance improvement if measurable`;

    return this.callWeaveAPI(systemPrompt, userPrompt, 'suggestion', context);
  }

  /**
   * Generate code completion
   */
  async generateCompletion(context: WeaveCodeContext, position: vscode.Position): Promise<string> {
    this.ensureInitialized();

    const lines = context.code.split('\n');
    const previousLines = lines.slice(0, position.line).join('\n');

    const systemPrompt = `You are a code completion expert. Complete the code based on context.
Respond with only the completion text, no explanations.`;

    const userPrompt = `Complete this ${context.language} code based on context:

\`\`\`${context.language}
${previousLines}
|CURSOR_HERE|
\`\`\`

Provide a natural completion that fits the code style and logic.`;

    const result = await this.callWeaveAPI(systemPrompt, userPrompt, 'completion', context);

    return result.content;
  }

  /**
   * Get function documentation
   */
  async generateDocumentation(context: WeaveCodeContext): Promise<string> {
    this.ensureInitialized();

    const systemPrompt = `You are a documentation expert. Generate clear, concise documentation for code.`;

    const userPrompt = `Generate JSDoc/documentation for this ${context.language} code:

\`\`\`${context.language}
${context.code}
\`\`\`

Include description, parameters, return type, and examples where relevant.`;

    const result = await this.callWeaveAPI(systemPrompt, userPrompt, 'analysis', context);

    return result.content;
  }

  /**
   * Call Weave API
   */
  private async callWeaveAPI(
    systemPrompt: string,
    userPrompt: string,
    type: 'analysis' | 'suggestion' | 'completion',
    context: WeaveCodeContext
  ): Promise<WeaveAnalysisResult> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Weave AI Assistant',
        cancellable: false,
      },
      async (progress) => {
        try {
          progress.report({ message: 'Analyzing with Weave AI...' });

          // Call real Weave API using HTTPClient from core
          const response = await this.httpClient.post<Record<string, unknown>>(
            'http://localhost:3000/api/v1/generate',
            {
              prompt: userPrompt,
              systemPrompt,
              provider: this.config.getProvider(),
              model: this.config.getModel(),
              temperature: this.config.getTemperature(),
              maxTokens: this.config.getMaxTokens(),
              codeContext: {
                language: context.language,
                fileName: context.fileName,
                line: context.line,
                column: context.column,
              },
            }
          );

          const data = response.data as Record<string, unknown>;
          logInfo(`Weave API response received for ${type}`, {
            tokensUsed: data.tokensUsed,
            cost: data.cost,
          });

          return {
            type,
            content: (data.content as string) || '',
            language: context.language,
            timestamp: new Date(),
            details: {
              tokensUsed: (data.tokensUsed as number) || 0,
              cost: (data.cost as number) || 0,
              provider: (data.provider as string) || this.config.getProvider(),
              model: (data.model as string) || this.config.getModel(),
            },
          };
        } catch (error) {
          logError('Weave API call failed:', error);
          throw error;
        }
      }
    );
  }

  /**
   * Ensure the assistant is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('WeaveAssistant not initialized');
    }
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.isInitialized = false;
  }
}
