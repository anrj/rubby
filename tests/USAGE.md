# Rubby AI Testing - Usage Guide

Quick reference for running golden set evaluations and regression tests.

## 🚀 Quick Start

```bash
cd tests
bun install
bun run eval:baseline
```

## 📋 Available Commands

### Basic Evaluation

```bash
# Run evaluation (shows results in console)
bun run eval

# Save baseline metrics
bun run eval:baseline

# Custom output file
bun run evaluation.ts --output metrics_v2.json
```

### Regression Testing

```bash
# Run regression test (compares against metrics_baseline.json)
bun run regression

# Strict mode (fail on ANY regression)
bun run regression:strict

# Use custom baseline
bun run regression-test.ts --baseline=metrics_v1.json

# CI/CD friendly (exits with code 0 on pass, 1 on fail)
bun test
```

### Comparison

```bash
# Compare two metric files
bun run compare metrics_baseline.json metrics_v2.json
```

## 🎯 What Each Script Does

### `evaluation.ts` - Main Evaluation
- Runs all 32 test cases from `golden_set.json`
- Queries Rubby AI via Cerebras API
- Measures: latency, cost, quality, error rate
- Outputs: Console report + JSON file
- Uses mock responses if no API key

### `regression-test.ts` - Automated Regression Tests
- Runs evaluation automatically
- Compares against baseline metrics
- Checks absolute thresholds (accuracy, latency, cost, error rate)
- Checks regression thresholds (deltas from baseline)
- Exits with code 0 (pass) or 1 (fail)
- Perfect for CI/CD pipelines

### `compare-metrics.ts` - Manual Comparison
- Loads two metric files
- Shows side-by-side comparison
- Calculates deltas and improvements
- Lists test-by-test changes

## 📊 Understanding Results

### Evaluation Output

```
✅ Accuracy: 84.2% (27 tests scored ≥80%)
⚡ Avg Latency: 2.3s
💰 Avg Cost: $0.0018/query
❌ Error Rate: 3.1%
```

### Regression Test Output

```
🔴 Critical: 4/4 passed
🟡 Warnings: 3/3 passed
🔵 Info:     1/1 passed

✅ REGRESSION TEST PASSED
All critical checks passed. Safe to deploy!
```

## 🎯 Thresholds

### Absolute Thresholds (must meet)
- **Accuracy**: > 80%
- **Latency**: < 3s
- **Cost**: < $0.25/query
- **Error Rate**: < 5%

### Regression Thresholds (vs baseline)
- **Accuracy**: Don't drop more than 5%
- **Latency**: Don't increase more than 0.5s
- **Cost**: Don't increase more than $0.05
- **Error Rate**: Don't increase more than 3%

### Strict Mode
Fails on ANY regression (even 0.1% worse)

## 🔄 Typical Workflow

### 1. First Time Setup
```bash
cd tests
bun install
export CEREBRAS_API_KEY=your_key
bun run eval:baseline
```

### 2. Make Changes
Edit system prompt, model config, etc.

### 3. Test Changes
```bash
bun run regression
```

### 4. If Tests Pass
```bash
# Save new baseline
mv metrics_regression_*.json metrics_baseline.json
```

### 5. If Tests Fail
Review the report, fix issues, repeat

## 🧪 CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Run Regression Tests
  run: |
    cd tests
    bun install
    bun test
  env:
    CEREBRAS_API_KEY: ${{ secrets.CEREBRAS_API_KEY }}
```

Exit codes:
- `0` = All tests passed
- `1` = Tests failed or error occurred

## 🐛 Troubleshooting

### "No baseline found"
First run creates a baseline. Rename the output to `metrics_baseline.json`

### "CEREBRAS_API_KEY not found"
Set your API key: `export CEREBRAS_API_KEY=your_key`
Or create `.env` file in root directory

### Mock responses used
Script falls back to mocks if no API key. Good for testing framework!

### Regression test fails
Review the report JSON file for details on which tests failed

## 📁 Output Files

- `metrics_baseline.json` - Your baseline (create this first)
- `metrics_regression_*.json` - Results from regression runs
- `regression_report_*.json` - Detailed test results
- `metrics_*.json` - Any custom evaluation outputs

## 🎓 Examples

### Example 1: First Baseline
```bash
bun run eval:baseline
# Creates metrics_baseline.json
```

### Example 2: Test Changes
```bash
# Edit system prompt
bun run regression
# ✅ PASSED - safe to deploy
```

### Example 3: Compare Versions
```bash
bun run eval:baseline  # v1
# make changes
bun run evaluation.ts --output metrics_v2.json
bun run compare metrics_baseline.json metrics_v2.json
```

### Example 4: Strict Testing
```bash
bun run regression:strict
# Fails on ANY decrease in quality
```

## 🔑 Key Points

✅ Run `eval:baseline` first to create your baseline
✅ Use `regression` after making changes
✅ Use `regression:strict` for critical releases
✅ Compare manually with `compare` for detailed analysis
✅ All scripts work without API key (uses mocks)
✅ Exit codes make it CI/CD friendly

---

**Need more details?** Check `QUICKSTART.md` or read the source code in the .ts files!