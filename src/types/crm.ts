export type ContactType = 'Customer' | 'Prospect' | 'Vendor' | 'Supplier' | 'Partner' | 'Employee';
export type ContactStatus = 'Active' | 'Inactive';

export interface Company {
  id?: string | number;
  name: string;
  companyType?: string; // e.g. PT, CV, Corporate, SME
  industry?: string;
  address?: string;
  city?: string;
  website?: string;
  source?: string;
  owner?: string; // Sales Owner UID/Name/Email
  isCustomer?: boolean;
  assignedTo?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id?: string | number;
  companyId?: string | number;
  company: string;
  name: string;
  position?: string;
  phone: string;
  whatsApp?: string;
  email: string;
  type: ContactType;
  status: ContactStatus;
  tags?: string;
  notes?: string;
  assignedTo?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeadSource = 'Website' | 'Referral' | 'Social Media' | 'Email Campaign' | 'Event' | 'Cold Call' | 'Other';

export interface Lead {
  id?: string | number;
  companyId?: string | number;
  contactId?: string | number;
  leadName?: string;
  name: string; // Contact/PIC Name or Lead Name
  email: string;
  phone: string;
  company: string;
  requirement?: string;
  productService?: string;
  estimatedValue?: number;
  source: LeadSource;
  stage: string; // NEW | CONTACTED | QUALIFIED | NEED ANALYSIS | MEETING / SURVEY | PROPOSAL REQUIRED | CONVERTED | LOST
  score?: number;
  priority?: 'Low' | 'Medium' | 'High';
  notes?: string;
  assignedTo?: string;
  createdBy?: string;
  expectedClosingDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id?: string | number;
  dealNumber?: string;
  title: string;
  companyId?: string | number;
  contactId?: string | number;
  leadId?: string | number;
  company: string;
  contactName?: string;
  productService?: string;
  value: number;
  stage: string; // QUALIFICATION | SURVEY / MEETING | PROPOSAL | NEGOTIATION | APPROVAL | PO / SPK | WON | LOST
  probability: number; // 0 - 100
  expectedClose?: string;
  lostReason?: string;
  wonDate?: string;
  notes?: string;
  assignedTo?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export type QuotationStatus = 'DRAFT' | 'SENT' | 'REVISED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface Quotation {
  id?: string | number;
  quotationNumber: string;
  dealId?: string | number;
  companyId?: string | number;
  contactId?: string | number;
  companyName: string;
  picName: string;
  picEmail?: string;
  picPhone?: string;
  address?: string;
  productService?: string;
  salesOwner?: string;
  date: string;
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  termsAndConditions?: string;
  status: QuotationStatus;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'Todo' | 'In Progress' | 'Completed' | 'Cancelled';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id?: string | number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignedTo?: string;
  createdBy?: string;
  relatedType?: 'contact' | 'lead' | 'deal' | 'company' | 'quotation';
  relatedId?: string | number;
  companyId?: string | number;
  contactId?: string | number;
  leadId?: string | number;
  dealId?: string | number;
  reminder?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'Call' | 'WhatsApp' | 'Email' | 'Meeting' | 'Survey' | 'Visit' | 'Note' | 'Proposal Sent' | 'Follow Up' | 'Lead Created' | 'Quotation Created' | 'Quotation Sent' | 'Deal Won' | 'Deal Lost' | 'Status Changed';

export interface Activity {
  id?: string | number;
  type: 'contact' | 'lead' | 'deal' | 'task' | 'hris' | 'system' | 'quotation' | 'company';
  activityType?: ActivityType;
  description: string;
  entityType?: string;
  entityId?: string | number;
  companyId?: string | number;
  contactId?: string | number;
  leadId?: string | number;
  dealId?: string | number;
  quotationId?: string | number;
  createdBy?: string;
  createdByName?: string;
  timestamp: string;
  nextFollowUpDate?: string;
  nextFollowUpTask?: string;
}

export interface PipelineStage {
  id?: string | number;
  module: 'leads' | 'deals';
  stageName: string;
  order: number;
  color: string;
}

export interface AppSetting {
  id?: string;
  key: string;
  value: string;
}

export interface CompanyProfile {
  companyName: string;
  legalName: string;
  logoUrl?: string;
  address: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string; // NPWP Perusahaan / Badan Usaha
  signatoryName: string; // Nama Pejabat Penandatangan Dokumen
  signatoryTitle: string; // Jabatan Penandatangan (e.g. HR & Payroll Manager)
  currency: string;
}

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  companyName: 'ErmApps Enterprise HRIS',
  legalName: 'PT ErmApps Digital Nusantara',
  logoUrl: '',
  address: 'Gedung Cyber 2 Tower Lt. 18, Jl. H.R. Rasuna Said Kav. X-5',
  city: 'Jakarta Selatan, DKI Jakarta 12950',
  phone: '+62 21 5088 9900',
  email: 'contact@ermapps.co.id',
  website: 'www.ermapps.co.id',
  taxId: '01.234.567.8-012.000',
  signatoryName: 'Nabila Putri, S.Psi',
  signatoryTitle: 'HR & Payroll Operations Manager',
  currency: 'IDR'
};

// --- Multi-User & Invitation Auth Types ---
export type UserRole = 'Owner' | 'Super Admin' | 'Admin' | 'Manager' | 'Staff';
export type UserStatus = 'Active' | 'Suspended';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  employeeCode?: string;
  invitedBy?: string;
  joinedAt: string;
  managerId?: string;
  managerName?: string;
  managerEmail?: string;
}

export type InvitationStatus = 'Pending' | 'Used' | 'Expired';

export interface Invitation {
  id?: string;
  code: string;
  email?: string;
  role: UserRole;
  status: InvitationStatus;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  usedBy?: string;
  usedAt?: string;
  managerId?: string;
  managerName?: string;
  managerEmail?: string;
}

// --- HRIS Types ---
export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship';
export type EmployeeStatus = 'Active' | 'On Leave' | 'Resigned' | 'Terminated';
export type PTKPStatus = 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3' | 'K/0' | 'K/1' | 'K/2' | 'K/3';

export interface Employee {
  id?: string | number;
  employeeCode: string; // e.g. EMP-001 / NIK Karyawan
  nik?: string; // No. KTP 16 digit
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  joinDate: string; // YYYY-MM-DD
  gender?: 'Laki-laki' | 'Perempuan';
  birthPlace?: string;
  birthDate?: string;
  maritalStatus?: 'Single (TK)' | 'Menikah (K)' | 'Cerai';
  taxStatus?: PTKPStatus;
  address?: string;
  domicileAddress?: string;
  religion?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  managerId?: string;
  managerName?: string;
  workLocation?: string;
  education?: string;

  // Payroll & Allowance Config (Komponen Penggajian Karyawan Lengkap)
  baseSalary: number; // Gaji Pokok
  transportAllowance?: number; // Tunjangan Transportasi
  mealAllowance?: number; // Tunjangan Uang Makan
  positionAllowance?: number; // Tunjangan Jabatan / Fungsional
  communicationAllowance?: number; // Tunjangan Pulsa / Komunikasi
  otherAllowances?: number; // Tunjangan Lainnya
  allowance?: number; // Legacy/Total Tunjangan Tetap

  // BPJS & Pajak Config
  bpjsKesehatanActive?: boolean;
  bpjsKetenagakerjaanActive?: boolean;
  pph21PaidBy?: 'Karyawan' | 'Perusahaan'; // 'Karyawan' (Ditanggung Karyawan / Gross) vs 'Perusahaan' (Ditanggung Perusahaan / Nett / Gross-Up)
  pph21Scheme?: 'Gross' | 'GrossUp' | 'Nett' | 'Ditanggung Karyawan (Gross)' | 'Ditanggung Perusahaan (Nett / Gross Up)';

  // Bank & Identifiers
  bankName?: string;
  bankAccount?: string;
  bankAccountHolder?: string;
  taxId?: string; // NPWP (15/16 digit)
  bpjsKetenagakerjaan?: string;
  bpjsKesehatan?: string;
  avatarUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Cuti' | 'Alpha';
export type WorkLocation = 'WFO (Office)' | 'WFH (Home)' | 'Client Site' | 'Dinas Luar';

export interface Attendance {
  id?: string | number;
  employeeId: string | number;
  employeeName?: string;
  employeeCode?: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:mm
  checkOut?: string; // HH:mm
  status: AttendanceStatus;
  hoursWorked: number;
  overtimeHours: number;
  workLocation: WorkLocation;
  photoSimulated?: string;
  photoUrl?: string;
  checkInPhoto?: string;
  checkOutPhoto?: string;
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
  geotag?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeaveType = 'Cuti Tahunan' | 'Sakit' | 'Izin Menikah' | 'Melahirkan' | 'Cuti Penting' | 'Lainnya';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id?: string | number;
  employeeId: string | number;
  employeeName?: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  createdAt: string;
}

export type PayrollStatus = 'Draft' | 'Approved' | 'Paid';

export interface Payroll {
  id?: string | number;
  payrollCode: string; // e.g. PAY-202608-001
  month: number; // 1-12
  year: number; // 2026
  periodName: string; // e.g. "Agustus 2026"
  employeeId: string | number;
  employeeName: string;
  employeeCode?: string;
  department: string;
  position: string;

  // Detail Income / Penerimaan Gaji
  baseSalary: number;
  transportAllowance?: number;
  mealAllowance?: number;
  positionAllowance?: number;
  communicationAllowance?: number;
  otherAllowances?: number;
  allowances: number; // Total Tunjangan Tetap
  overtimePay: number;
  bonus: number;
  grossSalary?: number; // Total Penerimaan Kotor

  // Detail BPJS Pekerja (Potongan Gaji Employee)
  bpjsKesehatanEmployee?: number; // 1%
  bpjsJHTEmployee?: number; // 2%
  bpjsJPEmployee?: number; // 1%
  bpjsAmount: number; // Total Potongan BPJS Pekerja

  // Detail BPJS Perusahaan (Tanggungan Employer)
  bpjsKesehatanEmployer?: number; // 4%
  bpjsJKKEmployer?: number; // 0.24%
  bpjsJKMEmployer?: number; // 0.3%
  bpjsJHTEmployer?: number; // 3.7%
  bpjsJPEmployer?: number; // 2%
  totalBPJSEmployer?: number;

  // Detail PPh 21 (Pajak Penghasilan Karyawan TER PP 58/2023 & PMK 168)
  taxStatus?: string; // e.g. TK/0, K/1
  terCategory?: 'TER A' | 'TER B' | 'TER C';
  terRatePercent?: number; // e.g. 1.25 for 1.25%
  pph21Method?: string; // e.g. 'TER (PP 58/2023)' | 'Pasal 17'
  pph21PaidBy?: 'Karyawan' | 'Perusahaan'; // Ditanggung Perusahaan vs Ditanggung Karyawan
  pph21PaidByEmployer?: number; // Nilai PPh 21 yang ditanggung oleh perusahaan
  pph21EmployeeDeduction?: number; // Nilai PPh 21 yang memotong gaji karyawan (0 jika ditanggung perusahaan)
  pph21Allowance?: number; // Tunjangan PPh 21 dari perusahaan
  hasNPWP?: boolean;
  npwpSurchargeApplied?: boolean; // 120% penalty if no NPWP
  taxableGross?: number;
  biayaJabatan?: number;
  annualizedNet?: number;
  ptkpAmount?: number;
  pkpAmount?: number;
  annualPPh21?: number;
  pph21Amount?: number; // Total PPh 21 Terutang Sebulan

  // Detail Potongan Absensi & Lainnya
  unpaidLeaveDeduction?: number; // Potongan Mangkir
  lateDeduction?: number; // Potongan Keterlambatan
  otherDeductions?: number;
  deductions: number; // Potongan Lainnya / Mangkir

  totalDeductionsAll?: number; // Total Seluruh Potongan (BPJS + PPh21 Karyawan + Absensi + Lainnya)
  netSalary: number; // Gaji Bersih / Take Home Pay (THP)
  employerTotalCost?: number; // Total Pengeluaran Perusahaan (Gaji Bruto + BPJS Perusahaan + PPh 21 jika Ditanggung Perusahaan)
  paymentStatus: PayrollStatus;
  paymentDate?: string;
  paymentMethod?: 'Bank Transfer' | 'Cash';
  bankName?: string;
  bankAccount?: string;
  bankAccountHolder?: string;
  notes?: string;
  createdAt: string;
}

export type HRISTab = 'overview' | 'employees' | 'attendance' | 'leave' | 'payroll' | 'reports';

export type PayrollRecord = Payroll;

export type ActiveView = 'landing' | 'dashboard' | 'companies' | 'contacts' | 'leads' | 'deals' | 'quotations' | 'customers' | 'tasks' | 'analytics' | 'pipeline' | 'settings' | 'hris';

