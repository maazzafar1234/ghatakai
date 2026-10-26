use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveSettingsPayload {
    pub settings: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoadModelPayload {
    pub model_path: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TranscriptionPayload {
    pub text: String,
    pub language: String,
    pub timestamp: String,
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

#[tauri::command]
pub fn load_whisper_model(
    payload: LoadModelPayload,
    model: State<'_, crate::stt::WhisperModel>,
) -> Result<(), String> {
    model.load_model(&payload.model_path)
}

#[tauri::command]
pub fn is_stt_ready(model: State<'_, crate::stt::WhisperModel>) -> Result<bool, String> {
    Ok(model.is_loaded())
}

#[tauri::command]
pub fn transcribe_audio(
    state: State<'_, crate::audio::RecordingState>,
    model: State<'_, crate::stt::WhisperModel>,
) -> Result<TranscriptionPayload, String> {
    let audio_samples = state.get_audio_buffer();

    if audio_samples.is_empty() {
        return Err("No audio data available for transcription".to_string());
    }

    let result = model.transcribe(&audio_samples)?;

    Ok(TranscriptionPayload {
        text: result.text,
        language: result.language,
        timestamp: result.timestamp,
    })
}

#[tauri::command]
pub fn get_audio_buffer_len(state: State<'_, crate::audio::RecordingState>) -> Result<usize, String> {
    Ok(state.audio_buffer_len())
}
