import React, { useState } from 'react';
import { Company, Contact, Lead, Deal, Quotation } from '../types/crm';
import { Search, X, Building2, Users, Target, CircleDollarSign, FileText, ChevronRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  contacts: Contact[];
  leads: Lead[];
  deals: Deal[];
  quotations: Quotation[];
  onSelectCompany360: (company: Company) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  companies,
  contacts,
  leads,
  deals,
  quotations,
  onSelectCompany360
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const qLower = query.trim().toLowerCase();

  const matchingCompanies = qLower
    ? companies.filter(
        (c) =>
          c.name.toLowerCase().includes(qLower) ||
          (c.city && c.city.toLowerCase().includes(qLower)) ||
          (c.industry && c.industry.toLowerCase().includes(qLower))
      )
    : [];

  const matchingContacts = qLower
    ? contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(qLower) ||
          c.phone.includes(qLower) ||
          (c.email && c.email.toLowerCase().includes(qLower)) ||
          (c.company && c.company.toLowerCase().includes(qLower))
      )
    : [];

  const matchingLeads = qLower
    ? leads.filter(
        (l) =>
          l.name.toLowerCase().includes(qLower) ||
          (l.company && l.company.toLowerCase().includes(qLower)) ||
          (l.productService && l.productService.toLowerCase().includes(qLower))
      )
    : [];

  const matchingDeals = qLower
    ? deals.filter(
        (d) =>
          d.title.toLowerCase().includes(qLower) ||
          (d.dealNumber && d.dealNumber.toLowerCase().includes(qLower)) ||
          (d.company && d.company.toLowerCase().includes(qLower))
      )
    : [];

  const matchingQuotations = qLower
    ? quotations.filter(
        (q) =>
          q.quotationNumber.toLowerCase().includes(qLower) ||
          q.companyName.toLowerCase().includes(qLower) ||
          (q.picName && q.picName.toLowerCase().includes(qLower))
      )
    : [];

  const totalResults =
    matchingCompanies.length +
    matchingContacts.length +
    matchingLeads.length +
    matchingDeals.length +
    matchingQuotations.length;

  const handleCompanyClick = (comp: Company) => {
    onSelectCompany360(comp);
    onClose();
  };

  const handleContactClick = (contact: Contact) => {
    const parentCompany = companies.find(
      (c) => String(c.id) === String(contact.companyId) || c.name.toLowerCase() === (contact.company || '').toLowerCase()
    );
    if (parentCompany) {
      onSelectCompany360(parentCompany);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-start justify-center pt-16 px-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Pencarian Global: Perusahaan, PIC, No WhatsApp, Lead, Deal #, Quotation #..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none placeholder:text-slate-400"
          />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs font-medium">
          {!qLower ? (
            <p className="text-slate-400 text-center py-8">Ketik kata kunci pencarian untuk menjelajahi database terintegrasi.</p>
          ) : totalResults === 0 ? (
            <p className="text-slate-500 text-center py-8">Tidak ditemukan data yang cocok dengan "{query}".</p>
          ) : (
            <div className="space-y-4">
              
              {/* Companies Results */}
              {matchingCompanies.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" /> Perusahaan ({matchingCompanies.length})
                  </span>
                  <div className="space-y-1">
                    {matchingCompanies.map((comp) => (
                      <div
                        key={comp.id}
                        onClick={() => handleCompanyClick(comp)}
                        className="p-3 bg-slate-50 hover:bg-blue-50/80 rounded-xl cursor-pointer flex items-center justify-between transition-colors border border-slate-100"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{comp.name}</p>
                          <p className="text-slate-500 text-[11px]">{comp.companyType || 'PT'} • {comp.city || 'Kota -'}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contacts Results */}
              {matchingContacts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" /> Kontak PIC ({matchingContacts.length})
                  </span>
                  <div className="space-y-1">
                    {matchingContacts.map((ct) => (
                      <div
                        key={ct.id}
                        onClick={() => handleContactClick(ct)}
                        className="p-3 bg-slate-50 hover:bg-indigo-50/80 rounded-xl cursor-pointer flex items-center justify-between transition-colors border border-slate-100"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{ct.name} ({ct.company})</p>
                          <p className="text-slate-500 text-[11px]">{ct.phone} • {ct.email || '-'}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deals & Leads */}
              {(matchingDeals.length > 0 || matchingQuotations.length > 0) && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CircleDollarSign className="w-3.5 h-3.5 text-emerald-600" /> Deals & Quotations
                  </span>
                  <div className="space-y-1">
                    {matchingDeals.map((d) => (
                      <div key={d.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-900">{d.title} ({d.dealNumber || 'DEAL'})</p>
                          <p className="text-slate-500 text-[11px]">Nilai: Rp {(d.value || 0).toLocaleString('id-ID')} • Stage: {d.stage}</p>
                        </div>
                      </div>
                    ))}
                    {matchingQuotations.map((q) => (
                      <div key={q.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-900">Quotation #{q.quotationNumber}</p>
                          <p className="text-slate-500 text-[11px]">{q.companyName} • Grand Total: Rp {q.grandTotal.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
