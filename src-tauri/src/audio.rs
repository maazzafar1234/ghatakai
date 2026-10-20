use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioDevice {
    pub id: String,
    pub name: String,
    pub kind: String,
}

pub fn get_audio_devices() -> Result<Vec<AudioDevice>, String> {
    // Phase 1 placeholder: returns empty list until cpal is properly integrated
    // with Rust toolchain available.
    Ok(vec![])
}

pub fn start_recording(_device_id: Option<String>) -> Result<(), String> {
    // Phase 1 placeholder: recording not yet implemented without Rust toolchain
    Err("Audio recording not available in this build. Rust toolchain required for cpal integration.".to_string())
}

pub fn stop_recording() -> Result<(), String> {
    Err("Audio recording not available in this build. Rust toolchain required for cpal integration.".to_string())
}
