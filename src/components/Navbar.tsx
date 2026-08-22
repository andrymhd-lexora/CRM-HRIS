import React, { useState, useEffect } from 'react';
import { ActiveView, UserProfile } from '../types/crm';
import { useLanguage } from '../context/LanguageContext';
import {
  Menu,
  Search,
  Plus,
  Clock,
  Sparkles,
  LogIn,
  LogOut,
  Shield,
  LayoutDashboard,
  Users,
  Building2,
  Award,
  FileText,
  Target,
  CircleDollarSign,
  CheckSquare,
  BarChart3,
  SlidersHorizontal,
  Settings,
  UserCheck,
  Sun,
  Moon,
  User
} from 'lucide-react';

interface NavbarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenQuickAdd: () => void;
  onOpenSearch: (query: string) => void;
  onOpenMobileMenu: () => void;
  companyName: string;
  currency: string;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  onOpenQuickAdd,
  onOpenSearch,
  onOpenMobileMenu,
  currency,
  currentUser,
  onOpenAuthModal,
  onLogout,
  theme = 'light',
  onToggleTheme
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [timeStr, setTimeStr] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleString(language === 'id' ? 'id-ID' : 'en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, [language]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onOpenSearch(searchQuery.trim());
    }
  };

  const viewTitles: Record<ActiveView, { title: string; shortTitle: string; icon: any }> = {
    landing: { title: t.nav.landing, shortTitle: 'Home', icon: Sparkles },
    dashboard: { title: t.nav.dashboard, shortTitle: 'Dash', icon: LayoutDashboard },
    companies: { title: t.nav.companies, shortTitle: language === 'id' ? 'Komp' : 'Comp', icon: Building2 },
    contacts: { title: t.nav.contacts, shortTitle: language === 'id' ? 'Kontak' : 'Contact', icon: Users },
    leads: { title: t.nav.leads, shortTitle: 'Leads', icon: Target },
    deals: { title: t.nav.deals, shortTitle: 'Deals', icon: CircleDollarSign },
    quotations: { title: t.nav.quotations, shortTitle: language === 'id' ? 'Quotes' : 'Quotes', icon: FileText },
    customers: { title: t.nav.customers, shortTitle: language === 'id' ? 'Klien' : 'Clients', icon: Award },
    tasks: { title: t.nav.tasks, shortTitle: language === 'id' ? 'Tugas' : 'Tasks', icon: CheckSquare },
    analytics: { title: t.nav.analytics, shortTitle: 'Stats', icon: BarChart3 },
    pipeline: { title: t.nav.pipeline, shortTitle: 'Pipeline', icon: SlidersHorizontal },
    settings: { title: t.nav.settings, shortTitle: language === 'id' ? 'Setting' : 'Config', icon: Settings },
    hris: { title: t.nav.hris, shortTitle: 'HRIS', icon: UserCheck }
  };

  const currentViewObj = viewTitles[activeView] || viewTitles.dashboard;
  const ViewIcon = currentViewObj.icon;

  return (
    <header className="h-14 sm:h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-2.5 sm:px-4 lg:px-6 flex items-center justify-between gap-1.5 sm:gap-4 sticky top-0 z-30 shrink-0">
      {/* Left: Mobile Toggle & Adaptive View Title */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors cursor-pointer shrink-0"
          title={language === 'id' ? 'Buka Menu Navigasi' : 'Open Navigation'}
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 flex items-center justify-center shrink-0">
            <ViewIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          
          <div className="min-w-0">
            {/* Shortened title on small mobile screens, full title on tablet and desktop */}
            <span className="sm:hidden text-xs font-black text-slate-900 dark:text-white tracking-tight truncate block max-w-[85px] xs:max-w-[120px]">
              {currentViewObj.shortTitle}
            </span>
            <h1 className="hidden sm:block text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
              {currentViewObj.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Middle: Global Search (Tablet & Desktop) */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex items-center relative max-w-sm w-full mx-2"
      >
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.actions.searchPlaceholder}
          className="w-full pl-10 pr-12 py-1.5 text-xs bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100/90 border border-slate-200/80 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
        />
        <div className="absolute right-2.5 px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700 text-[9px] font-bold text-slate-500 dark:text-slate-400 pointer-events-none">
          ⌘K
        </div>
      </form>

      {/* Right Controls: User Avatar, Exit Button, Theme, Lang, Quick Add */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Currency Pill (Large Screens) */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 rounded-xl text-[11px] font-bold">
          <span className="text-slate-400 dark:text-slate-500 font-semibold">{t.actions.currency}</span>
          <span className="uppercase text-slate-900 dark:text-white">{currency}</span>
        </div>

        {/* Live Clock (Extra Large Screens) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>{timeStr || t.common.live}</span>
        </div>

        {/* Mobile Search Trigger Icon (Small screens only) */}
        <button
          type="button"
          onClick={() => onOpenSearch('')}
          className="md:hidden p-1.5 rounded-lg sm:rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={t.actions.searchPlaceholder}
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Language Switcher Pill */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg sm:rounded-xl border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setLanguage('id')}
            className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer flex items-center gap-0.5 sm:gap-1 ${
              language === 'id'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Bahasa Indonesia"
          >
            <span>🇮🇩</span>
            <span className="hidden xs:inline font-mono">ID</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer flex items-center gap-0.5 sm:gap-1 ${
              language === 'en'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="English"
          >
            <span>🇬🇧</span>
            <span className="hidden xs:inline font-mono">EN</span>
          </button>
        </div>

        {/* Theme Switcher Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-amber-400 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-center shrink-0"
            title={theme === 'dark' ? t.actions.themeLight : t.actions.themeDark}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />}
          </button>
        )}

        {/* User Account & Exit (Logout) Group - Always visible on mobile */}
        {currentUser ? (
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* User Profile Badge with Avatar */}
            <div
              className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800 px-1.5 sm:px-2.5 py-1 rounded-lg sm:rounded-xl border border-slate-200/90 dark:border-slate-700"
              title={`${currentUser.displayName || currentUser.email} (${currentUser.role})`}
            >
              <div className="relative">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-[10px] sm:text-xs shadow-xs shrink-0">
                  {currentUser.displayName ? (
                    currentUser.displayName.charAt(0).toUpperCase()
                  ) : currentUser.email ? (
                    currentUser.email.charAt(0).toUpperCase()
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white dark:border-slate-900 rounded-full" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight max-w-[110px] truncate">
                  {currentUser.displayName || currentUser.email.split('@')[0]}
                </div>
                <div className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" />
                  <span>{currentUser.role}</span>
                </div>
              </div>
            </div>

            {/* Prominent Exit / Logout Icon Button */}
            <button
              onClick={onLogout}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-2xs group"
              title={language === 'id' ? 'Keluar / Logout Akun' : t.actions.logout}
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer"
            title={t.actions.login}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.actions.login}</span>
          </button>
        )}

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
          title={t.actions.quickAdd}
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{t.actions.quickAdd}</span>
        </button>
      </div>
    </header>
  );
};

