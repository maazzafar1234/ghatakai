import { useState, useEffect, useCallback } from 'react';
import {
  TranscriptEntry,
  TranscriptionPayload,
  loadWhisperModel,
  isSttReady,
  transcribeAudio,
  getAudioBufferLen,
  SAMPLE_TRANSCRIPT,
} from '@/lib/tauri';
import { Mic, MicOff, AlertCircle, Loader2, Play } from 'lucide-react';

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
  recording: boolean;
}

export function TranscriptPanel({ recording }: TranscriptPanelProps) {
  const [sttReady, setSttReady] = useState<boolean>(false);
  const [modelPath, setModelPath] = useState<string>('');
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [bufferLen, setBufferLen] = useState<number>(0);
  const [liveEntries, setLiveEntries] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSttStatus();
    checkBufferLen();
  }, []);

  const checkSttStatus = async () => {
    try {
      const ready = await isSttReady();
      setSttReady(ready);
    } catch {
      setSttReady(false);
    }
  };

  const checkBufferLen = async () => {
    try {
      const len = await getAudioBufferLen();
      setBufferLen(len);
    } catch {
      setBufferLen(0);
    }
  };

  const handleLoadModel = async () => {
    if (!modelPath.trim()) {
      setError('Please enter a model path');
      return;
    }
    setIsLoadingModel(true);
    setError(null);
    try {
      await loadWhisperModel(modelPath.trim());
      setSttReady(true);
    } catch (err) {
      setError(`Failed to load model: ${(err as Error).message}`);
    } finally {
      setIsLoadingModel(false);
    }
  };

  const handleTranscribe = async () => {
    if (!sttReady) {
      setError('Whisper model not loaded. Please load a model first.');
      return;
    }
    if (bufferLen === 0) {
      setError('No audio data available. Start recording first.');
      return;
    }
    setIsTranscribing(true);
    setError(null);
    try {
      const result: TranscriptionPayload = await transcribeAudio();
      const entry: TranscriptEntry = {
        id: crypto.randomUUID(),
        speaker: 'Whisper STT',
        text: result.text,
        timestamp: result.timestamp,
      };
      setLiveEntries((prev) => [...prev, entry]);
    } catch (err) {
      setError(`Transcription failed: ${(err as Error).message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleClearError = useCallback(() => setError(null), []);

  // Show sample data when no STT model is loaded
  const displayEntries = sttReady ? liveEntries : SAMPLE_TRANSCRIPT;
  const isSampleData = !sttReady;

  if (displayEntries.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="gk-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gk-text">Transcription</h3>
            <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
              sttReady
                ? 'bg-gk-accent-light text-gk-accent dark:bg-gk-accent/10 dark:text-gk-accent'
                : 'bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${sttReady ? 'bg-gk-accent' : 'bg-red-500'}`} />
              {sttReady ? 'STT Ready' : 'STT Not Configured'}
            </span>
          </div>

          <div className="space-y-4">
            {/* Model loading section */}
            <div className="space-y-3">
              <label className="gk-label">Whisper Model Path</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={modelPath}
                  onChange={(e) => setModelPath(e.target.value)}
                  placeholder="Path to ggml model file (e.g., ./models/ggml-base.en.bin)"
                  className="gk-input flex-1 text-sm"
                  disabled={isLoadingModel}
                />
                <button
                  onClick={handleLoadModel}
                  disabled={isLoadingModel || !modelPath.trim()}
                  className="gk-btn-secondary text-sm"
                >
                  {isLoadingModel ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                Loading…
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                Load Model
              </>
            )}
                </button>
              </div>
              <p className="text-[10px] text-gk-text-muted">
                Download a model from https://huggingface.co/ggerganov/whisper.cpp
              </p>
            </div>

            {/* Audio buffer info */}
            <div className="flex items-center justify-between text-xs text-gk-text-muted">
              <span>Audio buffer: {bufferLen} samples</span>
              <span>{recording ? 'Recording…' : 'Idle'}</span>
            </div>

            <div className="gk-empty-state">
              <div className="w-16 h-16 bg-gk-surface rounded-full flex items-center justify-center mb-4 text-gk-text-muted">
                <Mic className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gk-text">No transcript yet</h3>
              <p className="text-sm text-gk-text-muted">
                {sttReady
                  ? 'Start recording to capture audio, then transcribe.'
                  : 'Load a Whisper model to enable transcription.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gk-text">Live Transcript</h3>
        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
          sttReady
            ? 'bg-gk-accent-light text-gk-accent dark:bg-gk-accent/10 dark:text-gk-accent'
            : 'bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${sttReady ? 'bg-gk-accent' : 'bg-red-500'}`} />
          {sttReady ? 'STT Ready' : 'STT Not Configured'}
        </span>
      </div>

      {error && (
        <div className="gk-error-banner">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={handleClearError}
            className="ml-auto text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Model loading section */}
      <div className="gk-card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gk-text">Whisper Model</span>
          <span className="text-[10px] text-gk-text-muted">
            {sttReady ? 'Loaded' : 'Not loaded'}
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={modelPath}
              onChange={(e) => setModelPath(e.target.value)}
              placeholder="Path to ggml model file"
              className="gk-input flex-1 text-sm"
              disabled={isLoadingModel}
            />
            <button
              onClick={handleLoadModel}
              disabled={isLoadingModel || !modelPath.trim()}
              className="gk-btn-secondary text-sm"
            >
              {isLoadingModel ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                Loading…
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                Load Model
              </>
            )}
            </button>
          </div>
          <p className="text-[10px] text-gk-text-muted">
            Download a model from https://huggingface.co/ggerganov/whisper.cpp
          </p>
        </div>
      </div>

      {/* Recording status */}
      <div className="flex items-center gap-2 text-xs text-gk-text-muted mb-2">
        <span className={`w-2 h-2 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-gk-border'}`} />
        <span>{recording ? 'Recording audio…' : 'Idle'}</span>
        <span className="ml-auto">{bufferLen} audio samples buffered</span>
      </div>

      {/* Transcribe button */}
      <div className="gk-card p-4">
        <div className="flex gap-2">
          <button
            onClick={handleTranscribe}
            disabled={!sttReady || bufferLen === 0 || isTranscribing}
            className="gk-btn-primary flex-1 text-sm"
          >
            {isTranscribing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                Transcribing…
              </>
            ) : sttReady ? (
              <>
                <Mic className="w-3 h-3 mr-1" />
                Transcribe Audio
              </>
            ) : (
              <>
                <MicOff className="w-3 h-3 mr-1" />
                Load Model First
              </>
            )}
          </button>
          <button
            onClick={async () => {
              try {
                const len = await getAudioBufferLen();
                setBufferLen(len);
              } catch {}
            }}
            className="gk-btn-secondary text-sm"
          >
            <Loader2 className="w-3 h-3 animate-spin" style={{ display: 'none' }} />
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Buffer
          </button>
        </div>
        <p className="text-[10px] text-gk-text-muted mt-2">
          {sttReady
            ? `Audio buffer has {bufferLen} samples. Click Transcribe to convert to text.`
            : 'Load a Whisper model first to enable transcription.'}
        </p>
      </div>

      {/* Transcript entries */}
      <div className="gk-card flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gk-text">
            {isSampleData ? 'Sample Transcript (STT not integrated)' : 'Live Transcriptions'}
          </span>
          {isSampleData && (
            <span className="text-[10px] text-gk-text-muted">Load Whisper model to enable real transcription</span>
          )}
        </div>
        <div className="space-y-3">
          {displayEntries.map((entry) => (
            <div key={entry.id} className="gk-transcript-item">
              <span className="gk-transcript-speaker">{entry.speaker}</span>
              <div className="flex-1">
                <p className="gk-transcript-text">{entry.text}</p>
                <span className="gk-transcript-timestamp">{entry.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
        {displayEntries.length === 0 && (
          <div className="gk-empty-state py-4">
            <div className="w-12 h-12 bg-gk-surface rounded-full flex items-center justify-center mb-3 text-gk-text-muted">
              <Mic className="w-6 h-6" />
            </div>
            <p className="text-sm text-gk-text-muted">No transcriptions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
