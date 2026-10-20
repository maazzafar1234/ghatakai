use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioDevice {
    pub id: String,
    pub name: String,
    pub kind: String,
}

/// Wraps a `cpal::Stream` with manual `Send` + `Sync` impls.
///
/// `cpal::Stream` is intentionally `!Send`/`!Sync` (marked with
/// `PhantomData<*mut ()>`), so it cannot be stored directly in Tauri state
/// (which requires `Send + Sync`). We wrap it in a struct that manually
/// implements `Send` and `Sync`. This is safe because:
/// - Only one stream is stored at a time
/// - All access is serialized through a `Mutex`
/// - CPAL's stream destructor is safe to call from any thread
/// - The stream is never accessed concurrently
pub(crate) struct StreamWrapper(Box<cpal::Stream>);

unsafe impl Send for StreamWrapper {}
unsafe impl Sync for StreamWrapper {}

pub struct RecordingState {
    stream: Mutex<Option<StreamWrapper>>,
}

impl Default for RecordingState {
    fn default() -> Self {
        Self {
            stream: Mutex::new(None),
        }
    }
}

impl RecordingState {
    pub fn is_recording(&self) -> bool {
        self.stream.lock().unwrap().is_some()
    }

    pub fn store_stream(&self, stream: cpal::Stream) {
        *self.stream.lock().unwrap() = Some(StreamWrapper(Box::new(stream)));
    }

    pub(crate) fn take_stream(&self) -> Option<StreamWrapper> {
        self.stream.lock().unwrap().take()
    }
}

pub fn get_audio_devices() -> Result<Vec<AudioDevice>, String> {
    let host = cpal::default_host();
    let devices = host
        .input_devices()
        .map_err(|e| format!("Failed to enumerate input devices: {}", e))?;

    let mut result = Vec::new();
    for device in devices {
        let name = device.name().unwrap_or_else(|_| "Unknown device".to_string());
        let id = name.clone();
        result.push(AudioDevice {
            id,
            name,
            kind: "input".to_string(),
        });
    }

    Ok(result)
}

pub fn start_recording(device_id: Option<String>, state: &RecordingState) -> Result<(), String> {
    let host = cpal::default_host();

    let device = if let Some(id) = &device_id {
        host.input_devices()
            .map_err(|e| format!("Failed to enumerate input devices: {}", e))?
            .find(|d| d.name().unwrap_or_default() == *id)
            .ok_or_else(|| format!("Microphone device '{}' not found", id))?
    } else {
        host.default_input_device()
            .ok_or_else(|| "No default input device found".to_string())?
    };

    let config = device
        .default_input_config()
        .map_err(|e| format!("Failed to get default input config: {}", e))?;

    let err_fn = |err| eprintln!("Input stream error: {}", err);

    let stream = match config.sample_format() {
        cpal::SampleFormat::F32 => device.build_input_stream(
            &config.into(),
            move |data: &[f32], _: &cpal::InputCallbackInfo| {
                // Process audio locally - no external transmission
                // Audio data is available here for future STT integration
                let _ = data;
            },
            err_fn,
            None,
        ),
        cpal::SampleFormat::I16 => device.build_input_stream(
            &config.into(),
            move |data: &[i16], _: &cpal::InputCallbackInfo| {
                let _ = data;
            },
            err_fn,
            None,
        ),
        cpal::SampleFormat::U16 => device.build_input_stream(
            &config.into(),
            move |data: &[u16], _: &cpal::InputCallbackInfo| {
                let _ = data;
            },
            err_fn,
            None,
        ),
        _ => {
            return Err(format!(
                "Unsupported audio sample format: {:?}",
                config.sample_format()
            ))
        }
    }
    .map_err(|e| format!("Failed to build input stream: {}", e))?;

    stream
        .play()
        .map_err(|e| format!("Failed to start audio stream: {}", e))?;

    state.store_stream(stream);

    Ok(())
}

pub fn stop_recording(state: &RecordingState) -> Result<(), String> {
    if let Some(wrapper) = state.take_stream() {
        let stream = wrapper.0;
        stream
            .pause()
            .map_err(|e| format!("Failed to pause audio stream: {}", e))?;
    }
    Ok(())
}
