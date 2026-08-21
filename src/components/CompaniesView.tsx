import React, { useState } from 'react';
import { Company, UserProfile } from '../types/crm';
import { useLanguage } from '../context/LanguageContext';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Globe,
  Phone,
  UserCheck,
  Eye,
  Trash2,
  Edit2,
  CheckCircle2,
  Users,
  Loader2,
  X
} from 'lucide-react';

interface CompaniesViewProps {
  companies: Company[];
  currentUser: UserProfile | null;
  onAddCompany: (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void> | void;
  onUpdateCompany: (id: string, data: Partial<Company>) => Promise<void> | void;
  onDeleteCompany: (id: string) => Promise<void> | void;
  onSelectCompany360: (company: Company) => void;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({
  companies,
  currentUser,
  onAddCompany,
  onUpdateCompany,
  onDeleteCompany,
  onSelectCompany360
}) => {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [isCustomerFilter, setIsCustomerFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [companyType, setCompanyType] = useState('PT');
  const [industry, setIndustry] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [source, setSource] = useState('Website');
  const [owner, setOwner] = useState(currentUser?.displayName || '');
  const [isCustomer, setIsCustomer] = useState(false);

  const openAddModal = () => {
    setEditingCompany(null);
    setName('');
    setCompanyType('PT');
    setIndustry('');
    setAddress('');
    setCity('');
    setWebsite('');
    setSource('Website');
    setOwner(currentUser?.displayName || '');
    setIsCustomer(false);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Company) => {
    setEditingCompany(c);
    setName(c.name);
    setCompanyType(c.companyType || 'PT');
    setIndustry(c.industry || '');
    setAddress(c.address || '');
    setCity(c.city || '');
    setWebsite(c.website || '');
    setSource(c.source || 'Website');
    setOwner(c.owner || '');
    setIsCustomer(!!c.isCustomer);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingCompany && editingCompany.id) {
        await onUpdateCompany(String(editingCompany.id), {
          name,
          companyType,
          industry,
          address,
          city,
          website,
          source,
          owner,
          isCustomer
        });
      } else {
        await onAddCompany({
          name,
          companyType,
          industry,
          address,
          city,
          website,
          source,
          owner,
          isCustomer
        });
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.industry && c.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.owner && c.owner.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'All' || c.companyType === typeFilter;
    const matchesCust =
      isCustomerFilter === 'All'
        ? true
        : isCustomerFilter === 'Customer'
        ? c.isCustomer
        : !c.isCustomer;

    return matchesSearch && matchesType && matchesCust;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7 text-blue-600" />
            <span>{t.companies.title}</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            {t.companies.subtitle}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.companies.addCompany}</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.companies.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto text-xs">
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-600">{t.companies.allStatuses}:</span>
            <select
              value={isCustomerFilter}
              onChange={(e) => setIsCustomerFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
            >
              <option value="All">{t.companies.allStatuses}</option>
              <option value="Customer">{t.companies.clientCustomer}</option>
              <option value="Prospect">{t.companies.prospectOnly}</option>
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-semibold text-slate-600">{t.companies.allTypes}:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
            >
              <option value="All">{t.companies.allTypes}</option>
              <option value="PT">PT</option>
              <option value="CV">CV</option>
              <option value="UD">UD</option>
              <option value="BUMN">BUMN</option>
              <option value="Instansi Pemerintah">Instansi Pemerintah</option>
              <option value="Perorangan">Perorangan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-bold text-sm">
            {language === 'id' ? 'Tidak ada data perusahaan yang ditemukan' : 'No companies found'}
          </p>
          <p className="text-slate-400 text-xs">
            {language === 'id' ? 'Tambahkan perusahaan baru atau sesuaikan filter pencarian.' : 'Add a new company or adjust your filter query.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map((comp) => (
            <div
              key={comp.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-black text-sm shrink-0">
                      {comp.companyType || 'PT'}
                    </div>
                    <div>
                      <h3
                        onClick={() => onSelectCompany360(comp)}
                        className="font-bold text-slate-900 text-base group-hover:text-blue-600 cursor-pointer line-clamp-1 transition-colors"
                      >
                        {comp.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {comp.industry || (language === 'id' ? 'Industri tidak diisi' : 'Industry not set')}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      comp.isCustomer
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {comp.isCustomer ? 'CLIENT' : 'PROSPECT'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  {comp.city && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {comp.address ? `${comp.address}, ` : ''}{comp.city}
                    </p>
                  )}
                  {comp.website && (
                    <p className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {comp.website}
                    </p>
                  )}
                  {comp.owner && (
                    <p className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Sales Owner: <span className="font-semibold text-slate-800">{comp.owner}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectCompany360(comp)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Customer 360°
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(comp)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title={t.actions.edit}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {comp.id && (
                    <button
                      onClick={() => onDeleteCompany(String(comp.id))}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title={t.actions.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add/Edit Company */}
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
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>{editingCompany ? (language === 'id' ? 'Edit Perusahaan' : 'Edit Company') : t.companies.addCompany}</span>
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
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {language === 'id' ? 'Tipe' : 'Type'}
                    </label>
                    <select
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="PT">PT</option>
                      <option value="CV">CV</option>
                      <option value="UD">UD</option>
                      <option value="BUMN">BUMN</option>
                      <option value="Instansi Pemerintah">Instansi Govt</option>
                      <option value="Perorangan">Perorangan</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">
                      {language === 'id' ? 'Nama Perusahaan *' : 'Company Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Nusantara Raya"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {language === 'id' ? 'Industri' : 'Industry'}
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Teknologi, Konstruksi"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {language === 'id' ? 'Kota' : 'City'}
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Jakarta Selatan"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'id' ? 'Alamat Lengkap' : 'Full Address'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Alamat kantor..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Website</label>
                    <input
                      type="text"
                      placeholder="www.perusahaan.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {language === 'id' ? 'Sumber (Lead Source)' : 'Source'}
                    </label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Website">Website</option>
                      <option value="Referral">Referral / Rekomendasi</option>
                      <option value="Outbound Call">Outbound Call</option>
                      <option value="Event / Pameran">Event / Pameran</option>
                      <option value="Social Media">Social Media</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Sales Owner</label>
                    <input
                      type="text"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="pt-2 sm:pt-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isCustomer"
                      checked={isCustomer}
                      onChange={(e) => setIsCustomer(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="isCustomer" className="text-slate-800 font-bold cursor-pointer">
                      {language === 'id' ? 'Status: Client / Customer Active' : 'Status: Active Customer'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-2 shrink-0">
                {editingCompany && editingCompany.id ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      const id = String(editingCompany.id);
                      setIsModalOpen(false);
                      onDeleteCompany(id);
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'id' ? 'Hapus Perusahaan' : 'Delete Company'}</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {t.actions.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> {t.actions.saving}
                      </>
                    ) : (
                      t.actions.save
                    )}
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
