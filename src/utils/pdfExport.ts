import { jsPDF } from 'jspdf';
import { Payroll, CompanyProfile, DEFAULT_COMPANY_PROFILE } from '../types/crm';
import { formatTerbilangRupiah } from './terbilang';

/**
 * Format currency number to Indonesian Rupiah string (e.g. Rp 15.000.000)
 */
function formatIDR(amount: number): string {
  return 'Rp ' + (amount || 0).toLocaleString('id-ID');
}

/**
 * Generate and download a formatted PDF payslip for an individual employee payroll record.
 */
export function exportPayslipPDF(payroll: Payroll, profile?: CompanyProfile): jsPDF {
  const companyProfile = profile || DEFAULT_COMPANY_PROFILE;

  // Create A4 PDF Document (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  let currentY = 14;

  // ---------------------------------------------------------------------------
  // 1. TOP HEADER & COMPANY BRANDING / LOGO
  // ---------------------------------------------------------------------------

  let logoDrawn = false;
  if (companyProfile.logoUrl && companyProfile.logoUrl.startsWith('data:image')) {
    try {
      const format = companyProfile.logoUrl.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(companyProfile.logoUrl, format, margin, currentY, 14, 14, undefined, 'FAST');
      logoDrawn = true;
    } catch (err) {
      console.warn('Could not add uploaded logo image to PDF:', err);
    }
  }

  if (!logoDrawn) {
    // Modern Vector Logo: Rounded rectangle badge with initial
    doc.setFillColor(30, 64, 175); // Blue 700 (#1E40AF)
    doc.roundedRect(margin, currentY, 13, 13, 3, 3, 'F');

    // Initial character inside the box
    const initialChar = (companyProfile.companyName || 'E').trim().charAt(0).toUpperCase();
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(initialChar, margin + 4.2, currentY + 9.5);
  }

  // Company Name & Subtitle
  const compBrandName = companyProfile.companyName || 'ErmApps Enterprise HRIS';
  const compLegalName = (companyProfile.legalName || 'PT ERMAPPS DIGITAL NUSANTARA').toUpperCase();
  const addressLine1 = [companyProfile.address, companyProfile.city].filter(Boolean).join(', ') || 'Gedung Cyber 2 Tower Lt. 18, Jakarta';
  const contactLine = [
    companyProfile.phone ? `Tel: ${companyProfile.phone}` : '',
    companyProfile.website || 'www.ermapps.co.id'
  ].filter(Boolean).join(' | ');

  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(compBrandName, margin + 17, currentY + 5);

  doc.setTextColor(71, 85, 105); // Slate 600
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(compLegalName, margin + 17, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFontSize(6.5);
  doc.text(`${addressLine1} • ${contactLine}`, margin + 17, currentY + 13);

  // Right Header: Payslip Title & Payroll Reference Badge
  const rightX = pageWidth - margin;
  doc.setTextColor(30, 64, 175); // Blue 700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('SLIP GAJI RESMI', rightX, currentY + 4, { align: 'right' });

  // Badge for Payroll Code
  const codeText = payroll.payrollCode || `PAY-${payroll.month || '00'}${payroll.year || '26'}`;
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.roundedRect(rightX - 32, currentY + 5.5, 32, 5, 1, 1, 'FD');

  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(codeText, rightX - 16, currentY + 9, { align: 'center' });

  // Period text
  const periodStr = (payroll.periodName || `${payroll.month || ''}/${payroll.year || ''}`).toUpperCase();
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(`PERIODE: ${periodStr}`, rightX, currentY + 14, { align: 'right' });

  currentY += 17;

  // Header dividing line
  doc.setDrawColor(15, 23, 42); // Slate 900
  doc.setLineWidth(0.75);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 4;

  // ---------------------------------------------------------------------------
  // 2. EMPLOYEE INFORMATION GRID (Structured Information Card)
  // ---------------------------------------------------------------------------
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 27, 2, 2, 'FD');

  const col1X = margin + 4;
  const col2X = margin + 50;
  const col3X = margin + 98;
  const col4X = margin + 142;

  // Determine PPh 21 Scheme text
  const isBorneByEmployer =
    payroll.pph21PaidBy === 'Perusahaan' ||
    (payroll.pph21EmployeeDeduction === 0 && (payroll.pph21Amount || 0) > 0);
  const pphSchemeText = isBorneByEmployer
    ? 'Ditanggung Perusahaan (Nett)'
    : 'Ditanggung Karyawan (Gross)';

  // Row 1
  let infoY = currentY + 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('NAMA KARYAWAN', col1X, infoY);
  doc.text('NIK / ID KARYAWAN', col2X, infoY);
  doc.text('DEPARTEMEN / DIVISI', col3X, infoY);
  doc.text('JABATAN', col4X, infoY);

  infoY += 3.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(payroll.employeeName || '-', col1X, infoY);
  doc.text(payroll.employeeCode || '-', col2X, infoY);
  doc.text(payroll.department || 'Operasional', col3X, infoY);
  doc.text(payroll.position || 'Staff', col4X, infoY);

  // Row 2
  infoY += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('STATUS PTKP & TER PAJAK', col1X, infoY);
  doc.text('SKEMA PPh 21 PASAL 21', col2X, infoY);
  doc.text('STATUS NPWP & METODE', col3X, infoY);
  doc.text('REKENING PEMBAYARAN', col4X, infoY);

  infoY += 3.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(67, 56, 202); // Indigo 700
  const terInfo = `${payroll.taxStatus || 'TK/0'} (${payroll.terCategory || 'TER A'} - ${payroll.terRatePercent ?? 0}%)`;
  doc.text(terInfo, col1X, infoY);

  // PPh Scheme colored
  if (isBorneByEmployer) {
    doc.setTextColor(6, 95, 70); // Emerald 800
    doc.text(pphSchemeText, col2X, infoY);
  } else {
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(pphSchemeText, col2X, infoY);
  }

  // NPWP
  doc.setTextColor(30, 41, 59);
  const npwpText = payroll.hasNPWP !== false ? 'NPWP Valid (TER Reguler)' : 'Non-NPWP (+20% Surcharge)';
  doc.text(npwpText, col3X, infoY);

  // Bank
  doc.text(`${payroll.bankName || 'BCA'} - ${payroll.bankAccount || '-'}`, col4X, infoY);

  currentY += 31;

  // ---------------------------------------------------------------------------
  // 3. BREAKDOWN TABLES: EARNINGS (PENERIMAAN) vs DEDUCTIONS (POTONGAN)
  // ---------------------------------------------------------------------------
  const halfColWidth = (contentWidth - 4) / 2; // 89mm each
  const earningsX = margin;
  const deductionsX = margin + halfColWidth + 4;

  const tableHeight = 76;

  // --- 3A. EARNINGS BOX (LEFT) ---
  doc.setFillColor(240, 253, 244); // Emerald 50
  doc.setDrawColor(167, 243, 208); // Emerald 200
  doc.setLineWidth(0.3);
  doc.roundedRect(earningsX, currentY, halfColWidth, tableHeight, 2, 2, 'FD');

  // Earnings Table Header Banner
  doc.setFillColor(5, 150, 105); // Emerald 600
  doc.roundedRect(earningsX, currentY, halfColWidth, 6.5, 2, 2, 'F');
  // Overwrite bottom corners for header
  doc.rect(earningsX, currentY + 3.5, halfColWidth, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('1. PENERIMAAN (EARNINGS)', earningsX + 3.5, currentY + 4.5);
  doc.text('JUMLAH (IDR)', earningsX + halfColWidth - 3.5, currentY + 4.5, { align: 'right' });

  // Earnings Rows
  let earnY = currentY + 11;
  const earningsItems: Array<{ label: string; amount: number; isBold?: boolean }> = [
    { label: 'Gaji Pokok (Base Salary)', amount: payroll.baseSalary, isBold: true },
    { label: 'Tunjangan Transportasi', amount: payroll.transportAllowance || 0 },
    { label: 'Tunjangan Uang Makan', amount: payroll.mealAllowance || 0 },
    { label: 'Tunjangan Jabatan', amount: payroll.positionAllowance || 0 },
    { label: 'Tunjangan Komunikasi / Pulsa', amount: payroll.communicationAllowance || 0 },
    ...(payroll.otherAllowances ? [{ label: 'Tunjangan Lainnya', amount: payroll.otherAllowances }] : []),
    { label: 'Upah Lembur (Overtime)', amount: payroll.overtimePay || 0 },
    { label: 'Bonus / Insentif / THR', amount: payroll.bonus || 0 }
  ];

  earningsItems.forEach((item) => {
    doc.setFont('helvetica', item.isBold ? 'bold' : 'normal');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(item.label, earningsX + 3.5, earnY);

    doc.setFont('helvetica', item.isBold ? 'bold' : 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(formatIDR(item.amount), earningsX + halfColWidth - 3.5, earnY, { align: 'right' });

    // Subtle divider
    doc.setDrawColor(220, 252, 231);
    doc.setLineWidth(0.15);
    doc.line(earningsX + 3.5, earnY + 1.5, earningsX + halfColWidth - 3.5, earnY + 1.5);

    earnY += 5.8;
  });

  // Total Gross Earnings (Bottom of box)
  const grossTotal = payroll.grossSalary || (payroll.baseSalary + payroll.allowances + payroll.overtimePay + payroll.bonus);
  doc.setFillColor(220, 252, 231); // Emerald 100
  doc.roundedRect(earningsX + 1.5, currentY + tableHeight - 7.5, halfColWidth - 3, 6, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(6, 95, 70); // Emerald 800
  doc.text('TOTAL PENERIMAAN KOTOR:', earningsX + 3.5, currentY + tableHeight - 3.5);
  doc.text(formatIDR(grossTotal), earningsX + halfColWidth - 3.5, currentY + tableHeight - 3.5, { align: 'right' });

  // --- 3B. DEDUCTIONS BOX (RIGHT) ---
  doc.setFillColor(255, 241, 242); // Rose 50
  doc.setDrawColor(254, 205, 211); // Rose 200
  doc.setLineWidth(0.3);
  doc.roundedRect(deductionsX, currentY, halfColWidth, tableHeight, 2, 2, 'FD');

  // Deductions Header Banner
  doc.setFillColor(225, 29, 72); // Rose 600
  doc.roundedRect(deductionsX, currentY, halfColWidth, 6.5, 2, 2, 'F');
  doc.rect(deductionsX, currentY + 3.5, halfColWidth, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('2. POTONGAN (DEDUCTIONS)', deductionsX + 3.5, currentY + 4.5);
  doc.text('JUMLAH (IDR)', deductionsX + halfColWidth - 3.5, currentY + 4.5, { align: 'right' });

  // Deductions Rows
  let dedY = currentY + 11;

  const bpjsKesEmp = payroll.bpjsKesehatanEmployee || Math.round((payroll.bpjsAmount || 0) * 0.25);
  const bpjsJhtEmp = payroll.bpjsJHTEmployee || Math.round((payroll.bpjsAmount || 0) * 0.5);
  const bpjsJpEmp = payroll.bpjsJPEmployee || Math.round((payroll.bpjsAmount || 0) * 0.25);

  const pph21DeductionVal = isBorneByEmployer
    ? 0
    : (payroll.pph21EmployeeDeduction !== undefined ? payroll.pph21EmployeeDeduction : (payroll.pph21Amount || 0));

  const pph21SubsidyVal = payroll.pph21PaidByEmployer || (isBorneByEmployer ? payroll.pph21Amount : 0) || 0;

  const deductionItems: Array<{ label: string; amountText: string; subText?: string; isSpecial?: boolean }> = [
    { label: 'BPJS Kesehatan (1% Pekerja)', amountText: `-${formatIDR(bpjsKesEmp)}` },
    { label: 'BPJS TK - JHT (2% Pekerja)', amountText: `-${formatIDR(bpjsJhtEmp)}` },
    { label: 'BPJS TK - JP (1% Pekerja)', amountText: `-${formatIDR(bpjsJpEmp)}` },
    {
      label: isBorneByEmployer ? 'PPh 21 (Ditanggung Perusahaan)' : 'Pajak PPh 21 TER (PMK 168)',
      amountText: isBorneByEmployer ? 'Rp 0 (Subsidized)' : `-${formatIDR(pph21DeductionVal)}`,
      subText: isBorneByEmployer ? `*Disubsidi Penuh: ${formatIDR(pph21SubsidyVal)}` : undefined,
      isSpecial: isBorneByEmployer
    },
    { label: 'Potongan Mangkir (Alpha)', amountText: `-${formatIDR(payroll.unpaidLeaveDeduction || 0)}` },
    { label: 'Potongan Keterlambatan', amountText: `-${formatIDR(payroll.lateDeduction || 0)}` },
    ...(payroll.otherDeductions ? [{ label: 'Potongan Lainnya (Kasbon)', amountText: `-${formatIDR(payroll.otherDeductions)}` }] : [])
  ];

  deductionItems.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(item.label, deductionsX + 3.5, dedY);

    if (item.isSpecial) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105); // Green for Rp 0 subsidized
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(190, 18, 60); // Rose 700
    }
    doc.text(item.amountText, deductionsX + halfColWidth - 3.5, dedY, { align: 'right' });

    if (item.subText) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(5, 150, 105);
      doc.text(item.subText, deductionsX + 3.5, dedY + 2.5);
    }

    doc.setDrawColor(254, 226, 226);
    doc.setLineWidth(0.15);
    doc.line(deductionsX + 3.5, dedY + 3.5, deductionsX + halfColWidth - 3.5, dedY + 3.5);

    dedY += 5.8;
  });

  // Total Deductions
  const totalDedAll = payroll.totalDeductionsAll || (payroll.bpjsAmount + pph21DeductionVal + (payroll.deductions || 0));
  doc.setFillColor(254, 226, 226); // Rose 100
  doc.roundedRect(deductionsX + 1.5, currentY + tableHeight - 7.5, halfColWidth - 3, 6, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(159, 18, 57); // Rose 800
  doc.text('TOTAL SELURUH POTONGAN:', deductionsX + 3.5, currentY + tableHeight - 3.5);
  doc.text(`-${formatIDR(totalDedAll)}`, deductionsX + halfColWidth - 3.5, currentY + tableHeight - 3.5, { align: 'right' });

  currentY += tableHeight + 4;

  // ---------------------------------------------------------------------------
  // 4. EMPLOYER CONTRIBUTIONS (TANGGUNGAN PERUSAHAAN) INFORMATIVE BOX
  // ---------------------------------------------------------------------------
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.25);
  doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text('3. KONTRIBUSI & TANGGUNGAN PERUSAHAAN (EMPLOYER CONTRIBUTIONS):', margin + 3.5, currentY + 4);

  const employerTotal = payroll.employerTotalCost || (grossTotal + (payroll.totalBPJSEmployer || 0) + pph21SubsidyVal);
  doc.setTextColor(30, 64, 175);
  doc.text(`TOTAL BEBAN PENGGAJIAN PERUSAHAAN: ${formatIDR(employerTotal)}`, pageWidth - margin - 3.5, currentY + 4, { align: 'right' });

  // 3 Columns inside the contribution box
  const bpjsEmployerTotal = payroll.totalBPJSEmployer || Math.round(payroll.baseSalary * 0.1024);
  const contY = currentY + 9;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`• BPJS Perusahaan (Health 4% + TK 10.24%): ${formatIDR(bpjsEmployerTotal)}`, margin + 3.5, contY);
  doc.text(`• Subsidi Pajak PPh 21 TER: ${formatIDR(pph21SubsidyVal)}`, margin + 82, contY);
  doc.text(`• Metode Pajak: ${payroll.pph21Method || 'TER PP 58/2023 & PMK 168'}`, margin + 130, contY);

  currentY += 17;

  // ---------------------------------------------------------------------------
  // 5. TAKE HOME PAY (NET SALARY) HIGHLIGHTED BLOCK
  // ---------------------------------------------------------------------------
  doc.setFillColor(30, 58, 138); // Blue 900 (#1E3A8A)
  doc.roundedRect(margin, currentY, contentWidth, 19, 2.5, 2.5, 'F');

  doc.setTextColor(191, 219, 254); // Blue 200
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('GAJI BERSIH DITERIMA (TAKE HOME PAY)', margin + 4, currentY + 5.5);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(formatIDR(payroll.netSalary), margin + 4, currentY + 12);

  // Status & Bank Right-aligned
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - margin - 32, currentY + 3.5, 28, 5, 1, 1, 'F');
  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text(`STATUS: ${(payroll.paymentStatus || 'PAID').toUpperCase()}`, pageWidth - margin - 18, currentY + 7, { align: 'center' });

  doc.setTextColor(219, 234, 254);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`Transfer via ${payroll.bankName || 'BCA'} • A/C ${payroll.bankAccount || '-'}`, pageWidth - margin - 4, currentY + 13.5, { align: 'right' });

  // Terbilang Spelled-out words line
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(224, 231, 255);
  const terbilangText = `# Terbilang: ${formatTerbilangRupiah(payroll.netSalary)} #`;
  doc.text(terbilangText, margin + 4, currentY + 16.5);

  currentY += 23;

  // ---------------------------------------------------------------------------
  // 6. SIGNATURES & VERIFICATION
  // ---------------------------------------------------------------------------
  const sigBoxWidth = (contentWidth - 20) / 2; // 81mm
  const sigY = currentY;

  // Receiver Signature (Karyawan)
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Penerima Karyawan,', margin + 10, sigY + 3);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin + 10, sigY + 22, margin + 10 + sigBoxWidth - 20, sigY + 22);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.text((payroll.employeeName || 'Karyawan').toUpperCase(), margin + 10, sigY + 25.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`NIK: ${payroll.employeeCode || '-'}`, margin + 10, sigY + 29);

  // Authorized HR / Finance Signatory
  const hrSigX = pageWidth - margin - sigBoxWidth + 5;
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Disetujui HR & Finance Admin,', hrSigX, sigY + 3);

  // Digital verification stamp badge
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  doc.roundedRect(hrSigX + 40, sigY - 1, 22, 10, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(5, 150, 105);
  doc.text('VERIFIED DIGITAL', hrSigX + 51, sigY + 3, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('SYSTEM GENERATED', hrSigX + 51, sigY + 6.5, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(hrSigX, sigY + 22, hrSigX + sigBoxWidth - 20, sigY + 22);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  const signName = (companyProfile.signatoryName || 'NABILA PUTRI, S.PSI').toUpperCase();
  const signTitle = companyProfile.signatoryTitle || 'HR & Payroll Operations Manager';
  doc.text(signName, hrSigX, sigY + 25.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${signTitle} • ${companyProfile.legalName || 'PT ErmApps Digital Nusantara'}`, hrSigX, sigY + 29);

  // ---------------------------------------------------------------------------
  // 7. FOOTER NOTE & AUDIT TRAIL
  // ---------------------------------------------------------------------------
  const footerY = 286;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.25);
  doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Catatan: Dokumen ini diterbitkan secara sah dan otomatis oleh ${companyProfile.companyName || 'ErmApps Enterprise HRIS'}. Disimpan secara terenkripsi sesuai ketentuan hukum ketenagakerjaan RI.`,
    margin,
    footerY + 2
  );

  const printTimeStr = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Audit Trail: ${payroll.payrollCode || 'PAY'} • ${printTimeStr} WIB`, pageWidth - margin, footerY + 2, {
    align: 'right'
  });

  return doc;
}

/**
 * Trigger immediate download of the payslip as a PDF file
 */
export function downloadPayslipPDF(payroll: Payroll, companyProfile?: CompanyProfile): void {
  const doc = exportPayslipPDF(payroll, companyProfile);
  const cleanEmpName = (payroll.employeeName || 'Karyawan').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanPeriod = (payroll.periodName || `${payroll.month || 1}_${payroll.year || 2026}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Slip_Gaji_${cleanEmpName}_${cleanPeriod}.pdf`;
  doc.save(fileName);
}
