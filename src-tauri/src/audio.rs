use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

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

/// Collects audio samples during recording for transcription.
pub struct AudioBuffer {
    samples: Mutex<Vec<f32>>,
}

impl Default for AudioBuffer {
    fn default() -> Self {
        Self {
            samples: Mutex::new(Vec::new()),
        }
    }
}

impl AudioBuffer {
    pub fn push(&self, sample: f32) {
        self.samples.lock().unwrap().push(sample);
    }

    pub fn get_and_clear(&self) -> Vec<f32> {
        self.samples.lock().unwrap().drain(..).collect()
    }

    pub fn len(&self) -> usize {
        self.samples.lock().unwrap().len()
    }

    #[allow(dead_code)]
    pub fn is_empty(&self) -> bool {
        self.samples.lock().unwrap().is_empty()
    }
}

pub struct RecordingState {
    stream: Mutex<Option<StreamWrapper>>,
    audio_buffer: Arc<AudioBuffer>,
}

impl Default for RecordingState {
    fn default() -> Self {
        Self {
            stream: Mutex::new(None),
            audio_buffer: Arc::new(AudioBuffer::default()),
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

    #[allow(dead_code)]
    pub fn push_audio_sample(&self, sample: f32) {
        self.audio_buffer.push(sample);
    }

    pub fn get_audio_buffer(&self) -> Vec<f32> {
        self.audio_buffer.get_and_clear()
    }

    pub fn audio_buffer_len(&self) -> usize {
        self.audio_buffer.len()
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

    let buffer = state.audio_buffer.clone();

    let stream = match config.sample_format() {
        cpal::SampleFormat::F32 => {
            let buffer = buffer.clone();
            device.build_input_stream(
                &config.into(),
                move |data: &[f32], _: &cpal::InputCallbackInfo| {
                    // Collect audio samples for transcription
                    for &sample in data {
                        buffer.push(sample);
                    }
                },
                err_fn,
                None,
            )
        }
        cpal::SampleFormat::I16 => {
            let buffer = buffer.clone();
            device.build_input_stream(
                &config.into(),
                move |data: &[i16], _: &cpal::InputCallbackInfo| {
                    // Convert i16 to f32 for collection
                    for &sample in data {
                        let f_sample = sample as f32 / i16::MAX as f32;
                        buffer.push(f_sample);
                    }
                },
                err_fn,
                None,
            )
        }
        cpal::SampleFormat::U16 => {
            let buffer = buffer.clone();
            device.build_input_stream(
                &config.into(),
                move |data: &[u16], _: &cpal::InputCallbackInfo| {
                    // Convert u16 to f32 for collection
                    for &sample in data {
                        let f_sample = (sample as i32 - i16::MAX as i32) as f32 / i16::MAX as f32;
                        buffer.push(f_sample);
                    }
                },
                err_fn,
                None,
            )
        }
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
