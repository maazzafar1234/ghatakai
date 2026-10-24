import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export interface AudioDevice {
  id: string;
  name: string;
  kind: 'input' | 'output';
}

export interface Settings {
  theme: 'light' | 'dark';
  overlayOpacity: number;
  fontSizeIndex: number;
  microphoneDeviceId: string | null;
  isPrivate: boolean;
  isTranscriptOpen: boolean;
}

export interface TranscriptionPayload {
  text: string;
  language: string;
  timestamp: string;
}

export interface WhisperModelStatus {
  isReady: boolean;
}

export async function getAudioDevices(): Promise<AudioDevice[]> {
  return invoke<AudioDevice[]>('get_audio_devices');
}

export async function startRecording(deviceId: string | null): Promise<void> {
  return invoke('start_recording', { deviceId });
}

export async function stopRecording(): Promise<void> {
  return invoke('stop_recording');
}

export async function isRecording(): Promise<boolean> {
  return invoke<boolean>('is_recording');
}

export async function getSettings(): Promise<Settings> {
  return invoke<Settings>('get_settings');
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  return invoke('save_settings', { settings });
}

export async function toggleTranscript(open: boolean): Promise<void> {
  return invoke('toggle_transcript', { open });
}

export async function loadWhisperModel(modelPath: string): Promise<void> {
  return invoke('load_whisper_model', { modelPath });
}

export async function isSttReady(): Promise<boolean> {
  return invoke<boolean>('is_stt_ready');
}

export async function transcribeAudio(): Promise<TranscriptionPayload> {
  return invoke<TranscriptionPayload>('transcribe_audio');
}

export async function getAudioBufferLen(): Promise<number> {
  return invoke<number>('get_audio_buffer_len');
}

export type TranscriptEntry = {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
};

export const SAMPLE_TRANSCRIPT: TranscriptEntry[] = [
  {
    id: '1',
    speaker: 'Speaker 1',
    text: "Welcome to GhataKai. This is a sample transcript entry to demonstrate the UI layout.",
    timestamp: '00:00:01',
  },
  {
    id: '2',
    speaker: 'Speaker 2',
    text: 'This panel shows how transcripts will appear once speech-to-text is integrated.',
    timestamp: '00:00:05',
  },
  {
    id: '3',
    speaker: 'System',
    text: 'Recording status: Not recording. Use the recording controls to begin.',
    timestamp: '00:00:10',
  },
];

export function listenToTranscript(callback: (entry: TranscriptEntry) => void) {
  return listen<TranscriptEntry>('transcript-update', (event) => {
    callback(event.payload as TranscriptEntry);
  });
}
