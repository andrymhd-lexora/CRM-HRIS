import React, { useState } from 'react';
import { Company, Contact, Deal, UserProfile } from '../types/crm';
import {
  Users,
  Building2,
  Award,
  Search,
  Eye,
  Phone,
  Mail,
  MapPin,
  CircleDollarSign,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface CustomersViewProps {
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  currentUser: UserProfile | null;
  onSelectCustomer360: (company: Company) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  companies,
  contacts,
  deals,
  currentUser,
  onSelectCustomer360
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter only companies that are marked isCustomer === true or have WON deals
  const customerCompanies = companies.filter((comp) => {
    const compWonDeals = deals.filter(
      (d) =>
        (d.companyId && String(d.companyId) === String(comp.id)) &&
        (d.stage === 'WON' || d.stage === 'Closed Won')
    );

    const isClient = comp.isCustomer || compWonDeals.length > 0;
    const matchesSearch =
      comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comp.city && comp.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (comp.industry && comp.industry.toLowerCase().includes(searchTerm.toLowerCase()));

    return isClient && matchesSearch;
  });

  // Calculate total closing revenue from all customer companies
  const totalCustomerRevenue = deals
    .filter((d) => d.stage === 'WON' || d.stage === 'Closed Won')
    .reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Award className="w-7 h-7 text-emerald-600" /> Database Customer Active (Closing)
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Pelanggan resmi hasil konversi Deal Won. Klik untuk melihat Customer 360° View & riwayat transaksi.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-4">
          <div>
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Total Revenue Customer</p>
            <p className="text-lg font-black text-emerald-700">Rp {totalCustomerRevenue.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama customer, kota, industri..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="text-xs font-bold text-slate-500">
          Total {customerCompanies.length} Active Customer
        </div>
      </div>

      {/* Customers List */}
      {customerCompanies.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-bold text-sm">Belum ada data Customer Active yang terdaftar</p>
          <p className="text-slate-400 text-xs">Deal yang diubah menjadi status "WON" akan otomatis muncul di sini sebagai Customer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {customerCompanies.map((comp) => {
            const compWonDeals = deals.filter(
              (d) =>
                String(d.companyId) === String(comp.id) &&
                (d.stage === 'WON' || d.stage === 'Closed Won')
            );
            const compRevenue = compWonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            const compPICs = contacts.filter((c) => String(c.companyId) === String(comp.id));

            return (
              <div
                key={comp.id}
                className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-black text-sm shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3
                          onClick={() => onSelectCustomer360(comp)}
                          className="font-bold text-slate-900 text-base group-hover:text-emerald-600 cursor-pointer transition-colors line-clamp-1"
                        >
                          {comp.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {comp.industry || 'Industri General'}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> CLIENT
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Total Transaksi Won:</span>
                      <span className="font-bold text-slate-900">{compWonDeals.length} Deal</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Nilai Transaksi:</span>
                      <span className="font-black text-emerald-600">Rp {compRevenue.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {compPICs.length > 0 && (
                    <div className="text-xs text-slate-600 pt-2">
                      <p className="font-bold text-slate-800 mb-1">PIC Utama:</p>
                      <p className="flex items-center gap-1.5 text-slate-600">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> {compPICs[0].name} ({compPICs[0].phone})
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Sales Owner: {comp.owner || '-'}</span>
                  <button
                    onClick={() => onSelectCustomer360(comp)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" /> Customer 360°
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
