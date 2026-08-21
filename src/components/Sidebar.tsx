import React, { useState } from 'react';
import { ActiveView, HRISTab, UserProfile, CompanyProfile } from '../types/crm';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Award,
  Target,
  CircleDollarSign,
  CheckSquare,
  BarChart3,
  SlidersHorizontal,
  Settings,
  Sparkles,
  X,
  Database,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Calendar,
  CalendarDays,
  FileSpreadsheet,
  FileText,
  CreditCard,
  Clock,
  Layers,
  ShieldCheck,
  Globe
} from 'lucide-react';

interface SidebarProps {
  activeView: ActiveView;
  activeHrisTab?: HRISTab;
  setActiveView: (view: ActiveView, hrisTab?: HRISTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  counts: {
    companies?: number;
    contacts: number;
    leads: number;
    deals: number;
    quotations?: number;
    customers?: number;
    tasks: number;
    employees?: number;
    pendingLeaves?: number;
  };
  companyName: string;
  companyProfile?: CompanyProfile;
  currentUser?: UserProfile | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  activeHrisTab = 'overview',
  setActiveView,
  isOpenMobile,
  setIsOpenMobile,
  counts,
  companyName,
  companyProfile,
  currentUser
}) => {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  const [isCrmOpen, setIsCrmOpen] = useState(true);
  const [isHrisOpen, setIsHrisOpen] = useState(true);

  const isAdminOrAbove =
    currentUser?.role === 'Super Admin' ||
    currentUser?.role === 'Owner' ||
    currentUser?.role === 'Admin';
  const isStaff = currentUser?.role === 'Staff';

  const crmNavItems = [
    { id: 'dashboard' as ActiveView, label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'companies' as ActiveView, label: t.nav.companies, icon: Building2, badge: counts.companies },
    { id: 'contacts' as ActiveView, label: t.nav.contacts, icon: Users, badge: counts.contacts },
    { id: 'leads' as ActiveView, label: t.nav.leads, icon: Target, badge: counts.leads },
    { id: 'deals' as ActiveView, label: t.nav.deals, icon: CircleDollarSign, badge: counts.deals },
    { id: 'quotations' as ActiveView, label: t.nav.quotations, icon: FileText, badge: counts.quotations },
    { id: 'customers' as ActiveView, label: t.nav.customers, icon: Award, badge: counts.customers },
    { id: 'tasks' as ActiveView, label: t.nav.tasks, icon: CheckSquare, badge: counts.tasks },
    { id: 'analytics' as ActiveView, label: t.nav.analytics, icon: BarChart3 },
    { id: 'pipeline' as ActiveView, label: t.nav.pipeline, icon: SlidersHorizontal }
  ];

  const hrisSubItems = [
    { tab: 'overview' as HRISTab, label: t.hrisTabs.overview, icon: Clock },
    { tab: 'employees' as HRISTab, label: t.hrisTabs.employees, icon: Users, badge: counts.employees !== undefined ? `${counts.employees}` : undefined },
    { tab: 'attendance' as HRISTab, label: t.hrisTabs.attendance, icon: CalendarDays },
    { tab: 'leave' as HRISTab, label: t.hrisTabs.leave, icon: FileText, badge: counts.pendingLeaves !== undefined && counts.pendingLeaves > 0 ? `${counts.pendingLeaves}` : undefined },
    { tab: 'payroll' as HRISTab, label: t.hrisTabs.payroll, icon: CreditCard },
    ...(!isStaff ? [{ tab: 'reports' as HRISTab, label: t.hrisTabs.reports, icon: BarChart3 }] : [])
  ];

  const handleNavClick = (view: ActiveView, hrisTab?: HRISTab) => {
    setActiveView(view, hrisTab);
    setIsOpenMobile(false);
  };

  const displayName = companyProfile?.companyName || companyName || 'ErmApps';
  const logoUrl = companyProfile?.logoUrl;
  const legalName = companyProfile?.legalName || (language === 'id' ? 'Enterprise HRIS & CRM' : 'Enterprise HRIS & CRM');

  return (
    <>
      {/* Mobile Overlay Background */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Header Logo */}
        <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div
            className="flex items-center gap-2.5 cursor-pointer group min-w-0"
            onClick={() => handleNavClick('dashboard')}
            title={`${displayName} - ${legalName}`}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-9 h-9 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200/80 shadow-xs group-hover:scale-105 transition-transform shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-slate-900 tracking-tight text-sm truncate">
                  {displayName}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold truncate leading-tight">
                {legalName}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpenMobile(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs font-medium custom-scrollbar">
          {/* Quick Portal Switch */}
          <button
            onClick={() => handleNavClick('landing')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'landing'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{t.nav.landing}</span>
          </button>

          {/* CRM & SALES SECTION */}
          <div className="space-y-1">
            <button
              onClick={() => setIsCrmOpen(!isCrmOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors group cursor-pointer"
            >
              <span>{t.nav.crmSection}</span>
              <div className="p-0.5 rounded-md group-hover:bg-slate-100">
                {isCrmOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {isCrmOpen && (
              <div className="space-y-0.5 transition-all">
                {crmNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border border-blue-100/80 font-bold shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                            isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* HRIS & WORKFORCE SUITE SECTION */}
          <div className="space-y-1">
            <button
              onClick={() => setIsHrisOpen(!isHrisOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>{t.nav.hrisSection}</span>
              </div>
              <div className="flex items-center gap-1">
                {counts.pendingLeaves && counts.pendingLeaves > 0 ? (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[8px] font-black rounded-md flex items-center gap-0.5 animate-pulse">
                    <FileText className="w-2.5 h-2.5" />
                    {counts.pendingLeaves} {language === 'id' ? 'CUTI' : 'LEAVE'}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-600 text-[8px] font-extrabold rounded-md">
                    TER 2024
                  </span>
                )}
                <div className="p-0.5 rounded-md group-hover:bg-slate-100">
                  {isHrisOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </div>
            </button>

            {isHrisOpen && (
              <div className="space-y-0.5 pl-1 transition-all">
                {hrisSubItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === 'hris' && activeHrisTab === item.tab;
                  return (
                    <button
                      key={item.tab}
                      onClick={() => handleNavClick('hris', item.tab)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-bold shadow-2xs'
                          : 'text-slate-600 hover:bg-indigo-50/50 hover:text-indigo-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {!isStaff && item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                          item.tab === 'leave' && counts.pendingLeaves && counts.pendingLeaves > 0
                            ? isActive
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-amber-500 text-white animate-pulse shadow-xs'
                            : isActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {item.tab === 'leave' && counts.pendingLeaves && counts.pendingLeaves > 0 && <FileText className="w-2.5 h-2.5" />}
                          {item.badge} {item.tab === 'leave' && counts.pendingLeaves && counts.pendingLeaves > 0 ? (language === 'id' ? 'PENDING' : 'PENDING') : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SYSTEM SETTINGS - Only for Admin, Owner, Super Admin */}
          {isAdminOrAbove && (
            <div>
              <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {t.nav.systemSection}
              </div>
              <button
                onClick={() => handleNavClick('settings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeView === 'settings'
                    ? 'bg-blue-50 text-blue-600 border border-blue-100/80 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className={`w-4 h-4 shrink-0 ${activeView === 'settings' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{t.nav.settings}</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Footer: Language Switcher & Database Engine Badge */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
          {/* Quick Language Toggle */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 text-[11px] shadow-2xs">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'id' ? 'Bahasa' : 'Language'}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-black transition-colors ${
                  language === 'id' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                ID
              </button>
              <span className="text-slate-300">/</span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-black transition-colors ${
                  language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-500 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                Firebase Firestore
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {language === 'id'
                ? 'Single-Tenant Cloud Database. Sinkronisasi multi-user real-time.'
                : 'Single-Tenant Cloud Database. Real-time multi-user synchronization.'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
