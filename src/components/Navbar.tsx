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
  Globe
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
  const { language, toggleLanguage, setLanguage, t } = useLanguage();
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

  const viewTitles: Record<ActiveView, { title: string; icon: any }> = {
    landing: { title: t.nav.landing, icon: Sparkles },
    dashboard: { title: t.nav.dashboard, icon: LayoutDashboard },
    companies: { title: t.nav.companies, icon: Building2 },
    contacts: { title: t.nav.contacts, icon: Users },
    leads: { title: t.nav.leads, icon: Target },
    deals: { title: t.nav.deals, icon: CircleDollarSign },
    quotations: { title: t.nav.quotations, icon: FileText },
    customers: { title: t.nav.customers, icon: Award },
    tasks: { title: t.nav.tasks, icon: CheckSquare },
    analytics: { title: t.nav.analytics, icon: BarChart3 },
    pipeline: { title: t.nav.pipeline, icon: SlidersHorizontal },
    settings: { title: t.nav.settings, icon: Settings },
    hris: { title: t.nav.hris, icon: UserCheck }
  };

  const currentViewObj = viewTitles[activeView] || viewTitles.dashboard;
  const ViewIcon = currentViewObj.icon;

  return (
    <header className="h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shrink-0">
      {/* Left: Mobile Toggle & View Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
          title={language === 'id' ? 'Buka Navigasi' : 'Open Navigation'}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 flex items-center justify-center shrink-0">
            <ViewIcon className="w-4 h-4" />
          </div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
            {currentViewObj.title}
          </h1>
        </div>
      </div>

      {/* Middle: Global Search */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex items-center relative max-w-sm w-full"
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

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Currency Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 rounded-xl text-[11px] font-bold">
          <span className="text-slate-400 dark:text-slate-500 font-semibold">{t.actions.currency}</span>
          <span className="uppercase text-slate-900 dark:text-white">{currency}</span>
        </div>

        {/* Live Clock */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>{timeStr || t.common.live}</span>
        </div>

        {/* Language Switcher Pill Button */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setLanguage('id')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              language === 'id'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Ganti ke Bahasa Indonesia"
          >
            <span>🇮🇩</span>
            <span className="hidden sm:inline">ID</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              language === 'en'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            title="Switch to English"
          >
            <span>🇬🇧</span>
            <span className="hidden sm:inline">EN</span>
          </button>
        </div>

        {/* User Account / Login Button */}
        {currentUser ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-all">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-[11px] shadow-2xs">
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser.displayName || currentUser.email.split('@')[0]}
                </div>
                <div className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" />
                  {currentUser.role}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-200/60 dark:border-slate-700 transition-colors cursor-pointer"
              title={t.actions.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t.actions.login}</span>
          </button>
        )}

        {/* Theme Switcher Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-amber-400 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-center shrink-0"
            title={theme === 'dark' ? t.actions.themeLight : t.actions.themeDark}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        )}

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 hover:scale-102 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">{t.actions.quickAdd}</span>
        </button>
      </div>
    </header>
  );
};
