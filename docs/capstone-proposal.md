# Capstone Proposal

**Course:** Building AI-Powered Applications  
**Team Name:** Promptsitutes  
**Project Title:** Rubby.AI  
**Date:** 10/17/25

---

## 1. Problem Statement

### The Problem

[2-3 paragraphs describing the problem you're solving]

**Questions to answer:**
- What specific problem are you addressing?
- Who currently experiences this problem?
- What are the current solutions (if any) and why are they inadequate?
- Why does this problem matter?
- What makes this problem suitable for an AI-powered solution?

**Example Structure:**
"Many students struggle with [specific problem]. Currently, they [how they deal with it now], which leads to [negative outcomes]. This problem affects [number/type of people] and costs them [time/money/frustration]. An AI-powered solution could [how AI specifically helps] by [concrete mechanism]."

---

### Scope

**What's In Scope:**
- [Feature/capability 1]
- [Feature/capability 2]
- [Feature/capability 3]

**What's Out of Scope (but maybe future work):**
- [Thing you won't do 1]
- [Thing you won't do 2]

**Why This Scope Makes Sense:**
[1-2 sentences justifying your chosen scope for a semester project]

---

## 2. Target Users

### Primary User Persona

**User Type:** [e.g., Undergraduate students, small business owners, content creators]

**Demographics:**
- Age range: [e.g., 18-24]
- Technical proficiency: [e.g., Comfortable with web apps, but not developers]
- Context of use: [e.g., Mobile-first, using during commute]

**User Needs:**
1. **Need #1:** [Specific need]
   - Why it matters: [Impact on user]
   - Current workaround: [What they do now]

2. **Need #2:** [Specific need]
   - Why it matters: [Impact on user]
   - Current workaround: [What they do now]

3. **Need #3:** [Specific need]
   - Why it matters: [Impact on user]
   - Current workaround: [What they do now]

**User Pain Points:**
- [Specific frustration 1]
- [Specific frustration 2]
- [Specific frustration 3]

---

### Secondary Users (Optional)

[If applicable, describe other types of users who might interact with your system]

---

## 3. Success Criteria

### Product Success Metrics

**How we'll know our solution works:**

1. **Metric #1:** [e.g., Task completion time]
   - Target: [e.g., Reduce from 10 minutes to <2 minutes]
   - Measurement method: [e.g., Time users from task start to completion]

2. **Metric #2:** [e.g., Accuracy/Quality]
   - Target: [e.g., 90% of outputs rated "helpful" or "very helpful" by users]
   - Measurement method: [e.g., Post-task survey with 5-point scale]

3. **Metric #3:** [e.g., User satisfaction]
   - Target: [e.g., NPS score >50, or 4/5 average rating]
   - Measurement method: [e.g., Exit survey]

4. **Metric #4:** [e.g., Adoption/Engagement]
   - Target: [e.g., 5 active users with 3+ sessions each]
   - Measurement method: [e.g., Usage analytics]

5. **Metric #5:** [e.g., Cost efficiency]
   - Target: [e.g., <$0.10 per user interaction]
   - Measurement method: [e.g., API cost tracking]

---

### Technical Success Criteria

**Minimum viable performance:**
- Response latency: [e.g., <3 seconds p95]
- Availability: [e.g., 95% uptime during testing period]
- Error rate: [e.g., <5% of requests fail]
- Cost per user: [e.g., <$X per session]

---

### Learning Goals

**What each team member wants to learn:**

**[Team Member 1]:**
- [Specific skill/technology 1]
- [Specific skill/technology 2]

**[Team Member 2]:**
- [Specific skill/technology 1]
- [Specific skill/technology 2]

**[Team Member 3]:** (if applicable)
- [Specific skill/technology 1]
- [Specific skill/technology 2]

---

## 4. Technical Architecture

### System Overview

[1-2 paragraph high-level description of how your system works]

**Example:**
"Our system consists of a Next.js frontend that captures user input, sends it to a FastAPI backend, which orchestrates calls to OpenAI's GPT-4 API and a Pinecone vector database for retrieval. Results are streamed back to the user with citations."

---

### Architecture Diagram

[Insert diagram here - use draw.io, Excalidraw, Mermaid, or similar]

```
[Paste ASCII diagram or link to image file]
```

**Example:**
```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   User      │─────▶│   Frontend  │─────▶│   Backend   │
│  (Browser)  │◀─────│  (Next.js)  │◀─────│  (FastAPI)  │
└─────────────┘      └─────────────┘      └─────────────┘
                                                  │
                                     ┌────────────┼────────────┐
                                     ▼            ▼            ▼
                              ┌──────────┐ ┌──────────┐ ┌──────────┐
                              │ OpenAI   │ │ Pinecone │ │PostgreSQL│
                              │   API    │ │  Vector  │ │   DB     │
                              └──────────┘ └──────────┘ └──────────┘
```

---

### Technology Stack

**Frontend:**
- Framework: [e.g., Next.js 14, React, vanilla JS]
- Key libraries: [e.g., TailwindCSS, Recharts]
- Hosting: [e.g., Vercel, Netlify]

**Backend:**
- Framework: [e.g., FastAPI, Flask, Express]
- Language: [e.g., Python 3.11, TypeScript]
- Hosting: [e.g., Render, Railway, local]

**AI/ML Services:**
- Primary model: [e.g., GPT-4o, Claude Sonnet 3.5]
- Fallback model: [e.g., GPT-3.5-turbo]
- Other AI services: [e.g., OpenAI Embeddings, Whisper, DALL-E 3]

**Data Storage:**
- Database: [e.g., PostgreSQL, SQLite]
- Vector store: [e.g., FAISS, Pinecone, pgvector]
- Object storage: [e.g., Cloudinary, S3]

**DevOps/Tooling:**
- Version control: GitHub
- CI/CD: [e.g., GitHub Actions, none yet]
- Monitoring: [e.g., Sentry, custom logging]
- Testing: [e.g., pytest, Jest]

---

### Data Flow

**Example Flow: User Query → AI Response**

1. User enters query in frontend
2. Frontend validates input and shows loading state
3. Request sent to `/api/query` endpoint
4. Backend:
   - Sanitizes input (check for prompt injection)
   - Generates embedding of query
   - Searches vector DB for relevant context (top 5 results)
   - Constructs prompt with retrieved context
   - Calls OpenAI API with prompt
   - Streams response back to frontend
   - Logs latency, cost, and user feedback
5. Frontend displays response with citations

**Critical Path Latency Budget:**
- Frontend validation: <100ms
- Backend processing: <500ms
- Vector search: <300ms
- LLM generation: <3000ms
- **Total target: <4 seconds**

---

### AI Integration Details

**Model Selection:**
- **Primary use case:** [e.g., Text generation, classification, embedding]
- **Model choice:** [e.g., GPT-4o]
- **Why this model:** [e.g., Good balance of quality and cost, supports streaming]

**Prompt Strategy:**
- Template: [Describe your prompt structure]
- Context length: [e.g., Max 4000 tokens]
- Temperature: [e.g., 0.7 for creative, 0 for factual]
- Safety: [e.g., System prompt includes "do not provide medical advice"]

**Example Prompt:**
```
System: You are an expert assistant for [domain]. 
You help users by [specific task]. 
Always cite sources when using retrieved information.
Never provide [forbidden content].

Context from knowledge base:
{retrieved_chunks}

User question: {user_query}

Answer:
```

**Retrieval Strategy (if applicable):**
- Chunking: [e.g., 500 tokens with 50 token overlap]
- Embedding model: [e.g., text-embedding-3-small]
- Similarity metric: [e.g., cosine similarity]
- Top-k: [e.g., 5 most relevant chunks]
- Reranking: [Yes/No, and method]

---

### Third-Party Services & APIs

| Service | Purpose | Cost | Rate Limits |
|---------|---------|------|-------------|
| OpenAI API | Text generation | ~$0.03/1K tokens | 10K RPM tier 1 |
| [Service 2] | [Purpose] | [Cost] | [Limits] |
| [Service 3] | [Purpose] | [Cost] | [Limits] |

**API Keys & Secrets:**
- [ ] All keys stored in `.env` (not committed to git)
- [ ] `.env.example` provided for team members
- [ ] Keys rotated if accidentally exposed

---

## 5. Risk Assessment

### Technical Risks

**Risk #1: [e.g., API Rate Limits]**
- Likelihood: [High/Medium/Low]
- Impact: [High/Medium/Low]
- Mitigation:
  - [Strategy 1: e.g., Implement request queuing]
  - [Strategy 2: e.g., Add fallback to cached responses]
  - [Strategy 3: e.g., Monitor usage and alert at 80% threshold]

**Risk #2: [e.g., LLM Output Quality]**
- Likelihood: [High/Medium/Low]
- Impact: [High/Medium/Low]
- Mitigation:
  - [Strategy 1]
  - [Strategy 2]

**Risk #3: [e.g., Response Latency]**
- Likelihood: [High/Medium/Low]
- Impact: [High/Medium/Low]
- Mitigation:
  - [Strategy 1]
  - [Strategy 2]

---

### Product Risks

**Risk #1: [e.g., Users Don't Find It Useful]**
- Likelihood: [High/Medium/Low]
- Impact: [High/Medium/Low]
- Mitigation:
  - [Strategy 1: e.g., User interviews in Week 3]
  - [Strategy 2: e.g., Prototype testing before building full app]

**Risk #2: [e.g., Scope Creep]**
- Likelihood: [High/Medium/Low]
- Impact: [High/Medium/Low]
- Mitigation:
  - [Strategy 1: e.g., Strict feature freeze after Week 8]
  - [Strategy 2: e.g., Weekly scope reviews]

---

### Team Risks

**Risk #1: [e.g., Unequal Workload Distribution]**
- Likelihood: [High/Medium/Low]
- Impact: [High/Medium/Low]
- Mitigation:
  - [Strategy 1: e.g., Weekly standup with task review]
  - [Strategy 2: e.g., Track contributions in GitHub + peer evaluations]

**Risk #2: [e.g., Team Member Availability]**
- Likelihood: [High/Medium/Low]
- Impact: [High/Medium/Low]
- Mitigation:
  - [Strategy 1: e.g., Buffer time in schedule]
  - [Strategy 2: e.g., Cross-training on critical components]

---

### Safety & Ethical Risks

**Risk #1: [e.g., Prompt Injection Attacks]**
- Likelihood: [High/Medium/Low]
- Impact: [High/Medium/Low]
- Mitigation:
  - [Strategy 1: e.g., Input sanitization]
  - [Strategy 2: e.g., Separate user content from system prompts]

**Risk #2: [e.g., Bias in AI Outputs]**
- Likelihood: [High/Medium/Low]
- Impact: [High/Medium/Low]
- Mitigation:
  - [Strategy 1: e.g., Test with diverse user inputs]
  - [Strategy 2: e.g., Include disclaimer about AI limitations]

**Risk #3: [e.g., Privacy/Data Leakage]**
- Likelihood: [High/Medium/Low]
- Impact: [High/Medium/Low]
- Mitigation:
  - [Strategy 1: e.g., Don't store PII]
  - [Strategy 2: e.g., Anonymize all user data]

---

### Contingency Plans

**If our primary model is unavailable:**
- [Fallback plan, e.g., switch to GPT-3.5-turbo with degraded quality notice]

**If we can't recruit enough user testers:**
- [Alternative plan, e.g., synthetic evaluation with golden dataset]

**If we fall behind schedule:**
- [Plan to cut scope, e.g., drop features X and Y, focus on core flow]

---

## 6. Research Plan

### What We Need to Learn

**Technical Questions:**
1. [e.g., How do we implement streaming responses in FastAPI?]
   - Resources: [e.g., FastAPI docs, LangChain streaming examples]
   - Timeline: Week 3

2. [e.g., What's the best way to chunk documents for RAG?]
   - Resources: [e.g., LlamaIndex docs, research papers on RAG]
   - Timeline: Week 5

3. [e.g., How do we prevent prompt injection?]
   - Resources: [e.g., OWASP Top 10 for LLMs, prompt engineering guides]
   - Timeline: Week 6

**Product Questions:**
1. [e.g., Do users prefer concise or detailed responses?]
   - Method: [e.g., A/B test in Week 7]
   - Timeline: Week 7-8

2. [e.g., What error messages are most helpful?]
   - Method: [e.g., User observation during testing]
   - Timeline: Week 9

---

### Experiments & Prototypes

**Week 3-4: Proof of Concept**
- Goal: [e.g., Can we get a basic query → LLM → response working?]
- Success criteria: [e.g., End-to-end flow works with <5s latency]
- What we'll learn: [e.g., Basic API integration, prompt patterns]

**Week 5-6: Retrieval Integration**
- Goal: [e.g., Add RAG with citations]
- Success criteria: [e.g., Responses include relevant context 80% of time]
- What we'll learn: [e.g., Chunking strategies, embedding quality]

**Week 7-8: User Testing Round 1**
- Goal: [e.g., Get feedback on core flow]
- Success criteria: [e.g., 3+ users complete test tasks]
- What we'll learn: [e.g., UX pain points, feature priorities]

**Week 11-12: Evaluation & Optimization**
- Goal: [e.g., Reduce cost and latency]
- Success criteria: [e.g., Hit target <$0.10 per query, <3s latency]
- What we'll learn: [e.g., Caching strategies, prompt optimization]

---

### Literature & Resources

**Key Papers/Articles to Review:**
- [Paper 1 on RAG evaluation]
- [Blog post on prompt engineering]
- [Documentation on safety best practices]

**Tutorials/Examples to Follow:**
- [LangChain RAG tutorial]
- [OpenAI cookbook example on function calling]
- [FastAPI streaming example]

---

## 7. User Study Plan

### Research Ethics

**Do we need IRB approval?**
- [ ] Yes - we're collecting sensitive data or working with minors
- [ ] No - but we've completed the IRB Light Checklist (see `docs/irb-checklist.md`)

**Data we'll collect:**
- [Type of data, e.g., Task completion times, user feedback, screen recordings]
- [How long we'll store it, e.g., Until end of semester, then delete]
- [Who has access, e.g., Only team members]

**User consent:**
- [ ] We've adapted the course consent template
- [ ] Users can withdraw at any time
- [ ] We've explained data usage clearly

---

### Recruitment Plan

**Target participants:**
- Number: [e.g., 5-8 users per testing round]
- Criteria: [e.g., Must be students, no prior experience with similar tools]
- Where we'll find them: [e.g., CS department, study groups, social media]

**Compensation:**
- [e.g., Coffee gift card, pizza, acknowledgment in final presentation]

**Timeline:**
- Week 3-4: Recruit first batch (3-5 users)
- Week 7-8: User testing round 1
- Week 11-12: User testing round 2
- Week 14: Final feedback session

---

### Testing Protocol

**Session Structure (45-60 minutes):**

1. **Introduction (5 min)**
   - Explain study purpose
   - Get consent
   - Explain think-aloud protocol

2. **Background Questions (5 min)**
   - [Question about user's current workflow]
   - [Question about pain points]
   - [Question about expectations]

3. **Task 1: [Specific task] (10 min)**
   - Scenario: [e.g., "You need to find information about..."]
   - Success: [e.g., User completes task with AI assistant]
   - Observe: [e.g., Time, errors, confusion points]

4. **Task 2: [Specific task] (10 min)**
   - [Similar structure]

5. **Task 3: [Specific task] (10 min)**
   - [Similar structure]

6. **Post-Task Questions (10 min)**
   - What worked well?
   - What was confusing?
   - What would you change?
   - Would you use this? Why/why not?
   - Rate overall experience (1-5 scale)

7. **Wrap-up (5 min)**
   - Thank them
   - Provide compensation
   - Ask for follow-up permission

---

### Data Collection Methods

- [ ] Screen recording (with permission)
- [ ] Observer notes
- [ ] Task completion metrics (time, success rate)
- [ ] Post-session survey
- [ ] System logs (latency, errors, costs)

**Where data will be stored:**
- Raw notes/recordings: [e.g., Password-protected Google Drive folder]
- Analysis: [e.g., Anonymized summary in `docs/user-research/`]
- No identifiable data in public repo

---

### Analysis Plan

**Quantitative:**
- Task completion rate
- Average time per task
- Error rate
- User satisfaction scores

**Qualitative:**
- Thematic analysis of user feedback
- Identification of common pain points
- Prioritization of improvements

**Deliverables:**
- User research summary (Week 8, Week 12)
- Updated feature priority list
- Input for final case study

---

## 8. Project Timeline & Milestones

### Weekly Breakdown

| Week | Focus | Deliverables | Owner |
|------|-------|-------------|-------|
| 1 | Setup | Team formation, initial ideas | All |
| 2 | Planning | **This proposal**, team contract, dev environment | All |
| 3 | Core Flow | Basic query → LLM → response | [Name] |
| 4 | Design Review | Architecture diagrams, eval plan | All |
| 5 | Retrieval | RAG integration, Week 5 quiz | [Name] |
| 6 | Function Calling | Add tool use, structured outputs | [Name] |
| 7 | User Testing 1 | First user feedback round | All |
| 8 | Iteration | Implement feedback, optimize | All |
| 9 | **Midterm Exam** | Study week | All |
| 10 | Optimization | Caching, batching, cost reduction | [Name] |
| 11 | Safety Audit | Red teaming, bias testing | All |
| 12 | Evaluation | Golden set, regression tests | [Name] |
| 13 | Production | CI/CD, monitoring, portability | [Name] |
| 14 | Polish | User testing round 2, final fixes | All |
| 15 | **Final Demo** | Presentation, video, case study | All |

---

### Major Milestones

**✅ Milestone 1: Proposal (Week 2)** - YOU ARE HERE
- Submission: [Date]
- Points: 10

**🎯 Milestone 2: Design Review (Week 4)**
- Submission: [Date]
- Points: 5
- What's due: Updated architecture, evaluation plan, backlog, token usage plan

**🎯 Milestone 3: Safety & Evaluation Audit (Week 11)**
- Submission: [Date]
- Points: 3
- What's due: Red team results, bias checks, golden set, error taxonomy, telemetry plan

**🎯 Milestone 4: Final Demo (Week 15)**
- Submission: [Date]
- Points: 7
- What's due: Working product, CI/CD, public README, demo video, case study

---

### Dependency Map

**What must happen before what:**
- ⚠️ Basic API integration (Week 3) blocks RAG (Week 5)
- ⚠️ Core flow (Week 3) blocks user testing (Week 7)
- ⚠️ Evaluation plan (Week 4) blocks golden set creation (Week 11)
- ⚠️ Working product (Week 10) blocks user testing round 2 (Week 14)

---

### Backup Plan

**If we fall behind, we'll cut (in this order):**
1. [Secondary feature 1]
2. [Nice-to-have feature 2]
3. [Optimization work beyond basics]

**Core features we won't cut:**
- [Essential feature 1]
- [Essential feature 2]
- [Essential feature 3]

---

## 9. Budget & Resources

### Cost Estimates

**AI API Costs:**
- Development & testing: [e.g., $50/month × 3 months = $150]
- User testing: [e.g., $30 for ~300 test sessions]
- Safety margin: [e.g., $50]
- **Total AI costs: ~$230**

**Other Services:**
- [e.g., Vector DB hosting: $0 (free tier)]
- [e.g., App hosting: $0 (free tier)]
- [e.g., Domain name: $0 (use .vercel.app or .netlify.app)]

**User compensation:**
- [e.g., 8 users × $10 gift card = $80]

**TOTAL PROJECT COST: ~$310**

**Who pays:**
- [e.g., Split equally: ~$103 per team member]
- OR [e.g., Apply for course/department funding]

---

### Resource Constraints

**Time:**
- Total: ~15 weeks
- Accounting for midterms, finals: ~12 effective weeks
- Team capacity: [X] hours/week × [Y] team members = [Z] total hours

**Compute:**
- Development machines: [e.g., Laptops sufficient for most work]
- GPU needs: [e.g., None - using cloud APIs]
- Storage: [e.g., <1GB for database, fits free tier]

**Access:**
- API keys: [e.g., Each team member has own OpenAI account]
- Shared resources: [e.g., Team account for vector DB]

---

## 10. Appendix

### Team Contract Summary

[Brief 1-2 sentence summary linking to full contract]
See [docs/team-contract.md](./team-contract.md) for full details.

---

### References

[List any papers, articles, or resources you referenced in this proposal]

1. [Reference 1]
2. [Reference 2]
3. [Reference 3]

---

### Revision History

| Date | Author | Changes |
|------|--------|---------|
| [Date] | [Name] | Initial draft |
| [Date] | [Name] | Added architecture diagram |
| [Date] | All | Final review and approval |

---

## Instructor Use Only

**Grade: _____ / 10**

| Component | Points | Feedback |
|-----------|--------|----------|
| Problem Clarity | __/2 | |
| Technical Feasibility | __/2 | |
| Success Criteria | __/1 | |
| Risk Assessment | __/1 | |
| Research & User Plan | __/1.5 | |
| Team Contract | __/1.5 | |
| Presentation Quality | __/1 | |

**Overall Feedback:**