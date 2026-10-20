use serde::{Deserialize, Serialize};
use std::sync::Mutex;

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

impl SettingsStore {
    pub fn get(&self) -> Result<GhataKaiSettings, String> {
        self.inner.lock().map_err(|e| e.to_string()).map(|g| g.clone())
    }

    pub fn update(&self, updates: serde_json::Value) -> Result<(), String> {
        let mut current = self.inner.lock().map_err(|e| e.to_string())?;

        if let Some(theme) = updates.get("theme").and_then(|v| v.as_str()) {
            current.theme = theme.to_string();
        }
        if let Some(opacity) = updates.get("overlay_opacity").and_then(|v| v.as_i64()) {
            current.overlay_opacity = opacity as i32;
        }
        if let Some(font_size) = updates.get("font_size_index").and_then(|v| v.as_i64()) {
            current.font_size_index = font_size as i32;
        }
        if let Some(device_id) = updates.get("microphone_device_id").and_then(|v| v.as_str()) {
            if device_id.is_empty() {
                current.microphone_device_id = None;
            } else {
                current.microphone_device_id = Some(device_id.to_string());
            }
        }
        if let Some(private) = updates.get("is_private").and_then(|v| v.as_bool()) {
            current.is_private = private;
        }
        if let Some(transcript_open) = updates.get("is_transcript_open").and_then(|v| v.as_bool()) {
            current.is_transcript_open = transcript_open;
        }

        Ok(())
    }
}
