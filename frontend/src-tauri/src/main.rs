#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ai::RubbyAI;
use tauri::State;
use tokio::sync::Mutex;

struct AppState {
    ai: Mutex<Option<RubbyAI>>,
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

fn main() {
    tauri::Builder::default()
        .manage(AppState { ai: Mutex::new(None) })
        .invoke_handler(tauri::generate_handler![run_chat_command])
        .run(tauri::generate_context!())
        .expect("error while running Tauri app");
}
