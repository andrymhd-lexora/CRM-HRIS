import * as XLSX from 'xlsx';
import { Payroll, Employee, CompanyProfile, DEFAULT_COMPANY_PROFILE } from '../types/crm';

export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

export interface PayrollExcelExportOptions {
  payrolls: Payroll[];
  employees?: Employee[];
  month: number;
  year: number;
  departmentFilter?: string; // 'All' or specific dept
  statusFilter?: string; // 'All' | 'Paid' | 'Approved' | 'Draft'
  taxSchemeFilter?: string; // 'All' | 'Ditanggung Perusahaan' | 'Ditanggung Karyawan'
  companyProfile?: CompanyProfile;
  includeSummarySheet?: boolean;
  includeDeptRecap?: boolean;
  includeBankDisbursement?: boolean;
}

/**
 * Helper to format numbers safely
 */
function num(val: any): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

/**
 * Generate and download an Excel (.xlsx) file containing comprehensive payroll data
 */
export function exportPayrollToExcel(options: PayrollExcelExportOptions) {
  const {
    payrolls,
    employees = [],
    month,
    year,
    departmentFilter = 'All',
    statusFilter = 'All',
    taxSchemeFilter = 'All',
    companyProfile = DEFAULT_COMPANY_PROFILE,
    includeSummarySheet = true,
    includeDeptRecap = true,
    includeBankDisbursement = true
  } = options;

  const monthName = INDONESIAN_MONTHS[month - 1] || `Bulan ${month}`;
  const periodLabel = `${monthName} ${year}`;
  const printDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Filter payroll records according to criteria
  const filteredPayrolls = payrolls.filter((p) => {
    // Month and Year check
    if (p.month !== month || p.year !== year) return false;

    // Department check
    if (departmentFilter !== 'All' && p.department !== departmentFilter) {
      return false;
    }

    // Status check
    if (statusFilter !== 'All' && p.paymentStatus !== statusFilter) {
      return false;
    }

    // Tax scheme check
    if (taxSchemeFilter !== 'All') {
      const isEmployerBorne =
        p.pph21PaidBy === 'Perusahaan' ||
        (p.pph21EmployeeDeduction === 0 && (p.pph21Amount || 0) > 0);
      if (taxSchemeFilter === 'Ditanggung Perusahaan' && !isEmployerBorne) {
        return false;
      }
      if (taxSchemeFilter === 'Ditanggung Karyawan' && isEmployerBorne) {
        return false;
      }
    }

    return true;
  });

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // -------------------------------------------------------------------------
  // SHEET 1: DATA RINCIAN PAYROLL (DETAIL)
  // -------------------------------------------------------------------------
  if (includeSummarySheet) {
    const sheetData: any[][] = [];

    // Header metadata
    sheetData.push([companyProfile.legalName || companyProfile.companyName || 'PERUSAHAAN']);
    sheetData.push(['LAPORAN PENGGAJIAN KARYAWAN & PPh 21 TER (PMK 168 / PP 58/2023)']);
    sheetData.push([`Periode: ${periodLabel}`]);
    sheetData.push([`Kategori Filter: Departemen [${departmentFilter}], Status [${statusFilter}], Skema Pajak [${taxSchemeFilter}]`]);
    sheetData.push([`Tanggal Export: ${printDate} | Total Karyawan: ${filteredPayrolls.length} orang`]);
    sheetData.push([]); // blank row

    // Table Column Headers
    const headers = [
      'No',
      'Kode Payroll',
      'NIK Karyawan',
      'Nama Karyawan',
      'Departemen',
      'Jabatan',
      'Status PTKP',
      'Kategori TER',
      'Tarif TER (%)',
      'Skema Pajak PPh 21',
      'Gaji Pokok (Rp)',
      'Tunjangan Transport (Rp)',
      'Tunjangan Makan (Rp)',
      'Tunjangan Jabatan (Rp)',
      'Tunjangan Komunikasi (Rp)',
      'Tunjangan Lainnya (Rp)',
      'Total Tunjangan (Rp)',
      'Lembur (Rp)',
      'Bonus / Insentif (Rp)',
      'Gaji Bruto (Rp)',
      'BPJS Kesehatan Karyawan (1%) (Rp)',
      'BPJS Ketenagakerjaan Karyawan (JHT 2% + JP 1%) (Rp)',
      'Total BPJS Karyawan (Rp)',
      'PPh 21 TER Terutang (Rp)',
      'PPh 21 Ditanggung Perusahaan (Rp)',
      'PPh 21 Potong Karyawan (Rp)',
      'Potongan Mangkir/Absensi (Rp)',
      'Potongan Lainnya (Rp)',
      'Total Seluruh Potongan (Rp)',
      'Gaji Bersih / THP (Rp)',
      'BPJS Ditanggung Perusahaan (Rp)',
      'Total Beban Perusahaan / CTC (Rp)',
      'Status Pembayaran',
      'Metode',
      'Nama Bank',
      'Nomor Rekening',
      'Atas Nama Rekening',
      'Catatan'
    ];
    sheetData.push(headers);

    // Running totals
    let totBaseSalary = 0;
    let totTransport = 0;
    let totMeal = 0;
    let totPosition = 0;
    let totComm = 0;
    let totOtherAllow = 0;
    let totAllowances = 0;
    let totOvertime = 0;
    let totBonus = 0;
    let totGross = 0;
    let totBpjsKesEmp = 0;
    let totBpjsTkEmp = 0;
    let totBpjsEmp = 0;
    let totPph21 = 0;
    let totPph21Employer = 0;
    let totPph21EmpDeduct = 0;
    let totUnpaidDeduct = 0;
    let totOtherDeduct = 0;
    let totDeductionsAll = 0;
    let totNetSalary = 0;
    let totBpjsEmployer = 0;
    let totEmployerCost = 0;

    // Populate data rows
    filteredPayrolls.forEach((p, idx) => {
      // Find matching employee for any missing bank or profile fields
      const emp = employees.find(
        (e) => String(e.id) === String(p.employeeId) || (p.employeeCode && e.employeeCode === p.employeeCode)
      );

      const baseSalary = num(p.baseSalary);
      const transport = num(p.transportAllowance);
      const meal = num(p.mealAllowance);
      const position = num(p.positionAllowance);
      const comm = num(p.communicationAllowance);
      const otherAllow = num(p.otherAllowances);
      const allowances = num(p.allowances) || (transport + meal + position + comm + otherAllow);
      const overtime = num(p.overtimePay);
      const bonus = num(p.bonus);
      const gross = num(p.grossSalary) || (baseSalary + allowances + overtime + bonus);

      const bpjsKesEmp = num(p.bpjsKesehatanEmployee) || Math.round(baseSalary * 0.01);
      const bpjsTkEmp = (num(p.bpjsJHTEmployee) || Math.round(baseSalary * 0.02)) + (num(p.bpjsJPEmployee) || Math.round(baseSalary * 0.01));
      const bpjsEmp = num(p.bpjsAmount) || (bpjsKesEmp + bpjsTkEmp);

      const pph21Amount = num(p.pph21Amount);
      const isEmployerBorne =
        p.pph21PaidBy === 'Perusahaan' ||
        (p.pph21EmployeeDeduction === 0 && pph21Amount > 0);

      const pph21Employer = num(p.pph21PaidByEmployer) !== 0 ? num(p.pph21PaidByEmployer) : (isEmployerBorne ? pph21Amount : 0);
      const pph21EmpDeduct = num(p.pph21EmployeeDeduction) !== 0 ? num(p.pph21EmployeeDeduction) : (isEmployerBorne ? 0 : pph21Amount);

      const unpaidDeduct = num(p.unpaidLeaveDeduction);
      const otherDeduct = num(p.otherDeductions) || num(p.deductions);
      const totalDeductions = num(p.totalDeductionsAll) || (bpjsEmp + pph21EmpDeduct + unpaidDeduct + otherDeduct);

      const netSalary = num(p.netSalary) || (gross - totalDeductions);
      const bpjsEmployer = num(p.totalBPJSEmployer) || Math.round(baseSalary * 0.1024);
      const employerCost = num(p.employerTotalCost) || (gross + bpjsEmployer + pph21Employer);

      const bankName = p.bankName || emp?.bankName || '-';
      const bankAccount = p.bankAccount || emp?.bankAccount || '-';
      const bankHolder = p.bankAccountHolder || emp?.bankAccountHolder || p.employeeName;

      // Accumulate
      totBaseSalary += baseSalary;
      totTransport += transport;
      totMeal += meal;
      totPosition += position;
      totComm += comm;
      totOtherAllow += otherAllow;
      totAllowances += allowances;
      totOvertime += overtime;
      totBonus += bonus;
      totGross += gross;
      totBpjsKesEmp += bpjsKesEmp;
      totBpjsTkEmp += bpjsTkEmp;
      totBpjsEmp += bpjsEmp;
      totPph21 += pph21Amount;
      totPph21Employer += pph21Employer;
      totPph21EmpDeduct += pph21EmpDeduct;
      totUnpaidDeduct += unpaidDeduct;
      totOtherDeduct += otherDeduct;
      totDeductionsAll += totalDeductions;
      totNetSalary += netSalary;
      totBpjsEmployer += bpjsEmployer;
      totEmployerCost += employerCost;

      sheetData.push([
        idx + 1,
        p.payrollCode,
        p.employeeCode || emp?.employeeCode || `EMP-${p.employeeId}`,
        p.employeeName,
        p.department,
        p.position,
        p.taxStatus || emp?.taxStatus || 'TK/0',
        p.terCategory || 'TER A',
        p.terRatePercent ? Number(p.terRatePercent) : 0,
        isEmployerBorne ? 'Ditanggung Perusahaan (Nett/Gross Up)' : 'Ditanggung Karyawan (Gross)',
        baseSalary,
        transport,
        meal,
        position,
        comm,
        otherAllow,
        allowances,
        overtime,
        bonus,
        gross,
        bpjsKesEmp,
        bpjsTkEmp,
        bpjsEmp,
        pph21Amount,
        pph21Employer,
        pph21EmpDeduct,
        unpaidDeduct,
        otherDeduct,
        totalDeductions,
        netSalary,
        bpjsEmployer,
        employerCost,
        p.paymentStatus,
        p.paymentMethod || 'Bank Transfer',
        bankName,
        bankAccount,
        bankHolder,
        p.notes || ''
      ]);
    });

    // Total summary row
    sheetData.push([
      'TOTAL',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      totBaseSalary,
      totTransport,
      totMeal,
      totPosition,
      totComm,
      totOtherAllow,
      totAllowances,
      totOvertime,
      totBonus,
      totGross,
      totBpjsKesEmp,
      totBpjsTkEmp,
      totBpjsEmp,
      totPph21,
      totPph21Employer,
      totPph21EmpDeduct,
      totUnpaidDeduct,
      totOtherDeduct,
      totDeductionsAll,
      totNetSalary,
      totBpjsEmployer,
      totEmployerCost,
      '',
      '',
      '',
      '',
      '',
      ''
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Auto-fit column widths
    worksheet['!cols'] = [
      { wch: 6 }, // No
      { wch: 18 }, // Kode Payroll
      { wch: 14 }, // NIK
      { wch: 24 }, // Nama
      { wch: 18 }, // Departemen
      { wch: 20 }, // Jabatan
      { wch: 12 }, // PTKP
      { wch: 14 }, // TER Cat
      { wch: 14 }, // TER Rate
      { wch: 32 }, // Skema
      { wch: 16 }, // Gaji Pokok
      { wch: 16 }, // Transport
      { wch: 16 }, // Makan
      { wch: 16 }, // Jabatan
      { wch: 16 }, // Komunikasi
      { wch: 16 }, // Lainnya
      { wch: 18 }, // Total Tunjangan
      { wch: 14 }, // Lembur
      { wch: 14 }, // Bonus
      { wch: 18 }, // Bruto
      { wch: 18 }, // BPJS Kes
      { wch: 20 }, // BPJS TK
      { wch: 18 }, // Total BPJS
      { wch: 18 }, // PPh 21 Terutang
      { wch: 22 }, // PPh 21 Ditanggung Perusahaan
      { wch: 20 }, // PPh 21 Potong Karyawan
      { wch: 16 }, // Potongan Absensi
      { wch: 16 }, // Potongan Lainnya
      { wch: 20 }, // Total Potongan
      { wch: 20 }, // Net Salary
      { wch: 22 }, // BPJS Perusahaan
      { wch: 22 }, // Total Beban Perusahaan
      { wch: 16 }, // Status
      { wch: 14 }, // Metode
      { wch: 16 }, // Bank
      { wch: 20 }, // No Rek
      { wch: 24 }, // Atas Nama
      { wch: 24 } // Catatan
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rincian Payroll');
  }

  // -------------------------------------------------------------------------
  // SHEET 2: REKAPITULASI DEPARTEMEN
  // -------------------------------------------------------------------------
  if (includeDeptRecap) {
    const deptMap = new Map<string, Payroll[]>();
    filteredPayrolls.forEach((p) => {
      const dept = p.department || 'Umum';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, []);
      }
      deptMap.get(dept)!.push(p);
    });

    const deptSheetData: any[][] = [];
    deptSheetData.push([companyProfile.legalName || companyProfile.companyName || 'PERUSAHAAN']);
    deptSheetData.push([`REKAPITULASI BIAYA PENGGAJIAN PER DEPARTEMEN — ${periodLabel.toUpperCase()}`]);
    deptSheetData.push([`Tanggal Export: ${printDate}`]);
    deptSheetData.push([]);

    const deptHeaders = [
      'No',
      'Departemen',
      'Jumlah Karyawan',
      'Total Gaji Pokok (Rp)',
      'Total Tunjangan (Rp)',
      'Total Lembur & Bonus (Rp)',
      'Total Gaji Bruto (Rp)',
      'Total BPJS Karyawan (Rp)',
      'PPh 21 Dipotong Karyawan (Rp)',
      'PPh 21 Ditanggung Perusahaan (Rp)',
      'Total Seluruh Potongan (Rp)',
      'Total Gaji Bersih / THP (Rp)',
      'Total BPJS Perusahaan (Rp)',
      'Total Beban Perusahaan / CTC (Rp)'
    ];
    deptSheetData.push(deptHeaders);

    let sumEmps = 0;
    let sumBase = 0;
    let sumAllow = 0;
    let sumOverBonus = 0;
    let sumGross = 0;
    let sumBpjsEmp = 0;
    let sumPphEmp = 0;
    let sumPphCompany = 0;
    let sumDeduct = 0;
    let sumNet = 0;
    let sumBpjsCompany = 0;
    let sumCtc = 0;

    let rowNum = 1;
    deptMap.forEach((records, deptName) => {
      const count = records.length;
      const base = records.reduce((s, r) => s + num(r.baseSalary), 0);
      const allow = records.reduce((s, r) => s + (num(r.allowances) || (num(r.transportAllowance) + num(r.mealAllowance) + num(r.positionAllowance) + num(r.communicationAllowance) + num(r.otherAllowances))), 0);
      const overBonus = records.reduce((s, r) => s + num(r.overtimePay) + num(r.bonus), 0);
      const gross = records.reduce((s, r) => s + (num(r.grossSalary) || (num(r.baseSalary) + allow + overBonus)), 0);
      const bpjsEmp = records.reduce((s, r) => s + num(r.bpjsAmount), 0);
      const pphEmp = records.reduce((s, r) => {
        const isEmployer = r.pph21PaidBy === 'Perusahaan' || (r.pph21EmployeeDeduction === 0 && (r.pph21Amount || 0) > 0);
        return s + (num(r.pph21EmployeeDeduction) !== 0 ? num(r.pph21EmployeeDeduction) : (isEmployer ? 0 : num(r.pph21Amount)));
      }, 0);
      const pphCompany = records.reduce((s, r) => {
        const isEmployer = r.pph21PaidBy === 'Perusahaan' || (r.pph21EmployeeDeduction === 0 && (r.pph21Amount || 0) > 0);
        return s + (num(r.pph21PaidByEmployer) !== 0 ? num(r.pph21PaidByEmployer) : (isEmployer ? num(r.pph21Amount) : 0));
      }, 0);
      const deduct = records.reduce((s, r) => s + (num(r.totalDeductionsAll) || (num(r.bpjsAmount) + (r.pph21PaidBy === 'Perusahaan' ? 0 : num(r.pph21Amount)) + num(r.deductions))), 0);
      const net = records.reduce((s, r) => s + num(r.netSalary), 0);
      const bpjsCompany = records.reduce((s, r) => s + (num(r.totalBPJSEmployer) || Math.round(num(r.baseSalary) * 0.1024)), 0);
      const ctc = records.reduce((s, r) => s + (num(r.employerTotalCost) || (gross + bpjsCompany + pphCompany)), 0);

      sumEmps += count;
      sumBase += base;
      sumAllow += allow;
      sumOverBonus += overBonus;
      sumGross += gross;
      sumBpjsEmp += bpjsEmp;
      sumPphEmp += pphEmp;
      sumPphCompany += pphCompany;
      sumDeduct += deduct;
      sumNet += net;
      sumBpjsCompany += bpjsCompany;
      sumCtc += ctc;

      deptSheetData.push([
        rowNum++,
        deptName,
        count,
        base,
        allow,
        overBonus,
        gross,
        bpjsEmp,
        pphEmp,
        pphCompany,
        deduct,
        net,
        bpjsCompany,
        ctc
      ]);
    });

    // Total row
    deptSheetData.push([
      'TOTAL',
      'SEMUA DEPARTEMEN',
      sumEmps,
      sumBase,
      sumAllow,
      sumOverBonus,
      sumGross,
      sumBpjsEmp,
      sumPphEmp,
      sumPphCompany,
      sumDeduct,
      sumNet,
      sumBpjsCompany,
      sumCtc
    ]);

    const deptWorksheet = XLSX.utils.aoa_to_sheet(deptSheetData);
    deptWorksheet['!cols'] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 20 },
      { wch: 22 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 22 }
    ];

    XLSX.utils.book_append_sheet(workbook, deptWorksheet, 'Rekap Departemen');
  }

  // -------------------------------------------------------------------------
  // SHEET 3: FORMAT DISBURSEMENT / TRANSFER BANK
  // -------------------------------------------------------------------------
  if (includeBankDisbursement) {
    const bankSheetData: any[][] = [];
    bankSheetData.push([companyProfile.legalName || companyProfile.companyName || 'PERUSAHAAN']);
    bankSheetData.push([`DAFTAR TRANSFER GAJI KARYAWAN (DISBURSEMENT BANK) — ${periodLabel.toUpperCase()}`]);
    bankSheetData.push([`Tanggal Export: ${printDate} | Total Transaksi: ${filteredPayrolls.length} penerima`]);
    bankSheetData.push([]);

    const bankHeaders = [
      'No',
      'NIK Karyawan',
      'Nama Penerima',
      'Departemen',
      'Bank Tujuan',
      'Nomor Rekening',
      'Atas Nama Rekening',
      'Nominal Transfer / THP (Rp)',
      'Status Pembayaran',
      'Berita Transfer / Keterangan'
    ];
    bankSheetData.push(bankHeaders);

    let totTransfer = 0;

    filteredPayrolls.forEach((p, idx) => {
      const emp = employees.find(
        (e) => String(e.id) === String(p.employeeId) || (p.employeeCode && e.employeeCode === p.employeeCode)
      );

      const netSalary = num(p.netSalary);
      totTransfer += netSalary;

      const bankName = p.bankName || emp?.bankName || 'BCA';
      const bankAccount = p.bankAccount || emp?.bankAccount || '-';
      const bankHolder = p.bankAccountHolder || emp?.bankAccountHolder || p.employeeName;
      const remark = `Gaji ${periodLabel} - ${p.employeeName} (${p.employeeCode || emp?.employeeCode || ''})`;

      bankSheetData.push([
        idx + 1,
        p.employeeCode || emp?.employeeCode || `EMP-${p.employeeId}`,
        p.employeeName,
        p.department,
        bankName,
        bankAccount,
        bankHolder,
        netSalary,
        p.paymentStatus,
        remark
      ]);
    });

    bankSheetData.push([
      'TOTAL',
      '',
      '',
      '',
      '',
      '',
      '',
      totTransfer,
      '',
      ''
    ]);

    const bankWorksheet = XLSX.utils.aoa_to_sheet(bankSheetData);
    bankWorksheet['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 25 },
      { wch: 18 },
      { wch: 16 },
      { wch: 22 },
      { wch: 25 },
      { wch: 20 },
      { wch: 16 },
      { wch: 38 }
    ];

    XLSX.utils.book_append_sheet(workbook, bankWorksheet, 'Format Transfer Bank');
  }

  // Generate file name & trigger download
  const cleanCompanyName = (companyProfile.companyName || 'HRIS')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 20);
  const fileName = `Laporan_Payroll_${cleanCompanyName}_${monthName}_${year}.xlsx`;

  XLSX.writeFile(workbook, fileName);

  return {
    fileName,
    totalRecords: filteredPayrolls.length,
    period: periodLabel
  };
}
