import React from 'react';
import { ActiveView, UserProfile } from '../types/crm';
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
  LayoutDashboard
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
              <span className="font-extrabold text-slate-900 tracking-tight text-base">ErmApps</span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold tracking-wider uppercase border border-blue-100">
                SaaS Enterprise
              </span>
            </div>
            <p className="text-[10px] font-semibold text-slate-400">CRM & HRIS Real-Time System</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenApp('dashboard')}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-102 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden xs:inline">Buka Sistem</span>
                <span className="text-blue-100 font-semibold">({currentUser.displayName || currentUser.email.split('@')[0]})</span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200/60 transition-colors cursor-pointer"
                  title="Keluar (Logout)"
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
                  <span>Masuk / Undangan Admin</span>
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
            <span>Enterprise Cloud Multi-User • Firebase Firestore Real-Time Sync</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Platform CRM & HRIS Enterprise.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
              Kolaborasi Multi-User Real-Time.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Sistem SaaS lengkap untuk tim operasional perusahaan. Menggabungkan CRM Sales Pipeline dan Sistem Kepegawaian HRIS (Database Karyawan, Presensi Terminal, Pengajuan Cuti, Payroll Slip Gaji, & Kode Undangan Internal) berbasis Cloud Firestore.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto text-xs font-semibold text-slate-600">
            {[
              'Cloud Firestore Real-Time',
              'Single-Tenant Multi-User',
              'Kode Undangan Internal',
              'Sistem HRIS & Payroll',
              'Presensi & Cuti Karyawan',
              'Kanban Sales Pipeline',
              'Direct WhatsApp Web',
              'Role Access Control'
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
                <span>Masuk ke Dashboard Sistem</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              onOpenAuthModal && (
                <button
                  onClick={onOpenAuthModal}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl text-sm shadow-xl shadow-blue-500/30 flex items-center gap-2.5 transition-all hover:scale-102 cursor-pointer"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Masuk Ke Sistem / Gunakan Kode Undangan</span>
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
                Modul Operational System
              </h2>
              <p className="text-xs text-slate-500">
                Akses terintegrasi ke modul CRM & HRIS Cloud Firestore real-time.
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
              <span>{currentUser ? 'Lihat Executive Dashboard' : 'Login untuk Akses Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {[
              { id: 'hris' as ActiveView, label: 'HRIS & Payroll', icon: UserCheck, desc: 'Presensi, Cuti & Slip Gaji', highlight: true },
              { id: 'contacts' as ActiveView, label: 'Contacts', icon: Users, desc: 'Direct WA & Email' },
              { id: 'leads' as ActiveView, label: 'Leads', icon: Target, desc: 'Kanban & Scoring' },
              { id: 'deals' as ActiveView, label: 'Deals', icon: CircleDollarSign, desc: 'Sales Pipeline' },
              { id: 'tasks' as ActiveView, label: 'Tasks', icon: CheckSquare, desc: 'Priority & Due Dates' },
              { id: 'analytics' as ActiveView, label: 'Analytics', icon: BarChart3, desc: 'Interactive Charts' },
              { id: 'settings' as ActiveView, label: 'Settings & Users', icon: KeyRound, desc: 'Undangan & Sync' }
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

      {/* Database & Multi-User Architecture Highlights */}
      <section className="max-w-6xl mx-auto py-16 px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Arsitektur Database Enterprise & Akses Terverifikasi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Dirancang khusus untuk kebutuhan internal perusahaan dengan sinkronisasi Cloud Firestore dan kontrol hak akses berbasis peran.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Cloud Firestore Real-Time</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Perubahan status lead, deals, tugas, dan presensi karyawan langsung tersinkronisasi secara otomatis ke seluruh layar tim secara real-time.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Sistem Kode Undangan Internal</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Registrasi karyawan dan manajer terkontrol melalui kode undangan unik (1-time use) yang dibuat oleh HR/Admin perusahaan.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Role-Based Access Control</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dukungan peran fleksibel: Super Admin, HR Manager, Sales Manager, dan Employee dengan visibilitas data sesuai tanggung jawab.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900">
              Perbandingan: Cloud Firestore CRM vs Aplikasi Tradisional
            </h3>
            <p className="text-xs text-slate-500">
              Keunggulan sistem terintegrasi Firestore real-time dibanding spreadsheet terpisah.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Fitur / Kriteria</th>
                  <th className="py-3 px-4 text-blue-600 bg-blue-50/50">ErmApps Firestore Real-Time</th>
                  <th className="py-3 px-4 text-slate-500">Spreadsheet / CRM Terpisah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">Sinkronisasi Data Tim</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold bg-blue-50/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time Firestore Sync
                  </td>
                  <td className="py-3 px-4 text-slate-500 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-400" /> Konflik Manual / Terlambat Update
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">Manajemen Registrasi Karyawan</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold bg-blue-50/30">Sistem Kode Undangan HR</td>
                  <td className="py-3 px-4 text-slate-500">Pendaftaran Terbuka Tanpa Kontrol</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">Integrasi HRIS & Payroll</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold bg-blue-50/30">Terintegrasi Langsung (Presensi & Slip Gaji)</td>
                  <td className="py-3 px-4 text-slate-500">Perlu Software HR Eksternal Lengkap</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">Komunikasi Pelanggan Direct</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold bg-blue-50/30 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-500" /> Direct WhatsApp Web & Mail
                  </td>
                  <td className="py-3 px-4 text-slate-500">Copy-Paste Nomor Manual</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">Backup & Keamanan Data</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold bg-blue-50/30">Cloud Firestore Rules + JSON Export</td>
                  <td className="py-3 px-4 text-slate-500">Risiko File Terhapus</td>
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
            Mulai Kelola CRM & Kepegawaian Perusahaan Anda
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto">
            Platform operasional terintegrasi dengan sinkronisasi Firestore real-time & kontrol hak akses per tingkat jabatan.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {currentUser ? (
              <>
                <button
                  onClick={() => onOpenApp('dashboard')}
                  className="px-6 py-3 bg-white hover:bg-slate-100 text-blue-700 font-extrabold rounded-2xl text-xs shadow-md transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Buka Executive Dashboard</span>
                </button>
                <button
                  onClick={() => onOpenApp('hris')}
                  className="px-6 py-3 bg-blue-700/60 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs border border-white/20 transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Kelola HRIS & Presensi</span>
                </button>
              </>
            ) : (
              onOpenAuthModal && (
                <button
                  onClick={onOpenAuthModal}
                  className="px-8 py-3.5 bg-white hover:bg-slate-100 text-blue-700 font-extrabold rounded-2xl text-xs shadow-md transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Sistem / Gunakan Kode Undangan</span>
                </button>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
