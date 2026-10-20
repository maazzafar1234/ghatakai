import React, { useState } from 'react';
import { MessageCircle, Send, AlertCircle } from 'lucide-react';
import {
  ConversationSession,
  CloudSTTConfig,
  CloudLLMConfig,
  AIIntegrationStatus,
} from '@/lib/types';

interface AIPanelProps {
  session: ConversationSession | undefined;
  onSend: (content: string) => void;
  loading: boolean;
  sttConfig: CloudSTTConfig;
  llmConfig: CloudLLMConfig;
  aiStatus: AIIntegrationStatus;
}

export function AIPanel({
  session,
  onSend,
  loading,
  sttConfig,
  llmConfig,
  aiStatus,
}: AIPanelProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input);
    setInput('');
  };

  const renderMessages = () => {
    if (!session || session.messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <MessageCircle className="w-12 h-12 mb-3" />
          <p>No conversation yet. Start by asking a question.</p>
        </div>
      );
    }
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`px-3 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-gk-600 text-white dark:bg-gk-600'
                  : 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <span className="text-[10px] opacity-60 block mt-1">
                {msg.role === 'user' ? 'You' : 'GhataKai'}
                {msg.transcriptContext ? ' • from transcript' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gk-100 dark:bg-gk-900 flex items-center justify-center text-gk-600 dark:text-gk-400">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                AI Assistant
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {session?.title ?? 'New conversation'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                aiStatus.stt === 'disabled' && aiStatus.llm === 'disabled'
                  ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  : 'bg-gk-100 text-gk-700 dark:bg-gk-900 dark:text-gk-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                aiStatus.stt === 'listening' || aiStatus.llm === 'generating'
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-gk-600'
              }`} />
              AI ready
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session?.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-12 h-12 text-slate-400 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No conversation yet. Start by asking a question about your transcript.
            </p>
          </div>
        ) : (
          renderMessages()
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your transcript..."
            disabled={loading}
            className="gk-input flex-1 text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="gk-btn-primary text-xs"
          >
            {loading ? (
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <Send className="w-3 h-3" />
            )}
          </button>
        </form>
      </div>

      {/* Cloud integration status */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">STT Provider</span>
            <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate max-w-xs">
              {sttConfig.provider === 'none' ? 'Not configured' : sttConfig.provider}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">LLM Provider</span>
            <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate max-w-xs">
              {llmConfig.provider === 'none' ? 'Not configured' : llmConfig.provider}
            </span>
          </div>
          {aiStatus.lastError && (
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-3 h-3" />
              <span>{aiStatus.lastError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
