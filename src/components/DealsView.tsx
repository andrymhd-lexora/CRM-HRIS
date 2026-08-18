import React, { useState } from 'react';
import { Deal, Company, Contact, UserProfile } from '../types/crm';
import { STAGE_PROBABILITIES } from '../db/firestoreService';
import {
  CircleDollarSign,
  Search,
  Plus,
  Building2,
  Calendar,
  AlertTriangle,
  Award,
  XCircle,
  FileText,
  Edit,
  Trash2,
  LayoutGrid,
  List,
  CheckCircle2,
  UserCheck,
  Percent,
  X
} from 'lucide-react';

interface DealsViewProps {
  deals: Deal[];
  companies: Company[];
  contacts: Contact[];
  currentUser: UserProfile | null;
  onAddDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateDeal: (id: string, deal: Partial<Deal>) => void;
  onDeleteDeal: (id: string) => void;
  onMarkDealWon?: (deal: Deal) => void;
  onMarkDealLost?: (deal: Deal, lostReason: string) => void;
  onCreateQuotationForDeal?: (deal: Deal) => void;
}

export const DEAL_STAGES_DEFAULT = [
  'QUALIFICATION',
  'SURVEY / MEETING',
  'PROPOSAL',
  'NEGOTIATION',
  'APPROVAL',
  'PO / SPK',
  'WON',
  'LOST'
];

export const DealsView: React.FC<DealsViewProps> = ({
  deals,
  companies,
  contacts,
  currentUser,
  onAddDeal,
  onUpdateDeal,
  onDeleteDeal,
  onMarkDealWon,
  onMarkDealLost,
  onCreateQuotationForDeal
}) => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // Lost Reason Modal State
  const [lostDealTarget, setLostDealTarget] = useState<Deal | null>(null);
  const [lostReasonInput, setLostReasonInput] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [contactName, setContactName] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [value, setValue] = useState<number>(0);
  const [stage, setStage] = useState('QUALIFICATION');
  const [expectedClose, setExpectedClose] = useState('');
  const [assignedTo, setAssignedTo] = useState(currentUser?.displayName || 'Sales');
  const [notes, setNotes] = useState('');

  const handleCompanySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cId = e.target.value;
    setSelectedCompanyId(cId);
    const matchedComp = companies.find((c) => String(c.id) === cId);
    if (matchedComp) {
      setCompany(matchedComp.name);
      // Auto pick first contact
      const matchedCt = contacts.find((ct) => String(ct.companyId) === cId);
      if (matchedCt) {
        setContactName(matchedCt.name);
        setSelectedContactId(String(matchedCt.id));
      }
    }
  };

  const handleContactSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ctId = e.target.value;
    setSelectedContactId(ctId);
    if (ctId) {
      const matchedCt = contacts.find((c) => String(c.id) === ctId);
      if (matchedCt) {
        setContactName(matchedCt.name);
        if (matchedCt.company) setCompany(matchedCt.company);
        if (matchedCt.companyId) setSelectedCompanyId(String(matchedCt.companyId));
      }
    }
  };

  const handleOpenAddModal = (initialStage?: string) => {
    setEditingDeal(null);
    setTitle('');
    setCompany('');
    setSelectedCompanyId('');
    setContactName('');
    setSelectedContactId('');
    setValue(0);
    setStage(initialStage || 'QUALIFICATION');
    setExpectedClose(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setAssignedTo(currentUser?.displayName || 'Sales');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (d: Deal) => {
    setEditingDeal(d);
    setTitle(d.title);
    setCompany(d.company || '');
    setSelectedCompanyId(d.companyId ? String(d.companyId) : '');
    setContactName(d.contactName || '');
    setSelectedContactId(d.contactId ? String(d.contactId) : '');
    setValue(d.value || 0);
    setStage(d.stage || 'QUALIFICATION');
    setExpectedClose(d.expectedClose || '');
    setAssignedTo(d.assignedTo || 'Sales');
    setNotes(d.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const prob = STAGE_PROBABILITIES[stage] !== undefined ? STAGE_PROBABILITIES[stage] : 20;

    if (editingDeal && editingDeal.id) {
      onUpdateDeal(String(editingDeal.id), {
        title,
        company,
        companyId: selectedCompanyId || undefined,
        contactName,
        contactId: selectedContactId || undefined,
        value,
        stage,
        probability: prob,
        expectedClose,
        assignedTo,
        notes
      });
    } else {
      onAddDeal({
        dealNumber: `DEAL-${Date.now().toString().slice(-6)}`,
        title,
        company,
        companyId: selectedCompanyId || undefined,
        contactName,
        contactId: selectedContactId || undefined,
        value,
        stage,
        probability: prob,
        expectedClose,
        assignedTo,
        notes
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmMarkLost = (e: React.FormEvent) => {
    e.preventDefault();
    if (lostDealTarget && onMarkDealLost && lostReasonInput.trim()) {
      onMarkDealLost(lostDealTarget, lostReasonInput);
      setLostDealTarget(null);
      setLostReasonInput('');
    }
  };

  const filteredDeals = deals.filter((d) => {
    return (
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.company && d.company.toLowerCase().includes(search.toLowerCase())) ||
      (d.dealNumber && d.dealNumber.toLowerCase().includes(search.toLowerCase()))
    );
  });

  // Calculate Total & Weighted Values
  const totalPipelineValue = filteredDeals
    .filter((d) => d.stage !== 'WON' && d.stage !== 'Closed Won' && d.stage !== 'LOST' && d.stage !== 'Closed Lost')
    .reduce((sum, d) => sum + (d.value || 0), 0);

  const weightedPipelineValue = filteredDeals
    .filter((d) => d.stage !== 'WON' && d.stage !== 'Closed Won' && d.stage !== 'LOST' && d.stage !== 'Closed Lost')
    .reduce((sum, d) => sum + Math.round(((d.value || 0) * (d.probability || 20)) / 100), 0);

  const totalWonValue = filteredDeals
    .filter((d) => d.stage === 'WON' || d.stage === 'Closed Won')
    .reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <CircleDollarSign className="w-7 h-7 text-amber-600" /> Deals Pipeline & Weighted Revenue
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Lacak peluang transaksi, probabilitas closing, pembuat penawaran, hingga status Closing (Won/Lost)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors ${
                viewMode === 'kanban' ? 'bg-white shadow-xs text-amber-600' : 'text-slate-600'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-xs text-amber-600' : 'text-slate-600'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Tabel
            </button>
          </div>

          <button
            onClick={() => handleOpenAddModal('QUALIFICATION')}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Tambah Deal Baru
          </button>
        </div>
      </div>

      {/* Pipeline Revenue Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Value Pipeline (Open)</p>
          <p className="text-xl font-black text-slate-900 mt-1">Rp {totalPipelineValue.toLocaleString('id-ID')}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-amber-800 uppercase">Weighted Revenue Forecast</p>
          <p className="text-xl font-black text-amber-600 mt-1">Rp {weightedPipelineValue.toLocaleString('id-ID')}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-emerald-800 uppercase">Total Revenue Closing (Won)</p>
          <p className="text-xl font-black text-emerald-600 mt-1">Rp {totalWonValue.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari deal, nomor deal, nama perusahaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {DEAL_STAGES_DEFAULT.map((stgName) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stgName);
            const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            const prob = STAGE_PROBABILITIES[stgName] ?? 20;

            return (
              <div key={stgName} className="bg-slate-100/80 rounded-2xl p-3 border border-slate-200/80 flex flex-col h-full min-w-[290px]">
                {/* Header Stage */}
                <div className="pb-2 mb-3 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 uppercase tracking-wide">{stgName}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                        {prob}%
                      </span>
                    </div>
                    <p className="text-[11px] font-black text-slate-500 mt-0.5">
                      Rp {(stageValue || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 text-xs font-black flex items-center justify-center">
                    {stageDeals.length}
                  </span>
                </div>

                {/* Deal Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
                  {stageDeals.map((deal) => {
                    // Check if > 3 days since updated
                    const lastUpdated = deal.updatedAt ? new Date(deal.updatedAt) : new Date();
                    const daysInactive = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
                    const isWarning = daysInactive >= 3 && deal.stage !== 'WON' && deal.stage !== 'LOST';

                    return (
                      <div
                        key={deal.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3 group relative"
                      >
                        {/* Warning Badge rule */}
                        {isWarning && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[9px] font-bold w-max">
                            <AlertTriangle className="w-3 h-3 text-rose-500" /> &gt;3 Hari Tanpa Follow-Up
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block">{deal.dealNumber || 'DEAL'}</span>
                            <h4 className="font-bold text-slate-900 text-xs group-hover:text-amber-600 transition-colors">
                              {deal.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" /> {deal.company || 'N/A'}
                            </p>
                            {deal.contactName && (
                              <p className="text-[10px] text-slate-600 font-semibold mt-0.5 flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-slate-400" /> {deal.contactName}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleOpenEditModal(deal)}
                            className="p-1 text-slate-400 hover:text-amber-600 rounded-md"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-0.5">
                          <p className="font-black text-slate-900 text-sm">
                            Rp {(deal.value || 0).toLocaleString('id-ID')}
                          </p>
                          <p className="text-[10px] text-amber-700 font-bold">
                            Weighted ({deal.probability || prob}%): Rp {Math.round(((deal.value || 0) * (deal.probability || prob)) / 100).toLocaleString('id-ID')}
                          </p>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 flex-wrap">
                          {onCreateQuotationForDeal && deal.stage !== 'WON' && deal.stage !== 'LOST' && (
                            <button
                              onClick={() => onCreateQuotationForDeal(deal)}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" /> Quotation
                            </button>
                          )}

                          {deal.stage !== 'WON' && deal.stage !== 'Closed Won' && deal.stage !== 'LOST' && (
                            <div className="flex items-center gap-1 ml-auto">
                              {onMarkDealWon && (
                                <button
                                  onClick={() => onMarkDealWon(deal)}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                                >
                                  Won
                                </button>
                              )}
                              {onMarkDealLost && (
                                <button
                                  onClick={() => setLostDealTarget(deal)}
                                  className="px-2 py-1 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg text-[10px] font-bold"
                                >
                                  Lost
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Nomor & Judul Deal</th>
                  <th className="py-3.5 px-4">Perusahaan</th>
                  <th className="py-3.5 px-4">Nilai Deal</th>
                  <th className="py-3.5 px-4">Stage & Probabilitas</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredDeals.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <p className="text-[10px] text-slate-400">{d.dealNumber || 'DEAL'}</p>
                      <p>{d.title}</p>
                    </td>
                    <td className="py-4 px-4">{d.company || '-'}</td>
                    <td className="py-4 px-4 font-black text-slate-900">
                      Rp {(d.value || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">
                        {d.stage} ({d.probability || 20}%)
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button onClick={() => handleOpenEditModal(d)} className="p-1 text-slate-400 hover:text-amber-600">
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Deal */}
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
                <CircleDollarSign className="w-4 h-4 text-amber-400" />
                {editingDeal ? 'Edit Data Deal' : 'Buat Peluang Deal Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs font-medium flex-1">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Judul Peluang / Deal *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pengadaan Hardware Server PT XYZ"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Pilih Kontak Terdaftar (Master Contact)</label>
                    <select
                      value={selectedContactId}
                      onChange={handleContactSelect}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="">-- Pilih Kontak Terdaftar --</option>
                      {contacts.map((ct) => (
                        <option key={ct.id} value={String(ct.id)}>
                          {ct.name} {ct.company ? `(${ct.company})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nama Kontak / PIC</label>
                    <input
                      type="text"
                      placeholder="Nama Kontak PIC"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Pilih Perusahaan *</label>
                    <select
                      value={selectedCompanyId}
                      onChange={handleCompanySelect}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="">-- Pilih Perusahaan --</option>
                      {companies.map((c) => (
                        <option key={c.id} value={String(c.id)}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nama Perusahaan (Text)</label>
                    <input
                      type="text"
                      placeholder="Nama Client"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nilai Potensi Deal (Rp) *</label>
                    <input
                      type="number"
                      required
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Stage Pipeline</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      {DEAL_STAGES_DEFAULT.map((st) => (
                        <option key={st} value={st}>{st} ({STAGE_PROBABILITIES[st]}%)</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Target Closing</label>
                    <input
                      type="date"
                      value={expectedClose}
                      onChange={(e) => setExpectedClose(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Sales Person</label>
                    <input
                      type="text"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-colors"
                >
                  {editingDeal ? 'Simpan Perubahan' : 'Simpan Deal'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: Deal Lost Reason (Rule 10 Requirement) */}
      {lostDealTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600 font-bold text-base">
              <AlertTriangle className="w-6 h-6" /> Tentukan Alasan Deal Lost (Batal)
            </div>
            <p className="text-xs text-slate-600">
              Sistem mengharuskan pengisian alasan kegagalan untuk analisis evaluasi penjualan perusahaan.
            </p>

            <form onSubmit={handleConfirmMarkLost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alasan Deal Lost *</label>
                <select
                  onChange={(e) => setLostReasonInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium mb-2"
                >
                  <option value="">-- Pilih Alasan Utama --</option>
                  <option value="Kalah Harga / Anggaran Client Tidak Masuk">Kalah Harga / Anggaran Client Tidak Masuk</option>
                  <option value="Fitur Produk Tidak Memenuhi Spesifikasi">Fitur Produk Tidak Memenuhi Spesifikasi</option>
                  <option value="Pindah ke Kompetitor">Pindah ke Kompetitor</option>
                  <option value="Proyek Dibatalkan Internal Client">Proyek Dibatalkan Internal Client</option>
                  <option value="Komunikasi Terputus / No Response">Komunikasi Terputus / No Response</option>
                </select>

                <input
                  type="text"
                  required
                  placeholder="Atau tuliskan alasan spesifik..."
                  value={lostReasonInput}
                  onChange={(e) => setLostReasonInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLostDealTarget(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!lostReasonInput.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  Simpan Deal Lost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
