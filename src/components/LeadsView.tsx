import React, { useState } from 'react';
import { Lead, Contact, Company, LeadSource, UserProfile } from '../types/crm';
import { useLanguage } from '../context/LanguageContext';
import {
  Target,
  Search,
  Plus,
  Building2,
  Phone,
  Mail,
  Edit,
  Trash2,
  LayoutGrid,
  List,
  X,
  ChevronRight,
  ArrowRightLeft,
  CheckCircle2,
  Calendar,
  UserCheck
} from 'lucide-react';

interface LeadsViewProps {
  leads: Lead[];
  contacts: Contact[];
  companies: Company[];
  currentUser: UserProfile | null;
  onAddLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateLead: (id: string, lead: Partial<Lead>) => void;
  onDeleteLead: (id: string) => void;
  onConvertLeadToDeal?: (lead: Lead) => void;
}

export const LEAD_STAGES_DEFAULT = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'NEED ANALYSIS',
  'MEETING / SURVEY',
  'PROPOSAL REQUIRED',
  'CONVERTED',
  'LOST'
];

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  contacts,
  companies,
  currentUser,
  onAddLead,
  onUpdateLead,
  onDeleteLead,
  onConvertLeadToDeal
}) => {
  const { language, t, formatCurrency: formatMoney } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [source, setSource] = useState<LeadSource>('Website');
  const [stage, setStage] = useState('NEW');
  const [productService, setProductService] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const handleCompanySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cId = e.target.value;
    setSelectedCompanyId(cId);
    const matchedComp = companies.find((c) => String(c.id) === cId);
    if (matchedComp) {
      setCompany(matchedComp.name);
    }
  };

  const handleContactSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ctId = e.target.value;
    setSelectedContactId(ctId);
    if (ctId) {
      const matchedCt = contacts.find((c) => String(c.id) === ctId);
      if (matchedCt) {
        setName(matchedCt.name);
        if (matchedCt.email) setEmail(matchedCt.email);
        if (matchedCt.phone) setPhone(matchedCt.phone);
        if (matchedCt.company) setCompany(matchedCt.company);
        if (matchedCt.companyId) setSelectedCompanyId(String(matchedCt.companyId));
      }
    }
  };

  const handleOpenAddModal = (initialStage?: string) => {
    setEditingLead(null);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setSelectedCompanyId('');
    setSelectedContactId('');
    setSource('Website');
    setStage(initialStage || 'NEW');
    setProductService('');
    setEstimatedValue(0);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setName(lead.name);
    setEmail(lead.email || '');
    setPhone(lead.phone || '');
    setCompany(lead.company);
    setSelectedCompanyId(lead.companyId ? String(lead.companyId) : '');
    setSelectedContactId(lead.contactId ? String(lead.contactId) : '');
    setSource(lead.source || 'Website');
    setStage(lead.stage || 'NEW');
    setProductService(lead.productService || '');
    setEstimatedValue(lead.estimatedValue || 0);
    setNotes(lead.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim()) return;

    if (editingLead && editingLead.id) {
      onUpdateLead(String(editingLead.id), {
        name,
        email,
        phone,
        company,
        companyId: selectedCompanyId || undefined,
        contactId: selectedContactId || undefined,
        source,
        stage,
        productService,
        estimatedValue,
        notes
      });
    } else {
      onAddLead({
        name,
        email,
        phone,
        company,
        companyId: selectedCompanyId || undefined,
        contactId: selectedContactId || undefined,
        source,
        stage,
        productService,
        estimatedValue,
        score: 60,
        assignedTo: currentUser?.displayName || 'Sales',
        notes
      });
    }

    setIsModalOpen(false);
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      (l.email && l.email.toLowerCase().includes(search.toLowerCase()));

    const matchesSource = selectedSource === 'All' || l.source === selectedSource;
    return matchesSearch && matchesSource;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Target className="w-7 h-7 text-blue-600" />
            <span>{t.leads.title}</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            {t.leads.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle View */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> {t.leads.kanbanView}
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'
              }`}
            >
              <List className="w-3.5 h-3.5" /> {t.leads.tableView}
            </button>
          </div>

          <button
            onClick={() => handleOpenAddModal('NEW')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.leads.addLead}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.leads.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs w-full md:w-auto">
          <span className="font-semibold text-slate-500">Source:</span>
          {['All', 'Website', 'Referral', 'Social Media', 'Cold Call'].map((sc) => (
            <button
              key={sc}
              onClick={() => setSelectedSource(sc)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0 cursor-pointer ${
                selectedSource === sc ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sc === 'All' ? (language === 'id' ? 'Semua' : 'All') : sc}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {LEAD_STAGES_DEFAULT.map((stgName) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stgName);
            const totalStageValue = stageLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

            return (
              <div key={stgName} className="bg-slate-100/80 rounded-2xl p-3 border border-slate-200/80 flex flex-col h-full min-w-[280px]">
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800 tracking-wide uppercase">{stgName}</span>
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center">
                      {stageLeads.length}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {formatMoney(totalStageValue)}
                  </span>
                </div>

                {/* Lead Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                              {lead.name}
                            </p>
                            {lead.contactId && (
                              <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[9px] font-bold border border-blue-100" title="Terintegrasi dengan Master Contact">
                                Contact
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" /> {lead.company || 'Perusahaan N/A'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(lead)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded-md cursor-pointer"
                            title={t.actions.edit}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {lead.id && (
                            <button
                              onClick={() => onDeleteLead(String(lead.id))}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                              title={t.actions.delete}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-1">
                        {lead.productService && (
                          <p className="font-medium text-slate-700">
                            {language === 'id' ? 'Produk: ' : 'Product: '}{lead.productService}
                          </p>
                        )}
                        <p className="font-black text-blue-700">
                          Est. {formatMoney(lead.estimatedValue || 0)}
                        </p>
                      </div>

                      {/* Convert Action Button */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{lead.source}</span>
                        
                        {lead.stage === 'CONVERTED' ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {t.leads.converted}
                          </span>
                        ) : onConvertLeadToDeal ? (
                          <button
                            onClick={() => onConvertLeadToDeal(lead)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                          >
                            <ArrowRightLeft className="w-3 h-3" /> {t.leads.convertDeal}
                          </button>
                        ) : null}
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW 2: TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">{language === 'id' ? 'Nama Lead & Perusahaan' : 'Lead & Company'}</th>
                  <th className="py-3.5 px-4">{language === 'id' ? 'Kontak' : 'Contact'}</th>
                  <th className="py-3.5 px-4">{language === 'id' ? 'Produk / Estimasi' : 'Product / Est. Value'}</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4 text-right">{t.actions.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{l.name}</p>
                      <p className="text-[11px] text-slate-500">{l.company}</p>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      <p>{l.phone || '-'}</p>
                      <p className="text-[11px] text-slate-400">{l.email || '-'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{formatMoney(l.estimatedValue || 0)}</p>
                      <p className="text-[11px] text-slate-500">{l.productService || '-'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        l.stage === 'CONVERTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {l.stage}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {l.stage !== 'CONVERTED' && onConvertLeadToDeal && (
                          <button
                            onClick={() => onConvertLeadToDeal(l)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                          >
                            {t.leads.convertDeal}
                          </button>
                        )}
                        <button onClick={() => handleOpenEditModal(l)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer" title={t.actions.edit}>
                          <Edit className="w-4 h-4" />
                        </button>
                        {l.id && (
                          <button
                            onClick={() => onDeleteLead(String(l.id))}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                            title={t.actions.delete}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Lead */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col max-h-[88vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span>{editingLead ? (language === 'id' ? 'Edit Data Lead' : 'Edit Lead') : t.leads.addLead}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={t.actions.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs font-medium flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {language === 'id' ? 'Pilih Kontak (Master)' : 'Link to Contact'}
                    </label>
                    <select
                      value={selectedContactId}
                      onChange={handleContactSelect}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">{language === 'id' ? '-- Pilih dari Master Kontak --' : '-- Select from Contacts --'}</option>
                      {contacts.map((ct) => (
                        <option key={ct.id} value={String(ct.id)}>
                          {ct.name} {ct.company ? `(${ct.company})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {language === 'id' ? 'Pilih Perusahaan (Master)' : 'Link to Company'}
                    </label>
                    <select
                      value={selectedCompanyId}
                      onChange={handleCompanySelect}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">{language === 'id' ? '-- Pilih dari Master Perusahaan --' : '-- Select from Companies --'}</option>
                      {companies.map((c) => (
                        <option key={c.id} value={String(c.id)}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {language === 'id' ? 'Nama Lead / PIC *' : 'Lead PIC Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Kontak / PIC"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {language === 'id' ? 'Nama Perusahaan *' : 'Company Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Perusahaan Client"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {language === 'id' ? 'No Telepon / WA' : 'Phone / WhatsApp'}
                    </label>
                    <input
                      type="text"
                      placeholder="0812xxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="email@perusahaan.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Stage Pipeline</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {LEAD_STAGES_DEFAULT.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {language === 'id' ? 'Estimasi Nilai' : 'Estimated Value'}
                    </label>
                    <input
                      type="number"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'id' ? 'Produk / Layanan Yang Diminati' : 'Interested Product / Service'}
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Software HRIS & Payroll System"
                    value={productService}
                    onChange={(e) => setProductService(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-2 shrink-0">
                {editingLead && editingLead.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      const id = String(editingLead.id);
                      setIsModalOpen(false);
                      onDeleteLead(id);
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'id' ? 'Hapus Lead' : 'Delete Lead'}</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {t.actions.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
                  >
                    {editingLead ? t.actions.save : t.actions.save}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
