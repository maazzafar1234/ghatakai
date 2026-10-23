import { Mic, Palette, Shield, AlertTriangle, Loader2 } from 'lucide-react';

interface AudioDevice {
  id: string;
  name: string;
  kind: 'input' | 'output';
}

interface SettingsPanelProps {
  settings: {
    theme: 'light' | 'dark';
    overlayOpacity: number;
    fontSizeIndex: number;
    microphoneDeviceId: string | null;
    isPrivate: boolean;
    isTranscriptOpen: boolean;
  };
  audioDevices: AudioDevice[];
  loading: boolean;
  error: string | null;
  onChange: (key: string, value: any) => void;
  onSave: () => void;
  onReset: () => void;
}

export function SettingsPanel({
  settings,
  audioDevices,
  loading,
  error,
  onChange,
  onSave,
  onReset,
}: SettingsPanelProps) {
  const inputDevices = audioDevices.filter((d) => d.kind === 'input');

  return (
    <div className="flex-1 p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Settings</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure appearance, audio, and privacy options
          </p>
        </div>
      </div>

      <div className="gk-settings-grid">
        {/* Appearance */}
        <div className="gk-section">
          <div className="gk-section-header">
            <Palette className="w-4 h-4 text-gk-600 dark:text-gk-400" />
            <span className="gk-section-title">Appearance</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="gk-label">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => onChange('theme', e.target.value as 'light' | 'dark')}
                className="gk-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className="gk-label">Overlay opacity</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.overlayOpacity}
                  onChange={(e) => onChange('overlayOpacity', parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-gk-600 dark:bg-slate-700 dark:accent-gk-500"
                />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-12 text-right">
                  {settings.overlayOpacity}%
                </span>
              </div>
            </div>
            <div>
              <label className="gk-label">Font size</label>
              <select
                value={String(settings.fontSizeIndex)}
                onChange={(e) => onChange('fontSizeIndex', parseInt(e.target.value, 10))}
                className="gk-select"
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <option key={i} value={String(i)}>
                    Size {i}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Audio */}
        <div className="gk-section">
          <div className="gk-section-header">
            <Mic className="w-4 h-4 text-gk-600 dark:text-gk-400" />
            <span className="gk-section-title">Audio Devices</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="gk-label">Microphone device</label>
              <select
                value={settings.microphoneDeviceId || 'none'}
                onChange={(e) => onChange('microphoneDeviceId', e.target.value === 'none' ? null : e.target.value)}
                className="gk-select"
                disabled={loading}
              >
                <option value="none">Default system microphone</option>
                {inputDevices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {inputDevices.length === 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  No microphone devices detected.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="gk-section">
          <div className="gk-section-header">
            <Shield className="w-4 h-4 text-gk-600 dark:text-gk-400" />
            <span className="gk-section-title">Privacy</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="gk-toggle ${settings.isPrivate ? 'checked' : ''}" role="switch" aria-checked={settings.isPrivate} onClick={() => onChange('isPrivate', !settings.isPrivate)}>
                <div className="gk-toggle-thumb" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                  Private mode
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Process audio locally, no cloud upload
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="gk-error-banner">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onReset}
          disabled={loading}
          className="gk-btn-secondary flex-1"
        >
          Reset
        </button>
        <button
          onClick={onSave}
          disabled={loading}
          className="gk-btn-primary flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
              Saving…
            </>
          ) : 'Save settings'}
        </button>
      </div>
    </div>
  );
}
