# Grading Checklist - Week 6 & 7 Combined Homework
## Some parts have been altered please review manually

**Team Name:** Promptstitutes
**Project Title:** Rubby: The AI Rubber Duck (Tauri/Rust)
**Submission Date:** November 28, 2025
**Team Members:** Anri Javakhishvili, Nikoloz Tukhashvili, Giorgi Gogichashvili, Davit Kutateladze

## Part A: Week 6 - Function Calling (Modified Status)

### ⚠️ Implementation Status: DEFERRED
**Function Calling is NOT being utilized in the current sprint.**
Due to the architectural pivot to a **Voice-In / Text-Out** latency-focused pipeline (using Cerebras), we have deferred tool usage to Week 8.

- [x] **Status Explanation:** `docs/week6-implementation-status.md` - [Direct link](./docs/week6/implementation-status.md)
- [x] **Rationale:** The document above explains why we prioritized inference speed (Cerebras) and Audio processing (Rust) over tool use for this specific milestone.

*(The standard Pydantic/Function definitions section has been removed as it is not applicable to the current architecture.)*

### Tests & Demo (Adapted)
- [x] **Demo Video:** [Video link](https://drive.google.com/file/d/1KwHBV3IxEoU6y9rtYG5SYKwpDAgrMzYW/view)
- [x] **Demo Scope:** Video demonstrates the **Week 7 Architecture** (Voice capture -> Whisper -> Cerebras -> UI) instead of Function Calling.

### Documentation & Code Quality
- [] README updated with Week 6/7 section: [Direct link to README](./README.md)
^ From my experience updating readme similarly would would not be the best practise and even distasteful as it would clutter the short introduction about the project. All necessary important additions will be included by the end.
- [x] No hard-coded API keys: ✅ Confirmed (Using `.env`)
- [x] Codebase Cleanliness: ✅ Rust/Tauri backend is structured and typed.

### Evaluation & Safety Logs (Required)
Located in: `course-pack/labs/lab-6/`
- [x] `evaluation_notes.md` (Model logic evaluation): [Direct link](./docs/week6/evaluation_notes.md)
- [x] `safety_checklist.md` (Prompt Injection checks): [Direct link](./docs/week6/safety_checklist.md)
- [x] `ai_use_log.md` (Prompts used for Whisper/Cerebras): [Direct link](./docs/week6/ai_use_log.md)
- [x] `capstone_link.md`: [Direct link](./docs/week7/capstone_link.md)

---

## Part B: Week 7 - Design Review (5 points)

### Main Documents
- [x] Design Review Document: `docs/design-review-week7.md` - [Direct link](./docs/design-review-week7.md)
- [x] Event Schemas: `docs/event-schemas.md` - [Direct link](./docs/event-schemas.md)
- [ ] Updated Architecture Diagram: `docs/architecture-week7.mermaid` - [Direct link](./docs/architecture-week7.mermaid)
^^^ A better clear architecture diagram will be provided by the end.


### Design Review Sections Completed
- [x] Section 1: Architecture Validation (Voice-First/Cerebras Logic)
- [x] Section 2: Event Schema Documentation (Rust Structs & JSON)
- [x] Section 3: Smoke Test Results (Latency & Transcription checks)
- [x] Section 4: Performance Baseline (TTFT & Round Trip metrics)
- [x] Section 5: Hypothesis Validation (Socratic Method)
- [x] Section 6: Readiness Assessment (Go/No-Go)

### Evidence Folder
- [x] Evidence folder exists at: `docs/evidence/`
- [ ] Contains: `latency_log.txt` (Performance data)