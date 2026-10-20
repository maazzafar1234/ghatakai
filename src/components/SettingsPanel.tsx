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
      <h2 className="text-xl font-semibold text-gk-text">Settings</h2>

      <div className="gk-card space-y-5">
        <div>
          <h3 className="text-sm font-medium text-gk-text mb-3">Appearance</h3>
          <div className="space-y-3">
            <div>
              <label className="gk-label">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => onChange('theme', e.target.value as 'light' | 'dark')}
                className="gk-input"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className="gk-label">Overlay opacity</label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.overlayOpacity}
                onChange={(e) => onChange('overlayOpacity', parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gk-border rounded-lg appearance-none cursor-pointer accent-gk-primary"
              />
              <span className="text-xs text-gk-text-muted">{settings.overlayOpacity}%</span>
            </div>
            <div>
              <label className="gk-label">Font size</label>
              <select
                value={String(settings.fontSizeIndex)}
                onChange={(e) => onChange('fontSizeIndex', parseInt(e.target.value, 10))}
                className="gk-input"
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

        <div className="border-t border-gk-border pt-4">
          <h3 className="text-sm font-medium text-gk-text mb-3">Audio Devices</h3>
          <div className="space-y-3">
            <div>
              <label className="gk-label">Microphone device</label>
              <select
                value={settings.microphoneDeviceId || 'none'}
                onChange={(e) => onChange('microphoneDeviceId', e.target.value === 'none' ? null : e.target.value)}
                className="gk-input"
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
                <p className="text-xs text-gk-text-muted mt-1">No microphone devices detected.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="gk-card space-y-3">
        <h3 className="text-sm font-medium text-gk-text mb-3">Privacy</h3>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.isPrivate}
            onChange={(e) => onChange('isPrivate', e.target.checked)}
            className="w-4 h-4 rounded border-gk-border text-gk-primary focus:ring-gk-primary bg-gk-border"
          />
          <label className="text-sm text-gk-text cursor-pointer">
            Private mode — process audio locally, no cloud upload
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-gk bg-red-50 border border-red-100 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onReset} disabled={loading} className="gk-btn-secondary">
          Reset
        </button>
        <button onClick={onSave} disabled={loading} className="gk-btn-primary">
          {loading ? 'Saving...' : 'Save settings'}
        </button>
      </div>
    </div>
  );
}
