#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ai::RubbyAI;
use tauri::{State, Window};
use tokio::sync::Mutex;

mod groq;
use groq::transcribe_audio;

pub struct AppState {
    ai: Mutex<Option<RubbyAI>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            ai: Mutex::new(None),
        }
    }
}

#[tauri::command]
async fn run_chat_command(prompt: String, state: State<'_, AppState>) -> Result<String, String> {
    let mut ai_guard = state.ai.lock().await;

    if ai_guard.is_none() {
        *ai_guard = Some(RubbyAI::new().map_err(|e| e.to_string())?);
    }

    if let Some(ai) = ai_guard.as_mut() {
        ai.chat(&prompt).await.map_err(|e| e.to_string())
    } else {
        Err("AI not initialized".to_string())
    }
}

#[tauri::command]
fn start_window_drag(window: Window) -> Result<(), String> {
    window.start_dragging().map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenvy::dotenv().ok();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::new())
        .setup(|_app| Ok(()))
        .invoke_handler(tauri::generate_handler![
            run_chat_command,
            start_window_drag,
            transcribe_audio
        ])
        .run(tauri::generate_context!())
        .expect("error while running Tauri app");
}
