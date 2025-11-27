# Event Schema Design: Rubby

## 1. Overview
This document defines the event schemas for the Rubby AI learning companion.
**Architecture Change:** Rubby operates on a **Text-In / Text-Out** basis. The AI responses are strictly constrained to be concise (micro-learning).

**Core Principles:**
- **Constraint:** AI responses are limited in length to ensure "small," digestible feedback.
- **Tracing:** `correlation_id` links user inputs to Rubby's answers.

---

## 2. Event Catalog

| Event Name | Type | Source (Tauri) | Payload | Description |
|:---|:---|:---|:---|:---|
| **Voice Command** | `rubby.input.voice` | Rust Core | `AudioBuffer` | Raw audio data from microphone. |
| **Transcription** | `rubby.process.transcription` | STT Service | `String` | Text result from Whisper. |
| **AI Insight** | `rubby.core.response` | Cerebras | `String` | The generated advice. |

## 3. JSON Schemas

### 3.1 Transcription Success (`rubby.process.transcription`)
Emitted by the Rust backend to the Frontend when Whisper returns text.

```json
{
  "type": "object",
  "properties": {
    "event_type": { "const": "rubby.process.transcription" },
    "session_id": { "type": "string", "format": "uuid" },
    "text_content": { "type": "string" },
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
    "duration_ms": { "type": "integer" }
  },
  "required": ["event_type", "text_content", "confidence"]
}
```

### 2.2 AI Insight (rubby.core.response)
The response from Cerebras (Llama/Qwen).

```json    
{
  "type": "object",
  "properties": {
    "event_type": { "const": "rubby.core.response" },
    "trigger_event_id": { "type": "string", "description": "Links to the transcription ID" },
    "model_used": { "type": "string", "enum": ["llama3.1-70b", "qwen-72b"] },
    "content": { "type": "string", "description": "Markdown formatted text" },
    "tokens_per_second": { "type": "number", "description": "Performance metric for logging" }
  },
  "required": ["event_type", "content", "model_used"]
}
```