import { Mic, Square, AlertCircle, Loader2 } from 'lucide-react';

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
    <div className="gk-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recording</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Capture microphone audio locally
          </p>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
      </div>

      {error && (
        <div className="gk-error-banner">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="gk-label">Input device</label>
          <select
            value={selectedDeviceId || 'default'}
            onChange={(e) => onSelectDevice(e.target.value === 'default' ? null : e.target.value)}
            className="gk-select"
            disabled={loading || recording}
          >
            <option value="default">Default microphone</option>
            {inputDevices.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {inputDevices.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              No input devices found. Connect a microphone to begin.
            </p>
          )}
        </div>

        <div className="pt-2">
          <button
            onClick={onToggleRecording}
            disabled={loading}
            className={`gk-btn-record ${recording ? 'stop' : 'idle'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{recording ? 'Stopping…' : 'Starting…'}</span>
              </>
            ) : recording ? (
              <>
                <Square className="w-4 h-4" />
                <span>Stop recording</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Start recording</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className={`w-1.5 h-1.5 rounded-full ${recording ? 'bg-red-500' : 'bg-slate-400'}`} />
          <span>{recording ? 'Recording active' : 'Idle'}</span>
        </div>
      </div>
    </div>
  );
}
