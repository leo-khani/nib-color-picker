use serde::Serialize;

use crate::errors::AppError;

#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RgbaColor {
    r: u8,
    g: u8,
    b: u8,
    a: f32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PickerResult {
    color: RgbaColor,
    x: i32,
    y: i32,
}

#[cfg(target_os = "windows")]
pub fn pick_screen_color() -> Result<PickerResult, AppError> {
    use std::{thread, time::Duration};
    use windows::Win32::{
        Foundation::{COLORREF, POINT},
        Graphics::Gdi::{GetDC, GetPixel, ReleaseDC, CLR_INVALID},
        UI::Input::KeyboardAndMouse::{GetAsyncKeyState, VK_ESCAPE, VK_LBUTTON, VK_RBUTTON},
        UI::WindowsAndMessaging::GetCursorPos,
    };

    let mut left_was_down = false;
    loop {
        let escape_down = unsafe { GetAsyncKeyState(VK_ESCAPE.0.into()) } < 0;
        let right_down = unsafe { GetAsyncKeyState(VK_RBUTTON.0.into()) } < 0;
        if escape_down || right_down {
            return Err(AppError::PickerCancelled);
        }

        let left_down = unsafe { GetAsyncKeyState(VK_LBUTTON.0.into()) } < 0;
        if left_down && !left_was_down {
            let mut point = POINT::default();
            unsafe { GetCursorPos(&mut point) }.map_err(|_| AppError::ScreenCapture)?;
            let dc = unsafe { GetDC(None) };
            if dc.is_invalid() {
                return Err(AppError::ScreenCapture);
            }
            let pixel = unsafe { GetPixel(dc, point.x, point.y) };
            unsafe { ReleaseDC(None, dc) };
            if pixel == COLORREF(CLR_INVALID) {
                return Err(AppError::ScreenCapture);
            }
            return Ok(PickerResult {
                color: RgbaColor {
                    r: (pixel.0 & 0xff) as u8,
                    g: ((pixel.0 >> 8) & 0xff) as u8,
                    b: ((pixel.0 >> 16) & 0xff) as u8,
                    a: 1.0,
                },
                x: point.x,
                y: point.y,
            });
        }
        left_was_down = left_down;
        thread::sleep(Duration::from_millis(8));
    }
}

#[cfg(not(target_os = "windows"))]
pub fn pick_screen_color() -> Result<PickerResult, AppError> {
    Err(AppError::ScreenCapture)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn picker_result_serializes_with_frontend_field_names() {
        let result = PickerResult {
            color: RgbaColor {
                r: 1,
                g: 2,
                b: 3,
                a: 1.0,
            },
            x: -100,
            y: 50,
        };
        let value = serde_json::to_value(result).expect("picker result should serialize");
        assert_eq!(value["color"]["r"], 1);
        assert_eq!(value["x"], -100);
    }
}
