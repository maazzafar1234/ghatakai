use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioDevice {
    pub id: String,
    pub name: String,
    pub kind: String, // "input" or "output"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GhataKaiSettings {
    pub theme: String,
    pub overlay_opacity: i32,
    pub font_size_index: i32,
    pub microphone_device_id: Option<String>,
    pub is_private: bool,
    pub is_transcript_open: bool,
}

impl Default for GhataKaiSettings {
    fn default() -> Self {
        Self {
            theme: "light".to_string(),
            overlay_opacity: 45,
            font_size_index: 2,
            microphone_device_id: None,
            is_private: true,
            is_transcript_open: true,
        }
    }
}

pub struct SettingsStore {
    inner: Mutex<GhataKaiSettings>,
}

impl Default for SettingsStore {
    fn default() -> Self {
        Self {
            inner: Mutex::new(GhataKaiSettings::default()),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveSettingsPayload {
    pub settings: serde_json::Value,
}

#[tauri::command]
pub fn get_audio_devices() -> Result<Vec<AudioDevice>, String> {
    audio::get_audio_devices()
}

#[tauri::command]
pub fn start_recording(device_id: Option<String>) -> Result<(), String> {
    audio::start_recording(device_id)
}

#[tauri::command]
pub fn stop_recording() -> Result<(), String> {
    audio::stop_recording()
}

#[tauri::command]
pub fn get_settings(_store: State<'_, SettingsStore>) -> Result<GhataKaiSettings, String> {
    let store = _store.inner.lock().map_err(|e| e.to_string())?;
    Ok(store.inner.clone())
}

#[tauri::command]
pub fn save_settings(
    _store: State<'_, SettingsStore>,
    payload: SaveSettingsPayload,
) -> Result<(), String> {
    let mut store = _store.inner.lock().map_err(|e| e.to_string())?;
    let mut current = store.inner.clone();

    if let Some(theme) = payload.settings.get("theme").and_then(|v| v.as_str()) {
        current.theme = theme.to_string();
    }
    if let Some(opacity) = payload.settings.get("overlay_opacity").and_then(|v| v.as_i64()) {
        current.overlay_opacity = opacity as i32;
    }
    if let Some(font_size) = payload.settings.get("font_size_index").and_then(|v| v.as_i64()) {
        current.font_size_index = font_size as i32;
    }
    if let Some(device_id) = payload.settings.get("microphone_device_id").and_then(|v| v.as_str()) {
        if device_id.is_empty() {
            current.microphone_device_id = None;
        } else {
            current.microphone_device_id = Some(device_id.to_string());
        }
    }
    if let Some(private) = payload.settings.get("is_private").and_then(|v| v.as_bool()) {
        current.is_private = private;
    }
    if let Some(transcript_open) = payload.settings.get("is_transcript_open").and_then(|v| v.as_bool()) {
        current.is_transcript_open = transcript_open;
    }

    *store.inner = current;
    Ok(())
}

#[tauri::command]
pub fn toggle_transcript(open: bool) -> Result<(), String> {
    // Transcript open/close toggle - no-op in Phase 1, UI handles state
    let _ = open;
    Ok(())
}
