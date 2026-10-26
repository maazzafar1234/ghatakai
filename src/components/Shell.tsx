import { LayoutDashboard, Settings, MessageSquare, Menu, HelpCircle } from 'lucide-react';

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
      <div className="gk-sidebar-header">
        <div className="w-10 h-10 rounded-gk-sm bg-gk-primary flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-sm font-bold text-slate-900 tracking-tight">GhataKai</span>
        <span className="dark:text-slate-400">GhataKai</span>
      </div>
      {NAV_ITEMS.map((item) => {
        const active = activePath === item.href;
        const Icon = item.icon;
        return (
          <button
            key={item.href}
            onClick={() => onNav(item.href)}
            className={`gk-nav-item ${active ? 'active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
      <div className="mt-auto pt-6 pb-6 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {}}
          className="gk-nav-item"
          aria-label="Help"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Help</span>
        </button>
      </div>
    </nav>
  );
}

export function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="gk-topbar">
      <button
        onClick={onMenu}
        className="lg:hidden p-2.5 text-slate-600 hover:text-slate-900 rounded-gk-sm hover:bg-slate-100 transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-slate-500 tracking-tight">v0.1.0</span>
        <button className="p-2.5 text-slate-600 hover:text-slate-900 rounded-gk-sm hover:bg-slate-100 transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800" aria-label="Help">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
