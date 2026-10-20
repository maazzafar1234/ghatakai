#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::sync::Mutex;

mod audio;
mod settings;
mod commands;

use commands::*;
use settings::SettingsStore;

fn main() {
    tauri::Builder::default()
        .manage(SettingsStore::default())
        .invoke_handler(tauri::generate_handler![
            get_audio_devices,
            start_recording,
            stop_recording,
            get_settings,
            save_settings,
            toggle_transcript,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
