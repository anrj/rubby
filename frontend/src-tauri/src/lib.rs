// use tauri::Window;
// mod groq;
// use groq::transcribe_audio;

// #[tauri::command]
// fn start_window_drag(window: Window) -> Result<(), String> {
//     window.start_dragging().map_err(|e| e.to_string())
// }

// #[cfg_attr(mobile, tauri::mobile_entry_point)]
// pub fn run() {
//     tauri::Builder::default()
//         .plugin(tauri_plugin_opener::init())
//         .setup(|_app| {
//             Ok(())
//         })
//         .invoke_handler(tauri::generate_handler![start_window_drag, transcribe_audio])
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }
