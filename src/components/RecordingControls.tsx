import { Mic } from 'lucide-react';

interface AudioDevice {
  id: string;
  name: string;
  kind: 'input' | 'output';
}

interface RecordingControlsProps {
  recording: boolean;
  devices: AudioDevice[];
  selectedDeviceId: string | null;
  loading: boolean;
  error: string | null;
  onSelectDevice: (id: string | null) => void;
  onToggleRecording: () => void;
}

export function RecordingControls({
  recording,
  devices,
  selectedDeviceId,
  loading,
  error,
  onSelectDevice,
  onToggleRecording,
}: RecordingControlsProps) {
  const inputDevices = devices.filter((d) => d.kind === 'input');

  return (
    <div className="gk-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gk-text">Recording</h3>
          <p className="text-xs text-gk-text-muted">Capture microphone audio locally</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-gk-border'}`} />
      </div>

      {error && (
        <div className="mb-4 rounded-gk bg-red-50 border border-red-100 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="gk-label">Input device</label>
          <select
            value={selectedDeviceId || 'default'}
            onChange={(e) => onSelectDevice(e.target.value === 'default' ? null : e.target.value)}
            className="gk-input"
            disabled={loading || recording}
          >
            <option value="default">Default microphone</option>
            {inputDevices.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {inputDevices.length === 0 && (
            <p className="text-xs text-gk-text-muted mt-1">No input devices found.</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onToggleRecording}
            disabled={loading}
            className={`flex-1 gk-btn px-6 py-3 ${
              recording
                ? 'gk-btn-danger flex items-center justify-center gap-2'
                : 'gk-btn-primary flex items-center justify-center gap-2'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {recording ? 'Stopping...' : 'Starting...'}
              </span>
            ) : recording ? (
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2" />
                </svg>
                Stop recording
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Start recording
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gk-text-muted">
          <span className={`w-2 h-2 rounded-full ${recording ? 'bg-red-500' : 'bg-gk-border'}`} />
          <span>{recording ? 'Recording active' : 'Idle'}</span>
        </div>
      </div>
    </div>
  );
}
