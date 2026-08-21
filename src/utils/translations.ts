export type Language = 'id' | 'en';

export interface TranslationsDict {
  // Brand & Global
  appName: string;
  appSubtitle: string;
  enterpriseBadge: string;
  allRightsReserved: string;

  // Navigation
  nav: {
    dashboard: string;
    companies: string;
    contacts: string;
    leads: string;
    deals: string;
    quotations: string;
    customers: string;
    tasks: string;
    analytics: string;
    pipeline: string;
    settings: string;
    hris: string;
    landing: string;
    crmSection: string;
    hrisSection: string;
    systemSection: string;
  };

  // HRIS Subtabs
  hrisTabs: {
    overview: string;
    employees: string;
    attendance: string;
    leave: string;
    payroll: string;
    reports: string;
  };

  // Header & Global Actions
  actions: {
    quickAdd: string;
    searchPlaceholder: string;
    searchHint: string;
    login: string;
    logout: string;
    openSystem: string;
    save: string;
    saving: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    actions: string;
    newTask: string;
    filter: string;
    exportExcel: string;
    downloadPdf: string;
    print: string;
    refresh: string;
    import: string;
    export: string;
    loadDemo: string;
    clearData: string;
    currency: string;
    themeLight: string;
    themeDark: string;
    switchLanguage: string;
    close: string;
    details: string;
    viewAll: string;
    approve: string;
    reject: string;
    markPaid: string;
  };

  // Dashboard Page
  dashboard: {
    title: string;
    subtitle: string;
    totalContacts: string;
    activeLeads: string;
    openDeals: string;
    pendingTasks: string;
    pipelineValue: string;
    winRate: string;
    upcomingTasks: string;
    recentActivity: string;
  };

  // Companies Page
  companies: {
    title: string;
    subtitle: string;
    addCompany: string;
    searchPlaceholder: string;
    allStatuses: string;
    clientCustomer: string;
    prospectOnly: string;
    allTypes: string;
  };

  // Contacts Page
  contacts: {
    title: string;
    subtitle: string;
    addContact: string;
    searchPlaceholder: string;
  };

  // Leads Page
  leads: {
    title: string;
    subtitle: string;
    addLead: string;
    searchPlaceholder: string;
    kanbanView: string;
    tableView: string;
    convertDeal: string;
    converted: string;
  };

  // Tasks Page
  tasks: {
    title: string;
    subtitle: string;
    addTask: string;
    searchPlaceholder: string;
    kanbanBoard: string;
    calendarView: string;
  };

  // Analytics Page
  analytics: {
    title: string;
    subtitle: string;
    totalRevenue: string;
    winRate: string;
    avgDealValue: string;
    taskCompletion: string;
    stageDistribution: string;
    leadSources: string;
  };

  // Common Statuses
  status: {
    all: string;
    draft: string;
    approved: string;
    paid: string;
    pending: string;
    rejected: string;
    won: string;
    lost: string;
    active: string;
    inactive: string;
    completed: string;
    inProgress: string;
    todo: string;
  };

  // Landing Page
  landing: {
    heroBadge: string;
    heroTitle: string;
    heroHighlight: string;
    heroDesc: string;
    ctaPrimary: string;
    ctaSecondary: string;
    crmFeatureTitle: string;
    crmFeatureDesc: string;
    hrisFeatureTitle: string;
    hrisFeatureDesc: string;
    payrollFeatureTitle: string;
    payrollFeatureDesc: string;
    securityTitle: string;
    securityDesc: string;
    statUsers: string;
    statUptime: string;
    statPph21: string;
    statSpeed: string;
  };

  // Settings
  settings: {
    title: string;
    subtitle: string;
    languageCardTitle: string;
    languageCardDesc: string;
    langIndonesian: string;
    langEnglish: string;
    companyProfileTitle: string;
    companyProfileDesc: string;
    companyName: string;
    legalName: string;
    taxNumber: string;
    phone: string;
    email: string;
    website: string;
    address: string;
    currency: string;
    themeTitle: string;
    dataManagementTitle: string;
    dataManagementDesc: string;
  };

  // Common UI hints
  common: {
    live: string;
    online: string;
    offline: string;
    totalRecords: string;
    noData: string;
    loading: string;
    success: string;
    error: string;
    role: string;
  };
}

export const translations: Record<Language, TranslationsDict> = {
  id: {
    appName: 'ErmApps SaaS',
    appSubtitle: 'Sistem Terintegrasi CRM & HRIS Real-Time',
    enterpriseBadge: 'SaaS Enterprise',
    allRightsReserved: 'Hak Cipta Dilindungi Undang-Undang.',

    nav: {
      dashboard: 'Dashboard Utama',
      companies: 'Perusahaan (Companies)',
      contacts: 'Kontak PIC (Contacts)',
      leads: 'Leads Pipeline',
      deals: 'Deals Pipeline',
      quotations: 'Penawaran (Quotations)',
      customers: 'Pelanggan Aktif (Closing)',
      tasks: 'Tasks & Aktivitas',
      analytics: 'Analitik & Laporan',
      pipeline: 'Konfigurasi Pipeline',
      settings: 'Pengaturan & Akses',
      hris: 'Sistem HRIS & Kepegawaian',
      landing: 'Portal Overview',
      crmSection: 'Modul CRM & Penjualan',
      hrisSection: 'Modul HRIS & Personalia',
      systemSection: 'Sistem & Konfigurasi'
    },

    hrisTabs: {
      overview: 'Overview & Absensi Terminal',
      employees: 'Database Karyawan',
      attendance: 'Log Kehadiran & Rekap',
      leave: 'Pengajuan Cuti & Izin',
      payroll: 'Penggajian & Slip Gaji (PPh 21 TER)',
      reports: 'Laporan & Analitik HR'
    },

    actions: {
      quickAdd: 'Tambah Cepat',
      searchPlaceholder: 'Cari Kontak, Lead, Deal, Task, Karyawan... (Enter)',
      searchHint: 'Gunakan kata kunci untuk mencari instan',
      login: 'Masuk / Undangan',
      logout: 'Keluar (Logout)',
      openSystem: 'Buka Sistem',
      save: 'Simpan Perubahan',
      saving: 'Menyimpan...',
      cancel: 'Batal',
      delete: 'Hapus',
      edit: 'Ubah',
      add: 'Tambah Baru',
      actions: 'Aksi',
      newTask: 'Tugas Baru',
      filter: 'Filter Kategori',
      exportExcel: 'Ekspor Excel (.xlsx)',
      downloadPdf: 'Unduh Slip Gaji PDF',
      print: 'Cetak Laporan',
      refresh: 'Perbarui Data',
      import: 'Impor Data',
      export: 'Ekspor Cadangan',
      loadDemo: 'Muat Data Contoh',
      clearData: 'Bersihkan Data',
      currency: 'Mata Uang:',
      themeLight: 'Mode Terang (Light)',
      themeDark: 'Mode Gelap (Dark)',
      switchLanguage: 'Ubah Bahasa',
      close: 'Tutup',
      details: 'Lihat Detail',
      viewAll: 'Lihat Semua',
      approve: 'Setujui',
      reject: 'Tolak',
      markPaid: 'Tandai Lunas'
    },

    dashboard: {
      title: 'Executive Dashboard',
      subtitle: 'Ringkasan performa penjualan CRM & operasional personalia HRIS secara real-time',
      totalContacts: 'Total Kontak PIC',
      activeLeads: 'Leads Aktif',
      openDeals: 'Deals Berjalan',
      pendingTasks: 'Tugas Pending',
      pipelineValue: 'Total Pipeline',
      winRate: 'Win Rate Closing',
      upcomingTasks: 'Tugas Terdekat',
      recentActivity: 'Aktivitas Terbaru'
    },

    companies: {
      title: 'Database Perusahaan & Klien',
      subtitle: 'Kelola data badan usaha (PT, CV, Yayasan), status pelanggan, dan riwayat transaksi',
      addCompany: 'Tambah Perusahaan',
      searchPlaceholder: 'Cari perusahaan, industri, atau kontak...',
      allStatuses: 'Status Hubungan',
      clientCustomer: 'Pelanggan Aktif (Customer)',
      prospectOnly: 'Prospek Bisnis (Prospect)',
      allTypes: 'Badan Usaha'
    },

    contacts: {
      title: 'Database Kontak & PIC Klien',
      subtitle: 'Kelola profil penanggung jawab klien, email, telepon, posisi jabatan, dan catatan relasi',
      addContact: 'Tambah Kontak Baru',
      searchPlaceholder: 'Cari kontak, email, jabatan, atau perusahaan...'
    },

    leads: {
      title: 'Pipeline Prospek Penjualan (Leads)',
      subtitle: 'Pantau status prospek dari kontak baru, kualifikasi, hingga konversi menjadi Deal potensial',
      addLead: 'Tambah Lead Baru',
      searchPlaceholder: 'Cari nama lead, perusahaan, atau produk...',
      kanbanView: 'Tampilan Papan Kanban',
      tableView: 'Tampilan Daftar Tabel',
      convertDeal: 'Konversi ke Deal',
      converted: 'Terkonversi'
    },

    tasks: {
      title: 'Manajemen Tugas & Aktivitas CRM',
      subtitle: 'Pantau jadwal follow-up, meeting klien, demo produk, dan deadline operasional harian',
      addTask: 'Tambah Tugas Baru',
      searchPlaceholder: 'Cari tugas atau penanggung jawab...',
      kanbanBoard: 'Papan Kanban',
      calendarView: 'Tampilan Kalender'
    },

    analytics: {
      title: 'Analitik Penjualan & Performa CRM',
      subtitle: 'Statistik performa pipeline deal, rasio closing, efisiensi tugas, dan proyeksi omzet bisnis',
      totalRevenue: 'Total Pendapatan Closed-Won',
      winRate: 'Rasio Closing (Win Rate)',
      avgDealValue: 'Rata-rata Nilai Deal',
      taskCompletion: 'Penyelesaian Tugas',
      stageDistribution: 'Distribusi Nilai Deal per Stage',
      leadSources: 'Sumber Asal Leads (Source Mix)'
    },

    status: {
      all: 'Semua Status',
      draft: 'Draft',
      approved: 'Disetujui',
      paid: 'Lunas (Paid)',
      pending: 'Menunggu',
      rejected: 'Ditolak',
      won: 'Closing / Won',
      lost: 'Gagal / Lost',
      active: 'Aktif',
      inactive: 'Non-Aktif',
      completed: 'Selesai',
      inProgress: 'Sedang Berjalan',
      todo: 'To Do'
    },

    landing: {
      heroBadge: 'Platform All-in-One Enterprise',
      heroTitle: 'Satukan Manajemen Penjualan CRM & Personalia HRIS dalam',
      heroHighlight: 'Satu Ekosistem Cerdas',
      heroDesc: 'Solusi perangkat lunak terintegrasi untuk akselerasi sales pipeline, manajemen prospek, presensi GPS kamera real-time, dan kalkulasi penggajian otomatis PPh 21 TER (PP 58/2023 & PMK 168/2023).',
      ctaPrimary: 'Mulai Masuk ke Dashboard',
      ctaSecondary: 'Jelajahi Fitur Lengkap',
      crmFeatureTitle: 'Sales CRM & Deals Pipeline',
      crmFeatureDesc: 'Pantau siklus penjualan dari prospek (Leads), penawaran harga (Quotations), hingga penutupan transaksi (Won Deals) secara visual.',
      hrisFeatureTitle: 'HRIS & Presensi Biometrik',
      hrisFeatureDesc: 'Terminal presensi instan dengan verifikasi swafoto kamera, geofencing lokasi GPS, dan approval cuti bertingkat.',
      payrollFeatureTitle: 'Payroll & Pajak PPh 21 TER Resmi',
      payrollFeatureDesc: 'Hitung gaji otomatis dengan tarif efektif TER A/B/C, BPJS Kesehatan & Ketenagakerjaan, serta ekspor Excel & slip PDF profesional.',
      securityTitle: 'Keamanan Data Berstandar Enterprise',
      securityDesc: 'Didukung kontrol akses berbasis peran (RBAC), enkripsi cloud Firestore, dan sistem undangan tim yang aman.',
      statUsers: 'Multi-Role User',
      statUptime: 'Akurasi PPh 21 TER',
      statPph21: 'Regulasi Resmi',
      statSpeed: 'Sinkronisasi Real-Time'
    },

    settings: {
      title: 'Pengaturan & Konfigurasi Sistem',
      subtitle: 'Sesuaikan profil perusahaan, bahasa tampilan, mata uang, dan manajemen data',
      languageCardTitle: 'Bahasa Tampilan (Display Language)',
      languageCardDesc: 'Pilih bahasa utama antarmuka untuk seluruh halaman aplikasi',
      langIndonesian: 'Bahasa Indonesia (ID)',
      langEnglish: 'English / Bahasa Inggris (EN)',
      companyProfileTitle: 'Profil Identitas Perusahaan',
      companyProfileDesc: 'Informasi ini akan tercetak otomatis pada Kop Surat, Penawaran (Quotation), dan Slip Gaji (Payslip)',
      companyName: 'Nama Perusahaan (Brand)',
      legalName: 'Nama Badan Hukum (PT/CV)',
      taxNumber: 'Nomor NPWP Perusahaan',
      phone: 'Nomor Telepon Kantor',
      email: 'Email Resmi Perusahaan',
      website: 'Situs Web / URL',
      address: 'Alamat Kantor Lengkap',
      currency: 'Mata Uang Standar',
      themeTitle: 'Tema Tampilan Antarmuka',
      dataManagementTitle: 'Manajemen Data & Cadangan',
      dataManagementDesc: 'Ekspor cadangan JSON, impor data, atau muat data contoh untuk simulasi'
    },

    common: {
      live: 'Aktif',
      online: 'Online',
      offline: 'Offline',
      totalRecords: 'Total Data',
      noData: 'Belum ada data tersedia',
      loading: 'Memuat data...',
      success: 'Berhasil!',
      error: 'Terjadi kesalahan',
      role: 'Peran'
    }
  },

  en: {
    appName: 'ErmApps SaaS',
    appSubtitle: 'Integrated Real-Time CRM & HRIS System',
    enterpriseBadge: 'Enterprise SaaS',
    allRightsReserved: 'All Rights Reserved.',

    nav: {
      dashboard: 'Executive Dashboard',
      companies: 'Companies Database',
      contacts: 'Contacts (PIC)',
      leads: 'Leads Pipeline',
      deals: 'Deals Pipeline',
      quotations: 'Quotations & Proposals',
      customers: 'Active Customers (Closed)',
      tasks: 'Tasks & Activities',
      analytics: 'Analytics & Reports',
      pipeline: 'Pipeline Configuration',
      settings: 'Settings & Permissions',
      hris: 'HRIS & Workforce Suite',
      landing: 'Portal Overview',
      crmSection: 'CRM & Sales Modules',
      hrisSection: 'HRIS & Workforce Modules',
      systemSection: 'System & Configuration'
    },

    hrisTabs: {
      overview: 'Overview & Attendance Terminal',
      employees: 'Employee Directory',
      attendance: 'Attendance Logs & Timesheets',
      leave: 'Leave Requests & Approvals',
      payroll: 'Payroll & Payslips (PPh 21 TER)',
      reports: 'HR Analytics & Reports'
    },

    actions: {
      quickAdd: 'Quick Add',
      searchPlaceholder: 'Search Contacts, Leads, Deals, Tasks, Employees... (Enter)',
      searchHint: 'Use keywords for instant live search',
      login: 'Sign In / Invite',
      logout: 'Log Out',
      openSystem: 'Open Dashboard',
      save: 'Save Changes',
      saving: 'Saving...',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add New',
      actions: 'Actions',
      newTask: 'New Task',
      filter: 'Filter Categories',
      exportExcel: 'Export Excel (.xlsx)',
      downloadPdf: 'Download Payslip PDF',
      print: 'Print Report',
      refresh: 'Refresh Data',
      import: 'Import Data',
      export: 'Export Backup',
      loadDemo: 'Load Sample Data',
      clearData: 'Clear All Data',
      currency: 'Currency:',
      themeLight: 'Light Mode',
      themeDark: 'Dark Mode',
      switchLanguage: 'Change Language',
      close: 'Close',
      details: 'View Details',
      viewAll: 'View All',
      approve: 'Approve',
      reject: 'Reject',
      markPaid: 'Mark as Paid'
    },

    dashboard: {
      title: 'Executive Dashboard',
      subtitle: 'Real-time overview of sales CRM pipelines and workforce HRIS operations',
      totalContacts: 'Total PIC Contacts',
      activeLeads: 'Active Leads',
      openDeals: 'Active Deals',
      pendingTasks: 'Pending Tasks',
      pipelineValue: 'Total Pipeline',
      winRate: 'Closing Win Rate',
      upcomingTasks: 'Upcoming Tasks',
      recentActivity: 'Recent Activity'
    },

    companies: {
      title: 'Companies & Client Directory',
      subtitle: 'Manage legal entities (Inc, LLC, PT, CV), customer status, and contract relationships',
      addCompany: 'Add Company',
      searchPlaceholder: 'Search companies, industry, or contact...',
      allStatuses: 'Relationship Status',
      clientCustomer: 'Active Client (Customer)',
      prospectOnly: 'Business Prospect',
      allTypes: 'Entity Type'
    },

    contacts: {
      title: 'Contacts & Client PIC Directory',
      subtitle: 'Manage client points of contact, emails, phone numbers, titles, and relationship notes',
      addContact: 'Add New Contact',
      searchPlaceholder: 'Search contact, email, title, or company...'
    },

    leads: {
      title: 'Sales Leads Pipeline',
      subtitle: 'Track leads lifecycle from initial discovery, qualification, to deal conversion',
      addLead: 'Add New Lead',
      searchPlaceholder: 'Search lead name, company, or product...',
      kanbanView: 'Kanban Board View',
      tableView: 'Table List View',
      convertDeal: 'Convert to Deal',
      converted: 'Converted'
    },

    tasks: {
      title: 'CRM Task & Activity Management',
      subtitle: 'Schedule client follow-ups, product demos, meetings, and daily operational deadlines',
      addTask: 'Add New Task',
      searchPlaceholder: 'Search tasks or assignees...',
      kanbanBoard: 'Kanban Board',
      calendarView: 'Calendar View'
    },

    analytics: {
      title: 'Sales Analytics & CRM Performance',
      subtitle: 'In-depth metrics on deal velocity, win rates, task fulfillment, and revenue forecasting',
      totalRevenue: 'Closed-Won Revenue',
      winRate: 'Closing Win Rate',
      avgDealValue: 'Average Deal Value',
      taskCompletion: 'Task Completion Rate',
      stageDistribution: 'Pipeline Value by Stage',
      leadSources: 'Lead Acquisition Sources'
    },

    status: {
      all: 'All Statuses',
      draft: 'Draft',
      approved: 'Approved',
      paid: 'Paid',
      pending: 'Pending',
      rejected: 'Rejected',
      won: 'Won / Closed',
      lost: 'Lost',
      active: 'Active',
      inactive: 'Inactive',
      completed: 'Completed',
      inProgress: 'In Progress',
      todo: 'To Do'
    },

    landing: {
      heroBadge: 'All-in-One Enterprise Platform',
      heroTitle: 'Unify Sales CRM & Workforce HRIS in',
      heroHighlight: 'One Intelligent Ecosystem',
      heroDesc: 'Comprehensive cloud software accelerating sales pipelines, lead tracking, camera GPS attendance clock-in, and automated Indonesian PPh 21 TER payroll engine (PP 58/2023 & PMK 168/2023).',
      ctaPrimary: 'Launch Enterprise Dashboard',
      ctaSecondary: 'Explore All Features',
      crmFeatureTitle: 'Sales CRM & Deals Pipeline',
      crmFeatureDesc: 'Visually monitor sales cycles from prospecting Leads, custom Quotations, to Deal closings and revenue analytics.',
      hrisFeatureTitle: 'HRIS & Biometric Attendance',
      hrisFeatureDesc: 'Instant attendance terminal with camera selfie verification, GPS geofencing radius, and tiered leave approval workflows.',
      payrollFeatureTitle: 'Automated Payroll & Official PPh 21 TER',
      payrollFeatureDesc: 'Calculate salaries with official TER A/B/C rates, Indonesian BPJS calculations, and export multi-sheet Excel & PDF payslips.',
      securityTitle: 'Enterprise-Grade Security',
      securityDesc: 'Backed by Role-Based Access Control (RBAC), Firestore cloud encryption, and secure team invitation workflows.',
      statUsers: 'Multi-Role Users',
      statUptime: 'TER Calculation Accuracy',
      statPph21: 'Official Regulations',
      statSpeed: 'Real-Time Sync'
    },

    settings: {
      title: 'Settings & System Configuration',
      subtitle: 'Customize company identity, interface language, currency, and data management',
      languageCardTitle: 'Display Language',
      languageCardDesc: 'Select the primary interface language for all app pages',
      langIndonesian: 'Bahasa Indonesia (ID)',
      langEnglish: 'English (EN)',
      companyProfileTitle: 'Corporate Profile & Letterhead',
      companyProfileDesc: 'This information will be printed automatically on Quotations, Invoices, and Official Payslips',
      companyName: 'Company Name (Brand)',
      legalName: 'Legal Entity Name (Inc/LLC/PT)',
      taxNumber: 'Corporate Tax ID (NPWP)',
      phone: 'Office Phone Number',
      email: 'Corporate Email Address',
      website: 'Official Website URL',
      address: 'Headquarters Full Address',
      currency: 'Default Currency',
      themeTitle: 'Interface Color Theme',
      dataManagementTitle: 'Data Management & Backups',
      dataManagementDesc: 'Export JSON backups, restore data files, or populate sample data for simulations'
    },

    common: {
      live: 'Live',
      online: 'Online',
      offline: 'Offline',
      totalRecords: 'Total Records',
      noData: 'No records available',
      loading: 'Loading data...',
      success: 'Success!',
      error: 'An error occurred',
      role: 'Role'
    }
  }
};
