import React, { useState } from 'react';
import { PromptTemplate } from '@/lib/types';
import { conversationStore } from '@/lib/conversationStore';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface PromptCustomizationProps {
  onSelectTemplate: (template: PromptTemplate) => void;
}

export function PromptCustomization({ onSelectTemplate }: PromptCustomizationProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newTemplate, setNewTemplate] = useState('');
  const [newVariables, setNewVariables] = useState('');

  const templates = conversationStore.getPromptTemplates();

  const handleSelect = (template: PromptTemplate) => {
    onSelectTemplate(template);
    setEditingId(null);
  };

  const handleStartEdit = (id: string) => {
    setEditingId(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const template = conversationStore.getPromptTemplate(id);
    if (template && window.confirm(`Delete prompt template "${template.name}"?`)) {
      conversationStore.deletePromptTemplate(id);
    }
  };

  const handleAdd = () => {
    if (!newName.trim() || !newTemplate.trim()) return;
    const variables = newVariables
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    conversationStore.addPromptTemplate({
      name: newName.trim(),
      template: newTemplate.trim(),
      variables,
    });
    setNewName('');
    setNewTemplate('');
    setNewVariables('');
  };

  const renderVariableChips = (variables: string[]) => {
    return (
      <div className="flex flex-wrap gap-1">
        {variables.map((v) => (
            <span
              key={v}
              className="px-2 py-0.5 text-[10px] font-medium bg-gk-primary-light text-gk-700 rounded-gk-sm dark:bg-gk-100 dark:text-gk-400"
            >
              {`{${v}}`}
            </span>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full border border-slate-200 rounded-gk-lg bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
          Prompt Templates
        </h2>
        <div className="space-y-3">
          <div>
            <label className="gk-label">Template name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="My custom prompt"
              className="gk-input text-xs"
            />
          </div>
          <div>
            <label className="gk-label">Template content</label>
            <textarea
              value={newTemplate}
              onChange={(e) => setNewTemplate(e.target.value)}
              placeholder="Summarize the following: {{transcript}}"
              rows={3}
              className="gk-textarea text-xs"
            />
          </div>
          <div>
            <label className="gk-label">Variables (comma-separated)</label>
            <input
              value={newVariables}
              onChange={(e) => setNewVariables(e.target.value)}
              placeholder="transcript, speaker, date"
              className="gk-input text-xs"
            />
            <p className="text-[10px] text-slate-500 mt-1 dark:text-slate-400">
              Use {'{'}{'variable'}{'}'} syntax in your template
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || !newTemplate.trim()}
            className="gk-btn-secondary text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Template
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">No templates</p>
          </div>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => {
              const isEditing = editingId === template.id;
              return (
                <div key={template.id} className="p-3 rounded-gk-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        autoFocus
                        value={template.name}
                        onChange={(e) => {
                          conversationStore.updatePromptTemplate(template.id, {
                            name: e.target.value,
                          });
                        }}
                        className="gk-input text-xs font-medium"
                      />
                      <textarea
                        value={template.template}
                        onChange={(e) => {
                          conversationStore.updatePromptTemplate(template.id, {
                            template: e.target.value,
                          });
                        }}
                        rows={3}
                        className="gk-textarea text-xs"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="gk-btn-secondary text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            conversationStore.updatePromptTemplate(template.id, {
                              name: template.name,
                              template: template.template,
                            });
                            setEditingId(null);
                          }}
                          className="gk-btn-primary text-xs"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                          {template.name}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-gk-sm font-medium ${
                          template.isCustom ? 'bg-gk-primary-light text-gk-700 dark:bg-gk-100 dark:text-gk-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {template.isCustom ? 'Custom' : 'Built-in'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {template.template}
                      </p>
                      {renderVariableChips(template.variables)}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleSelect(template)}
                          className="text-xs text-gk-600 dark:text-gk-400 hover:text-gk-700 dark:hover:text-gk-300 underline"
                        >
                          Use Template
                        </button>
                        <div className="flex gap-1">
                          {!template.isCustom && (
                            <button
                              onClick={() => handleStartEdit(template.id)}
                              className="p-1.5 text-slate-400 hover:text-gk-600 dark:hover:text-gk-400"
                              title="Duplicate"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                          {template.isCustom && (
                            <button
                              onClick={(e) => handleDelete(template.id, e)}
                              className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
