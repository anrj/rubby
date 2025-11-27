# Week 6: Function Calling Implementation Status

**Project:** Rubby
**Date:** November 28, 2025
**Status:** Deferred / Architecture Dependent

## 1. Current Implementation State
As of the Week 7 Design Review, the **Rubby** project utilizes a linear **Voice-to-Text-to-Insight** pipeline. The current architecture focuses on latency optimization using **Cerebras** (Hardware-accelerated inference) and **OpenAI Whisper**.

**Decision:**
Function Calling (Tool Use) has been **deferred** for the current sprint. The system relies on **Context Injection** (passing conversation history directly) rather than **Tool Execution** (letting the LLM query external APIs).

## 2. Rationale for Deferral
1.  **Latency Constraints:** The primary goal of Rubby is real-time "Rubber Ducking." Adding a function calling loop (LLM -> Stop -> Tool -> LLM -> Response) adds significant round-trip time, potentially breaking the conversational flow.
2.  **Scope Focus:** The current focus is ensuring the Rust (Tauri) backend correctly handles audio streams and integrates with the Cerebras SDK.
3.  **Security:** Giving the LLM access to the user's file system (a planned feature) requires strict sandboxing which is currently in the design phase.

## 3. Future Implementation Plan
Function calling will be introduced in the **"Context Awareness"** phase (Week 8+).

| Planned Function | Description | Implementation Strategy |
|:---|:---|:---|
| `get_editor_context()` | Allows Rubby to read the currently highlighted code in VS Code. | Will use Tauri's IPC to query the active window state. |
| `save_session_log()` | Saves the current debugging session to a markdown file. | Will use Rust `fs` modules exposed via schema to the LLM. |

## 4. Grading Note
Please refer to `docs/design-review-week7.md` for the full architectural context. The AI Safety logs (`safety_checklist.md`) and Evaluation notes (`evaluation_notes.md`) included in this submission apply to the standard text generation capabilities of the model.