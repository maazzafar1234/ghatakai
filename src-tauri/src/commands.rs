use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveSettingsPayload {
    pub settings: serde_json::Value,
}

#[tauri::command]
pub fn get_audio_devices() -> Result<Vec<crate::audio::AudioDevice>, String> {
    crate::audio::get_audio_devices()
}

#[tauri::command]
pub fn start_recording(
    device_id: Option<String>,
    state: State<'_, crate::audio::RecordingState>,
) -> Result<(), String> {
    crate::audio::start_recording(device_id, &*state)
}

#[tauri::command]
pub fn stop_recording(state: State<'_, crate::audio::RecordingState>) -> Result<(), String> {
    crate::audio::stop_recording(&*state)
}

#[tauri::command]
pub fn get_settings(store: State<'_, crate::settings::SettingsStore>) -> Result<crate::settings::GhataKaiSettings, String> {
    store.get()
}

#[tauri::command]
pub fn save_settings(
    store: State<'_, crate::settings::SettingsStore>,
    payload: SaveSettingsPayload,
) -> Result<(), String> {
    store.update(payload.settings)
}

#[tauri::command]
pub fn is_recording(state: State<'_, crate::audio::RecordingState>) -> Result<bool, String> {
    Ok(state.is_recording())
}

#[tauri::command]
pub fn toggle_transcript(open: bool) -> Result<(), String> {
    // Transcript open/close toggle - no-op in Phase 1, UI handles state
    let _ = open;
    Ok(())
}
