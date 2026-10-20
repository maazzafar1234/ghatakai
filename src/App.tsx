import { useState, useEffect, useCallback } from 'react';
import {
  getAudioDevices,
  startRecording,
  stopRecording,
  isRecording,
  AudioDevice,
} from '@/lib/tauri';

function App() {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
    checkRecordingState();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await getAudioDevices();
      setDevices(d);
    } catch (err) {
      setError('Failed to load audio devices: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const checkRecordingState = async () => {
    try {
      const rec = await isRecording();
      setRecording(rec);
    } catch {
      // Ignore errors on initial state check
    }
  };

  const handleToggleRecording = async () => {
    setError(null);
    if (recording) {
      try {
        await stopRecording();
        setRecording(false);
      } catch (err) {
        setError('Failed to stop recording: ' + (err as Error).message);
      }
    } else {
      try {
        await startRecording(selectedDeviceId);
        setRecording(true);
      } catch (err) {
        setError('Failed to start recording: ' + (err as Error).message);
      }
    }
  };

  const clearError = useCallback(() => setError(null), []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-4">
        <h1 className="text-xl font-bold">GhataKai</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Audio Recording — Microphone Device Discovery
        </p>
      </header>

      <main className="flex-1 p-8 max-w-md mx-auto">
        {error && (
          <div className="mb-6 rounded bg-red-50 border border-red-100 p-4 text-sm text-red-800 flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 text-red-500">!</span>
            <span>{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-xs text-red-600 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-3">Microphone Device</h2>
            {loading ? (
              <p className="text-sm text-slate-500">Loading devices...</p>
            ) : devices.length === 0 ? (
              <p className="text-sm text-slate-500">No microphone devices found.</p>
            ) : (
              <select
                value={selectedDeviceId ?? ''}
                onChange={(e) =>
                  setSelectedDeviceId(e.target.value || null)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">Default system microphone</option>
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Recording</h2>
            <button
              onClick={handleToggleRecording}
              disabled={loading}
              className={`w-full py-3 px-6 text-lg font-medium rounded-lg transition-colors ${
                recording
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-slate-600 text-white hover:bg-slate-700'
              }`}
            >
              {loading
                ? recording
                  ? 'Stopping...'
                  : 'Starting...'
                : recording
                ? 'Stop Recording'
                : 'Start Recording'}
            </button>
            <p className="text-sm text-slate-500 mt-2">
              Recording state: <strong>{recording ? 'Active' : 'Idle'}</strong>
            </p>
            <p className="text-xs text-slate-400">
              Audio is captured locally. No recordings are transmitted externally.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
