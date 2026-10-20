import {
  ConversationMessage,
  ConversationSession,
  DEFAULT_PROMPT_TEMPLATES,
  PromptTemplate,
} from '@/lib/types';

const STORAGE_KEY = 'ghatakai-conversations';
const PROMPT_STORAGE_KEY = 'ghatakai-prompts';

export class ConversationStore {
  private sessions: Map<string, ConversationSession> = new Map();
  private currentSessionId: string | null = null;
  private promptTemplates: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.loadFromStorage();
    this.initializeDefaults();
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const sessions: ConversationSession[] = JSON.parse(raw);
        sessions.forEach((s) => this.sessions.set(s.id, s));
      }
    } catch {
      // Ignore storage errors; start fresh
    }

    try {
      const raw = localStorage.getItem(PROMPT_STORAGE_KEY);
      if (raw) {
        const templates: PromptTemplate[] = JSON.parse(raw);
        templates.forEach((t) => this.promptTemplates.set(t.id, t));
      }
    } catch {
      // Ignore storage errors
    }
  }

  private initializeDefaults(): void {
    DEFAULT_PROMPT_TEMPLATES.forEach((t) => {
      this.promptTemplates.set(t.id, t);
    });
    if (this.sessions.size === 0) {
      this.createSession('New Conversation');
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.sessions.values()]));
    } catch {
      // Ignore storage errors
    }
    try {
      localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify([...this.promptTemplates.values()]));
    } catch {
      // Ignore storage errors
    }
  }

  createSession(title: string): string {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const session: ConversationSession = {
      id,
      title,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    this.sessions.set(id, session);
    this.currentSessionId = id;
    this.saveToStorage();
    return id;
  }

  getSession(id: string): ConversationSession | undefined {
    return this.sessions.get(id);
  }

  getCurrentSession(): ConversationSession | undefined {
    if (!this.currentSessionId) return undefined;
    return this.sessions.get(this.currentSessionId);
  }

  setCurrentSession(id: string): void {
    this.currentSessionId = id;
  }

  listSessions(): ConversationSession[] {
    return [...this.sessions.values()].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  addMessage(
    sessionId: string,
    role: ConversationMessage['role'],
    content: string,
    transcriptContext?: string,
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const message: ConversationMessage = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date().toISOString(),
      transcriptContext,
    };

    session.messages.push(message);
    session.updatedAt = new Date().toISOString();
    this.saveToStorage();
  }

  updateSessionTitle(sessionId: string, title: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.title = title;
    session.updatedAt = new Date().toISOString();
    this.saveToStorage();
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    if (this.currentSessionId === sessionId) {
      this.currentSessionId = this.listSessions()[0]?.id ?? null;
      if (!this.currentSessionId) {
        this.createSession('New Conversation');
      }
    }
    this.saveToStorage();
  }

  getPromptTemplates(): PromptTemplate[] {
    return [...this.promptTemplates.values()];
  }

  getPromptTemplate(id: string): PromptTemplate | undefined {
    return this.promptTemplates.get(id);
  }

  addPromptTemplate(template: Omit<PromptTemplate, 'id' | 'isCustom'>): string {
    const id = crypto.randomUUID();
    const prompt: PromptTemplate = {
      ...template,
      id,
      isCustom: true,
    };
    this.promptTemplates.set(id, prompt);
    this.saveToStorage();
    return id;
  }

  updatePromptTemplate(id: string, updates: Partial<PromptTemplate>): void {
    const existing = this.promptTemplates.get(id);
    if (!existing) return;
    this.promptTemplates.set(id, { ...existing, ...updates });
    this.saveToStorage();
  }

  deletePromptTemplate(id: string): void {
    this.promptTemplates.delete(id);
    this.saveToStorage();
  }
}

export const conversationStore = new ConversationStore();
