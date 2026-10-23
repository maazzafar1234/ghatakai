import { useState, useEffect } from 'react';
import { MeetingDetectionStatus } from '@/lib/types';
import { RefreshCw } from 'lucide-react';

interface MeetingDetectionProps {
  status: MeetingDetectionStatus;
  onToggle: () => void;
  onRefresh: () => void;
}

export function MeetingDetection({
  status,
  onToggle,
  onRefresh,
}: MeetingDetectionProps) {
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // No-op placeholder; backend would drive real detection
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="gk-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Meeting Detection
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automatically detect active meeting applications
          </p>
        </div>
        <div className={`w-2 h-2 rounded-full ${status.enabled ? 'bg-accent-500' : 'bg-slate-400'}`} />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-gk-sm transition-colors ${
            status.enabled
              ? 'bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20'
              : 'bg-gk-600 text-white hover:bg-gk-700 dark:bg-gk-600 dark:hover:bg-gk-700'
          }`}
        >
          {status.enabled ? 'Disable Detection' : 'Enable Detection'}
        </button>
        <button
          onClick={() => {
            setRefreshing(true);
            onRefresh();
            setTimeout(() => setRefreshing(false), 800);
          }}
          disabled={refreshing}
          className="p-2 text-slate-500 hover:text-gk-600 dark:text-slate-400 dark:hover:text-gk-400 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Status</span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-gk-sm ${
              status.enabled
                ? 'bg-accent-500/10 text-accent-600 dark:bg-accent-500/20 dark:text-accent-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {status.enabled ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Confidence</span>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div
              className="bg-gk-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(status.confidence, 100)}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {status.confidence}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Current meeting</span>
          <span
            className={`text-xs font-medium truncate max-w-[120px] ${
              status.currentMeeting ? 'text-gk-600 dark:text-gk-400' : 'text-slate-400'
            }`}
          >
            {status.currentMeeting ?? 'None detected'}
          </span>
        </div>

        {status.detectedApps.length > 0 && (
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
              Detected apps
            </span>
            <div className="flex flex-wrap gap-1">
              {status.detectedApps.map((app) => (
                <span
                  key={app}
                  className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-gk-sm dark:bg-slate-800 dark:text-slate-400"
                >
                  {app}
                </span>
              ))}
            </div>
          </div>
        )}

        {status.lastChecked && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400">Last checked</span>
            <span className="text-[10px] text-slate-400">
              {new Date(status.lastChecked).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
