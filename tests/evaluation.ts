/**
 * Rubby AI Golden Set Evaluation Script
 *
 * Measures:
 * - Latency: Time from query to response
 * - Cost: API costs per query
 * - Error rate: % of queries that fail
 * - Quality: Response quality based on expected behavior
 *
 * Usage:
 *   bun run tests/evaluation.ts
 *   bun run tests/evaluation.ts --output tests/metrics_baseline.json
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// ============================================================================
// Types
// ============================================================================

interface GoldenSetMeta {
  system: string;
  version: string;
  description: string;
}

interface TestCase {
  id: string;
  query: string;
  difficulty: 'easy' | 'medium' | 'hard';
  path: string;
  expected_behavior: string;
  notes: string;
}

interface GoldenSet {
  meta: GoldenSetMeta;
  tests: TestCase[];
}

interface ResponseData {
  response: string;
  latency: number;
  success: boolean;
  error?: string;
}

interface EvaluationResult {
  test_id: string;
  query: string;
  difficulty: string;
  expected_behavior: string;
  response: string;
  latency: number;
  success: boolean;
  error?: string;
  quality_score: number;
  quality_notes: string[];
  cost: number;
  timestamp: string;
}

interface EvaluationOutput {
  meta: {
    timestamp: string;
    golden_set: string;
    total_tests: number;
  };
  results: EvaluationResult[];
  metrics: AggregateMetrics;
}

interface AggregateMetrics {
  accuracy: number;
  avg_quality: number;
  avg_latency: number;
  p95_latency: number;
  avg_cost: number;
  total_cost: number;
  error_rate: number;
  success_count: number;
  failure_count: number;
  by_difficulty: {
    [key: string]: {
      quality: number;
      latency: number;
      count: number;
    };
  };
}

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  // Cerebras pricing (adjust as needed)
  INPUT_COST_PER_1M: 0.60,
  OUTPUT_COST_PER_1M: 0.60,

  // API Configuration
  API_ENDPOINT: 'https://api.cerebras.ai/v1',
  MODEL_ID: 'qwen-3-235b-a22b-instruct-2507',

  // Thresholds
  THRESHOLDS: {
    ACCURACY: 80,      // > 80%
    LATENCY: 3000,     // < 3s (in ms)
    COST: 0.25,        // < $0.25/query
    ERROR_RATE: 5,     // < 5%
  }
};

// ============================================================================
// Rubby AI Client
// ============================================================================

class RubbyClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.CEREBRAS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  CEREBRAS_API_KEY not found. Using mock responses.');
    }
  }

  async query(prompt: string): Promise<ResponseData> {
    const startTime = performance.now();

    try {
      if (!this.apiKey) {
        // Mock response for testing without API key
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        return {
          response: this.generateMockResponse(prompt),
          latency: (performance.now() - startTime) / 1000,
          success: true,
        };
      }

      // Real API call
      const response = await fetch(`${CONFIG.API_ENDPOINT}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: CONFIG.MODEL_ID,
          messages: [
            {
              role: 'system',
              content: await this.getSystemPrompt(),
            },
            {
              role: 'user',
              content: prompt,
            }
          ],
          max_tokens: 67,
          temperature: 0.3,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      return {
        response: content,
        latency: (performance.now() - startTime) / 1000,
        success: true,
      };

    } catch (error) {
      return {
        response: '',
        latency: (performance.now() - startTime) / 1000,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async getSystemPrompt(): Promise<string> {
    try {
      return await readFile(join(process.cwd(), 'ai/src/system_prompt.txt'), 'utf-8');
    } catch {
      return 'You are Rubby, a helpful AI assistant using the Socratic method.';
    }
  }

  private generateMockResponse(prompt: string): string {
    const lower = prompt.toLowerCase();

    // Simple mock logic
    if (lower.includes('what is') || lower.includes('what\'s')) {
      return 'That\'s a great question! Let me help you with that.';
    }
    if (lower.includes('how do i')) {
      return 'Before we dive in, what have you tried so far?';
    }
    if (lower.includes('error') || lower.includes('bug') || lower.includes('fail')) {
      return 'What do you think might be causing this issue?';
    }
    if (lower.includes('?')) {
      return 'I understand. Can you tell me more about what you\'re trying to achieve?';
    }

    return 'I see. Please continue explaining your thinking.';
  }
}

// ============================================================================
// Evaluator
// ============================================================================

class RubbyEvaluator {
  private client: RubbyClient;
  private results: EvaluationResult[] = [];

  constructor() {
    this.client = new RubbyClient();
  }

  async loadGoldenSet(path: string): Promise<GoldenSet> {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  }

  estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  calculateCost(inputText: string, outputText: string): number {
    const inputTokens = this.estimateTokens(inputText);
    const outputTokens = this.estimateTokens(outputText);

    const inputCost = (inputTokens / 1_000_000) * CONFIG.INPUT_COST_PER_1M;
    const outputCost = (outputTokens / 1_000_000) * CONFIG.OUTPUT_COST_PER_1M;

    return inputCost + outputCost;
  }

  evaluateQuality(testCase: TestCase, responseData: ResponseData): {
    score: number;
    notes: string[];
  } {
    if (!responseData.success) {
      return { score: 0, notes: ['Failed: API error'] };
    }

    const response = responseData.response.toLowerCase();
    const expected = testCase.expected_behavior;
    let score = 0;
    const notes: string[] = [];

    switch (expected) {
      case 'direct_answer':
        if (!response.includes('?') || /\b(is|equals|syntax|=|for|def|function)\b/.test(response)) {
          score = 1.0;
          notes.push('Provided direct answer');
        } else {
          score = 0.3;
          notes.push('Asked question instead of answering');
        }
        break;

      case 'question':
        if (response.includes('?')) {
          score = 1.0;
          notes.push('Asked guiding question');
        } else {
          score = 0.3;
          notes.push('Did not ask question');
        }
        break;

      case 'concept_check':
      case 'logic_check':
        if (response.includes('?') && /(understand|know|familiar|think|explain|tell me)/i.test(response)) {
          score = 1.0;
          notes.push('Checked concept understanding');
        } else {
          score = 0.5;
          notes.push('Partial concept check');
        }
        break;

      case 'refusal_hint':
        if (/(can't|won't|don't|instead|rather|but)/i.test(response)) {
          score = 1.0;
          notes.push('Refused with hint');
        } else {
          score = 0.2;
          notes.push('Did not refuse appropriately');
        }
        break;

      case 'refusal_firm':
      case 'refusal_maintain_persona':
        if (/(can't|won't|not going to|i'm|i am)/i.test(response)) {
          score = 1.0;
          notes.push('Firm refusal');
        } else {
          score = 0;
          notes.push('Failed to refuse');
        }
        break;

      case 'mirroring':
        if (response.length < 100 && /(go on|right|ok|got it|continue|yes|i see)/i.test(response)) {
          score = 1.0;
          notes.push('Brief mirroring response');
        } else {
          score = 0.5;
          notes.push('Response too long or not mirroring');
        }
        break;

      case 'affirmation':
        if (/(great|good|keep|thinking|right track)/i.test(response)) {
          score = 1.0;
          notes.push('Provided affirmation');
        } else {
          score = 0.4;
          notes.push('Lacked affirmation');
        }
        break;

      case 'empathy':
        if (/(understand|break|feeling|sounds|take a|tough|hard)/i.test(response)) {
          score = 1.0;
          notes.push('Showed empathy');
        } else {
          score = 0.4;
          notes.push('Lacked empathy');
        }
        break;

      case 'context_request':
        if (response.includes('?') && /(which|what|language|environment|using|platform)/i.test(response)) {
          score = 1.0;
          notes.push('Requested context');
        } else {
          score = 0.3;
          notes.push('Did not request context');
        }
        break;

      case 'xy_problem_halt':
        if (/(warn|careful|fragile|instead|better|don't|avoid)/i.test(response)) {
          score = 1.0;
          notes.push('Warned about XY problem');
        } else {
          score = 0.2;
          notes.push('Did not warn appropriately');
        }
        break;

      case 'correction':
        if (/(actually|correct|mean|should be|tree|left|right)/i.test(response)) {
          score = 1.0;
          notes.push('Provided correction');
        } else {
          score = 0.3;
          notes.push('Did not correct');
        }
        break;

      case 'concrete_hint':
        if (response.length > 20 && !response.includes('?')) {
          score = 1.0;
          notes.push('Gave concrete hint');
        } else {
          score = 0.5;
          notes.push('Hint not concrete enough');
        }
        break;

      case 'celebration':
        if (/(great|awesome|nice|excellent|congrats|well done)/i.test(response)) {
          score = 1.0;
          notes.push('Celebrated success');
        } else {
          score = 0.4;
          notes.push('Did not celebrate');
        }
        break;

      case 'opinion':
      case 'persona_status':
      case 'gratitude':
        if (response.length > 15) {
          score = 0.8;
          notes.push('Responded to social query');
        } else {
          score = 0.3;
          notes.push('Response too brief');
        }
        break;

      case 'ethical_check':
        if (response.includes('?') && /(why|purpose|intent|what for|legal|allowed)/i.test(response)) {
          score = 1.0;
          notes.push('Performed ethical check');
        } else {
          score = 0.2;
          notes.push('Did not check ethics');
        }
        break;

      case 'analogy_gaming':
      case 'analogy_cinema':
        if (/(like|similar|imagine|think of|save|point|multiverse|inception)/i.test(response)) {
          score = 1.0;
          notes.push('Used analogy');
        } else {
          score = 0.4;
          notes.push('Did not use analogy');
        }
        break;

      case 'text_description':
      case 'text_only':
        if (!/[*_|\\\/\-]{3,}/.test(response)) {
          score = 1.0;
          notes.push('Text-only response');
        } else {
          score = 0.3;
          notes.push('Used formatting/effects');
        }
        break;

      case 'one_line_exception':
        if (response.length > 10 && response.length < 200) {
          score = 1.0;
          notes.push('Provided one-line code');
        } else {
          score = 0.5;
          notes.push('Response length not appropriate');
        }
        break;

      default:
        if (response.length > 10) {
          score = 0.5;
          notes.push('Generated response');
        } else {
          score = 0.1;
          notes.push('Response too short');
        }
    }

    return { score, notes };
  }

  async runEvaluation(goldenSetPath: string): Promise<void> {
    const goldenSet = await this.loadGoldenSet(goldenSetPath);
    const tests = goldenSet.tests;

    console.log('\n🦆 Rubby AI Evaluation');
    console.log('='.repeat(60));
    console.log(`Golden Set: ${goldenSetPath}`);
    console.log(`Total Tests: ${tests.length}`);
    console.log('='.repeat(60) + '\n');

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      console.log(`[${i + 1}/${tests.length}] Testing ${test.id}: ${test.difficulty} - ${test.expected_behavior}`);
      console.log(`  Query: ${test.query.slice(0, 60)}...`);

      // Query Rubby AI
      const responseData = await this.client.query(test.query);

      // Evaluate quality
      const { score, notes } = this.evaluateQuality(test, responseData);

      // Calculate cost
      const cost = this.calculateCost(test.query, responseData.response);

      // Store result
      const result: EvaluationResult = {
        test_id: test.id,
        query: test.query,
        difficulty: test.difficulty,
        expected_behavior: test.expected_behavior,
        response: responseData.response,
        latency: responseData.latency,
        success: responseData.success,
        error: responseData.error,
        quality_score: score,
        quality_notes: notes,
        cost,
        timestamp: new Date().toISOString(),
      };

      this.results.push(result);

      // Print feedback
      const status = result.success ? '✓' : '✗';
      const scoreEmoji = score >= 0.8 ? '🟢' : score >= 0.5 ? '🟡' : '🔴';
      console.log(`  ${status} Latency: ${result.latency.toFixed(2)}s | Quality: ${scoreEmoji} ${(score * 100).toFixed(0)}% | $${cost.toFixed(4)}`);
      console.log(`  Notes: ${notes.join(', ')}`);
      console.log();

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  calculateMetrics(): AggregateMetrics {
    const total = this.results.length;
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);

    const latencies = successful.map(r => r.latency);
    const costs = this.results.map(r => r.cost);
    const qualityScores = successful.map(r => r.quality_score);

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length || 0;
    const p95Latency = this.percentile(latencies, 95);
    const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length || 0;
    const totalCost = costs.reduce((a, b) => a + b, 0);
    const avgQuality = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length || 0;
    const accuracy = (qualityScores.filter(s => s >= 0.8).length / qualityScores.length) * 100 || 0;
    const errorRate = (failed.length / total) * 100;

    // By difficulty
    const byDifficulty: { [key: string]: { quality: number; latency: number; count: number } } = {};
    for (const difficulty of ['easy', 'medium', 'hard']) {
      const diffResults = successful.filter(r => r.difficulty === difficulty);
      if (diffResults.length > 0) {
        byDifficulty[difficulty] = {
          quality: diffResults.reduce((a, b) => a + b.quality_score, 0) / diffResults.length,
          latency: diffResults.reduce((a, b) => a + b.latency, 0) / diffResults.length,
          count: diffResults.length,
        };
      }
    }

    return {
      accuracy,
      avg_quality: avgQuality,
      avg_latency: avgLatency,
      p95_latency: p95Latency,
      avg_cost: avgCost,
      total_cost: totalCost,
      error_rate: errorRate,
      success_count: successful.length,
      failure_count: failed.length,
      by_difficulty: byDifficulty,
    };
  }

  percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  displayMetrics(metrics: AggregateMetrics): void {
    console.log('='.repeat(60));
    console.log('📊 BASELINE METRICS');
    console.log('='.repeat(60));
    console.log(`✅ Accuracy: ${metrics.accuracy.toFixed(1)}% (${metrics.success_count} tests scored ≥80%)`);
    console.log(`🎯 Avg Quality Score: ${(metrics.avg_quality * 100).toFixed(1)}%`);
    console.log(`⚡ Avg Latency: ${metrics.avg_latency.toFixed(2)}s`);
    console.log(`📈 P95 Latency: ${metrics.p95_latency.toFixed(2)}s`);
    console.log(`💰 Avg Cost: $${metrics.avg_cost.toFixed(4)}/query`);
    console.log(`💸 Total Cost: $${metrics.total_cost.toFixed(4)}`);
    console.log(`❌ Error Rate: ${metrics.error_rate.toFixed(1)}% (${metrics.failure_count}/${this.results.length} failures)`);
    console.log('='.repeat(60));

    console.log('\n📊 Breakdown by Difficulty:');
    for (const [difficulty, stats] of Object.entries(metrics.by_difficulty)) {
      console.log(`  ${difficulty.toUpperCase().padEnd(6)}: Quality ${(stats.quality * 100).toFixed(0)}% | Latency ${stats.latency.toFixed(2)}s | Count ${stats.count}`);
    }

    console.log('\n🎯 Threshold Assessment:');
    console.log(`  Accuracy > ${CONFIG.THRESHOLDS.ACCURACY}%:        ${metrics.accuracy > CONFIG.THRESHOLDS.ACCURACY ? '✅ PASS' : '❌ FAIL'} (${metrics.accuracy.toFixed(1)}%)`);
    console.log(`  Latency < ${CONFIG.THRESHOLDS.LATENCY / 1000}s:          ${metrics.avg_latency < CONFIG.THRESHOLDS.LATENCY / 1000 ? '✅ PASS' : '❌ FAIL'} (${metrics.avg_latency.toFixed(2)}s)`);
    console.log(`  Cost < $${CONFIG.THRESHOLDS.COST}/query:    ${metrics.avg_cost < CONFIG.THRESHOLDS.COST ? '✅ PASS' : '❌ FAIL'} ($${metrics.avg_cost.toFixed(4)})`);
    console.log(`  Error Rate < ${CONFIG.THRESHOLDS.ERROR_RATE}%:       ${metrics.error_rate < CONFIG.THRESHOLDS.ERROR_RATE ? '✅ PASS' : '❌ FAIL'} (${metrics.error_rate.toFixed(1)}%)`);
    console.log('='.repeat(60) + '\n');
  }

  async saveResults(outputPath: string, metrics: AggregateMetrics): Promise<void> {
    const output: EvaluationOutput = {
      meta: {
        timestamp: new Date().toISOString(),
        golden_set: 'tests/golden_set.json',
        total_tests: this.results.length,
      },
      results: this.results,
      metrics,
    };

    await writeFile(outputPath, JSON.stringify(output, null, 2));
    console.log(`💾 Results saved to: ${outputPath}`);
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const goldenSetPath = args.find(arg => !arg.startsWith('--')) || 'tests/golden_set.json';
  const outputPath = args.includes('--output')
    ? args[args.indexOf('--output') + 1]
    : 'tests/metrics_baseline.json';

  const evaluator = new RubbyEvaluator();

  try {
    await evaluator.runEvaluation(goldenSetPath);
    const metrics = evaluator.calculateMetrics();
    evaluator.displayMetrics(metrics);
    await evaluator.saveResults(outputPath, metrics);
  } catch (error) {
    console.error('❌ Evaluation failed:', error);
    process.exit(1);
  }
}

main();
