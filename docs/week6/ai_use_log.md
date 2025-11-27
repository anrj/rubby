# AI Interaction Log

**Project:** Rubby
**Period:** Week 5 - Week 7

This log tracks the prompts used to develop the system and test the integration between Whisper (STT) and Cerebras (LLM).

## Session 1: Testing Whisper Integration
**Date:** 2025-11-20
**Goal:** Verify Rust audio buffer is correctly interpreted by OpenAI Whisper.

| Input (Audio Source) | Transcribed Output | Accuracy |
|:---|:---|:---|
| "Hello world testing one two." | "Hello world testing one two." | 100% |
| "Initialize the variable with null." | "Initialize the variable with null." | 100% |
| (Background Noise) + "Fix the loop." | "Fix the loop." | 100% |

## Session 2: Prompt Engineering for "Rubber Duck" Persona
**Date:** 2025-11-25
**Model:** Llama-3.1-70b (Cerebras)
**Goal:** Prevent the AI from just writing the code immediately. We want it to teach, not solve.

| System Prompt Iteration | User Prompt | Result | Verdict |
|:---|:---|:---|:---|
| "You are a coding assistant." | "My div is not centering." | Generated 20 lines of CSS flexbox code. | ❌ Too helpful. |
| "You are a Socratic tutor. Don't give answers." | "My div is not centering." | "Why do you think it is not centering? What have you tried?" | ✅ Better. |
| **Final:** "You are Rubby, a Rubber Duck. Be concise. Ask one guiding question at a time." | "My div is not centering." | "Have you checked if the parent container has a defined height?" | ⭐ Perfect. |

## Session 3: Latency & Stress Testing
**Date:** 2025-11-27
**Infrastructure:** Tauri App -> Rust Reqwest -> Cerebras API

- **Prompt:** "Explain the difference between TCP and UDP in one sentence."
- **Model:** Llama-3.1-8b (Testing smaller model for speed)
- **Result:** Response generated in 0.2 seconds. "TCP is reliable and connection-oriented, while UDP is faster but connectionless."
- **Decision:** The 70b model is fast enough on Cerebras, so we will use 70b for better intelligence.

## Session 4: Week 6 Function Calling Feasibility
**Date:** 2025-11-28
- **Test:** Asked Llama-3.1 to format a JSON object for a hypothetical `save_file` tool.
- **Result:** Model correctly formatted the JSON.
- **Decision:** Technical capability is there, but implementation deferred to Week 8 to prioritize voice latency stability.