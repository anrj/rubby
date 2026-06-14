use base64::{engine::general_purpose::STANDARD, Engine as _};
use reqwest;
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Serialize, Deserialize)]
struct TranscriptionResponse {
    text: String,
}

/// Groq's Whisper endpoint rejects files larger than 25 MB. Reject oversized or
/// empty payloads up front so a malicious/buggy caller can't bloat IPC or rack
/// up API usage with junk requests.
const MAX_AUDIO_BYTES: usize = 25 * 1024 * 1024;

#[tauri::command]
pub async fn transcribe_audio(audio_base64: String) -> Result<String, String> {
    // Audio crosses the IPC boundary base64-encoded (~1.33x raw) rather than as a
    // JSON array of bytes (~4x raw), which keeps the payload small.
    let audio_data = STANDARD
        .decode(audio_base64.as_bytes())
        .map_err(|e| format!("Invalid audio encoding: {}", e))?;

    if audio_data.is_empty() {
        return Err("No audio data received".to_string());
    }
    if audio_data.len() > MAX_AUDIO_BYTES {
        return Err(format!(
            "Audio too large: {} bytes (max {} bytes)",
            audio_data.len(),
            MAX_AUDIO_BYTES
        ));
    }

    let api_key = env::var("GROQ_API_KEY")
        .map_err(|_| "GROQ_API_KEY environment variable not set".to_string())?;

    let client = reqwest::Client::new();
    
    let form = reqwest::multipart::Form::new()
        .text("model", "whisper-large-v3-turbo")
        .text("language", "en")
        .part(
            "file",
            reqwest::multipart::Part::bytes(audio_data)
                .file_name("recording.webm")
                .mime_str("audio/webm")
                .map_err(|e| e.to_string())?,
        );

    let response = client
        .post("https://api.groq.com/openai/v1/audio/transcriptions")
        .header("Authorization", format!("Bearer {}", api_key))
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("API error: {}", error_text));
    }

    let transcription: TranscriptionResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    Ok(transcription.text)
}