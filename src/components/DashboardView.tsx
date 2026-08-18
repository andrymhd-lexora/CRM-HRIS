import React from 'react';
import { ActiveView, Task, Activity, Deal, Lead, Contact, CompanyProfile } from '../types/crm';
import { isTaskDueSoon } from '../utils/taskUtils';
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
  // Calculations
  const totalContacts = contacts.length;
  const activeLeads = leads.filter((l) => l.stage !== 'Won' && l.stage !== 'Lost').length;
  const openDeals = deals.filter((d) => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'Done');

  const totalDealValue = deals.reduce((acc, d) => acc + (d.value || 0), 0);
  const wonDeals = deals.filter((d) => d.stage === 'Closed Won').length;
  const closedDeals = deals.filter((d) => d.stage === 'Closed Won' || d.stage === 'Closed Lost').length;
  const winRate = closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTimeAgo = (isoString: string) => {
    try {
      const diff = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Baru saja';
      if (mins < 60) return `${mins}m yang lalu`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}j yang lalu`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}hari yang lalu`;
      return new Date(isoString).toLocaleDateString('id-ID');
    } catch {
      return 'Baru saja';
    }
  };

  const compBrand = companyProfile?.companyName || 'ErmApps Enterprise HRIS';
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
            title="Kelola Profil & Logo Perusahaan"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Profil</span>
          </button>
        </div>
      </div>

      {/* Primary Module Hub Selection Choice (Matching user request) */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white text-center space-y-4 shadow-xl shadow-blue-500/20">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
          Mulai Kelola CRM & Kepegawaian Perusahaan Anda
        </h2>
        <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
          Platform operasional lengkap dengan sinkronisasi Firestore real-time. Langsung gunakan atau pilih modul yang ingin dikelola.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-6 py-3 bg-white hover:bg-slate-100 text-blue-700 font-extrabold rounded-2xl text-xs shadow-md transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Buka Executive Dashboard</span>
          </button>
          <button
            onClick={() => onNavigate('hris')}
            className="px-6 py-3 bg-blue-700/60 hover:bg-blue-600 text-white font-extrabold rounded-2xl text-xs border border-white/30 shadow-sm transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-white" />
            <span>Kelola HRIS & Presensi</span>
          </button>
        </div>
      </div>

      {/* Top Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Executive CRM Dashboard</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200">
              Live Realtime
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ringkasan data kontak, performa sales pipeline, dan aktivitas tim hari ini.
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('hris')}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Modul HRIS</span>
          </button>
          <button
            onClick={() => onOpenAddModal('contact')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Kontak</span>
          </button>
          <button
            onClick={() => onOpenAddModal('lead')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Lead</span>
          </button>
          <button
            onClick={() => onOpenAddModal('deal')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-teal-600" />
            <span>Deal</span>
          </button>
          <button
            onClick={() => onOpenAddModal('task')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Task Baru</span>
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
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Contacts</span>
            <Users className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{totalContacts}</div>
          <div className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
            <span>Database kontak</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
          </div>
        </div>

        {/* Active Leads */}
        <div
          onClick={() => onNavigate('leads')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Active Leads</span>
            <Target className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{activeLeads}</div>
          <div className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
            <span>Dalam proses lead</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
          </div>
        </div>

        {/* Open Deals */}
        <div
          onClick={() => onNavigate('deals')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Open Deals</span>
            <CircleDollarSign className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{openDeals}</div>
          <div className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
            <span>Sales pipeline</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
          </div>
        </div>

        {/* Pending Tasks */}
        <div
          onClick={() => onNavigate('tasks')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Pending Tasks</span>
            <CheckSquare className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{pendingTasks.length}</div>
          <div className="text-[10px] font-semibold text-amber-600 mt-1 flex items-center gap-1">
            <span>Perlu tindakan</span>
            <ChevronRight className="w-3 h-3 text-amber-400" />
          </div>
        </div>

        {/* Total Pipeline Value */}
        <div
          onClick={() => onNavigate('deals')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Pipeline Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight truncate">
            {formatCurrency(totalDealValue)}
          </div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <span>Nilai total deal</span>
          </div>
        </div>

        {/* Overall Win Rate */}
        <div
          onClick={() => onNavigate('analytics')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Win Rate</span>
            <BarChart2 className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{winRate}%</div>
          <div className="text-[10px] font-semibold text-purple-600 mt-1 flex items-center gap-1">
            <span>Rasio deal won</span>
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
                <h3 className="font-extrabold text-sm text-slate-900">Task Perlu Tindakan</h3>
                <p className="text-[11px] text-slate-400">Task terdekat yang perlu diselesaikan hari ini</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                Semua task telah selesai dikerjakan!
              </div>
            ) : (
              pendingTasks.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={t.status === 'Done'}
                      onChange={() => t.id && onToggleTaskStatus(t.id)}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-extrabold text-slate-900 truncate">{t.title}</p>
                        {isTaskDueSoon(t) && (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black border border-amber-200 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            Due Soon
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        {t.dueDate && (
                          <span className={`flex items-center gap-1 font-semibold ${isTaskDueSoon(t) ? 'text-amber-700 font-bold' : 'text-slate-500'}`}>
                            {isTaskDueSoon(t) ? <Clock className="w-3 h-3 text-amber-600 animate-pulse" /> : <Calendar className="w-3 h-3 text-slate-400" />}
                            {t.dueDate}
                          </span>
                        )}
                        {t.assignedTo && <span>• Assigned: {t.assignedTo}</span>}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.priority === 'High'
                        ? 'bg-red-50 text-red-600 border border-red-200/60'
                        : t.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                        : 'bg-blue-50 text-blue-600 border border-blue-200/60'
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onOpenAddModal('task')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 rounded-2xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Tambah Task Baru</span>
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
                <h3 className="font-extrabold text-sm text-slate-900">Aktivitas Terbaru</h3>
                <p className="text-[11px] text-slate-400">Log perubahan dan interaksi data terupdate</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {activities.length} Aktivitas
            </span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Belum ada log aktivitas tercatat.
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
            ⚡ Data terrekam otomatis via IndexedDB Client Logger
          </div>
        </div>
      </div>
    </div>
  );
};
