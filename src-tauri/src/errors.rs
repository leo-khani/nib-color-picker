use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Color picking was cancelled.")]
    PickerCancelled,
    #[error("Windows could not sample the selected screen pixel.")]
    ScreenCapture,
    #[error("Windows could not create the color picker indicator.")]
    PickerOverlay,
    #[error("The global shortcut could not be registered: {0}")]
    Shortcut(String),
    #[error("The application window is unavailable.")]
    WindowUnavailable,
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
