import React, { useRef, useState, useEffect } from 'react';
import { UserProfile, CompanyProfile, DEFAULT_COMPANY_PROFILE } from '../types/crm';
import { UserInvitationManagement } from './UserInvitationManagement';
import {
  Settings,
  Building2,
  Database,
  Download,
  Upload,
  Trash2,
  Sparkles,
  DollarSign,
  Sun,
  Moon,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileCheck2,
  UserCheck,
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';

interface SettingsViewProps {
  companyProfile: CompanyProfile;
  stats: {
    contactsCount: number;
    leadsCount: number;
    dealsCount: number;
    tasksCount: number;
    activitiesCount: number;
  };
  currentUser: UserProfile | null;
  addToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  onSaveCompanyProfile: (profile: Partial<CompanyProfile>) => Promise<void> | void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

// Preset Logos for Instant 1-Click Corporate Branding
const PRESET_LOGOS = [
  {
    id: 'preset-tech',
    label: 'Modern Tech Blue',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%232563EB"/><stop offset="50%" stop-color="%234F46E5"/><stop offset="100%" stop-color="%230D9488"/></linearGradient></defs><rect width="100" height="100" rx="24" fill="url(%23g1)"/><path d="M30 50 L50 25 L70 50 L50 75 Z" fill="%23FFFFFF" opacity="0.95"/><circle cx="50" cy="50" r="10" fill="%232563EB"/></svg>`
  },
  {
    id: 'preset-nusantara',
    label: 'Digital Nusantara',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23059669"/><stop offset="100%" stop-color="%230284C7"/></linearGradient></defs><rect width="100" height="100" rx="24" fill="url(%23g2)"/><circle cx="50" cy="50" r="26" fill="none" stroke="%23FFFFFF" stroke-width="6"/><path d="M50 28 L62 68 L38 68 Z" fill="%23FFFFFF"/></svg>`
  },
  {
    id: 'preset-shield',
    label: 'Corporate Shield',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230F172A"/><stop offset="100%" stop-color="%23334155"/></linearGradient></defs><rect width="100" height="100" rx="24" fill="url(%23g3)"/><path d="M50 20 C68 20 76 28 76 46 C76 66 50 82 50 82 C50 82 24 66 24 46 C24 28 32 20 50 20 Z" fill="none" stroke="%2338BDF8" stroke-width="6"/><circle cx="50" cy="48" r="10" fill="%2338BDF8"/></svg>`
  },
  {
    id: 'preset-gold',
    label: 'Executive Gold',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23D97706"/><stop offset="100%" stop-color="%23B45309"/></linearGradient></defs><rect width="100" height="100" rx="24" fill="url(%23g4)"/><polygon points="50,22 75,37 75,67 50,82 25,67 25,37" fill="none" stroke="%23FFFFFF" stroke-width="6"/><circle cx="50" cy="52" r="8" fill="%23FFFFFF"/></svg>`
  }
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  companyProfile = DEFAULT_COMPANY_PROFILE,
  stats,
  currentUser,
  addToast,
  onSaveCompanyProfile,
  onExportData,
  onImportData,
  onLoadDemoData,
  onClearAllData,
  theme = 'light',
  onToggleTheme
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Local state form initialized from props
  const [formData, setFormData] = useState<CompanyProfile>(companyProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Sync state when props update
  useEffect(() => {
    setFormData(companyProfile);
  }, [companyProfile]);

  const totalRecords =
    stats.contactsCount +
    stats.leadsCount +
    stats.dealsCount +
    stats.tasksCount +
    stats.activitiesCount;

  const currencyOptions = [
    { code: 'IDR', label: 'IDR - Rupiah Indonesia (Rp)' },
    { code: 'USD', label: 'USD - US Dollar ($)' },
    { code: 'SGD', label: 'SGD - Singapore Dollar (S$)' },
    { code: 'EUR', label: 'EUR - Euro (€)' },
    { code: 'GBP', label: 'GBP - British Pound (£)' },
    { code: 'JPY', label: 'JPY - Japanese Yen (¥)' },
    { code: 'AUD', label: 'AUD - Australian Dollar (A$)' },
    { code: 'MYR', label: 'MYR - Malaysian Ringgit (RM)' }
  ];

  // Handle Image File processing with in-browser canvas compression
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('File harus berupa gambar (.png, .jpg, .jpeg, .svg, .webp)', 'error');
      return;
    }

    // Limit file upload to 5MB before compression
    if (file.size > 5 * 1024 * 1024) {
      addToast('Ukuran file gambar maksimal 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      // If SVG, save directly
      if (file.type.includes('svg')) {
        setFormData((prev) => ({ ...prev, logoUrl: result }));
        addToast('Logo SVG berhasil diunggah', 'info');
        return;
      }

      // Resize/compress raster image onto canvas to keep Firestore document lightweight (<50KB)
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/png', 0.9);
          setFormData((prev) => ({ ...prev, logoUrl: compressedDataUrl }));
          addToast('Logo perusahaan berhasil diproses dan dikompresi', 'info');
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
    addToast('Logo dihapus (kembali menggunakan Monogram Icon)', 'info');
  };

  const handleSelectPresetLogo = (svgData: string, label: string) => {
    setFormData((prev) => ({ ...prev, logoUrl: svgData }));
    addToast(`Preset logo "${label}" dipilih`, 'info');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveCompanyProfile(formData);
      addToast('✅ Profil & Identitas Perusahaan berhasil disimpan ke Cloud Firestore!', 'success');
    } catch (err: any) {
      console.error(err);
      addToast(`Gagal menyimpan profil perusahaan: ${err.message || 'Terjadi kesalahan'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleJSONFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Title */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          <span>Pengaturan & Identitas Organisasi</span>
        </h2>
        <p className="text-xs text-slate-500">
          Kelola profil badan usaha, logo resmi, alamat kantor, pejabat otorisasi payroll, akun anggota tim, serta database Firestore.
        </p>
      </div>

      {/* User & Invitation Management Section */}
      {currentUser && (
        <UserInvitationManagement currentUser={currentUser} addToast={addToast} />
      )}

      {/* Main Company Profile Management Card */}
      <form onSubmit={handleFormSubmit} className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Profil & Identitas Badan Usaha
              </h3>
              <p className="text-xs text-slate-400">
                Data terintegrasi otomatis ke Dashboard, Header Sidebar, Dokumen Slip Gaji PDF, dan Surat Penawaran.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Perubahan Profil</span>
              </>
            )}
          </button>
        </div>

        {/* Logo Upload & Preview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70">
          <div className="lg:col-span-4 space-y-3">
            <label className="block text-xs font-extrabold text-slate-800">
              Logo Perusahaan / Badan Usaha
            </label>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Upload logo formal format PNG, JPG, atau SVG. Logo akan tampil di navbar, sidebar, dashboard, dan dokumen PDF Slip Gaji resmi.
            </p>

            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoFileChange}
              accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
              className="hidden"
            />

            {/* Drag & Drop Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => logoInputRef.current?.click()}
              className={`p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-blue-600">Klik untuk upload</span> atau drag & drop
                <div className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, SVG maks 5MB</div>
              </div>
            </div>

            {formData.logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="w-full py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Logo (Reset ke Monogram)</span>
              </button>
            )}

            {/* Quick Logo Presets */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-600 block mb-2">
                Atau pilih logo preset instan:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_LOGOS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPresetLogo(p.svg, p.label)}
                    className="p-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl flex items-center gap-2 text-left text-[11px] font-bold text-slate-700 transition-all cursor-pointer"
                  >
                    <img src={p.svg} alt={p.label} className="w-6 h-6 rounded-md object-contain shrink-0" />
                    <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Display (How it looks in context) */}
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Pratinjau Tampilan Logo & Identitas</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Preview 1: Header Sidebar / Navbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tampilan di Sidebar & Navbar
                </span>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Company Logo Preview"
                      className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-slate-200 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
                      {(formData.companyName || 'E').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-xs text-slate-900 truncate">
                      {formData.companyName || 'ErmApps'}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {formData.legalName || 'PT ErmApps Digital Nusantara'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview 2: Payslip Document Header */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tampilan di Dokumen Slip Gaji & Surat
                </span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Logo Doc"
                        className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-blue-700 text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {(formData.companyName || 'E').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-black text-xs text-slate-900 truncate">
                        {formData.companyName || 'ErmApps Enterprise HRIS'}
                      </div>
                      <div className="text-[9px] font-bold text-slate-600 truncate">
                        {(formData.legalName || 'PT ERMAPPS DIGITAL NUSANTARA').toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-500 truncate">
                    {formData.address || 'Gedung Cyber 2 Tower Lt. 18, Jakarta Selatan'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Organization Profile Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Brand & Legal Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Brand / Aplikasi
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g. ErmApps Enterprise HRIS"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Nama singkat yang tampil di header tab dan navigasi utama.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Legal Badan Usaha (PT / CV / Firma)
            </label>
            <input
              type="text"
              required
              value={formData.legalName}
              onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              placeholder="e.g. PT ErmApps Digital Nusantara"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Nama resmi entitas hukum untuk kop surat, kwitansi & slip gaji legal.
            </span>
          </div>

          {/* Address & City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Alamat Kantor / Gedung Operasional</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Gedung Cyber 2 Tower Lt. 18, Jl. H.R. Rasuna Said Kav. X-5"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kota, Provinsi & Kode Pos
            </label>
            <input
              type="text"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Jakarta Selatan, DKI Jakarta 12950"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Contact Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>No. Telepon Perusahaan / WhatsApp</span>
            </label>
            <input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. (021) 5088-9900"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email Resmi Perusahaan</span>
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. contact@ermapps.co.id"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Website Resmi</span>
            </label>
            <input
              type="text"
              value={formData.website || ''}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="e.g. www.ermapps.co.id"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
              <span>NPWP Badan Usaha / Perusahaan</span>
            </label>
            <input
              type="text"
              value={formData.taxId || ''}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              placeholder="e.g. 01.234.567.8-012.000"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Authorized Signatory for Payroll & Quotation Documents */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Nama Pejabat Penandatangan Dokumen</span>
            </label>
            <input
              type="text"
              value={formData.signatoryName || ''}
              onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
              placeholder="e.g. Nabila Putri, S.Psi"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Nama penanggung jawab yang tercetak di kolom tanda tangan slip gaji & penawaran resmi.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Jabatan Pejabat Penandatangan
            </label>
            <input
              type="text"
              value={formData.signatoryTitle || ''}
              onChange={(e) => setFormData({ ...formData, signatoryTitle: e.target.value })}
              placeholder="e.g. HR & Payroll Operations Manager"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Jabatan resmi penanggung jawab (misal: Direktur HR, HR Manager, Finance Manager).
            </span>
          </div>

          {/* Currency Option */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>Mata Uang Utama Transaksi (Primary Currency)</span>
            </label>
            <select
              value={formData.currency || 'IDR'}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              {currencyOptions.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-7 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyimpan ke Cloud Firestore...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Seluruh Pengaturan Profil</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Secondary Cards: Theme, Firestore Stats, & Backup Management */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Theme & Tampilan Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Tema & Tampilan Aplikasi</h3>
              <p className="text-[11px] text-slate-400">Mode Terang / Mode Gelap</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Pilih mode tampilan visual yang paling nyaman untuk Anda. Preferensi tersimpan otomatis di perangkat.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'light' && onToggleTheme) onToggleTheme();
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-blue-50/80 border-blue-500 text-blue-700 font-bold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-blue-600' : 'text-slate-500'}`} />
                <div className="text-xs">
                  <div className="font-bold">Light Mode</div>
                  <div className="text-[10px] text-slate-400">Mode Terang</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (theme !== 'dark' && onToggleTheme) onToggleTheme();
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-indigo-900/40 border-indigo-500 text-indigo-300 font-bold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-amber-400' : 'text-slate-500'}`} />
                <div className="text-xs">
                  <div className="font-bold">Dark Mode</div>
                  <div className="text-[10px] text-slate-400">Mode Gelap</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Database Statistics */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Statistik Firestore</h3>
              <p className="text-[11px] text-slate-400">Jumlah data tersimpan di Cloud</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {[
              ['👤 Contacts', stats.contactsCount],
              ['🎯 Leads', stats.leadsCount],
              ['💰 Deals', stats.dealsCount],
              ['✅ Tasks', stats.tasksCount],
              ['📡 Activities', stats.activitiesCount],
              ['📊 Total Records', totalRecords]
            ].map(([label, val], i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1.5 border-b border-slate-100 text-slate-600 font-medium"
              >
                <span>{label}</span>
                <strong className="text-slate-900">{val.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Data Management Actions */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Manajemen Data JSON</h3>
              <p className="text-[11px] text-slate-400">Backup, restore & reset data</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onExportData}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" />
                <span>Export Data JSON</span>
              </span>
              <span className="text-[10px] text-slate-400">Backup</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleJSONFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Import Backup JSON</span>
              </span>
              <span className="text-[10px] text-slate-400">Restore</span>
            </button>

            <button
              type="button"
              onClick={onLoadDemoData}
              className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl text-xs font-bold text-blue-800 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Isi Data Sampel CRM</span>
              </span>
              <span className="text-[10px] text-blue-600">Populate</span>
            </button>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClearAllData}
                className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-xl text-xs font-bold text-red-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>Hapus Seluruh Data</span>
                </span>
                <span className="text-[10px] text-red-500 font-extrabold">Clear All</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
