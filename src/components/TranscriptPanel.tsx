import { TranscriptEntry } from '@/lib/tauri';

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
  recording: boolean;
}

export function TranscriptPanel({ entries, recording }: TranscriptPanelProps) {
  if (entries.length === 0) {
    return (
      <div className="gk-empty-state">
        <div className="w-16 h-16 bg-gk-surface rounded-full flex items-center justify-center mb-4 text-gk-text-muted">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gk-text mb-1">No transcript yet</h3>
        <p className="text-sm text-gk-text-muted">
          Start a recording to capture live transcription.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {entries.map((entry) => (
        <div key={entry.id} className="gk-transcript-item">
          <span className="gk-transcript-speaker">{entry.speaker}</span>
          <div className="flex-1">
            <p className="gk-transcript-text">{entry.text}</p>
            <span className="gk-transcript-timestamp">{entry.timestamp}</span>
          </div>
        </div>
      ))}
      <div className="pt-4">
        {recording ? (
          <div className="flex items-center gap-2 text-xs text-gk-primary">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>Listening...</span>
          </div>
        ) : (
          <div className="text-xs text-gk-text-muted">Not recording</div>
        )}
      </div>
    </div>
  );
}
