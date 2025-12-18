/**
 * Compare two metric files to see improvements or regressions
 *
 * Usage:
 *   bun run compare-metrics.ts metrics_baseline.json metrics_v2.json
 *   bun run compare-metrics.ts
 */

import { readFile } from 'fs/promises';

interface MetricFile {
  meta: {
    timestamp: string;
    golden_set: string;
    total_tests: number;
  };
  metrics: {
    accuracy: number;
    avg_quality: number;
    avg_latency: number;
    p95_latency: number;
    avg_cost: number;
    total_cost: number;
    error_rate: number;
    success_count: number;
    failure_count: number;
  };
  results: any[];
}

async function loadMetrics(path: string): Promise<MetricFile> {
  const content = await readFile(path, 'utf-8');
  return JSON.parse(content);
}

function formatDelta(current: number, baseline: number, suffix: string = '', invert: boolean = false): string {
  const delta = current - baseline;
  const pct = baseline !== 0 ? ((delta / baseline) * 100) : 0;

  const isGood = invert ? delta < 0 : delta > 0;
  const symbol = delta > 0 ? '+' : '';
  const emoji = Math.abs(delta) < 0.001 ? '⚪' : isGood ? '🟢' : '🔴';

  return `${emoji} ${symbol}${delta.toFixed(3)}${suffix} (${symbol}${pct.toFixed(1)}%)`;
}

function formatPercentDelta(current: number, baseline: number, invert: boolean = false): string {
  return formatDelta(current, baseline, '%', invert);
}

async function compareMetrics(baselinePath: string, currentPath: string) {
  console.log('\n🦆 Rubby AI Metrics Comparison');
  console.log('='.repeat(70));

  const baseline = await loadMetrics(baselinePath);
  const current = await loadMetrics(currentPath);

  console.log(`📊 Baseline: ${baselinePath}`);
  console.log(`   Date: ${new Date(baseline.meta.timestamp).toLocaleString()}`);
  console.log(`   Tests: ${baseline.meta.total_tests}`);
  console.log();
  console.log(`📊 Current:  ${currentPath}`);
  console.log(`   Date: ${new Date(current.meta.timestamp).toLocaleString()}`);
  console.log(`   Tests: ${current.meta.total_tests}`);
  console.log('='.repeat(70));

  const bm = baseline.metrics;
  const cm = current.metrics;

  console.log('\n📈 Performance Comparison:\n');

  console.log('Metric                Baseline    Current     Delta');
  console.log('-'.repeat(70));

  // Accuracy (higher is better)
  console.log(
    `Accuracy              ${bm.accuracy.toFixed(1)}%       ${cm.accuracy.toFixed(1)}%      ${formatPercentDelta(cm.accuracy, bm.accuracy, false)}`
  );

  // Quality (higher is better)
  console.log(
    `Quality Score         ${(bm.avg_quality * 100).toFixed(1)}%       ${(cm.avg_quality * 100).toFixed(1)}%      ${formatPercentDelta(cm.avg_quality * 100, bm.avg_quality * 100, false)}`
  );

  // Latency (lower is better)
  console.log(
    `Avg Latency           ${bm.avg_latency.toFixed(2)}s      ${cm.avg_latency.toFixed(2)}s     ${formatDelta(cm.avg_latency, bm.avg_latency, 's', true)}`
  );

  console.log(
    `P95 Latency           ${bm.p95_latency.toFixed(2)}s      ${cm.p95_latency.toFixed(2)}s     ${formatDelta(cm.p95_latency, bm.p95_latency, 's', true)}`
  );

  // Cost (lower is better)
  console.log(
    `Avg Cost              $${bm.avg_cost.toFixed(4)}   $${cm.avg_cost.toFixed(4)}  ${formatDelta(cm.avg_cost, bm.avg_cost, '', true)}`
  );

  console.log(
    `Total Cost            $${bm.total_cost.toFixed(4)}   $${cm.total_cost.toFixed(4)}  ${formatDelta(cm.total_cost, bm.total_cost, '', true)}`
  );

  // Error Rate (lower is better)
  console.log(
    `Error Rate            ${bm.error_rate.toFixed(1)}%       ${cm.error_rate.toFixed(1)}%      ${formatPercentDelta(cm.error_rate, bm.error_rate, true)}`
  );

  console.log('-'.repeat(70));

  // Overall assessment
  console.log('\n🎯 Overall Assessment:\n');

  let improvements = 0;
  let regressions = 0;

  if (cm.accuracy > bm.accuracy) improvements++; else if (cm.accuracy < bm.accuracy) regressions++;
  if (cm.avg_quality > bm.avg_quality) improvements++; else if (cm.avg_quality < bm.avg_quality) regressions++;
  if (cm.avg_latency < bm.avg_latency) improvements++; else if (cm.avg_latency > bm.avg_latency) regressions++;
  if (cm.avg_cost < bm.avg_cost) improvements++; else if (cm.avg_cost > bm.avg_cost) regressions++;
  if (cm.error_rate < bm.error_rate) improvements++; else if (cm.error_rate > bm.error_rate) regressions++;

  console.log(`✅ Improvements: ${improvements}`);
  console.log(`❌ Regressions:  ${regressions}`);
  console.log(`⚪ No Change:    ${5 - improvements - regressions}`);

  if (improvements > regressions) {
    console.log('\n🎉 Overall: IMPROVED');
  } else if (regressions > improvements) {
    console.log('\n⚠️  Overall: REGRESSED');
  } else {
    console.log('\n➡️  Overall: NEUTRAL');
  }

  // Test-by-test comparison
  console.log('\n📋 Test-by-Test Changes:\n');

  const improved: string[] = [];
  const regressed: string[] = [];

  for (const currResult of current.results) {
    const baseResult = baseline.results.find(r => r.test_id === currResult.test_id);
    if (!baseResult) continue;

    const scoreDelta = currResult.quality_score - baseResult.quality_score;

    if (scoreDelta > 0.1) {
      improved.push(`  ${currResult.test_id}: ${(baseResult.quality_score * 100).toFixed(0)}% → ${(currResult.quality_score * 100).toFixed(0)}% (+${(scoreDelta * 100).toFixed(0)}%)`);
    } else if (scoreDelta < -0.1) {
      regressed.push(`  ${currResult.test_id}: ${(baseResult.quality_score * 100).toFixed(0)}% → ${(currResult.quality_score * 100).toFixed(0)}% (${(scoreDelta * 100).toFixed(0)}%)`);
    }
  }

  if (improved.length > 0) {
    console.log(`✅ Improved Tests (${improved.length}):`);
    improved.forEach(line => console.log(line));
    console.log();
  }

  if (regressed.length > 0) {
    console.log(`❌ Regressed Tests (${regressed.length}):`);
    regressed.forEach(line => console.log(line));
    console.log();
  }

  if (improved.length === 0 && regressed.length === 0) {
    console.log('⚪ No significant test-level changes (threshold: ±10%)\n');
  }

  console.log('='.repeat(70));
  console.log();
}

async function main() {
  const args = process.argv.slice(2);

  const baselinePath = args[0] || 'metrics_baseline.json';
  const currentPath = args[1] || 'metrics_current.json';

  try {
    await compareMetrics(baselinePath, currentPath);
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      console.error('❌ Error: Could not find metric files.');
      console.error(`   Looking for: ${baselinePath} and ${currentPath}`);
      console.error('\n   Run evaluation first:');
      console.error('   bun run eval:baseline');
      console.error('   bun run evaluation.ts --output metrics_current.json');
    } else {
      console.error('❌ Error:', error);
    }
    process.exit(1);
  }
}

main();
