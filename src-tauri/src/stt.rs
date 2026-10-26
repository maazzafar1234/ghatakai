use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranscriptionResult {
    pub text: String,
    pub language: String,
    pub timestamp: String,
}

pub struct WhisperModel {
    context: Mutex<Option<WhisperContext>>,
}

impl Default for WhisperModel {
    fn default() -> Self {
        Self {
            context: Mutex::new(None),
        }
    }
}

impl WhisperModel {
    pub fn is_loaded(&self) -> bool {
        self.context.lock().unwrap().is_some()
    }

    pub fn load_model(&self, model_path: &str) -> Result<(), String> {
        let context = WhisperContext::new(model_path)
            .map_err(|e| format!("Failed to load Whisper model from '{}': {}", model_path, e))?;
        *self.context.lock().unwrap() = Some(context);
        Ok(())
    }

    pub fn transcribe(&self, audio_samples: &[f32]) -> Result<TranscriptionResult, String> {
        let guard = self.context.lock().unwrap();
        let context = guard
            .as_ref()
            .ok_or("Whisper model not loaded. Load a model first using load_whisper_model.")?;

        let mut state = context.create_state()
            .map_err(|e| format!("Failed to create Whisper state: {}", e))?;

        let params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });

        state.full(params, audio_samples)
            .map_err(|e| format!("Transcription failed: {}", e))?;

        let mut text = String::new();
        let num_segments = state
            .full_n_segments()
            .map_err(|e| format!("Failed to get segment count: {}", e))?;
        for i in 0..num_segments {
            let segment = state
                .full_get_segment_text(i)
                .map_err(|e| format!("Failed to get segment text: {}", e))?;
            if !segment.is_empty() {
                text.push_str(&segment);
                text.push(' ');
            }
        }

        Ok(TranscriptionResult {
            text: text.trim().to_string(),
            language: "en".to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
        })
    }
}
