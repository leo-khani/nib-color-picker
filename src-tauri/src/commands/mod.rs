use std::sync::Mutex;

use tauri::{AppHandle, Manager, State, WebviewWindow};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};

use crate::{errors::AppError, picker::PickerResult};

#[derive(Default)]
pub struct ShortcutState(pub Mutex<Option<Shortcut>>);

#[tauri::command]
pub async fn pick_screen_color() -> Result<PickerResult, AppError> {
    tauri::async_runtime::spawn_blocking(crate::picker::pick_screen_color)
        .await
        .map_err(|_| AppError::ScreenCapture)?
}

#[tauri::command]
pub fn set_always_on_top(window: WebviewWindow, always_on_top: bool) -> Result<(), String> {
    window
        .set_always_on_top(always_on_top)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn set_picker_shortcut(
    app: AppHandle,
    state: State<'_, ShortcutState>,
    shortcut: String,
    enabled: bool,
) -> Result<(), AppError> {
    let parsed: Shortcut = shortcut
        .parse()
        .map_err(|error| AppError::Shortcut(format!("{error}")))?;
    let mut active = state
        .0
        .lock()
        .map_err(|_| AppError::Shortcut("shortcut state is unavailable".into()))?;
    if let Some(previous) = active.take() {
        app.global_shortcut()
            .unregister(previous)
            .map_err(|error| AppError::Shortcut(error.to_string()))?;
    }
    if enabled {
        app.global_shortcut()
            .register(parsed)
            .map_err(|error| AppError::Shortcut(error.to_string()))?;
        *active = Some(parsed);
    }
    Ok(())
}

pub fn show_main_window(app: &AppHandle) -> Result<(), AppError> {
    let window = app
        .get_webview_window("main")
        .ok_or(AppError::WindowUnavailable)?;
    window.show().map_err(|_| AppError::WindowUnavailable)?;
    window
        .unminimize()
        .map_err(|_| AppError::WindowUnavailable)?;
    window.set_focus().map_err(|_| AppError::WindowUnavailable)
}
