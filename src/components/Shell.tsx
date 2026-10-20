import { LayoutDashboard, Settings, MessageSquare } from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Transcript', icon: LayoutDashboard, href: '/transcript' },
  { label: 'AI Assistant', icon: MessageSquare, href: '/ai' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar({ activePath, onNav }: { activePath: string; onNav: (path: string) => void }) {
  return (
    <nav className="gk-sidebar">
      <div className="p-4 mb-4 flex items-center gap-2">
        <div className="w-8 h-8 bg-gk-primary rounded-gk flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gk-text tracking-tight">GhataKai</span>
      </div>
      {NAV_ITEMS.map((item) => {
        const active = activePath === item.href;
        const Icon = item.icon;
        return (
          <button
            key={item.href}
            onClick={() => onNav(item.href)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-gk transition-colors ${
              active
                ? 'bg-gk-primary/10 text-gk-primary border-r-2 border-gk-primary'
                : 'text-gk-text-muted hover:bg-gk-surface hover:text-gk-text'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gk-border bg-gk-surface">
      <button
        onClick={onMenu}
        className="lg:hidden p-2 text-gk-text-muted hover:text-gk-text rounded-gk hover:bg-gk-border"
        aria-label="Toggle menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gk-text-muted">v0.1.0</span>
        <button className="p-2 text-gk-text-muted hover:text-gk-text rounded-gk hover:bg-gk-border" aria-label="Help">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </button>
      </div>
    </header>
  );
}
