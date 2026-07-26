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

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct ScreenBounds {
    left: i32,
    top: i32,
    right: i32,
    bottom: i32,
}

const INDICATOR_WIDTH: i32 = 106;
const INDICATOR_HEIGHT: i32 = 36;
const CURSOR_GAP: i32 = 14;

fn indicator_position(cursor_x: i32, cursor_y: i32, bounds: ScreenBounds) -> (i32, i32) {
    let preferred_x = cursor_x - INDICATOR_WIDTH / 2;
    let preferred_y = cursor_y + CURSOR_GAP;
    let y = if preferred_y + INDICATOR_HEIGHT > bounds.bottom {
        cursor_y - CURSOR_GAP - INDICATOR_HEIGHT
    } else {
        preferred_y
    };

    (
        preferred_x.clamp(bounds.left, bounds.right - INDICATOR_WIDTH),
        y.clamp(bounds.top, bounds.bottom - INDICATOR_HEIGHT),
    )
}

#[cfg(target_os = "windows")]
mod windows_picker {
    use std::{thread, time::Duration};

    use windows::{
        core::w,
        Win32::{
            Foundation::{COLORREF, HWND, POINT, RECT},
            Graphics::Gdi::{
                CreateRoundRectRgn, CreateSolidBrush, DeleteObject, DrawTextW, FillRgn, GetDC,
                GetMonitorInfoW, GetPixel, MonitorFromPoint, ReleaseDC, SetBkMode, SetTextColor,
                SetWindowRgn, CLR_INVALID, DT_CENTER, DT_SINGLELINE, DT_VCENTER, HGDIOBJ,
                MONITORINFO, MONITOR_DEFAULTTONEAREST, TRANSPARENT,
            },
            UI::{
                Input::KeyboardAndMouse::{GetAsyncKeyState, VK_ESCAPE, VK_LBUTTON, VK_RBUTTON},
                WindowsAndMessaging::{
                    CreateWindowExW, DestroyWindow, GetCursorPos, SetWindowPos, HWND_TOPMOST,
                    SWP_NOACTIVATE, SWP_SHOWWINDOW, WINDOW_EX_STYLE, WS_EX_NOACTIVATE,
                    WS_EX_TOOLWINDOW, WS_EX_TOPMOST, WS_EX_TRANSPARENT, WS_POPUP,
                },
            },
        },
    };

    use super::{
        indicator_position, AppError, PickerResult, RgbaColor, ScreenBounds, INDICATOR_HEIGHT,
        INDICATOR_WIDTH,
    };

    struct ColorIndicator {
        window: HWND,
    }

    impl ColorIndicator {
        fn create() -> Result<Self, AppError> {
            let window = unsafe {
                CreateWindowExW(
                    WINDOW_EX_STYLE(
                        WS_EX_TOOLWINDOW.0
                            | WS_EX_TOPMOST.0
                            | WS_EX_NOACTIVATE.0
                            | WS_EX_TRANSPARENT.0,
                    ),
                    w!("STATIC"),
                    w!(""),
                    WS_POPUP,
                    0,
                    0,
                    INDICATOR_WIDTH,
                    INDICATOR_HEIGHT,
                    None,
                    None,
                    None,
                    None,
                )
            }
            .map_err(|_| AppError::PickerOverlay)?;
            let region = unsafe {
                CreateRoundRectRgn(0, 0, INDICATOR_WIDTH + 1, INDICATOR_HEIGHT + 1, 24, 24)
            };
            if unsafe { SetWindowRgn(window, Some(region), true) } == 0 {
                let _ = unsafe { DeleteObject(HGDIOBJ(region.0)) };
                let _ = unsafe { DestroyWindow(window) };
                return Err(AppError::PickerOverlay);
            }
            Ok(Self { window })
        }

        fn update(&self, point: POINT, pixel: COLORREF) -> Result<(), AppError> {
            let bounds = monitor_bounds(point)?;
            let (x, y) = indicator_position(point.x, point.y, bounds);
            unsafe {
                SetWindowPos(
                    self.window,
                    Some(HWND_TOPMOST),
                    x,
                    y,
                    INDICATOR_WIDTH,
                    INDICATOR_HEIGHT,
                    SWP_NOACTIVATE | SWP_SHOWWINDOW,
                )
            }
            .map_err(|_| AppError::PickerOverlay)?;
            draw_indicator(self.window, pixel)
        }
    }

    impl Drop for ColorIndicator {
        fn drop(&mut self) {
            let _ = unsafe { DestroyWindow(self.window) };
        }
    }

    fn monitor_bounds(point: POINT) -> Result<ScreenBounds, AppError> {
        let monitor = unsafe { MonitorFromPoint(point, MONITOR_DEFAULTTONEAREST) };
        let mut info = MONITORINFO {
            cbSize: std::mem::size_of::<MONITORINFO>() as u32,
            ..Default::default()
        };
        if !unsafe { GetMonitorInfoW(monitor, &mut info) }.as_bool() {
            return Err(AppError::PickerOverlay);
        }
        Ok(ScreenBounds {
            left: info.rcWork.left,
            top: info.rcWork.top,
            right: info.rcWork.right,
            bottom: info.rcWork.bottom,
        })
    }

    fn sample_pixel(point: POINT) -> Result<COLORREF, AppError> {
        let dc = unsafe { GetDC(None) };
        if dc.is_invalid() {
            return Err(AppError::ScreenCapture);
        }
        let pixel = unsafe { GetPixel(dc, point.x, point.y) };
        unsafe { ReleaseDC(None, dc) };
        if pixel == COLORREF(CLR_INVALID) {
            return Err(AppError::ScreenCapture);
        }
        Ok(pixel)
    }

    fn draw_indicator(window: HWND, pixel: COLORREF) -> Result<(), AppError> {
        let dc = unsafe { GetDC(Some(window)) };
        if dc.is_invalid() {
            return Err(AppError::PickerOverlay);
        }

        let background = unsafe { CreateSolidBrush(COLORREF(0x00151313)) };
        let swatch = unsafe { CreateSolidBrush(pixel) };
        let outer_shape =
            unsafe { CreateRoundRectRgn(0, 0, INDICATOR_WIDTH + 1, INDICATOR_HEIGHT + 1, 24, 24) };
        let swatch_shape = unsafe { CreateRoundRectRgn(7, 7, 29, 29, 9, 9) };

        unsafe {
            let _ = FillRgn(dc, outer_shape, background);
            let _ = FillRgn(dc, swatch_shape, swatch);
            SetBkMode(dc, TRANSPARENT);
            SetTextColor(dc, COLORREF(0x00FFFFFF));
        }

        let red = pixel.0 & 0xff;
        let green = (pixel.0 >> 8) & 0xff;
        let blue = (pixel.0 >> 16) & 0xff;
        let mut label: Vec<u16> = format!("#{red:02X}{green:02X}{blue:02X}")
            .encode_utf16()
            .collect();
        let mut text_rect = RECT {
            left: 34,
            top: 0,
            right: INDICATOR_WIDTH - 5,
            bottom: INDICATOR_HEIGHT,
        };
        unsafe {
            let _ = DrawTextW(
                dc,
                &mut label,
                &mut text_rect,
                DT_CENTER | DT_VCENTER | DT_SINGLELINE,
            );
            let _ = DeleteObject(HGDIOBJ(outer_shape.0));
            let _ = DeleteObject(HGDIOBJ(swatch_shape.0));
            let _ = DeleteObject(HGDIOBJ(background.0));
            let _ = DeleteObject(HGDIOBJ(swatch.0));
            ReleaseDC(Some(window), dc);
        }
        Ok(())
    }

    pub fn pick_screen_color() -> Result<PickerResult, AppError> {
        let indicator = ColorIndicator::create()?;
        let mut left_was_down = unsafe { GetAsyncKeyState(VK_LBUTTON.0.into()) } < 0;

        loop {
            let escape_down = unsafe { GetAsyncKeyState(VK_ESCAPE.0.into()) } < 0;
            let right_down = unsafe { GetAsyncKeyState(VK_RBUTTON.0.into()) } < 0;
            if escape_down || right_down {
                return Err(AppError::PickerCancelled);
            }

            let mut point = POINT::default();
            unsafe { GetCursorPos(&mut point) }.map_err(|_| AppError::ScreenCapture)?;
            let pixel = sample_pixel(point)?;
            indicator.update(point, pixel)?;

            let left_down = unsafe { GetAsyncKeyState(VK_LBUTTON.0.into()) } < 0;
            if left_down && !left_was_down {
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
            thread::sleep(Duration::from_millis(16));
        }
    }
}

#[cfg(target_os = "windows")]
pub use windows_picker::pick_screen_color;

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

    #[test]
    fn indicator_flips_inside_monitor_edges() {
        let bounds = ScreenBounds {
            left: -1920,
            top: 0,
            right: 0,
            bottom: 1080,
        };
        assert_eq!(indicator_position(-1000, 500, bounds), (-1053, 514));
        assert_eq!(indicator_position(-10, 1070, bounds), (-106, 1020));
    }

    #[test]
    fn indicator_clamps_to_small_monitor_bounds() {
        let bounds = ScreenBounds {
            left: 0,
            top: 0,
            right: 200,
            bottom: 100,
        };
        assert_eq!(indicator_position(5, 5, bounds), (0, 19));
        assert_eq!(indicator_position(195, 95, bounds), (94, 45));
    }
}
