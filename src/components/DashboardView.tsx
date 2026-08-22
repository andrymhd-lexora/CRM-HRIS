import React, { useState } from 'react';
import {
  ActiveView,
  HRISTab,
  Task,
  Activity,
  Deal,
  Lead,
  Contact,
  Company,
  Quotation,
  Employee,
  Attendance,
  LeaveRequest,
  Payroll,
  CompanyProfile,
  UserProfile
} from '../types/crm';
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
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  LayoutDashboard,
  Building2,
  MapPin,
  Settings,
  Phone,
  Globe,
  FileText,
  CreditCard,
  CalendarDays,
  ShieldCheck,
  Lock,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Layers,
  SlidersHorizontal,
  Briefcase
} from 'lucide-react';

interface DashboardViewProps {
  contacts: Contact[];
  leads: Lead[];
  deals: Deal[];
  tasks: Task[];
  companies?: Company[];
  quotations?: Quotation[];
  customers?: Company[];
  employees?: Employee[];
  attendances?: Attendance[];
  leaveRequests?: LeaveRequest[];
  payrolls?: Payroll[];
  activities: Activity[];
  currency: string;
  companyProfile?: CompanyProfile;
  currentUser?: UserProfile | null;
  onNavigate: (view: ActiveView, hrisTab?: HRISTab) => void;
  onOpenAddModal: (type: 'contact' | 'lead' | 'deal' | 'task' | 'quotation' | 'company') => void;
  onToggleTaskStatus: (taskId: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  contacts,
  leads,
  deals,
  tasks,
  companies = [],
  quotations = [],
  customers = [],
  employees = [],
  attendances = [],
  leaveRequests = [],
  payrolls = [],
  activities,
  currency,
  companyProfile,
  currentUser,
  onNavigate,
  onOpenAddModal,
  onToggleTaskStatus
}) => {
  const { language, t, formatCurrency: formatMoney } = useLanguage();
  const [activitySearch, setActivitySearch] = useState('');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<'all' | 'crm' | 'hris' | 'system'>('all');

  // Role permissions check for audit logs & sensitive widgets
  const isAdminOrAbove =
    currentUser?.role === 'Super Admin' ||
    currentUser?.role === 'Owner' ||
    currentUser?.role === 'Admin';
  const isStaff = currentUser?.role === 'Staff';

  // CRM Calculations
  const totalContacts = contacts.length;
  const activeLeads = leads.filter((l) => l.stage !== 'Won' && l.stage !== 'Lost' && l.stage !== 'CONVERTED').length;
  const openDeals = deals.filter((d) => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost' && d.stage !== 'WON' && d.stage !== 'LOST').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'Done' && t.status !== 'Completed');

  const totalDealValue = deals.reduce((acc, d) => acc + (d.value || 0), 0);
  const wonDeals = deals.filter((d) => d.stage === 'Closed Won' || d.stage === 'WON' || d.stage === 'PO / SPK').length;
  const closedDeals = deals.filter((d) => d.stage === 'Closed Won' || d.stage === 'Closed Lost' || d.stage === 'WON' || d.stage === 'LOST').length;
  const winRate = closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0;

  const totalQuotationsCount = quotations.length;
  const totalCompaniesCount = companies.length;
  const totalCustomersCount = customers.length;

  // HRIS Calculations
  const totalEmployeesCount = employees.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendances = attendances.filter((a) => a.date === todayStr);
  const presentTodayCount = todayAttendances.filter((a) => a.status === 'Hadir' || a.status === 'Terlambat').length;
  const onTimeTodayCount = todayAttendances.filter((a) => a.status === 'Hadir').length;
  const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'Pending').length;

  // User personal summary for non-admin roles
  const myAssignedTasks = tasks.filter((t) => {
    if (!currentUser) return false;
    const uidMatch = t.assignedTo && String(t.assignedTo) === currentUser.uid;
    const nameMatch = currentUser.displayName && t.assignedTo && t.assignedTo.toLowerCase().includes(currentUser.displayName.toLowerCase());
    return uidMatch || nameMatch;
  });
  const myPendingTasks = myAssignedTasks.filter((t) => t.status !== 'Done' && t.status !== 'Completed');

  const myLeaves = leaveRequests.filter((l) => {
    if (!currentUser) return false;
    return (
      (currentUser.displayName && l.employeeName && l.employeeName.toLowerCase() === currentUser.displayName.toLowerCase()) ||
      (currentUser.email && l.employeeId && employees.find((e) => e.email.toLowerCase() === currentUser.email?.toLowerCase())?.id === l.employeeId)
    );
  });

  const myAttendanceToday = todayAttendances.find((a) => {
    if (!currentUser) return false;
    return (
      (currentUser.displayName && a.employeeName && a.employeeName.toLowerCase() === currentUser.displayName.toLowerCase()) ||
      (currentUser.email && a.employeeId && employees.find((e) => e.email.toLowerCase() === currentUser.email?.toLowerCase())?.id === a.employeeId)
    );
  });

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

  const compBrand = companyProfile?.companyName || (language === 'id' ? 'ErmApps Enterprise HRIS & CRM' : 'ErmApps Enterprise SaaS');
  const compLegal = companyProfile?.legalName || 'PT ErmApps Digital Nusantara';
  const compAddress = [companyProfile?.address, companyProfile?.city].filter(Boolean).join(', ');
  const logoUrl = companyProfile?.logoUrl;

  // Filtered activities for Admin/Owner view
  const filteredActivities = activities.filter((a) => {
    const matchSearch =
      activitySearch.trim() === '' ||
      a.description.toLowerCase().includes(activitySearch.toLowerCase()) ||
      (a.type && a.type.toLowerCase().includes(activitySearch.toLowerCase())) ||
      (a.createdByName && a.createdByName.toLowerCase().includes(activitySearch.toLowerCase()));

    if (!matchSearch) return false;

    if (selectedActivityFilter === 'crm') {
      return ['contact', 'lead', 'deal', 'quotation', 'company'].includes(a.type);
    }
    if (selectedActivityFilter === 'hris') {
      return a.type === 'hris';
    }
    if (selectedActivityFilter === 'system') {
      return a.type === 'system' || a.type === 'task';
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Corporate Identity & Live Sync Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={compBrand}
              className="w-12 h-12 rounded-2xl object-contain bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-500 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              {compBrand.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
                {compBrand}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold border border-blue-200/80 dark:border-blue-800">
                {compLegal}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Firestore
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
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
              {companyProfile?.taxId && (
                <span className="hidden md:flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                  <span>• NPWP:</span>
                  <span>{companyProfile.taxId}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {currentUser && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-400 text-[10px] block font-semibold">{language === 'id' ? 'Login sebagai' : 'Logged in as'}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                {currentUser.displayName || currentUser.email} ({currentUser.role})
              </span>
            </div>
          )}

          {isAdminOrAbove && (
            <button
              onClick={() => onNavigate('settings')}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title={language === 'id' ? 'Kelola Profil & Pengaturan Perusahaan' : 'Manage Corporate Identity & Settings'}
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'id' ? 'Pengaturan' : 'Settings'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Action Bar with Direct Navigation to All SaaS Features */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>{language === 'id' ? 'Executive Overview & Modul SaaS' : 'Executive Overview & SaaS Suite'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'id'
              ? 'Pantau metrik penjualan CRM, absensi kepegawaian HRIS, dan seluruh alur kerja operasional bisnis.'
              : 'Monitor CRM sales pipeline, HRIS workforce attendance, and full operational business workflows.'}
          </p>
        </div>

        {/* Quick Add Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('hris', 'attendance')}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{language === 'id' ? 'Absen / Presensi' : 'Attendance'}</span>
          </button>
          <button
            onClick={() => onOpenAddModal('lead')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ {language === 'id' ? 'Lead' : 'Lead'}</span>
          </button>
          <button
            onClick={() => onOpenAddModal('deal')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-teal-600" />
            <span>+ {language === 'id' ? 'Deal' : 'Deal'}</span>
          </button>
          <button
            onClick={() => onNavigate('quotations')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'id' ? 'Penawaran' : 'Quotes'}</span>
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

      {/* 3. Comprehensive KPI Metrics Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Contacts */}
        <div
          onClick={() => onNavigate('contacts')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{t.dashboard.totalContacts}</span>
            <Users className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{totalContacts}</div>
          <div className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center justify-between">
            <span>{language === 'id' ? 'Database kontak' : 'Contacts'}</span>
            <ChevronRight className="w-3 h-3 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Active Leads */}
        <div
          onClick={() => onNavigate('leads')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{t.dashboard.activeLeads}</span>
            <Target className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{activeLeads}</div>
          <div className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center justify-between">
            <span>{language === 'id' ? 'Prospek berjalan' : 'Active leads'}</span>
            <ChevronRight className="w-3 h-3 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Open Deals */}
        <div
          onClick={() => onNavigate('deals')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{t.dashboard.openDeals}</span>
            <CircleDollarSign className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{openDeals}</div>
          <div className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center justify-between">
            <span>{language === 'id' ? 'Pipeline aktif' : 'Active deals'}</span>
            <ChevronRight className="w-3 h-3 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Total Pipeline Value */}
        <div
          onClick={() => onNavigate('deals')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{t.dashboard.pipelineValue}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
            {formatMoney(totalDealValue, currency)}
          </div>
          <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center justify-between">
            <span>{language === 'id' ? 'Win Rate' : 'Win Rate'}: {winRate}%</span>
            <ChevronRight className="w-3 h-3 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* HRIS Workforce / Karyawan */}
        <div
          onClick={() => onNavigate('hris', 'employees')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{language === 'id' ? 'Karyawan Aktif' : 'Total Employees'}</span>
            <UserCheck className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{totalEmployeesCount}</div>
          <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center justify-between">
            <span>{language === 'id' ? 'Direktori HR' : 'HR Directory'}</span>
            <ChevronRight className="w-3 h-3 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Presensi Hari Ini & Pengajuan Cuti */}
        <div
          onClick={() => onNavigate('hris', 'attendance')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{language === 'id' ? 'Presensi Hari Ini' : 'Attendance Today'}</span>
            <CalendarDays className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {presentTodayCount} <span className="text-xs text-slate-400 font-normal">/ {totalEmployeesCount || '-'}</span>
          </div>
          <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-1 flex items-center justify-between">
            <span>
              {pendingLeavesCount > 0 ? (
                <span className="font-extrabold text-amber-700 dark:text-amber-300">
                  {pendingLeavesCount} {language === 'id' ? 'Cuti Pending' : 'Pending Leaves'}
                </span>
              ) : (
                language === 'id' ? 'Presensi GPS' : 'GPS Check-In'
              )}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* 4. Complete SaaS Feature Hub (Direktori Seluruh Fitur Aplikasi) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                {language === 'id' ? 'Direktori Lengkap Fitur & Modul Aplikasi SaaS' : 'Complete SaaS Application Feature Hub'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'id'
                  ? 'Akses cepat dan terpadu ke seluruh modul CRM Penjualan, HRIS Kepegawaian, dan Operasional Perusahaan.'
                  : 'Instant unified access to all Sales CRM, Workforce HRIS, and Corporate Governance modules.'}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-extrabold rounded-full self-start sm:self-auto">
            12+ {language === 'id' ? 'Modul Aktif' : 'Active Modules'}
          </span>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* CRM: Perusahaan */}
          <div
            onClick={() => onNavigate('companies')}
            className="p-4 rounded-2xl bg-slate-50/70 hover:bg-blue-50/50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {language === 'id' ? 'Perusahaan & Akun B2B' : 'Companies & B2B Accounts'}
                </h4>
                <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {totalCompaniesCount}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {language === 'id' ? 'Direktori profil korporat, alamat kantor, NPWP, dan histori relasi bisnis.' : 'B2B company profiles, corporate addresses, tax IDs, and business history.'}
              </p>
            </div>
          </div>

          {/* CRM: Kontak */}
          <div
            onClick={() => onNavigate('contacts')}
            className="p-4 rounded-2xl bg-slate-50/70 hover:bg-blue-50/50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {language === 'id' ? 'Buku Kontak & PIC' : 'Contacts & PIC Directory'}
                </h4>
                <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {totalContacts}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {language === 'id' ? 'Database person-in-charge, nomor telepon, email resmi, dan tombol langsung WhatsApp.' : 'PIC directory, direct WhatsApp messaging, phone calls, and email contacts.'}
              </p>
            </div>
          </div>

          {/* CRM: Leads */}
          <div
            onClick={() => onNavigate('leads')}
            className="p-4 rounded-2xl bg-slate-50/70 hover:bg-blue-50/50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {language === 'id' ? 'Manajemen Leads & Prospek' : 'Leads & Prospect Pipeline'}
                </h4>
                <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {activeLeads}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {language === 'id' ? 'Kualifikasi prospek masuk, estimasi nilai proyek, dan konversi cepat ke Deal/Kontak.' : 'Lead qualification stages, estimated value, and instant conversion to deals.'}
              </p>
            </div>
          </div>

          {/* CRM: Deals & Opportunities */}
          <div
            onClick={() => onNavigate('deals')}
            className="p-4 rounded-2xl bg-slate-50/70 hover:bg-blue-50/50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {language === 'id' ? 'Deals & Peluang Penjualan' : 'Deals & Sales Pipeline'}
                </h4>
                <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {openDeals}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {language === 'id' ? 'Tahapan negosiasi closing, estimasi probabilitas, dan tracking target omset.' : 'Closing stages, deal probabilities, and revenue tracking.'}
              </p>
            </div>
          </div>

          {/* CRM: Quotations */}
          <div
            onClick={() => onNavigate('quotations')}
            className="p-4 rounded-2xl bg-slate-50/70 hover:bg-blue-50/50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {language === 'id' ? 'Penawaran Harga (Quotations)' : 'Official Quotations'}
                </h4>
                <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {totalQuotationsCount}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {language === 'id' ? 'Kalkulasi item barang/jasa otomatis, PPN 11%, diskon, dan cetak PDF profesional.' : 'Itemized quotes, automatic 11% VAT, discounts, and professional PDF generation.'}
              </p>
            </div>
          </div>

          {/* CRM: Pelanggan Customer 360 */}
          <div
            onClick={() => onNavigate('customers')}
            className="p-4 rounded-2xl bg-slate-50/70 hover:bg-blue-50/50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {language === 'id' ? 'Customer 360 & Loyalitas' : 'Customer 360 & Loyalty'}
                </h4>
                <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {totalCustomersCount}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {language === 'id' ? 'Profil lengkap klien yang telah closing, riwayat transaksi, dan retensi pelanggan.' : 'Comprehensive client profiles, transactional history, and retention tracking.'}
              </p>
            </div>
          </div>

          {/* HRIS: Presensi GPS */}
          <div
            onClick={() => onNavigate('hris', 'attendance')}
            className="p-4 rounded-2xl bg-slate-50/70 hover:bg-indigo-50/50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {language === 'id' ? 'Presensi Online & GPS' : 'GPS Attendance & Check-In'}
                </h4>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {presentTodayCount} Hadir
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {language === 'id' ? 'Absensi check-in/out realtime dengan geotagging koordinat GPS, mode WFO/WFH.' : 'Real-time check-in/out with GPS geotagging, WFO/WFH shift tracking.'}
              </p>
            </div>
          </div>

          {/* HRIS: Database Karyawan */}
          <div
            onClick={() => onNavigate('hris', 'employees')}
            className="p-4 rounded-2xl bg-slate-50/70 hover:bg-indigo-50/50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {language === 'id' ? 'Database & Profil Karyawan' : 'Employees Master Data'}
                </h4>
                <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {totalEmployeesCount}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {language === 'id' ? 'Master data SDM, NIK KTP, status PTKP pajak, jabatan, departemen & tunjangan.' : 'Employee directory, tax status, positions, departments, and payroll profiles.'}
              </p>
            </div>
          </div>

          {/* HRIS: Pengajuan Cuti */}
          <div
            onClick={() => onNavigate('hris', 'leave')}
            className="p-4 rounded-2xl bg-slate-50/70 hover:bg-indigo-50/50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {language === 'id' ? 'Pengajuan & Persetujuan Cuti' : 'Leave Requests & Approvals'}
                </h4>
                {pendingLeavesCount > 0 ? (
                  <span className="text-[10px] font-black text-white bg-amber-500 px-1.5 py-0.5 rounded animate-pulse">
                    {pendingLeavesCount} Pending
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    0 Pending
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {language === 'id' ? 'Pengajuan izin sakit, cuti tahunan, dan persetujuan bertingkat oleh HR/Atasan.' : 'Leave requests, sick notes, and multi-tier manager approvals.'}
              </p>
            </div>
          </div>

          {/* HRIS: Penggajian TER 2024 */}
          <div
            onClick={() => onNavigate('hris', 'payroll')}
            className="p-4 rounded-2xl bg-slate-50/70 hover:bg-indigo-50/50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {language === 'id' ? 'Penggajian & Slip Gaji (TER 2024)' : 'Payroll & Pay Slip (TER 2024)'}
                </h4>
                <span className="text-[9px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  PPh 21 TER
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {language === 'id' ? 'Kalkulasi otomatis Gaji Pokok, Tunjangan, BPJS Kesehatan/TK, dan tarif efektif bulanan.' : 'Automated salary calculations, allowances, BPJS, and TER 2024 tax deductions.'}
              </p>
            </div>
          </div>

          {/* CRM: Analitik & Visual Pipeline */}
          <div
            onClick={() => onNavigate('analytics')}
            className="p-4 rounded-2xl bg-slate-50/70 hover:bg-blue-50/50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {language === 'id' ? 'Laporan & Analitik Sales' : 'Sales Analytics & Reports'}
                </h4>
                <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {winRate}% Win
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {language === 'id' ? 'Visualisasi grafik konversi, tren pendapatan per bulan, dan performa tim penjualan.' : 'Visualized conversion funnels, monthly revenue trends, and sales rep performance.'}
              </p>
            </div>
          </div>

          {/* Pipeline Kanban */}
          <div
            onClick={() => onNavigate('pipeline')}
            className="p-4 rounded-2xl bg-slate-50/70 hover:bg-blue-50/50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {language === 'id' ? 'Visual Kanban Pipeline' : 'Kanban Pipeline Board'}
                </h4>
                <span className="text-[9px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded">
                  Kanban
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {language === 'id' ? 'Tampilan kartu papan kanban interaktif untuk menggeser status deals secara visual.' : 'Interactive drag-and-drop board for visual deal stages management.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Main Content Grid: Upcoming Tasks & Live Activity Log (RBAC Protected) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{t.dashboard.upcomingTasks}</h3>
                <p className="text-[11px] text-slate-400">
                  {language === 'id' ? 'Task & tindak lanjut yang perlu diselesaikan' : 'Tasks & follow-ups requiring action'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>{t.actions.viewAll}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                {language === 'id' ? 'Semua task telah selesai dikerjakan!' : 'All tasks are completed!'}
              </div>
            ) : (
              pendingTasks.slice(0, 6).map((tItem) => (
                <div
                  key={tItem.id}
                  className="p-3 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={tItem.status === 'Done' || tItem.status === 'Completed'}
                      onChange={() => tItem.id && onToggleTaskStatus(Number(tItem.id))}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">{tItem.title}</p>
                        {isTaskDueSoon(tItem) && (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[9px] font-black border border-amber-200 dark:border-amber-700 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            Due Soon
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 flex-wrap">
                        {tItem.dueDate && (
                          <span className={`flex items-center gap-1 font-semibold ${isTaskDueSoon(tItem) ? 'text-amber-700 dark:text-amber-300 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                            {isTaskDueSoon(tItem) ? <Clock className="w-3 h-3 text-amber-600 animate-pulse" /> : <Calendar className="w-3 h-3 text-slate-400" />}
                            {tItem.dueDate}
                          </span>
                        )}
                        {tItem.assignedTo && <span>• {language === 'id' ? 'Ditugaskan' : 'Assigned'}: {tItem.assignedTo}</span>}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tItem.priority === 'High'
                        ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 border border-red-200/60 dark:border-red-800'
                        : tItem.priority === 'Medium'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800'
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
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t.actions.newTask}</span>
          </button>
        </div>

        {/* Live Activities Feed (KHUSUS ADMIN, SUPER ADMIN & OWNER) vs Personal Summary for Staff */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-5 flex flex-col justify-between space-y-4">
          {isAdminOrAbove ? (
            /* ADMIN / SUPER ADMIN / OWNER VIEW: Full Audit & Activity Log */
            <>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          {language === 'id' ? 'Log Aktivitas' : 'Activity Log'}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {language === 'id' ? 'Log perubahan dan interaksi data terupdate secara realtime' : 'Latest data changes and interaction audit trail'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {filteredActivities.length} {language === 'id' ? 'Catatan' : 'Records'}
                  </span>
                </div>

                {/* Filter and Search Bar for Activity Logs */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={language === 'id' ? 'Cari aktivitas...' : 'Search activity logs...'}
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    {(['all', 'crm', 'hris', 'system'] as const).map((filterKey) => (
                      <button
                        key={filterKey}
                        onClick={() => setSelectedActivityFilter(filterKey)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                          selectedActivityFilter === filterKey
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {filterKey}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredActivities.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    {language === 'id' ? 'Belum ada log aktivitas yang cocok.' : 'No matching activity records.'}
                  </div>
                ) : (
                  filteredActivities.slice(0, 8).map((a) => (
                    <div
                      key={a.id || Math.random()}
                      className="p-3 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="min-w-0 space-y-0.5 flex-1">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{a.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{getTimeAgo(a.timestamp)}</span>
                          {a.createdByName && <span>• {a.createdByName}</span>}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase shrink-0 border ${
                        a.type === 'hris'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                          : a.type === 'deal' || a.type === 'lead'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : a.type === 'quotation'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      }`}>
                        {a.type}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="text-[11px] text-slate-400 text-center pt-1 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>
                  {language === 'id' ? 'Sinkronisasi Log Terenkripsi & Real-time' : 'Encrypted & Real-time Audit Trail'}
                </span>
              </div>
            </>
          ) : (
            /* NON-ADMIN VIEW (Staff / Manager): Personal Activity & Status */
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {language === 'id' ? 'Log Aktivitas' : 'Activity Log'}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {language === 'id'
                          ? 'Ringkasan aktivitas kerja dan status harian Anda'
                          : 'Your daily work activities and operational status'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {language === 'id' ? 'Personal' : 'Personal'}
                  </span>
                </div>
              </div>

              {/* Personal Status & Daily Actions for Staff */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{language === 'id' ? 'Ringkasan Aktivitas Anda Hari Ini' : 'Your Personal Daily Summary'}</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/60">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">{language === 'id' ? 'Presensi Hari Ini' : 'Attendance Status'}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5 block">
                      {myAttendanceToday ? myAttendanceToday.status : (language === 'id' ? 'Belum Presensi' : 'Not Clocked In')}
                    </span>
                    <button
                      onClick={() => onNavigate('hris', 'attendance')}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-1 block"
                    >
                      {language === 'id' ? 'Buka Menu Presensi →' : 'Open Attendance →'}
                    </button>
                  </div>

                  <div className="p-3 bg-amber-50/50 dark:bg-amber-950/40 rounded-2xl border border-amber-100 dark:border-amber-900/60">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">{language === 'id' ? 'Tugas Aktif Anda' : 'Your Active Tasks'}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5 block">
                      {myPendingTasks.length} {language === 'id' ? 'Pending' : 'Pending'}
                    </span>
                    <button
                      onClick={() => onNavigate('tasks')}
                      className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline mt-1 block"
                    >
                      {language === 'id' ? 'Lihat Tugas Saya →' : 'View My Tasks →'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block">{language === 'id' ? 'Pengajuan Cuti Saya' : 'My Leave Requests'}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {myLeaves.length > 0 ? `${myLeaves.length} ${language === 'id' ? 'Riwayat Cuti' : 'History'}` : (language === 'id' ? 'Belum ada pengajuan cuti' : 'No leave requests')}
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('hris', 'leave')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {language === 'id' ? 'Ajukan Cuti' : 'Request Leave'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
