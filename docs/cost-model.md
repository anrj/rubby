# Token Usage & Cost Model (Version 2)

**Project Name:** Rubby the Duck
**Team Members:** [Giorgi Gogichashvili, Anri Javakhishvili, Davit Kutateladze, Nikoloz Tukhashvili]
**Date:** Week 5, [11/6/2025] 
**Version:** 2.0 (Projections based on app design)

---

## 📊 Executive Summary

**Current Cost Per Query:** $0.0031 (estimated)
**Projected Monthly Cost (Production):** $5 - $10
**Optimization Potential:** 90%+ cost reduction identified
**Budget Status:** On track

**Key Insight:**
> The primary cost driver for a conversational agent like Rubby is the back-and-forth nature of dialogue, not a single large output. Our biggest optimization opportunity lies in using a cheaper, faster model for the bulk of the conversation and escalating to a more powerful model only when necessary.

---

## 1. Current Baseline (Week 4)

### Token Usage Breakdown

Based on **estimated usage** for a typical conversational turn (one user query + one AI response):

**Per Query Analysis (Single Turn):**

| Component | Tokens | Cost | % of Total |
|-----------|--------|------|------------|
| **System Prompt** | 400 tokens | $0.00200 | 65% |
| **User Query** | 100 tokens | $0.00050 | 16% |
| **Retrieved Context** (if RAG) | 0 tokens | $0.00000 | 0% |
| **Input Subtotal** | 500 tokens | $0.00250 | 81% |
| **Output (Response)** | 40 tokens | $0.00060 | 19% |
| **TOTAL PER QUERY** | **540 tokens** | **$0.00310** | **100%** |

**Rubby the Duck example**

| Component | Tokens | Cost (GPT-4o) | % of Total |
|-----------|--------|---------------|------------|
| **System Prompt** | 400 tokens | $0.00200 | 65% |
| **User Query** | 100 tokens | $0.00050 | 16% |
| **Retrieved Context** | 0 tokens (no RAG) | $0.00000 | 0% |
| **Input Subtotal** | 500 tokens | $0.00250 | 81% |
| **Output (AI Question)**| 40 tokens | $0.00060 | 19% |
| **TOTAL PER TURN** | **540 tokens** | **$0.00310** | **100%** |

**Key Findings:**
- The System Prompt is the single largest cost component per turn (65%), making it a prime target for optimization.
- Unlike a data extraction app, our output is small and cheap; the cost is in the context we send with every message.
- Average conversational turn: ~540 tokens @ $0.0031. A full 10-turn conversation would cost ~$0.031.

---

### Current Usage Patterns

**Week 3-4 Testing Data:**
Since we have no real data, we will project based on expected testing loads.

| Metric | Value (Projected) |
|--------|-------|
| Total queries (Week 3-4) | 200 turns |
| Average queries/day | 10-15 turns |
| Total tokens used | ~108,000 tokens |
| Total cost incurred | ~$0.62 |
| Model used | GPT-4o |

**Cost Breakdown by Day (Hypothetical):**

| Date | Queries (Turns) | Tokens | Cost |
|------|---------|--------|------|
| Oct 15 | 20 | 10,800 | $0.06 |
| Oct 16 | 30 | 16,200 | $0.09 |
| Oct 17 | 15 | 8,100 | $0.05 |
| Oct 18 | 25 | 13,500 | $0.08 |
| **Total** | **90** | **48,600** | **$0.28** |

---

## 2. Cost Model (Current vs. Projected)

### Development Phase (Weeks 3-9)

**Current Usage:**
- Queries per day: ~30 turns/day (testing)
- Days remaining: 42 days (6 weeks)
- Estimated queries: 1,260 turns
- **Projected cost: $3.91**

### Production Phase (Weeks 10-15)

**Expected Usage:**
- Queries per day: 100 turns/day (user testing + demo prep)
- Days: 42 days (6 weeks)
- Estimated queries: 4,200 turns
- **Projected cost: $13.02**

### Total Semester Projection

| Phase | Queries (Turns) | Cost (Current Model) | Cost (Optimized) | Savings |
|-------|---------|----------------------|------------------|---------|
| Development (W3-9) | 1,260 | $3.91 | $0.39 | 90% |
| Production (W10-15) | 4,200 | $13.02 | $1.30 | 90% |
| **TOTAL** | **5,460** | **$16.93** | **$1.69** | **90%** |

**Budget Allocation:**
- AI API costs: $10 (optimized, with buffer)
- User testing incentives: $50 (5 participants × $10)
- Infrastructure (Vercel, Railway): $0 (Free Tiers)
- Buffer/contingency: $40
- **Total Budget: $100** (well within $200 course budget)

---

## 3. Optimization Strategies

### Strategy 1: Compress System Prompt ⭐ High Impact

**Current System Prompt (400 tokens):**
```
You are Rubby the Duck, an AI-powered learning companion. Your personality is encouraging, curious, and supportive. Your primary method of teaching is the Socratic method. You must never give the user the direct answer. Instead, you must always respond with a thoughtful, open-ended question that helps the user explore their own understanding. Guide them to identify gaps in their logic. If the user is stuck, rephrase the question or offer a simpler analogy. Your responses should be concise. Do not be overly verbose. Maintain the persona of a friendly duck.
[... continues for 400 tokens]
```

**Optimized System Prompt (150 tokens - 62% reduction):**
```
Persona: Rubby the Duck, a supportive Socratic learning guide.
Rule #1: NEVER give direct answers. ALWAYS respond with a concise, open-ended question to guide the user's thinking.
Rule #2: If user is stuck, rephrase or use a simple analogy.
Tone: Encouraging, curious.
```

**Why This Works:**
- Uses clear rules instead of descriptive paragraphs.
- Removes fluff ("do not be overly verbose") by being concise.
- LLMs understand structured instructions like "Persona:" and "Rule #1:" very well.

**Token Savings:** 250 tokens input per turn
**Cost Savings:** $0.00125/turn → **$6.83/semester (40% reduction)**

---

### Strategy 2: Hybrid Model Selection ⭐ High Impact

**Strategy:** Use GPT-4o-mini for 90% of the conversation and only escalate to GPT-4o for complex turns or when the user is stuck.

**Current Model:** GPT-4o for everything
**Optimized:** 90% GPT-4o-mini, 10% GPT-4o

**Model Pricing:**
- GPT-4o: $0.005/1K input, $0.015/1K output
- GPT-4o-mini: $0.00015/1K input, $0.0006/1K output (96% cheaper!)

**Cost Calculation (per turn, with optimized prompt):**

**GPT-4o (current):**
- Input: 250 tokens × $0.005/1K = $0.00125
- Output: 40 tokens × $0.015/1K = $0.00060
- **Total: $0.00185/turn**

**GPT-4o-mini:**
- Input: 250 tokens × $0.00015/1K = $0.0000375
- Output: 40 tokens × $0.0006/1K = $0.000024
- **Total: $0.0000615/turn**

**Blended (90% mini, 10% full):**
- Mini: 0.90 × $0.0000615 = $0.000055
- Full: 0.10 × $0.00185 = $0.000185
- **Total: $0.00024/turn (87% savings!)**

**Implementation:**
```python
def check_conversation_complexity(history):
    # Heuristics: user says "I'm stuck", conversation length > 20 turns, topic is abstract
    # Return score 0-1
    return complexity_score

def choose_model(history):
    complexity = check_conversation_complexity(history)
    
    if complexity > 0.8:
        return "gpt-4o"       # Complex turn, needs smarter model
    else:
        return "gpt-4o-mini"  # Standard turn
```

**Cost Savings:** 87% reduction → **Save ~$8.79/semester**

---

### Strategy 3: Implement Caching for Conversation Starters ⭐ Low Impact

**Strategy:** For very common, identical opening queries (e.g., "Explain recursion"), cache the first response from Rubby.

**Expected Cache Hit Rate:** 5% (conversations are unique, but some topics are common)

**Implementation:**
- Use Redis (Upstash free tier) to store key-value pairs.
- Key: Hash of the user's first message.
- Value: Rubby's first question.

**Cost Savings (5% cache hit rate):**
- Prevents ~273 API calls (5% of 5,460)
- Saves ~$0.07 (5% of optimized cost)
- **Total savings: Minimal, but good practice.**

---

## 4. Combined Optimization Impact

### Cumulative Savings

| Optimization | Token Reduction | Cost Savings | Implementation Effort |
|--------------|-----------------|--------------|----------------------|
| #1: Compress System Prompt | 250 input | $6.83 (40%) | 30 min |
| #2: Hybrid Model Selection | N/A | $8.79 (87% further) | 3 hours |
| #3: Caching Starters | All tokens (5% calls) | $0.07 (negligible) | 2 hours |

**Original Projected Cost:** $16.93/semester
**After #1 (Prompt Compression):** $10.10/semester (40% reduction)
**After #2 (Hybrid Model):** $1.31/semester (92% reduction!)
**After #3 (Caching):** $1.24/semester (93% reduction!)

---

## 5. Implementation Roadmap

### Week 4 (Immediate - Do Now)

- [ ] **Optimize system prompt** (30 min)
  - Reduce from 400 to 150 tokens.
  - Test persona and rule-following are maintained.

**Expected Savings:** 40% cost reduction ($6.83 saved).

---

### Week 5 (High Priority)

- [ ] **Implement hybrid model selection** (3 hours)
  - Write conversation complexity assessment function.
  - Add model routing logic.
  - Test quality on both models, especially the handoff.

**Expected Savings:** Additional 87% reduction ($8.79 saved).

---

### Week 6-7 (Medium Priority)

- [ ] **Set up cost tracking and alerts** (2 hours)
  - Create a simple spreadsheet or use a logging service.
  - Log every API call with model used, tokens, and cost.

---

### Week 8 (Low Priority)

- [ ] **Add Redis caching for starters** (2 hours)
  - Set up Upstash free tier.
  - Implement cache-aside pattern for the first turn only.

---

## 6. Cost Tracking Dashboard

### Metrics to Monitor

**Daily:**
- [ ] Total daily spend
- [ ] Number of conversational turns
- [ ] Model distribution (% mini vs. full)

**Weekly:**
- [ ] Weekly cost total
- [ ] Budget burn rate
- [ ] Projected end-of-semester cost

### Dashboard Implementation

**Simple Spreadsheet:**
```
Date | Turns | Tokens | Cost | Model (% mini) | Cache Hit | Notes
-----|-------|--------|------|----------------|-----------|------
Oct 15 | 20 | 10,800 | $0.06 | 0% | N/A | Baseline
Oct 22 | 20 | 5,080 | $0.005| 90% | 5% | Optimized!
```
---

## 7. Budget Allocation (Full Semester)

### Cost Categories

| Category | Budgeted | Actual (W1-4) | Projected (W5-15) | Total |
|----------|----------|---------------|-------------------|-------|
| **AI API (Optimized)** | $10 | $0.28 (est.) | $1.41 | $1.69 |
| **User Testing Incentives** | $50 | $0 | $50 | $50 |
| **Infrastructure** | | | | |
| - Vercel (Frontend) | $0 | $0 | $0 | $0 |
| - Railway (Backend) | $0 | $0 | $0 | $0 |
| - Redis (Cache) | $0 | $0 | $0 | $0 |
| **Buffer/Contingency** | $40 | $0 | $40 | $40 |
| **TOTAL** | **$100** | **$0.28** | **$91.41** | **$91.69** |

**Budget Health:** ✅ Healthy (well under $200 course limit). Most costs are for user testing, not APIs.

---

## 8. Cost Alerts & Thresholds

### Alert Levels

**Warning (Yellow):**
- Daily spend >$1
- Weekly spend >$5
- 50% of semester budget consumed

**Critical (Red):**
- Daily spend >$2
- Weekly spend >$10
- 80% of semester budget consumed

### Response Plan
- **If Yellow Alert:** Review logs for an increase in GPT-4o usage. Check if the complexity heuristic is too sensitive.
- **If Red Alert:** Temporarily disable the escalation to GPT-4o and run on GPT-4o-mini exclusively until the issue is resolved.

---

## 9. Alternative Models Consideration

### Model Comparison

| Model | Input Cost | Output Cost | Quality | Notes |
|-------|------------|-------------|---------|-------|
| **GPT-4o** | $0.005/1K | $0.015/1K | Excellent | Best for complex reasoning. |
| **GPT-4o-mini** | $0.00015/1K | $0.0006/1K | Very good | 96% cheaper. Perfect for standard conversation. |
| **Claude 3.5 Sonnet** | $0.003/1K | $0.015/1K | Excellent | Strong competitor, good for persona. |
| **Gemini Pro** | $0.00025/1K| $0.0005/1K | Good | Very cheap, great for simple turns. |

**Decision:** Stick with OpenAI GPT-4o-mini/GPT-4o hybrid. The quality difference is important for Socratic dialogue, and the cost of mini is competitive with Gemini Pro, making the hybrid approach the best of both worlds.

---

## 10. Long-Term Cost Sustainability

### Post-Course Considerations

**Expected Scale:**
- 100 users
- 5 conversations per user per month (avg. 10 turns each)
- 5,000 turns/month

**Costs (Optimized Model):**
- 5,000 turns × $0.00024/turn = $1.20/month
- Infrastructure: $0 (free tiers are sufficient at this scale)
- **Total: ~$1.20/month**

**Revenue Model (If Monetizing):**
- Freemium: $0 (20 conversations/month)
- Pro: $5/month (unlimited conversations)
- **Need: 1 paying user to break even.**

**Conclusion:** Extremely viable. The primary cost is user acquisition, not the technology itself.

---

## ✅ Cost Optimization Checklist

**Week 4 (This Week):**
- [ ] Compress system prompt (30 min)
- [ ] Set up cost tracking spreadsheet
- [ ] Measure baseline performance (with estimates)

**Week 5:**
- [ ] Implement hybrid model selection
- [ ] A/B test quality difference
- [ ] Measure cost savings

**Week 8:**
- [ ] Set up Redis caching for common starters
- [ ] Monitor cache hit rate
- [ ] Validate final cost model

**Ongoing:**
- [ ] Monitor daily costs
- [ ] Review weekly spend against budget
- [ ] Adjust complexity heuristic as needed

---

## 📊 Appendix: Token Calculation Reference

### OpenAI Pricing (as of Nov 2025)

**GPT-4o:**
- Input: $0.005 per 1K tokens
- Output: $0.015 per 1K tokens

**GPT-4o-mini:**
- Input: $0.00015 per 1K tokens
- Output: $0.0006 per 1K tokens

### Token Estimation Guide

**Rough estimates:**
- 1 token ≈ 4 characters
- 1 token ≈ 0.75 words

**Use `tiktoken` library for accurate counts:**
```python
import tiktoken

encoding = tiktoken.encoding_for_model("gpt-4o")
text = "You are Rubby the Duck..."
token_count = len(encoding.encode(text))
print(f"Token count: {token_count}")
```