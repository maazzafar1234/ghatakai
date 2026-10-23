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
    'Checking permissions…';

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
        <span>{permissionText}</span>
      </div>
      <div className="flex items-center gap-2">
        <span>{devices} audio device{devices !== 1 ? 's' : ''} available</span>
        {error && (
          <>
            <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
            <span className="text-red-600 dark:text-red-400">{error}</span>
          </>
        )}
      </div>
    </div>
  );
}
