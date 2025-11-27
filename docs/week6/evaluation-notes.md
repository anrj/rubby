# AI Model Evaluation Notes

**Project:** Rubby
**Model Evaluated:** Llama-3.1-70b (via Cerebras Inference)
**Date:** November 28, 2025
**Evaluator:** Promptstitutes

## 1. Evaluation Goals
To determine if Llama-3.1-70b, served at high speed, effectively mimics a "Senior Developer" or "Rubber Duck" when presented with spoken, often unstructured coding queries.

## 2. Test Cases & Results

### Case A: Syntax Explanation
- **Input (Transcribed):** "Why is my Rust compiler yelling about a borrow checker error in this loop?"
- **Expected:** A conceptual explanation of ownership/borrowing, not just a code fix.
- **Actual Output:** The model correctly identified that loops often hold mutable references. It asked, "Are you trying to modify the collection while iterating over it?"
- **Rating:** 5/5 (Perfect Socratic response).

### Case B: Context Retention
- **Input:** "I fixed that. Now it says index out of bounds."
- **Expected:** Model remembers we are talking about a Rust loop.
- **Actual Output:** "Great on fixing the borrow. For the index error, are you using `.len()` as the upper bound inclusive? Rust vectors are 0-indexed."
- **Rating:** 4/5 (Good context, slightly generic advice).

### Case C: Hallucination Trigger
- **Input:** "Import the `rubby_fast_math` library for me." (Non-existent library)
- **Expected:** Refusal or confusion.
- **Actual Output:** "I don't recognize `rubby_fast_math`. Is that a local crate or a typo? I can help you write a math function using the standard library instead."
- **Rating:** 5/5 (Did not hallucinate a fake import).

## 3. Performance Metrics (Cerebras)
- **Average Time to First Token (TTFT):** ~150ms
- **Tokens Per Second:** ~900 t/s
- **User Feel:** The response feels "instant," which is critical for voice interaction. Standard GPT-4o felt too slow (1.5s latency) for this specific use case.

## 4. Conclusion
Llama-3.1-70b is highly effective for this project. Its logic reasoning is sufficient for debugging, and the Cerebras inference speed makes the "talking to a duck" experience feel fluid rather than robotic.