#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod audio;
mod settings;
mod commands;

use audio::RecordingState;
use commands::*;
use settings::SettingsStore;

fn main() {
    tauri::Builder::default()
        .manage(SettingsStore::default())
        .manage(RecordingState::default())
        .invoke_handler(tauri::generate_handler![
            get_audio_devices,
            start_recording,
            stop_recording,
            is_recording,
            get_settings,
            save_settings,
            toggle_transcript,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
