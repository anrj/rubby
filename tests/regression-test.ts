/**
 * Regression Test Runner for Rubby AI
 *
 * Automatically runs evaluation and checks for regressions against baseline.
 * Fails with non-zero exit code if thresholds are not met.
 *
 * Perfect for CI/CD pipelines!
 *
 * Usage:
 *   bun run regression-test.ts
 *   bun run regression-test.ts --baseline metrics_baseline.json
 *   bun run regression-test.ts --strict  # Fail on any regression
 */

import { readFile, writeFile, access } from 'fs/promises';
import { constants } from 'fs';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  // Absolute thresholds (must pass these)
  ABSOLUTE_THRESHOLDS: {
    ACCURACY: 80,      // > 80%
    LATENCY: 3000,     // < 3s (in ms)
    COST: 0.25,        // < $0.25/query
    ERROR_RATE: 5,     // < 5%
  },

  // Regression thresholds (compared to baseline)
  REGRESSION_THRESHOLDS: {
    ACCURACY_DELTA: -5,      // Don't drop more than 5%
    LATENCY_DELTA: 0.5,      // Don't increase more than 0.5s
    COST_DELTA: 0.05,        // Don't increase more than $0.05
    ERROR_RATE_DELTA: 3,     // Don't increase more than 3%
  },

  // Strict mode: fail on ANY regression
  STRICT_MODE: false,
};

// ============================================================================
// Types
// ============================================================================

interface Metrics {
  accuracy: number;
  avg_quality: number;
  avg_latency: number;
  p95_latency: number;
  avg_cost: number;
  total_cost: number;
  error_rate: number;
  success_count: number;
  failure_count: number;
}

interface MetricFile {
  meta: {
    timestamp: string;
    golden_set: string;
    total_tests: number;
  };
  metrics: Metrics;
  results: any[];
}

interface TestResult {
  passed: boolean;
  metric: string;
  expected: string;
  actual: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

// ============================================================================
// Utilities
// ============================================================================

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function loadMetrics(path: string): Promise<MetricFile> {
  const content = await readFile(path, 'utf-8');
  return JSON.parse(content);
}

// ============================================================================
// Test Runners
// ============================================================================

class RegressionTester {
  private results: TestResult[] = [];
  private strictMode: boolean;

  constructor(strictMode: boolean = false) {
    this.strictMode = strictMode;
  }

  testAbsoluteThresholds(metrics: Metrics): void {
    console.log('\n🎯 Testing Absolute Thresholds...\n');

    // Accuracy
    this.addResult({
      passed: metrics.accuracy > CONFIG.ABSOLUTE_THRESHOLDS.ACCURACY,
      metric: 'Accuracy',
      expected: `> ${CONFIG.ABSOLUTE_THRESHOLDS.ACCURACY}%`,
      actual: `${metrics.accuracy.toFixed(1)}%`,
      message: 'Must maintain minimum accuracy',
      severity: 'critical',
    });

    // Latency
    this.addResult({
      passed: metrics.avg_latency < CONFIG.ABSOLUTE_THRESHOLDS.LATENCY / 1000,
      metric: 'Avg Latency',
      expected: `< ${CONFIG.ABSOLUTE_THRESHOLDS.LATENCY / 1000}s`,
      actual: `${metrics.avg_latency.toFixed(2)}s`,
      message: 'Response time must be acceptable',
      severity: 'critical',
    });

    // Cost
    this.addResult({
      passed: metrics.avg_cost < CONFIG.ABSOLUTE_THRESHOLDS.COST,
      metric: 'Avg Cost',
      expected: `< $${CONFIG.ABSOLUTE_THRESHOLDS.COST}`,
      actual: `$${metrics.avg_cost.toFixed(4)}`,
      message: 'Cost per query must be reasonable',
      severity: 'warning',
    });

    // Error Rate
    this.addResult({
      passed: metrics.error_rate < CONFIG.ABSOLUTE_THRESHOLDS.ERROR_RATE,
      metric: 'Error Rate',
      expected: `< ${CONFIG.ABSOLUTE_THRESHOLDS.ERROR_RATE}%`,
      actual: `${metrics.error_rate.toFixed(1)}%`,
      message: 'System must be reliable',
      severity: 'critical',
    });
  }

  testRegression(baseline: Metrics, current: Metrics): void {
    console.log('\n📉 Testing for Regressions...\n');

    // Accuracy regression
    const accuracyDelta = current.accuracy - baseline.accuracy;
    this.addResult({
      passed: this.strictMode
        ? accuracyDelta >= 0
        : accuracyDelta >= CONFIG.REGRESSION_THRESHOLDS.ACCURACY_DELTA,
      metric: 'Accuracy Change',
      expected: this.strictMode ? '≥ 0%' : `≥ ${CONFIG.REGRESSION_THRESHOLDS.ACCURACY_DELTA}%`,
      actual: `${accuracyDelta > 0 ? '+' : ''}${accuracyDelta.toFixed(1)}%`,
      message: 'Accuracy should not significantly decrease',
      severity: 'critical',
    });

    // Latency regression
    const latencyDelta = current.avg_latency - baseline.avg_latency;
    this.addResult({
      passed: this.strictMode
        ? latencyDelta <= 0
        : latencyDelta <= CONFIG.REGRESSION_THRESHOLDS.LATENCY_DELTA,
      metric: 'Latency Change',
      expected: this.strictMode ? '≤ 0s' : `≤ +${CONFIG.REGRESSION_THRESHOLDS.LATENCY_DELTA}s`,
      actual: `${latencyDelta > 0 ? '+' : ''}${latencyDelta.toFixed(2)}s`,
      message: 'Latency should not significantly increase',
      severity: 'warning',
    });

    // Cost regression
    const costDelta = current.avg_cost - baseline.avg_cost;
    this.addResult({
      passed: this.strictMode
        ? costDelta <= 0
        : costDelta <= CONFIG.REGRESSION_THRESHOLDS.COST_DELTA,
      metric: 'Cost Change',
      expected: this.strictMode ? '≤ $0' : `≤ +$${CONFIG.REGRESSION_THRESHOLDS.COST_DELTA}`,
      actual: `${costDelta > 0 ? '+' : ''}$${costDelta.toFixed(4)}`,
      message: 'Cost should not significantly increase',
      severity: 'warning',
    });

    // Error rate regression
    const errorDelta = current.error_rate - baseline.error_rate;
    this.addResult({
      passed: this.strictMode
        ? errorDelta <= 0
        : errorDelta <= CONFIG.REGRESSION_THRESHOLDS.ERROR_RATE_DELTA,
      metric: 'Error Rate Change',
      expected: this.strictMode ? '≤ 0%' : `≤ +${CONFIG.REGRESSION_THRESHOLDS.ERROR_RATE_DELTA}%`,
      actual: `${errorDelta > 0 ? '+' : ''}${errorDelta.toFixed(1)}%`,
      message: 'Error rate should not increase',
      severity: 'critical',
    });

    // Quality check (info only)
    const qualityDelta = (current.avg_quality - baseline.avg_quality) * 100;
    this.addResult({
      passed: qualityDelta >= 0,
      metric: 'Quality Change',
      expected: '≥ 0%',
      actual: `${qualityDelta > 0 ? '+' : ''}${qualityDelta.toFixed(1)}%`,
      message: 'Overall quality trend',
      severity: 'info',
    });
  }

  private addResult(result: TestResult): void {
    this.results.push(result);
    const icon = result.passed ? '✅' : '❌';
    const severityIcon =
      result.severity === 'critical' ? '🔴' :
      result.severity === 'warning' ? '🟡' : '🔵';

    console.log(
      `${icon} ${severityIcon} ${result.metric.padEnd(20)} Expected: ${result.expected.padEnd(12)} Actual: ${result.actual.padEnd(12)} ${result.passed ? '' : '← FAIL'}`
    );
  }

  generateReport(): { passed: boolean; summary: string } {
    const critical = this.results.filter(r => r.severity === 'critical');
    const warnings = this.results.filter(r => r.severity === 'warning');
    const info = this.results.filter(r => r.severity === 'info');

    const criticalFailed = critical.filter(r => !r.passed);
    const warningsFailed = warnings.filter(r => !r.passed);
    const infoFailed = info.filter(r => !r.passed);

    const passed = criticalFailed.length === 0 &&
                   (this.strictMode ? warningsFailed.length === 0 : true);

    let summary = '\n' + '='.repeat(70) + '\n';
    summary += '📊 REGRESSION TEST SUMMARY\n';
    summary += '='.repeat(70) + '\n\n';

    summary += `Total Tests: ${this.results.length}\n`;
    summary += `  🔴 Critical: ${critical.length - criticalFailed.length}/${critical.length} passed\n`;
    summary += `  🟡 Warnings: ${warnings.length - warningsFailed.length}/${warnings.length} passed\n`;
    summary += `  🔵 Info:     ${info.length - infoFailed.length}/${info.length} passed\n\n`;

    if (passed) {
      summary += '✅ REGRESSION TEST PASSED\n';
      summary += 'All critical checks passed. Safe to deploy!\n';
    } else {
      summary += '❌ REGRESSION TEST FAILED\n';
      summary += '\nFailed Checks:\n';

      if (criticalFailed.length > 0) {
        summary += '\n🔴 CRITICAL FAILURES:\n';
        criticalFailed.forEach(r => {
          summary += `  - ${r.metric}: ${r.message}\n`;
          summary += `    Expected: ${r.expected}, Got: ${r.actual}\n`;
        });
      }

      if (warningsFailed.length > 0 && this.strictMode) {
        summary += '\n🟡 WARNING FAILURES (strict mode):\n';
        warningsFailed.forEach(r => {
          summary += `  - ${r.metric}: ${r.message}\n`;
          summary += `    Expected: ${r.expected}, Got: ${r.actual}\n`;
        });
      }
    }

    summary += '\n' + '='.repeat(70) + '\n';

    return { passed, summary };
  }
}

// ============================================================================
// Main
// ============================================================================

async function runEvaluation(): Promise<string> {
  console.log('🔄 Running evaluation...\n');

  // Import and run the evaluation
  const { RubbyEvaluator } = await import('./evaluation');

  const evaluator = new (RubbyEvaluator as any)();
  await evaluator.runEvaluation('golden_set.json');
  const metrics = evaluator.calculateMetrics();

  const tempPath = `metrics_regression_${Date.now()}.json`;
  await evaluator.saveResults(tempPath, metrics);

  return tempPath;
}

async function main() {
  const args = process.argv.slice(2);
  const strictMode = args.includes('--strict');
  const baselinePath = args.find(arg => arg.startsWith('--baseline='))?.split('=')[1]
                    || args[args.indexOf('--baseline') + 1]
                    || 'metrics_baseline.json';

  console.log('\n🦆 Rubby AI Regression Test');
  console.log('='.repeat(70));
  console.log(`Mode: ${strictMode ? '🔒 STRICT (fail on any regression)' : '📊 STANDARD'}`);
  console.log(`Baseline: ${baselinePath}`);
  console.log('='.repeat(70));

  const tester = new RegressionTester(strictMode);

  try {
    // Check if baseline exists
    const hasBaseline = await fileExists(baselinePath);

    if (!hasBaseline) {
      console.log('\n⚠️  No baseline found. Running first evaluation...');
      const newMetricsPath = await runEvaluation();
      console.log(`\n✅ Baseline created: ${newMetricsPath}`);
      console.log('Rename this file to metrics_baseline.json for future comparisons.');
      console.log('\nSkipping regression tests (no baseline to compare against).');
      process.exit(0);
    }

    // Run new evaluation
    const currentMetricsPath = await runEvaluation();

    // Load metrics
    const baseline = await loadMetrics(baselinePath);
    const current = await loadMetrics(currentMetricsPath);

    console.log(`\n📊 Baseline: ${new Date(baseline.meta.timestamp).toLocaleString()}`);
    console.log(`📊 Current:  ${new Date(current.meta.timestamp).toLocaleString()}`);

    // Run tests
    tester.testAbsoluteThresholds(current.metrics);
    tester.testRegression(baseline.metrics, current.metrics);

    // Generate report
    const { passed, summary } = tester.generateReport();
    console.log(summary);

    // Save regression report
    const report = {
      timestamp: new Date().toISOString(),
      baseline: baselinePath,
      current: currentMetricsPath,
      strict_mode: strictMode,
      passed,
      tests: tester['results'],
      baseline_metrics: baseline.metrics,
      current_metrics: current.metrics,
    };

    const reportPath = `regression_report_${Date.now()}.json`;
    await writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}\n`);

    // Exit with appropriate code
    process.exit(passed ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Regression test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

main();
