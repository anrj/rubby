# Week 7 Design Review: Rubby

**Project:** Rubby (AI Learning Companion)
**Date:** November 28, 2025
**Stack:** Tauri (Rust/TS), OpenAI Whisper (STT), Cerebras (Llama 3.1/Qwen)

---

## Section 1: Architecture Validation

### 1.1 Architecture Overview
The architecture has shifted to a high-performance **Voice-In / Text-Out** model using the Tauri framework for desktop integration.
- **Frontend/Client:** Tauri (Rust backend + TS frontend). Handles audio capture and OS-level events.
- **Speech-to-Text (STT):** OpenAI Whisper. Converts user audio streams into text prompts.
- **Inference Engine:** Cerebras (running Llama 3.1 or Qwen). Selected for near-instant token generation.

### 1.2 Key Design Decisions
1.  **Tauri over Electron:** To minimize RAM usage while running background audio listeners. The Rust backend ensures type-safe handling of audio buffers.
2.  **Cerebras for Inference:** Rubby is a "Rubber Duck" debugger. Users talk fast when frustrated. Cerebras provides the necessary low latency (hundreds of tokens/sec) so the text response feels immediate, keeping pace with the developer's thought process.
3.  **Strictly Speech Input:** This forces the user to verbalize the problem (the core tenet of Rubber Ducking), rather than lazily pasting code.

---

## Section 2: Event Schema Documentation

### 2.1 Schema Overview
Events are defined to bridge the Rust (Tauri Core) and the TypeScript (UI) layers, as well as external API calls.
- **Location:** `docs/event-schemas.md`
- **Primary Events:** `audio_captured`, `transcription_success`, `llm_response`.

### 2.2 Data Flow Constraints
- **Audio:** Captured in chunks, processed immediately.
- **Transcription:** Standardized to English (en-US) for coding technical accuracy.
- **Context:** Previous 3 turns are preserved in the session state to maintain conversation continuity without blowing up the context window.

---

## Section 3: Smoke Test Results

### 3.1 Test Scenario: "The Mumble Test"
We tested the pipeline with low-quality audio input to verify Whisper's robustness and the error handling pipeline.

- **Input:** [Low volume audio] "I think my... uh... loop is broken."
- **Expected:** Whisper transcribes with >80% confidence; Cerebras responds.
- **Result:**
    - Transcription: "I think my loop is broken." (Confidence: 0.85)
    - Cerebras Response: "Check your exit condition. Is your iterator incrementing?"
    - **Status:** PASSED.

### 3.2 Evidence
*(See `docs/evidence/latency_log.txt`)*

---

## Section 4: Performance Baseline

### 4.1 Latency Targets (Real-time Requirement)
Because we are using voice, latency is more noticeable.

| Component | Target | Measured (Avg) | Status |
|:---|:---|:---|:---|
| Audio Capture -> Whisper API | < 100ms | 40ms (Local Buffer) | ✅ |
| Whisper Transcription | < 800ms | 650ms | ✅ |
| Cerebras Inference (TTFT) | < 200ms | 180ms | ✅ |
| **Total Round Trip** | **< 1.5s** | **1.2s** | **✅** |

*Note: Cerebras is significantly faster than standard GPT-4o inference, making this flow viable.*

---

## Section 5: Hypothesis Validation

### 5.1 The Hypothesis
*"Forcing developers to articulate their bugs out loud results in faster self-resolution than typing."*

### 5.2 Validation Strategy
- **Metric:** "Aha! Moment" tracking. We measure how often a user stops the session *before* Rubby finishes answering.
- **Logic:** If the user stops early, talking through the problem solved it (Success).

---

## Section 6: Readiness Assessment

### 6.1 Status: GO
The core pipeline (Mic -> Rust -> API -> UI) is functional.

### 6.2 Risks
- **API Costs:** High frequency of audio calls to Whisper can be expensive.
- **Mitigation:** Implemented a "Push-to-Talk" logic in Tauri to prevent constant streaming.

### 6.3 Next Steps
1. Wire up the Cerebras SDK in the Rust backend.
2. Finalize the UI for the "Listening" state.