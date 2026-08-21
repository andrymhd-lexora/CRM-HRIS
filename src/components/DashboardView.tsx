import React from 'react';
import { ActiveView, Task, Activity, Deal, Lead, Contact, CompanyProfile } from '../types/crm';
import { isTaskDueSoon } from '../utils/taskUtils';
import { useLanguage } from '../context/LanguageContext';
import {
  Users,
  Target,
  CircleDollarSign,
  CheckSquare,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
  Sparkles,
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  LayoutDashboard,
  Building2,
  MapPin,
  Settings,
  Phone,
  Globe
} from 'lucide-react';

interface DashboardViewProps {
  contacts: Contact[];
  leads: Lead[];
  deals: Deal[];
  tasks: Task[];
  activities: Activity[];
  currency: string;
  companyProfile?: CompanyProfile;
  onNavigate: (view: ActiveView) => void;
  onOpenAddModal: (type: 'contact' | 'lead' | 'deal' | 'task') => void;
  onToggleTaskStatus: (taskId: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  contacts,
  leads,
  deals,
  tasks,
  activities,
  currency,
  companyProfile,
  onNavigate,
  onOpenAddModal,
  onToggleTaskStatus
}) => {
  const { language, t, formatCurrency: formatMoney } = useLanguage();

  // Calculations
  const totalContacts = contacts.length;
  const activeLeads = leads.filter((l) => l.stage !== 'Won' && l.stage !== 'Lost').length;
  const openDeals = deals.filter((d) => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'Done');

  const totalDealValue = deals.reduce((acc, d) => acc + (d.value || 0), 0);
  const wonDeals = deals.filter((d) => d.stage === 'Closed Won').length;
  const closedDeals = deals.filter((d) => d.stage === 'Closed Won' || d.stage === 'Closed Lost').length;
  const winRate = closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0;

  const getTimeAgo = (isoString: string) => {
    try {
      const diff = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return language === 'id' ? 'Baru saja' : 'Just now';
      if (mins < 60) return language === 'id' ? `${mins}m yang lalu` : `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return language === 'id' ? `${hours}j yang lalu` : `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return language === 'id' ? `${days}h yang lalu` : `${days}d ago`;
      return new Date(isoString).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US');
    } catch {
      return language === 'id' ? 'Baru saja' : 'Just now';
    }
  };

  const compBrand = companyProfile?.companyName || (language === 'id' ? 'ErmApps Enterprise HRIS' : 'ErmApps Enterprise SaaS');
  const compLegal = companyProfile?.legalName || 'PT ErmApps Digital Nusantara';
  const compAddress = [companyProfile?.address, companyProfile?.city].filter(Boolean).join(', ');
  const logoUrl = companyProfile?.logoUrl;

  return (
    <div className="space-y-6 pb-12">
      {/* Company Profile Identity Banner (Realtime branding across app) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={compBrand}
              className="w-12 h-12 rounded-2xl object-contain bg-slate-50 p-1 border border-slate-200 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-500 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              {compBrand.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-black text-slate-900 tracking-tight truncate">
                {compBrand}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-200/80">
                {compLegal}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
              {compAddress && (
                <span className="flex items-center gap-1 truncate max-w-md">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{compAddress}</span>
                </span>
              )}
              {companyProfile?.phone && (
                <span className="hidden sm:flex items-center gap-1 text-slate-400">
                  <span>•</span>
                  <span>{companyProfile.phone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('settings')}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            title={language === 'id' ? 'Kelola Profil & Logo Perusahaan' : 'Manage Corporate Identity & Logo'}
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'id' ? 'Edit Profil' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Primary Module Hub Selection Choice */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white text-center space-y-4 shadow-xl shadow-blue-500/20">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
          {language === 'id' ? 'Mulai Kelola CRM & Kepegawaian Perusahaan Anda' : 'Manage Your Sales Pipeline & HR Workforce'}
        </h2>
        <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
          {language === 'id'
            ? 'Platform operasional lengkap dengan sinkronisasi Firestore real-time. Langsung gunakan atau pilih modul yang ingin dikelola.'
            : 'Unified operational system with Firestore cloud sync. Choose any module below to start work.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-6 py-3 bg-white hover:bg-slate-100 text-blue-700 font-extrabold rounded-2xl text-xs shadow-md transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>{language === 'id' ? 'Executive Dashboard' : 'Executive Dashboard'}</span>
          </button>
          <button
            onClick={() => onNavigate('hris')}
            className="px-6 py-3 bg-blue-700/60 hover:bg-blue-600 text-white font-extrabold rounded-2xl text-xs border border-white/30 shadow-sm transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-white" />
            <span>{t.nav.hris}</span>
          </button>
        </div>
      </div>

      {/* Top Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t.dashboard.title}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200">
              Live Realtime
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t.dashboard.subtitle}
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('hris')}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.nav.hris}</span>
          </button>
          <button
            onClick={() => onOpenAddModal('contact')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'id' ? 'Kontak' : 'Contact'}</span>
          </button>
          <button
            onClick={() => onOpenAddModal('lead')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>{language === 'id' ? 'Lead' : 'Lead'}</span>
          </button>
          <button
            onClick={() => onOpenAddModal('deal')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-teal-600" />
            <span>{language === 'id' ? 'Deal' : 'Deal'}</span>
          </button>
          <button
            onClick={() => onOpenAddModal('task')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.actions.newTask}</span>
          </button>
        </div>
      </div>

      {/* Top Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Contacts */}
        <div
          onClick={() => onNavigate('contacts')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{t.dashboard.totalContacts}</span>
            <Users className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{totalContacts}</div>
          <div className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
            <span>{language === 'id' ? 'Database kontak' : 'Contacts directory'}</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
          </div>
        </div>

        {/* Active Leads */}
        <div
          onClick={() => onNavigate('leads')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{t.dashboard.activeLeads}</span>
            <Target className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{activeLeads}</div>
          <div className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
            <span>{language === 'id' ? 'Dalam proses lead' : 'Leads in progress'}</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
          </div>
        </div>

        {/* Open Deals */}
        <div
          onClick={() => onNavigate('deals')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{t.dashboard.openDeals}</span>
            <CircleDollarSign className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{openDeals}</div>
          <div className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
            <span>{language === 'id' ? 'Sales pipeline' : 'Active pipeline'}</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
          </div>
        </div>

        {/* Pending Tasks */}
        <div
          onClick={() => onNavigate('tasks')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{t.dashboard.pendingTasks}</span>
            <CheckSquare className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{pendingTasks.length}</div>
          <div className="text-[10px] font-semibold text-amber-600 mt-1 flex items-center gap-1">
            <span>{language === 'id' ? 'Perlu tindakan' : 'Action needed'}</span>
            <ChevronRight className="w-3 h-3 text-amber-400" />
          </div>
        </div>

        {/* Total Pipeline Value */}
        <div
          onClick={() => onNavigate('deals')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{t.dashboard.pipelineValue}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight truncate">
            {formatMoney(totalDealValue, currency)}
          </div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <span>{language === 'id' ? 'Nilai total deal' : 'Total deal value'}</span>
          </div>
        </div>

        {/* Overall Win Rate */}
        <div
          onClick={() => onNavigate('analytics')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{t.dashboard.winRate}</span>
            <BarChart2 className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{winRate}%</div>
          <div className="text-[10px] font-semibold text-purple-600 mt-1 flex items-center gap-1">
            <span>{language === 'id' ? 'Rasio deal won' : 'Won deal ratio'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Upcoming Tasks & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{t.dashboard.upcomingTasks}</h3>
                <p className="text-[11px] text-slate-400">
                  {language === 'id' ? 'Task terdekat yang perlu diselesaikan' : 'Tasks requiring action today'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>{t.actions.viewAll}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                {language === 'id' ? 'Semua task telah selesai dikerjakan!' : 'All tasks are completed!'}
              </div>
            ) : (
              pendingTasks.slice(0, 5).map((tItem) => (
                <div
                  key={tItem.id}
                  className="p-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={tItem.status === 'Done'}
                      onChange={() => tItem.id && onToggleTaskStatus(tItem.id)}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-extrabold text-slate-900 truncate">{tItem.title}</p>
                        {isTaskDueSoon(tItem) && (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black border border-amber-200 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            Due Soon
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        {tItem.dueDate && (
                          <span className={`flex items-center gap-1 font-semibold ${isTaskDueSoon(tItem) ? 'text-amber-700 font-bold' : 'text-slate-500'}`}>
                            {isTaskDueSoon(tItem) ? <Clock className="w-3 h-3 text-amber-600 animate-pulse" /> : <Calendar className="w-3 h-3 text-slate-400" />}
                            {tItem.dueDate}
                          </span>
                        )}
                        {tItem.assignedTo && <span>• Assigned: {tItem.assignedTo}</span>}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tItem.priority === 'High'
                        ? 'bg-red-50 text-red-600 border border-red-200/60'
                        : tItem.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                        : 'bg-blue-50 text-blue-600 border border-blue-200/60'
                    }`}
                  >
                    {tItem.priority}
                  </span>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onOpenAddModal('task')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 rounded-2xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.actions.newTask}</span>
          </button>
        </div>

        {/* Live Activities Feed */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{t.dashboard.recentActivity}</h3>
                <p className="text-[11px] text-slate-400">
                  {language === 'id' ? 'Log perubahan dan interaksi data terupdate' : 'Latest interactions and audit records'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {activities.length} {language === 'id' ? 'Aktivitas' : 'Activities'}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                {language === 'id' ? 'Belum ada log aktivitas tercatat.' : 'No recent activity recorded.'}
              </div>
            ) : (
              activities.slice(0, 6).map((a) => (
                <div
                  key={a.id || Math.random()}
                  className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-semibold text-slate-800 truncate">{a.description}</p>
                    <span className="text-[10px] text-slate-400 block">{getTimeAgo(a.timestamp)}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-bold uppercase shrink-0 border border-blue-100">
                    {a.type}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-1">
            ⚡ {language === 'id' ? 'Tersinkronisasi otomatis via Cloud Firestore' : 'Synced in real-time via Cloud Firestore'}
          </div>
        </div>
      </div>
    </div>
  );
};
