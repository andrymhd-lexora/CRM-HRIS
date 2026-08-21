import React from 'react';
import { ActiveView, UserProfile } from '../types/crm';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Database,
  ArrowRight,
  Users,
  Target,
  CircleDollarSign,
  CheckSquare,
  BarChart3,
  SlidersHorizontal,
  Cloud,
  Lock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  UserCheck,
  KeyRound,
  Shield,
  FileSpreadsheet,
  LogIn,
  LogOut,
  LayoutDashboard,
  Globe
} from 'lucide-react';

interface LandingPageProps {
  onOpenApp: (view?: ActiveView) => void;
  onLoadDemoData: () => void;
  onOpenAuthModal?: () => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenApp,
  onLoadDemoData,
  onOpenAuthModal,
  currentUser,
  onLogout
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 flex flex-col">
      {/* Standalone Landing Page Header Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-2xs">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
            E
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-base">{t.appName}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold tracking-wider uppercase border border-blue-100">
                {t.enterpriseBadge}
              </span>
            </div>
            <p className="text-[10px] font-semibold text-slate-400">{t.appSubtitle}</p>
          </div>
        </div>

        {/* Action Controls & Language Switch */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setLanguage('id')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                language === 'id'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Bahasa Indonesia"
            >
              <span>🇮🇩</span>
              <span className="hidden sm:inline">ID</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                language === 'en'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="English"
            >
              <span>🇬🇧</span>
              <span className="hidden sm:inline">EN</span>
            </button>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenApp('dashboard')}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-102 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden xs:inline">{t.actions.openSystem}</span>
                <span className="text-blue-100 font-semibold">({currentUser.displayName || currentUser.email.split('@')[0]})</span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200/60 transition-colors cursor-pointer"
                  title={t.actions.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {onOpenAuthModal && (
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-102 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t.actions.login}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-xs">
            <Cloud className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>{t.landing.heroBadge} • Firebase Firestore Real-Time Sync</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.14]">
            {t.landing.heroTitle}{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
              {t.landing.heroHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {t.landing.heroDesc}
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto text-xs font-semibold text-slate-600">
            {[
              'Cloud Firestore Real-Time',
              'Single-Tenant Multi-User',
              'Internal Invite Codes',
              'HRIS & PPh 21 TER Engine',
              'Camera & GPS Attendance',
              'Kanban Deals Pipeline',
              'WhatsApp Integration',
              'Role Access Control (RBAC)'
            ].map((f, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-white rounded-full border border-slate-200/80 shadow-2xs flex items-center gap-1.5 text-slate-700"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {f}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {currentUser ? (
              <button
                onClick={() => onOpenApp('dashboard')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-sm shadow-xl shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>{t.landing.ctaPrimary}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              onOpenAuthModal && (
                <button
                  onClick={onOpenAuthModal}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl text-sm shadow-xl shadow-blue-500/30 flex items-center gap-2.5 transition-all hover:scale-102 cursor-pointer"
                >
                  <LogIn className="w-5 h-5" />
                  <span>{t.landing.ctaPrimary}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* Live Interactive App Preview Banner */}
      <section className="max-w-6xl mx-auto -mt-8 px-4 sm:px-6 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                {language === 'id' ? 'Modul Operasional Terintegrasi' : 'Integrated Operational Modules'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'id'
                  ? 'Akses terpadu ke seluruh modul CRM penjualan & HRIS kepegawaian real-time.'
                  : 'Unified access across all Sales CRM & HR Workforce real-time modules.'}
              </p>
            </div>
            <button
              onClick={() => {
                if (currentUser) {
                  onOpenApp('dashboard');
                } else if (onOpenAuthModal) {
                  onOpenAuthModal();
                }
              }}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-blue-200/60 transition-colors cursor-pointer"
            >
              <span>{currentUser ? (language === 'id' ? 'Buka Dashboard' : 'Open Dashboard') : (language === 'id' ? 'Masuk untuk Akses' : 'Sign in to Access')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {[
              { id: 'hris' as ActiveView, label: t.nav.hris, icon: UserCheck, desc: language === 'id' ? 'Presensi, Cuti & Gaji' : 'Attendance & Payroll', highlight: true },
              { id: 'contacts' as ActiveView, label: t.nav.contacts, icon: Users, desc: 'WhatsApp & Email' },
              { id: 'leads' as ActiveView, label: t.nav.leads, icon: Target, desc: 'Kanban & Scoring' },
              { id: 'deals' as ActiveView, label: t.nav.deals, icon: CircleDollarSign, desc: 'Sales Pipeline' },
              { id: 'tasks' as ActiveView, label: t.nav.tasks, icon: CheckSquare, desc: 'Priority & Due Dates' },
              { id: 'analytics' as ActiveView, label: t.nav.analytics, icon: BarChart3, desc: 'Interactive Charts' },
              { id: 'settings' as ActiveView, label: t.nav.settings, icon: KeyRound, desc: 'Invites & Roles' }
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    if (currentUser) {
                      onOpenApp(m.id);
                    } else if (onOpenAuthModal) {
                      onOpenAuthModal();
                    }
                  }}
                  className={`p-3.5 rounded-2xl text-left transition-all group cursor-pointer ${
                    m.highlight
                      ? 'bg-indigo-50 hover:bg-indigo-100/80 border-2 border-indigo-300 shadow-xs'
                      : 'bg-slate-50 hover:bg-blue-50/80 hover:border-blue-300 border border-slate-200/80'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 group-hover:scale-110 transition-transform ${m.highlight ? 'text-indigo-600' : 'text-blue-600'}`} />
                  <div className="font-bold text-xs text-slate-900">{m.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto py-16 px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {language === 'id'
              ? 'Arsitektur Enterprise Berstandar Cloud & Pajak Resmi'
              : 'Enterprise Cloud Architecture & Official Tax Compliance'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            {language === 'id'
              ? 'Dirancang khusus untuk kebutuhan operasional dengan sinkronisasi Cloud Firestore dan kontrol hak akses berbasis peran.'
              : 'Engineered for seamless business workflows with Firestore real-time sync and role-based security.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">{t.landing.crmFeatureTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.landing.crmFeatureDesc}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">{t.landing.hrisFeatureTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.landing.hrisFeatureDesc}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">{t.landing.payrollFeatureTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.landing.payrollFeatureDesc}
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900">
              {language === 'id'
                ? 'Perbandingan: ErmApps SaaS Cloud vs Spreadsheet Terpisah'
                : 'Comparison: ErmApps SaaS Cloud vs Disconnected Spreadsheets'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'id'
                ? 'Keunggulan sistem terintegrasi database real-time dibanding spreadsheet manual.'
                : 'Key advantages of unified cloud systems over error-prone manual spreadsheets.'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">{language === 'id' ? 'Fitur / Kriteria' : 'Feature / Criteria'}</th>
                  <th className="py-3 px-4 text-blue-600 bg-blue-50/50">ErmApps Cloud Real-Time</th>
                  <th className="py-3 px-4 text-slate-500">{language === 'id' ? 'Spreadsheet Manual' : 'Manual Sheets'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {language === 'id' ? 'Sinkronisasi Data Tim' : 'Team Real-time Sync'}
                  </td>
                  <td className="py-3 px-4 text-emerald-600 font-bold bg-blue-50/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {language === 'id' ? 'Otomatis Real-Time' : 'Instant Automatic'}
                  </td>
                  <td className="py-3 px-4 text-slate-500 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-400" /> {language === 'id' ? 'Konflik Manual / Telat' : 'Manual conflicts'}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {language === 'id' ? 'Perhitungan PPh 21 TER 2024' : 'PPh 21 TER 2024 Calculation'}
                  </td>
                  <td className="py-3 px-4 text-emerald-600 font-bold bg-blue-50/30">
                    {language === 'id' ? 'Otomatis Sesuai PP 58/2023' : 'Automated Official PP 58/2023'}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {language === 'id' ? 'Rumus Rumit & Rawan Salah' : 'Complex manual formulas'}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {language === 'id' ? 'Presensi GPS & Swafoto Kamera' : 'GPS & Camera Biometric Attendance'}
                  </td>
                  <td className="py-3 px-4 text-emerald-600 font-bold bg-blue-50/30">
                    {language === 'id' ? 'Terintegrasi Geofencing' : 'Integrated Geofencing'}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {language === 'id' ? 'Tidak Tersedia' : 'Not supported'}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {language === 'id' ? 'Dukungan Dua Bahasa' : 'Bilingual Support'}
                  </td>
                  <td className="py-3 px-4 text-emerald-600 font-bold bg-blue-50/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {language === 'id' ? 'Bahasa Indonesia & English' : 'Bahasa Indonesia & English'}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {language === 'id' ? 'Terbatas' : 'Limited'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto pt-8 px-4 sm:px-6">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 rounded-3xl p-8 sm:p-10 text-white text-center space-y-6 shadow-xl shadow-blue-500/20">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === 'id'
              ? 'Mulai Kelola CRM & Kepegawaian Perusahaan Anda'
              : 'Start Managing Your CRM & Workforce Today'}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto">
            {language === 'id'
              ? 'Platform operasional terintegrasi dengan sinkronisasi Firestore real-time & kontrol hak akses per tingkat jabatan.'
              : 'Integrated operational platform with real-time cloud synchronization and role-based permissions.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {currentUser ? (
              <>
                <button
                  onClick={() => onOpenApp('dashboard')}
                  className="px-6 py-3 bg-white hover:bg-slate-100 text-blue-700 font-extrabold rounded-2xl text-xs shadow-md transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t.actions.openSystem}</span>
                </button>
                <button
                  onClick={() => onOpenApp('hris')}
                  className="px-6 py-3 bg-blue-700/60 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs border border-white/20 transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{t.nav.hris}</span>
                </button>
              </>
            ) : (
              onOpenAuthModal && (
                <button
                  onClick={onOpenAuthModal}
                  className="px-8 py-3.5 bg-white hover:bg-slate-100 text-blue-700 font-extrabold rounded-2xl text-xs shadow-md transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t.actions.login}</span>
                </button>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
