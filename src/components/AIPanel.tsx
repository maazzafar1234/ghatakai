import React, { useState } from 'react';
import { MessageCircle, Send, AlertCircle, Loader2 } from 'lucide-react';import {
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

  const isConnected = sttConfig.provider !== 'none' && llmConfig.provider !== 'none';

  return (
    <div className="flex flex-col h-full border border-slate-200 rounded-gk-lg bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-gk-sm bg-gk-primary/10 flex items-center justify-center text-gk-600 dark:text-gk-400">
              <MessageCircle className="w-5 h-5" />
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
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                aiStatus.stt === 'disabled' && aiStatus.llm === 'disabled'
                  ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  : isConnected
                  ? 'bg-gk-accent-light text-gk-accent/700 dark:bg-accent-100 dark:text-accent-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                aiStatus.stt === 'listening' || aiStatus.llm === 'generating'
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-gk-600'
              }`} />
              {aiStatus.stt === 'disabled' && aiStatus.llm === 'disabled' ? 'Not configured' : isConnected ? 'Connected' : 'Partially configured'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session?.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 dark:bg-slate-800 dark:text-slate-500">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              No conversation yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Start by asking a question about your transcript.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {session?.messages.map((msg) => (
              <div
                key={msg.id}
                className={`gk-message ${msg.role === 'user' ? 'gk-message-user' : 'gk-message-ai'}`}
              >
                <div className="gk-message-content">
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <span className="gk-message-meta">
                    {msg.role === 'user' ? 'You' : 'GhataKai'}
                    {msg.transcriptContext ? ' &bull; from transcript' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your transcript…"
            disabled={loading || !isConnected}
            className="gk-input flex-1 text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || !isConnected}
            className="gk-btn-primary text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="ml-1">Sending…</span>
              </>
            ) : !isConnected ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span className="ml-1">Configure AI</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="ml-1">Send</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Cloud integration status */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="space-y-3">
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
          {!isConnected && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <AlertCircle className="w-3 h-3 text-slate-400" />
              <span>Configure STT and LLM providers in Settings to enable AI assistance.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
