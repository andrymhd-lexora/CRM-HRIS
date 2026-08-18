import React, { useState } from 'react';
import { Contact, ContactType, ContactStatus } from '../types/crm';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Building2,
  Tag,
  Edit,
  Trash2,
  MessageCircle,
  LayoutGrid,
  List,
  X
} from 'lucide-react';

import { Company } from '../types/crm';

interface ContactsViewProps {
  contacts: Contact[];
  companies?: Company[];
  onAddContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateContact: (id: any, contact: Partial<Contact>) => void;
  onDeleteContact: (id: any) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  companies = [],
  onAddContact,
  onUpdateContact,
  onDeleteContact
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    companyId: '' as string | number | undefined,
    type: 'Customer' as ContactType,
    status: 'Active' as ContactStatus,
    tags: '',
    notes: ''
  });

  const typesList: (string | ContactType)[] = ['All', 'Customer', 'Prospect', 'Vendor', 'Supplier', 'Partner', 'Employee'];

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);

    const matchesType = selectedType === 'All' || c.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      companyId: '',
      type: 'Customer',
      status: 'Active',
      tags: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      companyId: contact.companyId || '',
      type: contact.type || 'Customer',
      status: contact.status || 'Active',
      tags: contact.tags || '',
      notes: contact.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingContact && editingContact.id) {
      onUpdateContact(editingContact.id, formData);
    } else {
      onAddContact(formData);
    }

    setIsModalOpen(false);
  };

  const getCleanPhone = (phone: string) => {
    return phone.replace(/[^0-9]/g, '');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Database Kontak</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                {filteredContacts.length} Kontak
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Kelola data pelanggan, prospect, partner, dan vendor perusahaan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Grid Card"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kontak</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, perusahaan, email, phone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Type Selector */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {typesList.map((t) => (
                <option key={t} value={t}>
                  Type: {t}
                </option>
              ))}
            </select>

            {/* Status Selector */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">Status: All</option>
              <option value="Active">Status: Active</option>
              <option value="Inactive">Status: Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contacts List: Table Mode vs Grid Mode */}
      {filteredContacts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-slate-800 text-sm">Tidak ada kontak ditemukan</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau gunakan tombol "Tambah Kontak" untuk membuat kontak baru.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Kontak</th>
                  <th className="py-3 px-4">Perusahaan</th>
                  <th className="py-3 px-4">Kontak Info</th>
                  <th className="py-3 px-4">Kategori Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredContacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                      {c.tags && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.tags.split(',').map((tag, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-bold"
                            >
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.company || '-'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 space-y-1">
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-100">
                        {c.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          c.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Direct Link */}
                        {c.phone && (
                          <a
                            href={`https://wa.me/${getCleanPhone(c.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Chat WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}

                        {/* Email Direct Link */}
                        {c.email && (
                          <a
                            href={`mailto:${c.email}`}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Kirim Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                          title="Edit Kontak"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => c.id && onDeleteContact(c.id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Hapus Kontak"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((c) => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{c.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {c.company || 'Perusahaan tidak diisi'}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] shrink-0 border border-blue-100">
                    {c.type}
                  </span>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                </div>

                {c.tags && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {c.tags.split(',').map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <div className="flex items-center gap-1">
                  {c.phone && (
                    <a
                      href={`https://wa.me/${getCleanPhone(c.phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  {c.email && (
                    <a
                      href={`mailto:${c.email}`}
                      className="p-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(c)}
                    className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => c.id && onDeleteContact(c.id)}
                    className="p-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[88vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                {editingContact ? 'Edit Data Kontak' : 'Tambah Kontak Baru'}
              </h3>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="budi@company.com"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Telepon / WhatsApp</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+628123456789"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Perusahaan Terdaftar (Master Data)</label>
                  <select
                    value={formData.companyId ? String(formData.companyId) : ''}
                    onChange={(e) => {
                      const cId = e.target.value;
                      if (cId) {
                        const matched = companies.find((comp) => String(comp.id) === cId);
                        if (matched) {
                          setFormData({
                            ...formData,
                            companyId: matched.id,
                            company: matched.name
                          });
                        }
                      } else {
                        setFormData({ ...formData, companyId: '' });
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 mb-2"
                  >
                    <option value="">-- Pilih dari Master Perusahaan (Atau Ketik Manual) --</option>
                    {companies.map((comp) => (
                      <option key={comp.id} value={String(comp.id)}>
                        {comp.name} {comp.industry ? `(${comp.industry})` : ''}
                      </option>
                    ))}
                  </select>

                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Perusahaan (Ketik Manual / Hasil Pilih)</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => {
                      const val = e.target.value;
                      const cleanVal = val.toLowerCase().replace(/pt\.|pt\b|cv\.|ud\.|[^a-z0-9]/g, '').trim();
                      const matched = companies.find((comp) => {
                        const cleanComp = comp.name.toLowerCase().replace(/pt\.|pt\b|cv\.|ud\.|[^a-z0-9]/g, '').trim();
                        return cleanComp && cleanVal && (cleanComp === cleanVal || cleanComp.includes(cleanVal) || cleanVal.includes(cleanComp));
                      });
                      setFormData({
                        ...formData,
                        company: val,
                        companyId: matched ? matched.id : formData.companyId
                      });
                    }}
                    placeholder="Contoh: PT Techindo Solution"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as ContactType })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Customer">Customer</option>
                      <option value="Prospect">Prospect</option>
                      <option value="Vendor">Vendor</option>
                      <option value="Supplier">Supplier</option>
                      <option value="Partner">Partner</option>
                      <option value="Employee">Employee</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status Kontak</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ContactStatus })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tags (Pisahkan koma)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="vip, enterprise, jakarta"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Catatan latar belakang kontak..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-colors"
                >
                  {editingContact ? 'Simpan Perubahan' : 'Tambah Kontak'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
