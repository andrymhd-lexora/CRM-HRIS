import React, { useState, useMemo } from 'react';
import {
  Company,
  Contact,
  Lead,
  Deal,
  Quotation,
  Task,
  Activity,
  UserProfile,
  ActivityType,
  ContactType
} from '../types/crm';
import {
  X,
  Building2,
  Users,
  Target,
  CircleDollarSign,
  FileText,
  CheckSquare,
  Clock,
  Phone,
  Mail,
  MapPin,
  Globe,
  Plus,
  Send,
  Calendar,
  AlertTriangle,
  Award,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  UserPlus
} from 'lucide-react';

interface Customer360ModalProps {
  company: Company | null;
  onClose: () => void;
  contacts: Contact[];
  leads: Lead[];
  deals: Deal[];
  quotations: Quotation[];
  tasks: Task[];
  activities: Activity[];
  currentUser: UserProfile | null;
  onAddContact?: (data: any) => Promise<void> | void;
  onAddLead?: (data: any) => Promise<void> | void;
  onAddDeal?: (data: any) => Promise<void> | void;
  onCreateQuotation?: (dealId?: string | number) => void;
  onAddTask?: (data: any) => Promise<void> | void;
  onLogActivityWithFollowUp?: (data: any) => Promise<void> | void;
  onConvertLead?: (lead: Lead) => void;
  onMarkDealWon?: (deal: Deal) => void;
  onMarkDealLost?: (deal: Deal) => void;
}

export const Customer360Modal: React.FC<Customer360ModalProps> = ({
  company,
  onClose,
  contacts,
  leads,
  deals,
  quotations,
  tasks,
  activities,
  currentUser,
  onAddContact,
  onAddLead,
  onAddDeal,
  onCreateQuotation,
  onAddTask,
  onLogActivityWithFollowUp,
  onConvertLead,
  onMarkDealWon,
  onMarkDealLost
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'leads' | 'deals' | 'quotations' | 'tasks' | 'timeline'>('overview');

  // Form state for logging new activity with follow-up
  const [actType, setActType] = useState<ActivityType>('Call');
  const [actDesc, setActDesc] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [nextFollowUpTaskTitle, setNextFollowUpTaskTitle] = useState('');
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  // Form state for adding new PIC / Contact directly in 360 View
  const [isAddingPic, setIsAddingPic] = useState(false);
  const [newPicName, setNewPicName] = useState('');
  const [newPicPosition, setNewPicPosition] = useState('');
  const [newPicPhone, setNewPicPhone] = useState('');
  const [newPicEmail, setNewPicEmail] = useState('');
  const [newPicType, setNewPicType] = useState<ContactType>('Customer');
  const [isSubmittingPic, setIsSubmittingPic] = useState(false);

  if (!company) return null;

  const normalizeCompanyStr = (str?: string) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/pt\.|pt\b/g, '')
      .replace(/cv\.|cv\b/g, '')
      .replace(/ud\.|ud\b/g, '')
      .replace(/tbk\.|tbk\b/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  };

  const isCompanyMatch = (targetCompanyStr?: string, targetCompanyId?: string | number) => {
    if (targetCompanyId && company.id && String(targetCompanyId) === String(company.id)) return true;
    if (!targetCompanyStr) return false;
    const normTarget = normalizeCompanyStr(targetCompanyStr);
    const normComp = normalizeCompanyStr(company.name);
    if (normTarget && normComp && normTarget === normComp) return true;
    if (normTarget.length >= 3 && normComp.length >= 3 && (normTarget.includes(normComp) || normComp.includes(normTarget))) {
      return true;
    }
    const targetLower = targetCompanyStr.toLowerCase().trim();
    const compLower = company.name.toLowerCase().trim();
    if (targetLower === compLower || (compLower.length >= 3 && targetLower.includes(compLower)) || (targetLower.length >= 3 && compLower.includes(targetLower))) {
      return true;
    }
    return false;
  };

  // Filter linked items with resilient matching
  const companyLeads = useMemo(() => {
    return leads.filter((l) => isCompanyMatch(l.company, l.companyId));
  }, [leads, company]);

  const companyDeals = useMemo(() => {
    return deals.filter((d) => isCompanyMatch(d.company, d.companyId));
  }, [deals, company]);

  const companyQuotations = useMemo(() => {
    return quotations.filter((q) => isCompanyMatch(q.companyName, q.companyId));
  }, [quotations, company]);

  const companyContacts = useMemo(() => {
    const directContacts = contacts.filter((c) => isCompanyMatch(c.company, c.companyId));
    const contactKeys = new Set(directContacts.map((c) => `${c.name.toLowerCase()}_${(c.phone || c.email || '').toLowerCase()}`));

    // Add implicit PICs from leads matching this company
    const extraFromLeads: Contact[] = [];
    companyLeads.forEach((l) => {
      if (l.name) {
        const key = `${l.name.toLowerCase()}_${(l.phone || l.email || '').toLowerCase()}`;
        if (!contactKeys.has(key)) {
          contactKeys.add(key);
          extraFromLeads.push({
            id: `lead_pic_${l.id}`,
            companyId: company.id,
            company: company.name,
            name: l.name,
            position: 'PIC (Dari Lead)',
            phone: l.phone || '-',
            email: l.email || '-',
            type: (company.isCustomer ? 'Customer' : 'Prospect') as ContactType,
            status: 'Active',
            createdAt: l.createdAt,
            updatedAt: l.updatedAt
          });
        }
      }
    });

    // Add implicit PICs from deals matching this company
    companyDeals.forEach((d) => {
      const picName = d.contactName || (d as any).pic;
      if (picName) {
        const key = `${picName.toLowerCase()}_${((d as any).phone || (d as any).email || '').toLowerCase()}`;
        if (!contactKeys.has(key)) {
          contactKeys.add(key);
          extraFromLeads.push({
            id: `deal_pic_${d.id}`,
            companyId: company.id,
            company: company.name,
            name: picName,
            position: 'PIC (Dari Deal)',
            phone: (d as any).phone || '-',
            email: (d as any).email || '-',
            type: (company.isCustomer ? 'Customer' : 'Prospect') as ContactType,
            status: 'Active',
            createdAt: d.createdAt,
            updatedAt: d.updatedAt
          });
        }
      }
    });

    return [...directContacts, ...extraFromLeads];
  }, [contacts, company, companyLeads, companyDeals]);

  const companyTasks = useMemo(() => {
    return tasks.filter(
      (t) =>
        isCompanyMatch('', t.companyId) ||
        companyContacts.some((c) => String(c.id) === String(t.contactId)) ||
        companyLeads.some((l) => String(l.id) === String(t.leadId)) ||
        companyDeals.some((d) => String(d.id) === String(t.dealId))
    );
  }, [tasks, companyContacts, companyLeads, companyDeals]);

  const companyActivities = useMemo(() => {
    const compNameLower = company.name.toLowerCase();
    return activities.filter(
      (a) =>
        isCompanyMatch('', a.companyId) ||
        companyContacts.some((c) => String(c.id) === String(a.contactId)) ||
        companyLeads.some((l) => String(l.id) === String(a.leadId)) ||
        companyDeals.some((d) => String(d.id) === String(a.dealId)) ||
        (a.description && isCompanyMatch(a.description))
    );
  }, [activities, companyContacts, companyLeads, companyDeals]);

  // Calculated Sales Summary Metrics
  const wonDeals = companyDeals.filter((d) => d.stage === 'WON' || d.stage === 'Closed Won');
  const lostDeals = companyDeals.filter((d) => d.stage === 'LOST' || d.stage === 'Closed Lost');
  const openDeals = companyDeals.filter((d) => d.stage !== 'WON' && d.stage !== 'Closed Won' && d.stage !== 'LOST' && d.stage !== 'Closed Lost');

  const totalWonRevenue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const totalOpenPipeline = openDeals.reduce((sum, d) => sum + (d.value || 0), 0);

  const handleLogActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actDesc.trim() || !onLogActivityWithFollowUp) return;

    setIsSubmittingActivity(true);
    await onLogActivityWithFollowUp({
      type: 'company',
      activityType: actType,
      description: `${actType}: ${actDesc}`,
      companyId: company.id,
      createdByName: currentUser?.displayName || 'Sales Staff',
      nextFollowUpDate: nextFollowUpDate || undefined,
      nextFollowUpTask: nextFollowUpTaskTitle || undefined
    });

    setActDesc('');
    setNextFollowUpDate('');
    setNextFollowUpTaskTitle('');
    setIsSubmittingActivity(false);
  };

  const handleAddPicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPicName.trim()) return;

    setIsSubmittingPic(true);
    try {
      if (onAddContact) {
        await onAddContact({
          name: newPicName,
          position: newPicPosition || 'PIC Client',
          phone: newPicPhone || '-',
          email: newPicEmail || '-',
          company: company.name,
          companyId: company.id,
          type: newPicType,
          status: 'Active',
          assignedTo: currentUser?.uid || '',
          createdBy: currentUser?.uid || ''
        });
      }
      setNewPicName('');
      setNewPicPosition('');
      setNewPicPhone('');
      setNewPicEmail('');
      setIsAddingPic(false);
    } catch (err) {
      console.error('Failed to add PIC:', err);
    } finally {
      setIsSubmittingPic(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/30 text-blue-300 flex items-center justify-center text-2xl font-black shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold tracking-tight text-white">{company.name}</h2>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    company.isCustomer
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {company.isCustomer ? 'CLIENT / CUSTOMER' : 'PROSPECT'}
                </span>
                {company.companyType && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    {company.companyType}
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-xs mt-1 flex items-center gap-3 flex-wrap">
                {company.industry && <span>Industri: {company.industry}</span>}
                {company.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {company.city}</span>}
                {company.website && (
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:underline"
                  >
                    <Globe className="w-3 h-3" /> {company.website} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs font-semibold scrollbar-none">
          {[
            { id: 'overview', label: 'Overview 360°', icon: Building2 },
            { id: 'contacts', label: `PIC / Contacts (${companyContacts.length})`, icon: Users },
            { id: 'leads', label: `Leads (${companyLeads.length})`, icon: Target },
            { id: 'deals', label: `Deals (${companyDeals.length})`, icon: CircleDollarSign },
            { id: 'quotations', label: `Quotations (${companyQuotations.length})`, icon: FileText },
            { id: 'tasks', label: `Tasks (${companyTasks.length})`, icon: CheckSquare },
            { id: 'timeline', label: `Timeline (${companyActivities.length})`, icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600 font-bold bg-white shadow-xs rounded-t-xl'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          
          {/* TAB 1: OVERVIEW 360° */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Top Sales Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Total Closing (Revenue)</p>
                  <p className="text-xl font-black text-emerald-600 mt-1">Rp {totalWonRevenue.toLocaleString('id-ID')}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{wonDeals.length} Deal Won</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Open Pipeline</p>
                  <p className="text-xl font-black text-blue-600 mt-1">Rp {totalOpenPipeline.toLocaleString('id-ID')}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{openDeals.length} Deal Aktif</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Conversion Rate</p>
                  <p className="text-xl font-black text-slate-800 mt-1">
                    {companyDeals.length > 0 ? `${Math.round((wonDeals.length / companyDeals.length) * 100)}%` : '0%'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">{wonDeals.length} Won / {companyDeals.length} Total Deal</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Pending Tasks</p>
                  <p className="text-xl font-black text-amber-600 mt-1">
                    {companyTasks.filter((t) => t.status !== 'Completed' && t.status !== 'Done').length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Belum Selesai</p>
                </div>
              </div>

              {/* Company Information & Key Contacts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Company Details */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Building2 className="w-4 h-4 text-blue-600" /> Profil Perusahaan
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Nama Perusahaan</span>
                      <span className="text-slate-800 font-bold">{company.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Tipe / Industri</span>
                      <span className="text-slate-800 font-medium">{company.companyType || '-'} / {company.industry || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Sumber (Source)</span>
                      <span className="text-slate-800 font-medium">{company.source || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Sales Owner</span>
                      <span className="text-slate-800 font-medium">{company.owner || 'Belum ditugaskan'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block font-medium">Alamat Lengkap</span>
                      <span className="text-slate-800 font-medium">{company.address || '-'}, {company.city || ''}</span>
                    </div>
                  </div>
                </div>

                {/* Key PIC Contacts */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" /> Kontak PIC Utama ({companyContacts.length})
                    </h3>
                  </div>
                  {companyContacts.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">Belum ada data PIC tersimpan untuk perusahaan ini.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {companyContacts.map((pic) => (
                        <div key={pic.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-slate-900">{pic.name}</p>
                            <p className="text-[11px] text-slate-500">{pic.position || 'PIC Client'} • {pic.phone}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {pic.phone && (
                              <a
                                href={`https://wa.me/${pic.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-[11px] font-semibold"
                              >
                                WhatsApp
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Log Activity & Automatic Follow-Up Box */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" /> Catat Aktivitas & Jadwal Follow-Up Otomatis
                </h3>
                <form onSubmit={handleLogActivitySubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Aktivitas</label>
                      <select
                        value={actType}
                        onChange={(e) => setActType(e.target.value as ActivityType)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                      >
                        <option value="Call">Call / Telepon</option>
                        <option value="WhatsApp">WhatsApp Message</option>
                        <option value="Meeting">Meeting / Diskusi</option>
                        <option value="Survey">Survey Lokasi</option>
                        <option value="Visit">Kunjungan / Visit</option>
                        <option value="Proposal Sent">Penawaran Dikirim</option>
                        <option value="Follow Up">Follow Up Umum</option>
                        <option value="Note">Catatan Internal</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Hasil / Catatan Aktivitas</label>
                      <input
                        type="text"
                        placeholder="Contoh: Call customer - meminta revisi harga penawaran"
                        value={actDesc}
                        onChange={(e) => setActDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Automatic Follow-up schedule */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <div>
                      <label className="block text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" /> Next Follow-Up Date (Opsional)
                      </label>
                      <input
                        type="date"
                        value={nextFollowUpDate}
                        onChange={(e) => setNextFollowUpDate(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-blue-900 mb-1">Judul Task Follow-Up Otomatis</label>
                      <input
                        type="text"
                        placeholder="Contoh: Follow-up revisi harga PT ABC"
                        value={nextFollowUpTaskTitle}
                        onChange={(e) => setNextFollowUpTaskTitle(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingActivity || !actDesc.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" /> Simpan Aktivitas & Auto Task
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: CONTACTS / PICS */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Daftar PIC / Kontak Client ({companyContacts.length})</h3>
                  <p className="text-xs text-slate-500">Kontak ini tersinkronisasi otomatis dengan Database Kontak CRM.</p>
                </div>
                {!isAddingPic && (
                  <button
                    onClick={() => setIsAddingPic(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah PIC Baru
                  </button>
                )}
              </div>

              {/* Inline Add PIC Form */}
              {isAddingPic && (
                <form onSubmit={handleAddPicSubmit} className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-blue-600" /> Form Tambah PIC Kontak untuk {company.name}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Lengkap PIC *</label>
                      <input
                        type="text"
                        required
                        value={newPicName}
                        onChange={(e) => setNewPicName(e.target.value)}
                        placeholder="Contoh: Andi Pratama"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Jabatan / Position</label>
                      <input
                        type="text"
                        value={newPicPosition}
                        onChange={(e) => setNewPicPosition(e.target.value)}
                        placeholder="Contoh: Procurement Manager / Manager Operational"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Telepon / WhatsApp *</label>
                      <input
                        type="text"
                        required
                        value={newPicPhone}
                        onChange={(e) => setNewPicPhone(e.target.value)}
                        placeholder="Contoh: 08123456789"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newPicEmail}
                        onChange={(e) => setNewPicEmail(e.target.value)}
                        placeholder="andi@company.com"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 mr-2">Tipe Kontak:</label>
                      <select
                        value={newPicType}
                        onChange={(e) => setNewPicType(e.target.value as ContactType)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      >
                        <option value="Customer">Customer</option>
                        <option value="Prospect">Prospect</option>
                        <option value="Partner">Partner</option>
                        <option value="Vendor">Vendor</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingPic(false)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl text-xs font-bold transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingPic || !newPicName.trim()}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
                      >
                        Simpan PIC Baru
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {companyContacts.length === 0 && !isAddingPic ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 space-y-3">
                  <Users className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm text-slate-600 font-bold">Belum ada PIC terdaftar untuk perusahaan ini.</p>
                  <p className="text-xs text-slate-400">Tambahkan PIC kontak baru untuk mempermudah komunikasi dan pencatatan transaksi.</p>
                  <button
                    onClick={() => setIsAddingPic(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs mt-2"
                  >
                    <Plus className="w-4 h-4" /> Tambah PIC Pertama
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companyContacts.map((c) => (
                    <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-blue-300 transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{c.position || 'PIC Client'}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100">
                          {c.type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1.5 pt-1 border-t border-slate-100">
                        <p className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">{c.phone}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">{c.email || '-'}</span>
                        </p>
                      </div>
                      {c.phone && c.phone !== '-' && (
                        <div className="pt-2 flex items-center justify-end">
                          <a
                            href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                          >
                            Chat WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LEADS */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Riwayat Leads Calon Transaksi</h3>
              {companyLeads.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-slate-200">
                  <p className="text-sm text-slate-500 font-medium">Belum ada data Lead terdaftar.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {companyLeads.map((lead) => (
                    <div key={lead.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{lead.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                            {lead.stage}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Product: {lead.productService || '-'} • Estimasi Nilai: Rp {(lead.estimatedValue || 0).toLocaleString('id-ID')}</p>
                      </div>
                      {lead.stage !== 'CONVERTED' && lead.stage !== 'LOST' && onConvertLead && (
                        <button
                          onClick={() => onConvertLead(lead)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                        >
                          Convert to Deal
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DEALS */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Riwayat Deals & Peluang Transaksi</h3>
              {companyDeals.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-slate-200">
                  <p className="text-sm text-slate-500 font-medium">Belum ada Deal terdaftar.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {companyDeals.map((deal) => (
                    <div key={deal.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">{deal.title}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                            {deal.stage} ({deal.probability}%)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-semibold">
                          Nilai Deal: Rp {(deal.value || 0).toLocaleString('id-ID')} • Weighted: Rp {Math.round((deal.value * deal.probability) / 100).toLocaleString('id-ID')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {deal.stage !== 'WON' && deal.stage !== 'Closed Won' && deal.stage !== 'LOST' && (
                          <>
                            {onMarkDealWon && (
                              <button
                                onClick={() => onMarkDealWon(deal)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                              >
                                Mark Won
                              </button>
                            )}
                            {onMarkDealLost && (
                              <button
                                onClick={() => onMarkDealLost(deal)}
                                className="px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-xl text-xs font-bold transition-colors"
                              >
                                Mark Lost
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: QUOTATIONS */}
          {activeTab === 'quotations' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Daftar Penawaran (Quotations)</h3>
              {companyQuotations.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-slate-200">
                  <p className="text-sm text-slate-500 font-medium">Belum ada Quotation yang diterbitkan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {companyQuotations.map((q) => (
                    <div key={q.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{q.quotationNumber}</p>
                        <p className="text-slate-500 mt-0.5">PIC: {q.picName} • Grand Total: <span className="font-bold text-slate-900">Rp {q.grandTotal.toLocaleString('id-ID')}</span></p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                        q.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : q.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {q.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Tugas & Follow-Up Perusahaan</h3>
              {companyTasks.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-slate-200">
                  <p className="text-sm text-slate-500 font-medium">Tidak ada tugas aktif.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {companyTasks.map((t) => (
                    <div key={t.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{t.title}</p>
                        <p className="text-slate-500 mt-0.5">Jatuh Tempo: {t.dueDate || '-'} • Assigned: {t.assignedTo || '-'}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        t.status === 'Completed' || t.status === 'Done' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Activity Timeline (Riwayat Interaksi Complete)</h3>
              {companyActivities.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-slate-200">
                  <p className="text-sm text-slate-500 font-medium">Belum ada catatan riwayat interaksi.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 py-2">
                  {companyActivities.map((act) => (
                    <div key={act.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-xs">
                        <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
                          <span>{new Date(act.timestamp).toLocaleString('id-ID')}</span>
                          {act.createdByName && <span className="font-semibold text-slate-600">{act.createdByName}</span>}
                        </div>
                        <p className="font-bold text-slate-900">{act.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
