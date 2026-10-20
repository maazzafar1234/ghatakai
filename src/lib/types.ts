export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  transcriptContext?: string;
}

export interface ConversationSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
}

export interface CloudSTTConfig {
  provider: 'whisper-local' | 'azure' | 'assemblyai' | 'deepgram' | 'none';
  apiKey?: string;
  language?: string;
  model?: string;
  enabled: boolean;
}

export interface CloudLLMConfig {
  provider: 'openai' | 'anthropic' | 'none';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enabled: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  isCustom: boolean;
}

export interface MeetingDetectionStatus {
  enabled: boolean;
  detectedApps: string[];
  currentMeeting: string | null;
  confidence: number;
  lastChecked: string | null;
}

export interface AIIntegrationStatus {
  stt: 'idle' | 'listening' | 'processing' | 'error' | 'disabled';
  llm: 'idle' | 'generating' | 'error' | 'disabled';
  lastError: string | null;
}

export const DEFAULT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'summarize',
    name: 'Summarize Transcript',
    template: 'Summarize the following transcript in 3-5 bullet points:\n\n{{transcript}}',
    variables: ['transcript'],
    isCustom: false,
  },
  {
    id: 'action-items',
    name: 'Extract Action Items',
    template: 'Extract action items and assignees from this transcript:\n\n{{transcript}}',
    variables: ['transcript'],
    isCustom: false,
  },
  {
    id: 'key-decisions',
    name: 'Key Decisions',
    template: 'What key decisions were made in this conversation?\n\n{{transcript}}',
    variables: ['transcript'],
    isCustom: false,
  },
];
