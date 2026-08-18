import Dexie, { Table } from 'dexie';
import {
  Contact,
  Lead,
  Deal,
  Task,
  Activity,
  PipelineStage,
  AppSetting,
  Employee,
  Attendance,
  LeaveRequest,
  Payroll
} from '../types/crm';

export const DEF_LEAD_STAGES = [
  'New Lead',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost'
];

export const DEF_DEAL_STAGES = [
  'Prospecting',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost'
];

export const STAGE_COLORS = [
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#16A34A', // Green
  '#EF4444'  // Red
];

class CRMDatabase extends Dexie {
  contacts!: Table<Contact, number>;
  leads!: Table<Lead, number>;
  deals!: Table<Deal, number>;
  tasks!: Table<Task, number>;
  activities!: Table<Activity, number>;
  pipelineStages!: Table<PipelineStage, number>;
  settings!: Table<AppSetting, string>;
  // HRIS Tables
  employees!: Table<Employee, number>;
  attendances!: Table<Attendance, number>;
  leaveRequests!: Table<LeaveRequest, number>;
  payrolls!: Table<Payroll, number>;

  constructor() {
    super('ErmAppsCRMDB');
    this.version(1).stores({
      contacts: '++id, name, email, phone, company, type, status, tags, createdAt',
      leads: '++id, name, email, phone, company, source, stage, score, contactId, createdAt',
      deals: '++id, title, company, value, stage, probability, expectedClose, contactId, leadId, createdAt',
      tasks: '++id, title, status, priority, dueDate, assignedTo, relatedType, relatedId, createdAt',
      activities: '++id, type, description, entityType, entityId, timestamp',
      pipelineStages: '++id, module, stageName, order, color',
      settings: 'key',
      employees: '++id, employeeCode, name, email, department, position, status, joinDate, createdAt',
      attendances: '++id, employeeId, date, status, checkIn, checkOut, workLocation, createdAt',
      leaveRequests: '++id, employeeId, leaveType, status, startDate, endDate, createdAt',
      payrolls: '++id, payrollCode, month, year, employeeId, department, paymentStatus, createdAt'
    });

    this.version(2).stores({
      contacts: '++id, name, email, phone, company, type, status, tags, createdAt',
      leads: '++id, name, email, phone, company, source, stage, score, contactId, createdAt',
      deals: '++id, title, company, value, stage, probability, expectedClose, contactId, leadId, createdAt',
      tasks: '++id, title, status, priority, dueDate, assignedTo, relatedType, relatedId, createdAt',
      activities: '++id, type, description, entityType, entityId, timestamp',
      pipelineStages: '++id, module, stageName, order, color',
      settings: 'key',
      employees: '++id, employeeCode, name, email, department, position, status, joinDate, createdAt',
      attendances: '++id, employeeId, date, status, checkIn, checkOut, workLocation, createdAt',
      leaveRequests: '++id, employeeId, leaveType, status, startDate, endDate, createdAt',
      payrolls: '++id, payrollCode, month, year, employeeId, department, paymentStatus, createdAt'
    });
  }
}

export const db = new CRMDatabase();

export async function initDatabase() {
  await db.open();

  // Check pipeline stages
  const psCount = await db.pipelineStages.count();
  if (psCount === 0) {
    for (let i = 0; i < DEF_LEAD_STAGES.length; i++) {
      await db.pipelineStages.add({
        module: 'leads',
        stageName: DEF_LEAD_STAGES[i],
        order: i,
        color: STAGE_COLORS[i % STAGE_COLORS.length]
      });
    }
    for (let i = 0; i < DEF_DEAL_STAGES.length; i++) {
      await db.pipelineStages.add({
        module: 'deals',
        stageName: DEF_DEAL_STAGES[i],
        order: i,
        color: STAGE_COLORS[i % STAGE_COLORS.length]
      });
    }
  }

  // Check default settings
  const companyName = await db.settings.get('companyName');
  if (!companyName) {
    await db.settings.put({ key: 'companyName', value: 'ERM Enterprise' });
  }
  const currency = await db.settings.get('currency');
  if (!currency) {
    await db.settings.put({ key: 'currency', value: 'IDR' });
  }

  // Seed sample data automatically if DB is empty
  const empCount = await db.employees.count();
  if (empCount === 0) {
    await seedSampleData();
  }
}

export async function logActivity(
  type: Activity['type'],
  description: string,
  entityType?: string,
  entityId?: string | number
) {
  try {
    await db.activities.add({
      type,
      description,
      entityType: entityType || '',
      entityId: entityId ? String(entityId) : '',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to log activity', err);
  }
}

export async function seedSampleData() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  const dateAgoStr = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const daysAhead = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // --- Clear existing tables if seeding anew ---
  await db.contacts.clear();
  await db.leads.clear();
  await db.deals.clear();
  await db.tasks.clear();
  await db.employees.clear();
  await db.attendances.clear();
  await db.leaveRequests.clear();
  await db.payrolls.clear();

  // Seed Contacts
  const c1 = await db.contacts.add({
    name: 'Budi Santoso',
    email: 'budi.santoso@techindo.co.id',
    phone: '+6281234567890',
    company: 'PT Techindo Solution',
    type: 'Customer',
    status: 'Active',
    tags: 'vip, enterprise, jakarta',
    notes: 'CTO Techindo. Tertarik upgrade paket tahunan.',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(2)
  });

  const c2 = await db.contacts.add({
    name: 'Siti Nurhaliza',
    email: 'siti@nusantaradigital.com',
    phone: '+6281987654321',
    company: 'Nusantara Digital',
    type: 'Prospect',
    status: 'Active',
    tags: 'lead, e-commerce',
    notes: 'Founding Manager. Butuh CRM integrasi WhatsApp.',
    createdAt: daysAgo(8),
    updatedAt: daysAgo(1)
  });

  const c3 = await db.contacts.add({
    name: 'Michael Chen',
    email: 'm.chen@asiapacific.sg',
    phone: '+6591234567',
    company: 'Asia Pacific Logistics',
    type: 'Customer',
    status: 'Active',
    tags: 'regional, sg',
    notes: 'Key decision maker for regional logistics team.',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(5)
  });

  const c4 = await db.contacts.add({
    name: 'Dewi Anggraini',
    email: 'dewi@kreatifstudio.id',
    phone: '+6285678901234',
    company: 'Kreatif Studio Indonesia',
    type: 'Vendor',
    status: 'Active',
    tags: 'design, partner',
    notes: 'Partner penyedia aset desain branding.',
    createdAt: daysAgo(20),
    updatedAt: daysAgo(10)
  });

  // Seed Leads
  await db.leads.add({
    name: 'Rian Pratama',
    email: 'rian@InovasiBaru.com',
    phone: '+6287811223344',
    company: 'PT Inovasi Baru',
    source: 'Website',
    stage: 'Qualified',
    score: 85,
    notes: 'Inquiry dari form landing page. Butuh 25 user seat.',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1)
  });

  await db.leads.add({
    name: 'Amanda Wijaya',
    email: 'amanda@globalretail.co.id',
    phone: '+6281399887766',
    company: 'Global Retail Corp',
    source: 'Referral',
    stage: 'Proposal Sent',
    score: 92,
    notes: 'Rekomendasi dari Budi Santoso Techindo.',
    contactId: c1,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1)
  });

  await db.leads.add({
    name: 'Hendra Gunawan',
    email: 'hendra@fintechutama.com',
    phone: '+6281122334455',
    company: 'Fintech Utama',
    source: 'Social Media',
    stage: 'Contacted',
    score: 60,
    notes: 'Inbound message dari LinkedIn campaign.',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1)
  });

  // Seed Deals
  await db.deals.add({
    title: 'Enterprise CRM License - PT Techindo',
    company: 'PT Techindo Solution',
    value: 450000000,
    stage: 'Negotiation',
    probability: 80,
    expectedClose: daysAhead(10),
    contactId: c1,
    notes: 'Diskon 10% disetujui untuk kontrak 2 tahun.',
    createdAt: daysAgo(14),
    updatedAt: daysAgo(1)
  });

  await db.deals.add({
    title: 'Omnichannel CRM Deployment - Nusantara Digital',
    company: 'Nusantara Digital',
    value: 280000000,
    stage: 'Proposal',
    probability: 60,
    expectedClose: daysAhead(20),
    contactId: c2,
    notes: 'Draft proposal dikirim. Menunggu meeting direksi.',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(2)
  });

  await db.deals.add({
    title: 'Regional Logistics System - Asia Pacific',
    company: 'Asia Pacific Logistics',
    value: 950000000,
    stage: 'Closed Won',
    probability: 100,
    expectedClose: daysAgo(2).split('T')[0],
    contactId: c3,
    notes: 'Kontrak resmi ditandatangani Rp 950.000.000.',
    createdAt: daysAgo(25),
    updatedAt: daysAgo(2)
  });

  // Seed Tasks
  await db.tasks.add({
    title: 'Follow up proposal dengan Amanda Wijaya',
    status: 'Todo',
    priority: 'High',
    dueDate: daysAhead(1),
    assignedTo: 'Tim Sales',
    relatedType: 'lead',
    notes: 'Pastikan diskon khusus untuk referral dicantumkan.',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2)
  });

  await db.tasks.add({
    title: 'Kirim draf kontrak final ke Budi Santoso',
    status: 'In Progress',
    priority: 'High',
    dueDate: daysAhead(0),
    assignedTo: 'Legal & Sales',
    relatedType: 'deal',
    notes: 'Sertakan lampiran SLA & support 24/7.',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1)
  });

  // ==========================================
  // --- SEED HRIS DATA ---
  // ==========================================

  // 1. Employees (Karyawan)
  const e1 = await db.employees.add({
    employeeCode: 'EMP-001',
    name: 'Aditya Pratama',
    email: 'aditya.pratama@ermapps.co.id',
    phone: '+6281299001122',
    department: 'Engineering',
    position: 'Lead Software Engineer',
    employmentType: 'Full-Time',
    status: 'Active',
    joinDate: '2023-03-15',
    baseSalary: 18500000,
    allowance: 2500000,
    bankName: 'BCA',
    bankAccount: '8830192831',
    taxId: '81.992.123.4-015.000',
    bpjsKetenagakerjaan: '00012399881',
    bpjsKesehatan: '00012399882',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    notes: 'Senior Developer penanggung jawab modul backend & IndexedDB.',
    createdAt: daysAgo(300),
    updatedAt: daysAgo(10)
  });

  const e2 = await db.employees.add({
    employeeCode: 'EMP-002',
    name: 'Nabila Putri',
    email: 'nabila.putri@ermapps.co.id',
    phone: '+6281388776655',
    department: 'HR & Finance',
    position: 'HR Manager & Generalist',
    employmentType: 'Full-Time',
    status: 'Active',
    joinDate: '2023-08-01',
    baseSalary: 13500000,
    allowance: 2000000,
    bankName: 'Mandiri',
    bankAccount: '127000982312',
    taxId: '72.102.345.6-012.000',
    bpjsKetenagakerjaan: '00022399881',
    bpjsKesehatan: '00022399882',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    notes: 'Penanggung jawab operasional HR, rekrutmen & payroll.',
    createdAt: daysAgo(250),
    updatedAt: daysAgo(5)
  });

  const e3 = await db.employees.add({
    employeeCode: 'EMP-003',
    name: 'Rizky Ramadhan',
    email: 'rizky.ramadhan@ermapps.co.id',
    phone: '+6281766554433',
    department: 'Sales & Marketing',
    position: 'Senior Sales Account Manager',
    employmentType: 'Full-Time',
    status: 'Active',
    joinDate: '2022-11-10',
    baseSalary: 15000000,
    allowance: 3000000,
    bankName: 'BCA',
    bankAccount: '5271928310',
    taxId: '65.112.987.1-018.000',
    bpjsKetenagakerjaan: '00032399881',
    bpjsKesehatan: '00032399882',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    notes: 'Top performer sales enterprise CRM.',
    createdAt: daysAgo(400),
    updatedAt: daysAgo(2)
  });

  const e4 = await db.employees.add({
    employeeCode: 'EMP-004',
    name: 'Dian Sastro',
    email: 'dian.sastro@ermapps.co.id',
    phone: '+6285211223344',
    department: 'Product Design',
    position: 'Senior UI/UX Designer',
    employmentType: 'Full-Time',
    status: 'Active',
    joinDate: '2024-01-20',
    baseSalary: 12500000,
    allowance: 1800000,
    bankName: 'BSI',
    bankAccount: '7192039128',
    taxId: '91.823.102.9-011.000',
    bpjsKetenagakerjaan: '00042399881',
    bpjsKesehatan: '00042399882',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    notes: 'Perancang antarmuka UI/UX platform SaaS.',
    createdAt: daysAgo(180),
    updatedAt: daysAgo(1)
  });

  const e5 = await db.employees.add({
    employeeCode: 'EMP-005',
    name: 'Fajar Nugraha',
    email: 'fajar.nugraha@ermapps.co.id',
    phone: '+6281900112233',
    department: 'Operations',
    position: 'Operations Executive',
    employmentType: 'Full-Time',
    status: 'Active',
    joinDate: '2024-04-12',
    baseSalary: 9500000,
    allowance: 1200000,
    bankName: 'BNI',
    bankAccount: '0481928312',
    taxId: '54.102.981.2-014.000',
    bpjsKetenagakerjaan: '00052399881',
    bpjsKesehatan: '00052399882',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    notes: 'Manajemen fasilitas, lisensi, dan logistik kantor.',
    createdAt: daysAgo(100),
    updatedAt: daysAgo(3)
  });

  const e6 = await db.employees.add({
    employeeCode: 'EMP-006',
    name: 'Maya Indah',
    email: 'maya.indah@ermapps.co.id',
    phone: '+6282133445566',
    department: 'Customer Support',
    position: 'Support Specialist',
    employmentType: 'Contract',
    status: 'Active',
    joinDate: '2025-02-01',
    baseSalary: 7800000,
    allowance: 1000000,
    bankName: 'BCA',
    bankAccount: '3192019283',
    taxId: '43.109.821.0-019.000',
    bpjsKetenagakerjaan: '00062399881',
    bpjsKesehatan: '00062399882',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    notes: 'Customer support shift pagi & helpdesk ticketing.',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(2)
  });

  // 2. Attendance Data (Absensi)
  // Current Day Attendance Records
  await db.attendances.add({
    employeeId: e1,
    employeeName: 'Aditya Pratama',
    employeeCode: 'EMP-001',
    date: todayStr,
    checkIn: '08:45',
    checkOut: '17:30',
    status: 'Hadir',
    hoursWorked: 8.75,
    overtimeHours: 1.5,
    workLocation: 'WFO (Office)',
    notes: 'Hadir tepat waktu. Lembur deployment server.',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0)
  });

  await db.attendances.add({
    employeeId: e2,
    employeeName: 'Nabila Putri',
    employeeCode: 'EMP-002',
    date: todayStr,
    checkIn: '08:55',
    checkOut: '17:05',
    status: 'Hadir',
    hoursWorked: 8.16,
    overtimeHours: 0,
    workLocation: 'WFO (Office)',
    notes: 'Proses penggajian bulanan.',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0)
  });

  await db.attendances.add({
    employeeId: e3,
    employeeName: 'Rizky Ramadhan',
    employeeCode: 'EMP-003',
    date: todayStr,
    checkIn: '09:15',
    checkOut: '18:00',
    status: 'Terlambat',
    hoursWorked: 8.75,
    overtimeHours: 1.0,
    workLocation: 'Client Site',
    notes: 'Client meeting di PT Techindo jam 09:00.',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0)
  });

  await db.attendances.add({
    employeeId: e4,
    employeeName: 'Dian Sastro',
    employeeCode: 'EMP-004',
    date: todayStr,
    checkIn: '08:50',
    checkOut: '17:00',
    status: 'Hadir',
    hoursWorked: 8.16,
    overtimeHours: 0,
    workLocation: 'WFH (Home)',
    notes: 'Working from home — SPRINT UI Design.',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0)
  });

  await db.attendances.add({
    employeeId: e5,
    employeeName: 'Fajar Nugraha',
    employeeCode: 'EMP-005',
    date: todayStr,
    checkIn: '08:30',
    checkOut: '17:15',
    status: 'Hadir',
    hoursWorked: 8.75,
    overtimeHours: 0.5,
    workLocation: 'WFO (Office)',
    notes: 'Menyiapkan ruang rapat direksi.',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0)
  });

  await db.attendances.add({
    employeeId: e6,
    employeeName: 'Maya Indah',
    employeeCode: 'EMP-006',
    date: todayStr,
    checkIn: '-',
    checkOut: '-',
    status: 'Izin',
    hoursWorked: 0,
    overtimeHours: 0,
    workLocation: 'WFO (Office)',
    notes: 'Izin keperluan keluarga mendesak.',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0)
  });

  // Recent days attendance
  for (let d = 1; d <= 5; d++) {
    const pastDate = dateAgoStr(d);
    await db.attendances.add({
      employeeId: e1,
      employeeName: 'Aditya Pratama',
      employeeCode: 'EMP-001',
      date: pastDate,
      checkIn: '08:50',
      checkOut: '17:45',
      status: 'Hadir',
      hoursWorked: 8.9,
      overtimeHours: 1.0,
      workLocation: 'WFO (Office)',
      createdAt: daysAgo(d),
      updatedAt: daysAgo(d)
    });
    await db.attendances.add({
      employeeId: e2,
      employeeName: 'Nabila Putri',
      employeeCode: 'EMP-002',
      date: pastDate,
      checkIn: '08:55',
      checkOut: '17:00',
      status: 'Hadir',
      hoursWorked: 8.08,
      overtimeHours: 0,
      workLocation: 'WFO (Office)',
      createdAt: daysAgo(d),
      updatedAt: daysAgo(d)
    });
  }

  // 3. Leave Requests (Pengajuan Cuti)
  await db.leaveRequests.add({
    employeeId: e6,
    employeeName: 'Maya Indah',
    leaveType: 'Izin Menikah',
    startDate: daysAhead(5),
    endDate: daysAhead(8),
    totalDays: 3,
    reason: 'Izin menghadiri pernikahan saudara di Bandung.',
    status: 'Pending',
    createdAt: daysAgo(1)
  });

  await db.leaveRequests.add({
    employeeId: e4,
    employeeName: 'Dian Sastro',
    leaveType: 'Cuti Tahunan',
    startDate: dateAgoStr(10),
    endDate: dateAgoStr(8),
    totalDays: 3,
    reason: 'Cuti tahunan liburan keluarga.',
    status: 'Approved',
    approvedBy: 'Nabila Putri (HR)',
    createdAt: daysAgo(15)
  });

  await db.leaveRequests.add({
    employeeId: e3,
    employeeName: 'Rizky Ramadhan',
    leaveType: 'Sakit',
    startDate: dateAgoStr(15),
    endDate: dateAgoStr(14),
    totalDays: 2,
    reason: 'Demam tinggi & flu (Surat dokter dilampirkan).',
    status: 'Approved',
    approvedBy: 'Nabila Putri (HR)',
    createdAt: daysAgo(16)
  });

  // 4. Payroll Records (Slip Gaji & Laporan Payroll TER PMK 168/2023)
  await db.payrolls.add({
    payrollCode: 'PAY-202608-001',
    month: 8,
    year: 2026,
    periodName: 'Agustus 2026',
    employeeId: e1,
    employeeName: 'Aditya Pratama',
    employeeCode: 'EMP-001',
    department: 'Engineering',
    position: 'Lead Software Engineer',
    baseSalary: 18500000,
    transportAllowance: 1000000,
    mealAllowance: 1000000,
    positionAllowance: 1500000,
    communicationAllowance: 500000,
    allowances: 4000000,
    overtimePay: 1250000,
    bonus: 1000000,
    grossSalary: 24750000,
    bpjsKesehatanEmployee: 120000,
    bpjsJHTEmployee: 370000,
    bpjsJPEmployee: 105474,
    bpjsAmount: 595474,
    bpjsKesehatanEmployer: 480000,
    bpjsJKKEmployer: 37000,
    bpjsJKMEmployer: 46250,
    bpjsJHTEmployer: 684500,
    bpjsJPEmployer: 210948,
    totalBPJSEmployer: 1458698,
    taxStatus: 'K/1',
    terCategory: 'TER B',
    terRatePercent: 9.0,
    pph21Method: 'TER (PMK 168/2023)',
    hasNPWP: true,
    npwpSurchargeApplied: false,
    pph21Amount: 2274412,
    deductions: 250000,
    totalDeductionsAll: 3119886,
    netSalary: 21630114,
    paymentStatus: 'Paid',
    paymentDate: todayStr,
    paymentMethod: 'Bank Transfer',
    bankName: 'BCA',
    bankAccount: '8830192831',
    bankAccountHolder: 'Aditya Pratama',
    notes: 'Transfer via BCA. Sertakan bonus rilis fitur HRIS.',
    createdAt: daysAgo(1)
  });

  await db.payrolls.add({
    payrollCode: 'PAY-202608-002',
    month: 8,
    year: 2026,
    periodName: 'Agustus 2026',
    employeeId: e2,
    employeeName: 'Nabila Putri',
    employeeCode: 'EMP-002',
    department: 'HR & Finance',
    position: 'HR Manager & Generalist',
    baseSalary: 13500000,
    transportAllowance: 800000,
    mealAllowance: 700000,
    positionAllowance: 1000000,
    allowances: 2500000,
    overtimePay: 500000,
    bonus: 500000,
    grossSalary: 17000000,
    bpjsKesehatanEmployee: 120000,
    bpjsJHTEmployee: 270000,
    bpjsJPEmployee: 105474,
    bpjsAmount: 495474,
    bpjsKesehatanEmployer: 480000,
    bpjsJKKEmployer: 27000,
    bpjsJKMEmployer: 33750,
    bpjsJHTEmployer: 499500,
    bpjsJPEmployer: 210948,
    totalBPJSEmployer: 1251198,
    taxStatus: 'TK/0',
    terCategory: 'TER A',
    terRatePercent: 8.0,
    pph21Method: 'TER (PMK 168/2023)',
    hasNPWP: true,
    npwpSurchargeApplied: false,
    pph21Amount: 1403276,
    deductions: 150000,
    totalDeductionsAll: 2048750,
    netSalary: 14951250,
    paymentStatus: 'Paid',
    paymentDate: todayStr,
    paymentMethod: 'Bank Transfer',
    bankName: 'Bank Mandiri',
    bankAccount: '12700098231',
    bankAccountHolder: 'Nabila Putri',
    notes: 'Transfer via Mandiri.',
    createdAt: daysAgo(1)
  });

  await db.payrolls.add({
    payrollCode: 'PAY-202608-003',
    month: 8,
    year: 2026,
    periodName: 'Agustus 2026',
    employeeId: e3,
    employeeName: 'Rizky Ramadhan',
    employeeCode: 'EMP-003',
    department: 'Sales & Marketing',
    position: 'Senior Sales Account Manager',
    baseSalary: 15000000,
    transportAllowance: 1000000,
    mealAllowance: 1000000,
    positionAllowance: 1000000,
    allowances: 3000000,
    overtimePay: 800000,
    bonus: 3500000, // Insentif deal won
    grossSalary: 22300000,
    bpjsKesehatanEmployee: 120000,
    bpjsJHTEmployee: 300000,
    bpjsJPEmployee: 105474,
    bpjsAmount: 525474,
    taxStatus: 'TK/1',
    terCategory: 'TER A',
    terRatePercent: 9.0,
    pph21Method: 'TER (PMK 168/2023)',
    hasNPWP: true,
    npwpSurchargeApplied: false,
    pph21Amount: 2011822,
    deductions: 200000,
    totalDeductionsAll: 2737296,
    netSalary: 19562704,
    paymentStatus: 'Approved',
    paymentDate: todayStr,
    paymentMethod: 'Bank Transfer',
    bankName: 'BCA',
    bankAccount: '8830112233',
    bankAccountHolder: 'Rizky Ramadhan',
    notes: 'Bonus komisi deal Asia Pacific Logistics.',
    createdAt: daysAgo(1)
  });

  await db.payrolls.add({
    payrollCode: 'PAY-202608-004',
    month: 8,
    year: 2026,
    periodName: 'Agustus 2026',
    employeeId: e4,
    employeeName: 'Dian Sastro',
    employeeCode: 'EMP-004',
    department: 'Product Design',
    position: 'Senior UI/UX Designer',
    baseSalary: 12500000,
    allowances: 1800000,
    overtimePay: 300000,
    bonus: 0,
    grossSalary: 14600000,
    bpjsKesehatanEmployee: 120000,
    bpjsJHTEmployee: 250000,
    bpjsJPEmployee: 105474,
    bpjsAmount: 475474,
    taxStatus: 'TK/0',
    terCategory: 'TER A',
    terRatePercent: 6.0,
    pph21Method: 'TER (PMK 168/2023)',
    hasNPWP: true,
    npwpSurchargeApplied: false,
    pph21Amount: 889725,
    deductions: 100000,
    totalDeductionsAll: 1465199,
    netSalary: 13134801,
    paymentStatus: 'Draft',
    paymentMethod: 'Bank Transfer',
    bankName: 'BNI',
    bankAccount: '0981234567',
    bankAccountHolder: 'Dian Sastro',
    createdAt: daysAgo(1)
  });

  await db.payrolls.add({
    payrollCode: 'PAY-202608-005',
    month: 8,
    year: 2026,
    periodName: 'Agustus 2026',
    employeeId: e5,
    employeeName: 'Fajar Nugraha',
    employeeCode: 'EMP-005',
    department: 'Operations',
    position: 'Operations Executive',
    baseSalary: 9500000,
    allowances: 1200000,
    overtimePay: 450000,
    bonus: 0,
    grossSalary: 11150000,
    bpjsKesehatanEmployee: 95000,
    bpjsJHTEmployee: 190000,
    bpjsJPEmployee: 95000,
    bpjsAmount: 380000,
    taxStatus: 'K/0',
    terCategory: 'TER A',
    terRatePercent: 3.5,
    pph21Method: 'TER (PMK 168/2023)',
    hasNPWP: true,
    npwpSurchargeApplied: false,
    pph21Amount: 397198,
    deductions: 50000,
    totalDeductionsAll: 827198,
    netSalary: 10322802,
    paymentStatus: 'Draft',
    paymentMethod: 'Bank Transfer',
    bankName: 'BCA',
    bankAccount: '8830998877',
    bankAccountHolder: 'Fajar Nugraha',
    createdAt: daysAgo(1)
  });

  await db.payrolls.add({
    payrollCode: 'PAY-202608-006',
    month: 8,
    year: 2026,
    periodName: 'Agustus 2026',
    employeeId: e6,
    employeeName: 'Maya Indah',
    employeeCode: 'EMP-006',
    department: 'Customer Support',
    position: 'Support Specialist',
    baseSalary: 7800000,
    allowances: 1000000,
    overtimePay: 200000,
    bonus: 0,
    grossSalary: 9000000,
    bpjsKesehatanEmployee: 78000,
    bpjsJHTEmployee: 156000,
    bpjsJPEmployee: 78000,
    bpjsAmount: 312000,
    taxStatus: 'TK/0',
    terCategory: 'TER A',
    terRatePercent: 1.75,
    pph21Method: 'TER (PMK 168/2023)',
    hasNPWP: false,
    npwpSurchargeApplied: true,
    pph21Amount: 190050, // includes 120% surcharge
    deductions: 100000,
    totalDeductionsAll: 602050,
    netSalary: 8397950,
    paymentStatus: 'Draft',
    paymentMethod: 'Bank Transfer',
    bankName: 'CIMB Niaga',
    bankAccount: '70612345678',
    bankAccountHolder: 'Maya Indah',
    createdAt: daysAgo(1)
  });

  // Seed Activities
  await logActivity('system', 'Database CRM & HRIS berhasil diinisialisasi dengan data sampel', 'system', 0);
  await logActivity('contact', 'Menambahkan kontak baru: Budi Santoso (PT Techindo Solution)', 'contact', c1);
  await logActivity('hris', 'Modul HRIS aktif: 6 Karyawan & data absensi di-load', 'employee', e1);
  await logActivity('hris', 'Payroll Agustus 2026 berhasil di-generate untuk seluruh karyawan', 'payroll', 1);
}

