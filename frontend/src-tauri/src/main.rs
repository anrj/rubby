#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ai::run_chat;
use serde_json::Value;

#[tauri::command]
async fn run_chat_command(prompt: &str) -> Result<Value, String> {
    run_chat(prompt)
        .await
        .map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![run_chat_command])
        .run(tauri::generate_context!())
        .expect("error while running Tauri app");
}
