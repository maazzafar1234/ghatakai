import { AlertCircle } from 'lucide-react';

interface StatusBarProps {
  recording: boolean;
  permission: 'granted' | 'denied' | 'unknown';
  error: string | null;
  devices: number;
}

export function StatusBar({ recording, permission, error, devices }: StatusBarProps) {
  const permissionText =
    permission === 'granted' ? 'Microphone access granted' :
    permission === 'denied' ? 'Microphone access denied' :
    'Checking permissions...';

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-gk-border bg-gk-surface text-xs text-gk-text-muted">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-gk-border'}`} />
        <span>{permissionText}</span>
      </div>
      <div className="flex items-center gap-2">
        <span>{devices} audio device{devices !== 1 ? 's' : ''} available</span>
        {error && (
          <>
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span className="text-red-600">{error}</span>
          </>
        )}
      </div>
    </div>
  );
}
