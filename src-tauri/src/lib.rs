mod commands;
mod errors;
mod picker;
mod tray;

use tauri::{Emitter, Manager, RunEvent, WindowEvent};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

pub fn run() {
    let builder = tauri::Builder::default()
        .manage(commands::ShortcutState::default())
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            let _ = commands::show_main_window(app);
        }))
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--minimized"]),
        ))
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        let _ = app.emit("picker-requested", ());
                    }
                })
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            commands::pick_screen_color,
            commands::set_always_on_top,
            commands::set_picker_shortcut
        ])
        .setup(|app| {
            tray::create(app)?;
            let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyC);
            if app.global_shortcut().register(shortcut).is_ok() {
                if let Ok(mut state) = app.state::<commands::ShortcutState>().0.lock() {
                    *state = Some(shortcut);
                }
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("Nib Color Picker could not start");

    builder.run(|app, event| {
        if let RunEvent::WindowEvent {
            label,
            event: WindowEvent::CloseRequested { api, .. },
            ..
        } = event
        {
            if label == "main" {
                api.prevent_close();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            }
        }
    });
}
