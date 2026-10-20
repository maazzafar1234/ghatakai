import React, { useState } from 'react';
import {
  ConversationSession,
} from '@/lib/types';
import { conversationStore } from '@/lib/conversationStore';
import {
  Clock,
  Trash2,
  Edit2,
  MessageCircle,
  Plus,
  X,
  Check,
} from 'lucide-react';

interface ConversationHistoryProps {
  onSelectSession: (session: ConversationSession) => void;
  onNewSession: () => void;
  currentSessionId: string | null;
}

export function ConversationHistory({
  onSelectSession,
  onNewSession,
  currentSessionId,
}: ConversationHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const sessions = conversationStore.listSessions();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      conversationStore.deleteSession(id);
    }
  };

  const handleStartEdit = (id: string) => {
    const session = conversationStore.getSession(id);
    setEditTitle(session?.title ?? '');
    setEditingId(id);
  };

  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    conversationStore.updateSessionTitle(id, editTitle.trim());
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <div className="flex flex-col h-full border-r border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Conversations
          </h2>
          <button
            onClick={onNewSession}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-md hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>New</span>
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-gk-600"
          />
          <svg
            className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const isEditing = editingId === session.id;

              if (isEditing) {
                return (
                  <div key={session.id} className="p-2">
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleSaveEdit(session.id)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(session.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="w-full px-3 py-1.5 text-sm border border-gk-600 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gk-600"
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => handleSaveEdit(session.id)}
                        className="px-2 py-1 text-xs bg-gk-600 text-white rounded-md hover:bg-gk-700"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              }

              const lastMessage = session.messages[session.messages.length - 1];
              const preview = lastMessage
                ? lastMessage.content.length > 40
                  ? lastMessage.content.slice(0, 40) + '...'
                  : lastMessage.content
                : 'Empty conversation';

              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleStartEdit(session.id);
                  }}
                  className={`cursor-pointer flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gk-600/10 border border-gk-600 dark:bg-gk-600/20 dark:border-gk-600'
                      : 'bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                        {session.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {preview}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(session.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-gk-600"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
