import { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar, TopBar } from './components/Shell';
import { TranscriptPanel } from './components/TranscriptPanel';
import { AIPanel } from './components/AIPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { RecordingControls } from './components/RecordingControls';
import { StatusBar } from './components/StatusBar';
import { ConversationHistory } from './components/ConversationHistory';
import { PromptCustomization } from '@/components/PromptCustomization';
import { MeetingDetection } from '@/components/MeetingDetection';
import {
  getAudioDevices,
  startRecording,
  stopRecording,
  getSettings,
  saveSettings,
} from '@/lib/tauri';
import { AlertTriangle } from 'lucide-react';
import { useCloudAI } from '@/lib/cloudAI';
import { conversationStore } from '@/lib/conversationStore';
import { ConversationSession } from '@/lib/types';

type View = 'transcript' | 'ai' | 'settings';

interface AppSettings {
  theme: 'light' | 'dark';
  overlayOpacity: number;
  fontSizeIndex: number;
  microphoneDeviceId: string | null;
  isPrivate: boolean;
  isTranscriptOpen: boolean;
}

function App() {
  const [view, setView] = useState<View>('transcript');
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<{ id: string; name: string; kind: 'input' | 'output' }[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [permission, _setPermission] = useState<'granted' | 'denied' | 'unknown'>('unknown');
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    overlayOpacity: 45,
    fontSizeIndex: 2,
    microphoneDeviceId: null,
    isPrivate: true,
    isTranscriptOpen: true,
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const currentSession = useMemo(() => conversationStore.getCurrentSession(), [currentSessionId]);

  // Cloud AI hooks
  const {
    status: aiStatus,
    sttConfig,
    llmConfig,
    generateLLMResponse,
  } = useCloudAI({
    onSTTResult: (text) => {
      if (currentSession) {
        conversationStore.addMessage(currentSession.id, 'assistant', text);
      }
    },
    onError: (err) => setError(err),
  });

  useEffect(() => {
    loadDevices();
    loadSettings();
  }, []);

  const loadDevices = async () => {
    try {
      const d = await getAudioDevices();
      setDevices(d);
    } catch (err) {
      setError('Failed to load audio devices: ' + (err as Error).message);
    }
  };

  const loadSettings = async () => {
    try {
      const s = await getSettings();
      setSettings(s);
      setSelectedDeviceId(s.microphoneDeviceId);
    } catch (err) {
      setError('Failed to load settings: ' + (err as Error).message);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      await saveSettings({
        ...settings,
        microphoneDeviceId: selectedDeviceId,
      });
    } catch (err) {
      setError('Failed to save settings: ' + (err as Error).message);
    } finally {
      setLoading(false);
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

  const handleAsk = async (question: string) => {
    if (!question.trim() || aiLoading) return;
    setAiLoading(true);
    setError(null);

    // Add user message to conversation
    if (currentSession) {
      conversationStore.addMessage(currentSession.id, 'user', question);
    }

    try {
      const response = await generateLLMResponse(question);
      if (currentSession) {
        conversationStore.addMessage(currentSession.id, 'assistant', response);
      }
    } catch (err) {
      setError('AI request failed: ' + (err as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleNewSession = () => {
    const id = conversationStore.createSession('New Conversation');
    setCurrentSessionId(id);
  };

  const handleSelectSession = (session: ConversationSession) => {
    setCurrentSessionId(session.id);
  };

  const clearError = useCallback(() => setError(null), []);

  return (
    <div className="min-h-screen flex flex-col bg-gk-bg">
      <TopBar onMenu={() => {}} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activePath={`/${view}`} onNav={(path: string) => setView(path as View)} />
        <div className="flex-1 flex flex-col overflow-hidden bg-gk-bg">
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            {view === 'transcript' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gk-text">Transcript</h1>
                  <p className="text-sm text-gk-text-muted mt-1">
                    View and manage your transcript entries.
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 gk-card">
                    <div className="p-4 border-b border-gk-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gk-text">Live transcript</h3>
                        <span className="text-xs font-medium uppercase tracking-wider text-gk-primary">
                          Sample data — STT not yet integrated
                        </span>
                      </div>
                      <TranscriptPanel entries={[]} recording={recording} />
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <RecordingControls
                      recording={recording}
                      devices={devices}
                      selectedDeviceId={selectedDeviceId}
                      loading={loading}
                      error={error}
                      onSelectDevice={setSelectedDeviceId}
                      onToggleRecording={handleToggleRecording}
                    />
                    <StatusBar
                      recording={recording}
                      permission={permission}
                      error={error}
                      devices={devices.length}
                    />
                  </div>
                </div>
                {error && (
                  <div className="rounded-gk bg-red-50 border border-red-100 p-4 text-sm text-red-800 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                    <button
                      onClick={clearError}
                      className="ml-2 text-xs text-red-600 hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            )}
            {view === 'ai' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                  <ConversationHistory
                    currentSessionId={currentSessionId}
                    onSelectSession={handleSelectSession}
                    onNewSession={handleNewSession}
                  />
                </div>
                <div className="lg:col-span-8">
                  <AIPanel
                    session={currentSession}
                    onSend={(content: string) => handleAsk(content)}
                    loading={aiLoading}
                    sttConfig={sttConfig}
                    llmConfig={llmConfig}
                    aiStatus={aiStatus}
                  />
                </div>
              </div>
            )}
            {view === 'settings' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h1 className="text-2xl font-bold text-gk-text">Settings</h1>
                  <p className="text-sm text-gk-text-muted mt-1">
                    Configure appearance, audio, privacy, and AI integration options.
                  </p>
                </div>
                <SettingsPanel
                  settings={settings}
                  audioDevices={devices}
                  loading={loading}
                  error={error}
                  onChange={(key, value) => setSettings((prev) => ({ ...prev, [key]: value }))}
                  onSave={handleSaveSettings}
                  onReset={() => {
                    setSettings({
                      theme: 'light',
                      overlayOpacity: 45,
                      fontSizeIndex: 2,
                      microphoneDeviceId: null,
                      isPrivate: true,
                      isTranscriptOpen: true,
                    });
                    setSelectedDeviceId(null);
                  }}
                />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <PromptCustomization onSelectTemplate={() => {}} />
                  </div>
                  <div className="lg:col-span-1">
                    <MeetingDetection
                      status={{
                        enabled: settings.isPrivate,
                        detectedApps: [],
                        currentMeeting: null,
                        confidence: 0,
                        lastChecked: null,
                      }}
                      onToggle={() => setSettings((prev) => ({ ...prev, isPrivate: !prev.isPrivate }))}
                      onRefresh={() => {}}
                    />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
