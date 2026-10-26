import { Mic, AlertCircle } from 'lucide-react';
import { TranscriptEntry } from '@/lib/tauri';

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
  recording: boolean;
  devices: number;
  permission: 'granted' | 'denied' | 'unknown';
  error: string | null;
}

export function TranscriptPanel({
  entries,
  recording,
  devices,
  permission,
  error,
}: TranscriptPanelProps) {
  const permissionText =
    permission === 'granted' ? 'Microphone access granted' :
    permission === 'denied' ? 'Microphone access denied' :
    'Checking permissions…';

  // Empty states
  if (error) {
    return (
      <div className="gk-empty-state">
        <div className="gk-empty-icon">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="gk-empty-title">Unable to load transcript</h3>
        <p className="gk-empty-subtitle">{error}</p>
        {permission === 'denied' && (
          <p className="gk-empty-subtitle mt-2 text-xs text-slate-500 dark:text-slate-400">
            Grant microphone access in system settings to enable transcription.
          </p>
        )}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="gk-empty-state">
        <div className="gk-empty-icon">
          <Mic className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="gk-empty-title">No transcript yet</h3>
        <p className="gk-empty-subtitle">
          Start a recording to capture live transcription.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {recording ? 'Listening…' : 'Ready to record'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Live transcript
        </span>
        <span className={`flex items-center gap-1.5 text-xs font-medium ${
          recording ? 'text-gk-600 dark:text-gk-400' : 'text-slate-500 dark:text-slate-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
          {recording ? 'Listening…' : 'Idle'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="gk-transcript-item">
            <span className="gk-transcript-speaker">{entry.speaker}</span>
            <div className="flex-1">
              <p className="gk-transcript-text">{entry.text}</p>
              <span className="gk-transcript-timestamp">{entry.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Microphone status bar */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full ${permission === 'granted' ? 'bg-accent-500' : permission === 'denied' ? 'bg-red-500' : 'bg-slate-400'}`} />
          <span className="text-xs text-slate-500 dark:text-slate-400">{permissionText}</span>
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {devices} audio device{devices !== 1 ? 's' : ''} available
        </span>
      </div>
    </div>
  );
}
