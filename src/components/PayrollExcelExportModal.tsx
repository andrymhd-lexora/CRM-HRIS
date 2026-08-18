import React, { useState, useMemo } from 'react';
import { Payroll, Employee, CompanyProfile, DEFAULT_COMPANY_PROFILE } from '../types/crm';
import { exportPayrollToExcel, INDONESIAN_MONTHS } from '../utils/excelExport';
import {
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
  Filter,
  Calendar,
  Building2,
  CreditCard,
  Layers,
  Sparkles,
  ShieldCheck,
  DollarSign,
  Users
} from 'lucide-react';

interface PayrollExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  payrolls: Payroll[];
  employees: Employee[];
  currentMonth: number;
  currentYear: number;
  companyProfile?: CompanyProfile;
  currency?: string;
  onSuccess?: (msg: string) => void;
}

export const PayrollExcelExportModal: React.FC<PayrollExcelExportModalProps> = ({
  isOpen,
  onClose,
  payrolls,
  employees,
  currentMonth,
  currentYear,
  companyProfile = DEFAULT_COMPANY_PROFILE,
  currency = 'IDR',
  onSuccess
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedTaxScheme, setSelectedTaxScheme] = useState<string>('All');

  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeDeptRecap, setIncludeDeptRecap] = useState(true);
  const [includeBankTransfer, setIncludeBankTransfer] = useState(true);

  const [isExporting, setIsExporting] = useState(false);

  // Synchronize with parent props when opened
  React.useEffect(() => {
    if (isOpen) {
      setSelectedMonth(currentMonth);
      setSelectedYear(currentYear);
    }
  }, [isOpen, currentMonth, currentYear]);

  // Extract unique departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    payrolls.forEach((p) => {
      if (p.department) set.add(p.department);
    });
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set).sort();
  }, [payrolls, employees]);

  // Filter preview records
  const filteredRecords = useMemo(() => {
    return payrolls.filter((p) => {
      if (p.month !== selectedMonth || p.year !== selectedYear) return false;
      if (selectedDept !== 'All' && p.department !== selectedDept) return false;
      if (selectedStatus !== 'All' && p.paymentStatus !== selectedStatus) return false;

      if (selectedTaxScheme !== 'All') {
        const isEmployerBorne =
          p.pph21PaidBy === 'Perusahaan' ||
          (p.pph21EmployeeDeduction === 0 && (p.pph21Amount || 0) > 0);
        if (selectedTaxScheme === 'Ditanggung Perusahaan' && !isEmployerBorne) return false;
        if (selectedTaxScheme === 'Ditanggung Karyawan' && isEmployerBorne) return false;
      }

      return true;
    });
  }, [payrolls, selectedMonth, selectedYear, selectedDept, selectedStatus, selectedTaxScheme]);

  // Aggregate totals
  const totalTHP = useMemo(() => {
    return filteredRecords.reduce((sum, p) => sum + (p.netSalary || 0), 0);
  }, [filteredRecords]);

  const totalGross = useMemo(() => {
    return filteredRecords.reduce((sum, p) => {
      return sum + (p.grossSalary || (p.baseSalary + (p.allowances || 0) + (p.overtimePay || 0) + (p.bonus || 0)));
    }, 0);
  }, [filteredRecords]);

  const totalPPh21 = useMemo(() => {
    return filteredRecords.reduce((sum, p) => sum + (p.pph21Amount || 0), 0);
  }, [filteredRecords]);

  const formatMoney = (val: number) => {
    return `${currency} ${(val || 0).toLocaleString('id-ID')}`;
  };

  const handleExport = () => {
    if (filteredRecords.length === 0) {
      alert('Tidak ada data payroll yang sesuai dengan kategori filter yang dipilih.');
      return;
    }

    try {
      setIsExporting(true);
      const res = exportPayrollToExcel({
        payrolls,
        employees,
        month: selectedMonth,
        year: selectedYear,
        departmentFilter: selectedDept,
        statusFilter: selectedStatus,
        taxSchemeFilter: selectedTaxScheme,
        companyProfile,
        includeSummarySheet: includeSummary,
        includeDeptRecap,
        includeBankDisbursement: includeBankTransfer
      });

      if (onSuccess) {
        onSuccess(`File Excel "${res.fileName}" berhasil diekspor (${res.totalRecords} data karyawan)!`);
      }
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 600);
    } catch (err) {
      console.error('Export Excel failed:', err);
      setIsExporting(false);
      alert('Gagal mengekspor file Excel. Silakan coba lagi.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/30 shadow-inner">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                Ekspor Data Payroll ke Excel (.xlsx)
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Pilih kategori bulan, tahun, departemen, dan komponen laporan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs">
          {/* Section 1: Periode Bulan & Tahun */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>1. Pilih Periode Penggajian</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Bulan Penggajian</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {INDONESIAN_MONTHS.map((mName, i) => (
                    <option key={i + 1} value={i + 1}>
                      Bulan {i + 1} - {mName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Tahun Penggajian</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Kategori Filter Data */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>2. Kategori Filter Tambahan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Departemen</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="All">Semua Departemen ({departments.length})</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Status Pembayaran</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="All">Semua Status (Draft, Approved, Paid)</option>
                  <option value="Paid">Lunas / Paid</option>
                  <option value="Approved">Approved / Disetujui</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Skema Pajak PPh 21</label>
                <select
                  value={selectedTaxScheme}
                  onChange={(e) => setSelectedTaxScheme(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="All">Semua Skema Pajak</option>
                  <option value="Ditanggung Perusahaan">Ditanggung Perusahaan (Nett/Gross Up)</option>
                  <option value="Ditanggung Karyawan">Ditanggung Karyawan (Gross)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Pilihan Lembar Kerja (Worksheet) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>3. Lembar Kerja (Sheet) yang Disertakan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div className="leading-tight">
                  <span className="font-bold text-slate-800 block text-xs">Rincian Payroll</span>
                  <span className="text-[10px] text-slate-400">Data lengkap per karyawan</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeDeptRecap}
                  onChange={(e) => setIncludeDeptRecap(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div className="leading-tight">
                  <span className="font-bold text-slate-800 block text-xs">Rekap Departemen</span>
                  <span className="text-[10px] text-slate-400">Total biaya per divisi</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeBankTransfer}
                  onChange={(e) => setIncludeBankTransfer(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div className="leading-tight">
                  <span className="font-bold text-slate-800 block text-xs">Transfer Bank</span>
                  <span className="text-[10px] text-slate-400">Format disbursement bank</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Live Data Summary Preview */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                Preview Data Siap Ekspor
              </span>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xl font-black text-emerald-950">
                  {filteredRecords.length}
                </span>
                <span className="text-xs font-bold text-emerald-800">
                  Data Karyawan ({INDONESIAN_MONTHS[selectedMonth - 1]} {selectedYear})
                </span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Total Gaji Bersih (THP): <strong className="font-bold text-emerald-950">{formatMoney(totalTHP)}</strong> | PPh 21: <strong className="font-bold text-emerald-950">{formatMoney(totalPPh21)}</strong>
              </p>
            </div>

            {filteredRecords.length === 0 && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-xl border border-amber-300">
                ⚠️ Belum ada data di periode ini
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 font-medium">
            Format: Microsoft Excel Workbook (*.xlsx)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isExporting || filteredRecords.length === 0}
              onClick={handleExport}
              className={`px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                filteredRecords.length === 0 || isExporting
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 active:scale-95'
              }`}
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses Ekspor...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Unduh File Excel (.xlsx)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
