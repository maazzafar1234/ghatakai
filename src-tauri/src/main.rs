#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod audio;
mod settings;
mod commands;
mod stt;

use audio::RecordingState;
use commands::*;
use settings::SettingsStore;
use stt::WhisperModel;

fn main() {
    tauri::Builder::default()
        .manage(SettingsStore::default())
        .manage(RecordingState::default())
        .manage(WhisperModel::default())
        .invoke_handler(tauri::generate_handler![
            get_audio_devices,
            start_recording,
            stop_recording,
            is_recording,
            get_settings,
            save_settings,
            toggle_transcript,
            load_whisper_model,
            is_stt_ready,
            transcribe_audio,
            get_audio_buffer_len,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
