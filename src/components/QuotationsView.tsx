import React, { useState } from 'react';
import { Quotation, Company, Contact, Deal, UserProfile, QuotationStatus, QuotationItem } from '../types/crm';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Printer,
  Trash2,
  Edit2,
  Send,
  Building2,
  User,
  DollarSign,
  Calendar,
  Clock,
  Eye,
  Download
} from 'lucide-react';

interface QuotationsViewProps {
  quotations: Quotation[];
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  currentUser: UserProfile | null;
  onAddQuotation: (data: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateQuotationStatus: (id: string, status: QuotationStatus) => void;
  onDeleteQuotation: (id: string) => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({
  quotations,
  companies,
  contacts,
  deals,
  currentUser,
  onAddQuotation,
  onUpdateQuotationStatus,
  onDeleteQuotation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);

  // Form State
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [picName, setPicName] = useState('');
  const [selectedDealId, setSelectedDealId] = useState('');
  const [taxRate, setTaxRate] = useState<number>(11); // PPN 11%
  const [discount, setDiscount] = useState<number>(0);
  const [validUntil, setValidUntil] = useState<string>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [terms, setTerms] = useState<string>(
    '1. Pembayaran 50% Down Payment saat penandatanganan SPK.\n2. Pelunasan 50% setelah pekerjaan selesai.\n3. Penawaran berlaku selama 14 hari.'
  );

  // Line items state
  const [items, setItems] = useState<QuotationItem[]>([
    { description: 'Pengadaan Hardware & Server System', qty: 1, unitPrice: 25000000, total: 25000000 },
    { description: 'Jasa Implementasi & Maintenance Support', qty: 1, unitPrice: 10000000, total: 10000000 }
  ]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cId = e.target.value;
    setSelectedCompanyId(cId);
    const comp = companies.find((c) => String(c.id) === cId);
    if (comp) {
      setCompanyName(comp.name);
      // Auto pick first contact of company if available
      const matchingContact = contacts.find((ct) => String(ct.companyId) === cId);
      if (matchingContact) {
        setSelectedContactId(String(matchingContact.id));
        setPicName(matchingContact.name);
      }
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      { description: 'Item / Layanan Baru', qty: 1, unitPrice: 0, total: 0 }
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const updateItem = (index: number, field: keyof QuotationItem, val: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: val };

    if (field === 'qty' || field === 'unitPrice') {
      item.total = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
    }

    newItems[index] = item;
    setItems(newItems);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const taxAmount = Math.round((subtotal - discount) * (taxRate / 100));
  const grandTotal = subtotal - discount + taxAmount;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    const autoNumber = `QUO-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;

    onAddQuotation({
      quotationNumber: autoNumber,
      companyId: selectedCompanyId || undefined,
      companyName,
      contactId: selectedContactId || undefined,
      picName,
      dealId: selectedDealId || undefined,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      grandTotal,
      status: 'DRAFT',
      issuedDate: new Date().toISOString().split('T')[0],
      validUntil,
      termsAndConditions: terms,
      createdByName: currentUser?.displayName || 'Sales'
    });

    setIsCreateModalOpen(false);
  };

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.picName && q.picName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-600" /> Penawaran & Surat Penawaran (Quotations)
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Buat, lacak status, dan kirim penawaran resmi yang terhubung dengan Deal & Customer
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" /> Buat Penawaran Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari no quotation, perusahaan, PIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-600 shrink-0">Status:</span>
          {['All', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Quotation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredQuotations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-600 font-bold text-sm">Belum ada penawaran/quotation tersimpan</p>
            <p className="text-slate-400 text-xs">Klik "Buat Penawaran Baru" untuk membuat dokumen penawaran resmi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">No. Penawaran</th>
                  <th className="py-3.5 px-4">Perusahaan / PIC</th>
                  <th className="py-3.5 px-4">Nilai Grand Total</th>
                  <th className="py-3.5 px-4">Tgl Terbit / Valid</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-indigo-600">
                      {q.quotationNumber}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{q.companyName}</p>
                      <p className="text-[11px] text-slate-500">PIC: {q.picName || '-'}</p>
                    </td>
                    <td className="py-4 px-4 font-black text-slate-900 text-sm">
                      Rp {q.grandTotal.toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      <p>{q.issuedDate || '-'}</p>
                      <p className="text-[11px] text-amber-600">Valid: {q.validUntil || '-'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={q.status}
                        onChange={(e) =>
                          q.id && onUpdateQuotationStatus(String(q.id), e.target.value as QuotationStatus)
                        }
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase cursor-pointer border ${
                          q.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : q.status === 'SENT'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : q.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="SENT">SENT (Dikirim)</option>
                        <option value="REVISED">REVISED</option>
                        <option value="ACCEPTED">ACCEPTED (Diterima)</option>
                        <option value="REJECTED">REJECTED (Ditolak)</option>
                        <option value="EXPIRED">EXPIRED</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewQuotation(q)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1 transition-colors"
                          title="Pratinjau / Cetak Slip"
                        >
                          <Eye className="w-3.5 h-3.5" /> Pratinjau
                        </button>
                        {q.id && (
                          <button
                            onClick={() => onDeleteQuotation(String(q.id))}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Penawaran"
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
        )}
      </div>

      {/* MODAL: Create Quotation */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Buat Penawaran / Quotation Baru
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5 text-xs font-medium">
              
              {/* Select Company / Contact / Deal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pilih Perusahaan *</label>
                  <select
                    value={selectedCompanyId}
                    onChange={handleCompanyChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  >
                    <option value="">-- Pilih Perusahaan --</option>
                    {companies.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Perusahaan (Manual)</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="Nama PT / CV Client"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">PIC Name</label>
                  <input
                    type="text"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="Nama PIC Penerima"
                  />
                </div>
              </div>

              {/* Line Items Manager */}
              <div className="space-y-3 border-t border-b border-slate-100 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Rincian Barang & Layanan</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold rounded-lg text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Baris
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl">
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Deskripsi Layanan / Produk"
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.qty}
                          onChange={(e) => updateItem(idx, 'qty', Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Harga Satuan (Rp)"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px]">
                          Rp {(item.total || 0).toLocaleString('id-ID')}
                        </span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Calculations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Syarat & Ketentuan</label>
                  <textarea
                    rows={4}
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Diskon (Rp)</span>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-28 px-2 py-1 bg-white border border-slate-200 rounded-lg text-right"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">PPN (%)</span>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-right"
                    />
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                    <span>Grand Total</span>
                    <span className="text-indigo-600">Rp {grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  Terbitkan Penawaran (DRAFT)
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: Preview / Print Slip */}
      {previewQuotation && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Slip Print Header Action */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
              <span className="font-bold text-sm">Pratinjau Surat Penawaran Resmi</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Cetak / Download PDF
                </button>
                <button
                  onClick={() => setPreviewQuotation(null)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="p-8 space-y-6 text-slate-800 font-sans">
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">SURAT PENAWARAN HARGA</h1>
                  <p className="text-xs text-slate-500 font-bold mt-1">NO: {previewQuotation.quotationNumber}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold text-slate-900">PT NEXUS CRM INTEGRATED</p>
                  <p className="text-slate-500">Tanggal Terbit: {previewQuotation.issuedDate}</p>
                  <p className="text-slate-500">Berlaku s/d: {previewQuotation.validUntil}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block font-bold">Penerima Penawaran:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{previewQuotation.companyName}</p>
                  <p className="text-slate-600">UP: {previewQuotation.picName || 'Bapak/Ibu Manager'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">Status Dokumen:</span>
                  <span className="inline-block mt-1 px-3 py-0.5 bg-slate-900 text-white font-bold rounded-full text-[10px]">
                    {previewQuotation.status}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 font-bold text-slate-700">
                    <th className="py-2">Deskripsi Layanan / Produk</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Harga Satuan</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewQuotation.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-medium text-slate-900">{item.description}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">Rp {item.unitPrice.toLocaleString('id-ID')}</td>
                      <td className="py-3 text-right font-bold">Rp {item.totalPrice.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Calculation */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>Rp {previewQuotation.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {previewQuotation.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Diskon</span>
                      <span>- Rp {previewQuotation.discount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>PPN ({previewQuotation.taxRate}%)</span>
                    <span>Rp {previewQuotation.taxAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-300">
                    <span>Grand Total</span>
                    <span className="text-indigo-600">Rp {previewQuotation.grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              {previewQuotation.termsAndConditions && (
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-600">
                  <p className="font-bold text-slate-900 mb-1">Syarat & Ketentuan:</p>
                  <p className="whitespace-pre-line leading-relaxed">{previewQuotation.termsAndConditions}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
