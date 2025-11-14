use tauri::{Manager, Window};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use mouse_position::mouse_position::Mouse;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
struct DuckBounds {
    x: f64,
    y: f64,
    width: f64,
    height: f64,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
struct HitMaskData {
    width: usize,
    height: usize,
    // Flattened 2D boolean array: mask[y * width + x]
    data: Vec<bool>,
}



#[tauri::command]
fn start_window_drag(window: Window) -> Result<(), String> {
    window.start_dragging().map_err(|e| e.to_string())
}

#[tauri::command]
fn start_click_through_monitor(
    window: Window,
    duck_bounds: DuckBounds,
    hit_mask: Option<HitMaskData>,
) -> Result<(), String> {
    let window = Arc::new(window);
    let duck_bounds = Arc::new(Mutex::new(duck_bounds));
    let hit_mask = Arc::new(Mutex::new(hit_mask));

    // Spawn a background thread to monitor cursor position
    thread::spawn(move || {
        let mut last_state = true; // Start with click-through enabled

        loop {
            thread::sleep(Duration::from_millis(16)); // ~60fps

            // Get global cursor position
            let cursor_pos = match Mouse::get_mouse_position() {
                Mouse::Position { x, y } => (x, y),
                Mouse::Error => continue,
            };

            // Get window position
            let window_pos = match window.outer_position() {
                Ok(pos) => pos,
                Err(_) => continue,
            };

            // Calculate cursor position relative to window
            let relative_x = cursor_pos.0 - window_pos.x;
            let relative_y = cursor_pos.1 - window_pos.y;

            let bounds = duck_bounds.lock().unwrap();

            // First check if cursor is within duck's bounding box
            let is_in_bounds = relative_x >= bounds.x as i32
                && relative_x <= (bounds.x + bounds.width) as i32
                && relative_y >= bounds.y as i32
                && relative_y <= (bounds.y + bounds.height) as i32;

            let should_ignore = if is_in_bounds {
                // If we have a hit mask, do pixel-perfect detection
                let mask_guard = hit_mask.lock().unwrap();
                if let Some(mask) = mask_guard.as_ref() {
                    // Convert relative position to duck-local coordinates
                    let duck_local_x = relative_x - bounds.x as i32;
                    let duck_local_y = relative_y - bounds.y as i32;

                    // Scale to mask coordinates
                    let mask_x = ((duck_local_x as f64 / bounds.width) * mask.width as f64) as usize;
                    let mask_y = ((duck_local_y as f64 / bounds.height) * mask.height as f64) as usize;

                    // Check bounds and hit mask
                    if mask_y < mask.height && mask_x < mask.width {
                        let index = mask_y * mask.width + mask_x;
                        if index < mask.data.len() {
                            // If pixel is opaque, DON'T ignore cursor (disable click-through)
                            // If pixel is transparent, ignore cursor (enable click-through)
                            !mask.data[index]
                        } else {
                            true // Out of bounds, enable click-through
                        }
                    } else {
                        true // Out of bounds, enable click-through
                    }
                } else {
                    // No hit mask, use simple bounding box
                    false // In bounds, disable click-through
                }
            } else {
                // Outside bounds, enable click-through
                true
            };

            // Only update if state changed to avoid unnecessary calls
            if should_ignore != last_state {
                let _ = window.set_ignore_cursor_events(should_ignore);
                last_state = should_ignore;
            }
        }
    });

    Ok(())
}

#[tauri::command]
fn update_duck_bounds(_window: Window, duck_bounds: DuckBounds) -> Result<(), String> {
    // This command allows the frontend to update duck bounds dynamically
    // (e.g., when animations change the duck's position or size)
    println!("Duck bounds updated: {:?}", duck_bounds);
    Ok(())
}

#[tauri::command]
fn set_hit_mask(_window: Window, hit_mask: HitMaskData) -> Result<(), String> {
    // Hit mask is now passed directly to start_click_through_monitor
    // This command can be used to update the mask during sprite animations
    println!("Hit mask received: {}x{} pixels, {} data points",
             hit_mask.width, hit_mask.height, hit_mask.data.len());

    // In future: implement dynamic mask updates for animations
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            // Start with click-through enabled (transparent areas pass through)
            window.set_ignore_cursor_events(true).ok();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            start_window_drag,
            start_click_through_monitor,
            update_duck_bounds,
            set_hit_mask
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
