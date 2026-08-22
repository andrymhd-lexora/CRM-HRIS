import React, { useEffect, useState, useMemo, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { calculateEmployeePayroll } from './utils/payrollCalculator';
import { isTaskDueSoon } from './utils/taskUtils';
import { useHRISSync } from './hooks/useHRISSync';
import {
  getUserProfile,
  findRegisteredUserOrEmployee,
  findPendingInvitationForEmail,
  claimInvitationForUser,
  checkHasAnyUsers,
  isDeveloperOrSystemAdminEmail,
  subscribeUsers,
  subscribeCompanies,
  subscribeContacts,
  subscribeLeads,
  subscribeDeals,
  subscribeQuotations,
  subscribeTasks,
  subscribeActivities,
  subscribePipelineStages,
  subscribeSettings,
  subscribeLeaveRequests,
  subscribePayrolls,
  addCompany,
  updateCompany,
  deleteCompany,
  addContact,
  updateContact,
  deleteContact,
  addLead,
  updateLead,
  deleteLead,
  convertLeadToDeal,
  addDeal,
  updateDeal,
  markDealWon,
  markDealLost,
  deleteDeal,
  addQuotation,
  updateQuotation,
  deleteQuotation,
  addTask,
  updateTask,
  deleteTask,
  logActivityWithFollowUp,
  addPipelineStage,
  deletePipelineStage,
  setAppSetting,
  saveCompanyProfile,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  deleteAttendance,
  createLeaveRequest,
  updateLeaveStatus,
  deleteLeaveRequest,
  generateOrUpdatePayroll,
  markPayrollPaid,
  deletePayroll,
  logActivity as logFirestoreActivity,
  seedFirestoreSampleData,
  clearAllFirestoreCollections
} from './db/firestoreService';
import {
  ActiveView,
  HRISTab,
  Company,
  Contact,
  Lead,
  Deal,
  Quotation,
  Task,
  TaskStatus,
  PipelineStage,
  Employee,
  Attendance,
  LeaveRequest,
  Payroll,
  UserProfile,
  Activity,
  CompanyProfile,
  DEFAULT_COMPANY_PROFILE
} from './types/crm';

import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { CompaniesView } from './components/CompaniesView';
import { ContactsView } from './components/ContactsView';
import { LeadsView } from './components/LeadsView';
import { DealsView } from './components/DealsView';
import { QuotationsView } from './components/QuotationsView';
import { CustomersView } from './components/CustomersView';
import { TasksView } from './components/TasksView';
import { AnalyticsView } from './components/AnalyticsView';
import { PipelineConfigView } from './components/PipelineConfigView';
import { SettingsView } from './components/SettingsView';
import { HRISView } from './components/HRISView';
import { Customer360Modal } from './components/Customer360Modal';
import { QuickAddModal } from './components/QuickAddModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AuthModal } from './components/AuthModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  const [activeHrisTab, setActiveHrisTab] = useState<HRISTab>('overview');

  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: 'danger' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'danger',
    onConfirm: () => {}
  });

  const askConfirmation = (config: {
    title: string;
    message: string;
    variant?: 'danger' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => Promise<void> | void;
  }) => {
    setConfirmModalConfig({
      isOpen: true,
      title: config.title,
      message: config.message,
      variant: config.variant || 'danger',
      confirmText: config.confirmText,
      cancelText: config.cancelText,
      onConfirm: config.onConfirm
    });
  };

  const handleNavigate = (view: ActiveView, hrisTab?: HRISTab) => {
    const isAdminOrAbove = currentUser?.role === 'Super Admin' || currentUser?.role === 'Owner' || currentUser?.role === 'Admin';
    if (view === 'settings' && !isAdminOrAbove) {
      addToast('Akses Ditolak: Hanya Admin, Owner, atau Super Admin yang dapat mengakses Pengaturan Sistem', 'error');
      return;
    }
    setActiveView(view);
    if (hrisTab) {
      setActiveHrisTab(hrisTab);
    }
  };
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Theme state with local storage persistence and system preference fallback
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('crm_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('crm_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      addToast(`Mode Tampilan diubah ke ${next === 'dark' ? 'Mode Gelap (Dark Mode)' : 'Mode Terang (Light Mode)'}`, 'info');
      return next;
    });
  };

  // Real-time Firestore State Collections
  const [systemUsers, setSystemUsers] = useState<UserProfile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [selectedCustomer360Company, setSelectedCustomer360Company] = useState<Company | null>(null);

  // HRIS Collections & Sync Hook
  const {
    attendances,
    employees,
    syncCheckIn,
    syncCheckOut
  } = useHRISSync();

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userEmail = (firebaseUser.email || '').trim().toLowerCase();
        let profile = await getUserProfile(firebaseUser.uid);
        
        if (!profile) {
          if (isDeveloperOrSystemAdminEmail(userEmail)) {
            profile = {
              uid: firebaseUser.uid,
              email: userEmail,
              displayName: firebaseUser.displayName || 'Andry Mahardika',
              role: 'Super Admin',
              status: 'Active',
              joinedAt: new Date().toISOString(),
              invitedBy: 'System Owner / Super Admin'
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), profile);
          } else {
            const regData = await findRegisteredUserOrEmployee(userEmail);
            if (regData?.profile) {
              profile = { ...regData.profile, uid: firebaseUser.uid };
              await setDoc(doc(db, 'users', firebaseUser.uid), profile);
            } else if (regData?.employee) {
              profile = {
                uid: firebaseUser.uid,
                email: userEmail,
                displayName: regData.employee.name || firebaseUser.displayName || userEmail.split('@')[0],
                role: regData.employee.department === 'HR & Finance' ? 'Admin' : 'Staff',
                status: 'Active',
                joinedAt: new Date().toISOString(),
                invitedBy: 'Admin (Pre-registered Employee)'
              };
              await setDoc(doc(db, 'users', firebaseUser.uid), profile);
            } else {
              // Check if there is an active pending invitation for this email
              const pendingInv = await findPendingInvitationForEmail(userEmail);
              if (pendingInv) {
                profile = await claimInvitationForUser(
                  firebaseUser.uid,
                  userEmail,
                  firebaseUser.displayName || userEmail.split('@')[0],
                  pendingInv
                );
              } else {
                const hasUsers = await checkHasAnyUsers();
                if (!hasUsers) {
                  // System bootstrap: First user ever becomes Super Admin
                  profile = {
                    uid: firebaseUser.uid,
                    email: userEmail,
                    displayName: firebaseUser.displayName || (userEmail ? userEmail.split('@')[0] : 'Administrator'),
                    role: 'Super Admin',
                    status: 'Active',
                    joinedAt: new Date().toISOString(),
                    invitedBy: 'System Bootstrap'
                  };
                  await setDoc(doc(db, 'users', firebaseUser.uid), profile);
                } else {
                  // STRICT SECURITY GATE: User is NOT registered and has NO invitation!
                  await signOut(auth);
                  setCurrentUser(null);
                  setActiveView('landing');
                  addToast(`Akses Ditolak: Akun (${userEmail || 'User'}) belum terdaftar dari undangan. Silakan hubungi Admin perusahaan.`, 'error');
                  return;
                }
              }
            }
          }
        }

        if (profile?.status === 'Suspended') {
          await signOut(auth);
          setCurrentUser(null);
          setActiveView('landing');
          addToast('Akun Anda dinonaktifkan oleh Administrator.', 'error');
          return;
        }

        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
        setActiveView('landing');
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time Firestore collections
  useEffect(() => {
    const unsubUsers = subscribeUsers(setSystemUsers);
    const unsubCompanies = subscribeCompanies(setCompanies);
    const unsubContacts = subscribeContacts(setContacts);
    const unsubLeads = subscribeLeads(setLeads);
    const unsubDeals = subscribeDeals(setDeals);
    const unsubQuotations = subscribeQuotations(setQuotations);
    const unsubTasks = subscribeTasks(setTasks);
    const unsubActivities = subscribeActivities(setActivities);
    const unsubStages = subscribePipelineStages(setPipelineStages);
    const unsubSettings = subscribeSettings(setSettingsMap);

    const unsubLeaves = subscribeLeaveRequests(setLeaveRequests);
    const unsubPayrolls = subscribePayrolls(setPayrolls);

    return () => {
      unsubUsers();
      unsubCompanies();
      unsubContacts();
      unsubLeads();
      unsubDeals();
      unsubQuotations();
      unsubTasks();
      unsubActivities();
      unsubStages();
      unsubSettings();
      unsubLeaves();
      unsubPayrolls();
    };
  }, []);

  // Company Profile Settings Composite
  const companyProfile: CompanyProfile = useMemo(() => {
    return {
      companyName: settingsMap['companyName'] || DEFAULT_COMPANY_PROFILE.companyName,
      legalName: settingsMap['legalName'] || DEFAULT_COMPANY_PROFILE.legalName,
      logoUrl: settingsMap['logoUrl'] !== undefined ? settingsMap['logoUrl'] : DEFAULT_COMPANY_PROFILE.logoUrl,
      address: settingsMap['address'] || DEFAULT_COMPANY_PROFILE.address,
      city: settingsMap['city'] || DEFAULT_COMPANY_PROFILE.city,
      phone: settingsMap['phone'] || DEFAULT_COMPANY_PROFILE.phone,
      email: settingsMap['email'] || DEFAULT_COMPANY_PROFILE.email,
      website: settingsMap['website'] || DEFAULT_COMPANY_PROFILE.website,
      taxId: settingsMap['taxId'] || DEFAULT_COMPANY_PROFILE.taxId,
      signatoryName: settingsMap['signatoryName'] || DEFAULT_COMPANY_PROFILE.signatoryName,
      signatoryTitle: settingsMap['signatoryTitle'] || DEFAULT_COMPANY_PROFILE.signatoryTitle,
      currency: settingsMap['currency'] || DEFAULT_COMPANY_PROFILE.currency
    };
  }, [settingsMap]);

  const companyNameSetting = companyProfile.companyName;
  const currencySetting = companyProfile.currency;

  // Helper Toast
  const addToast = (text: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      type
    };
    setToasts((prev) => [...prev, newToast]);
  };

  // Real-time Toast Notification for Tasks Due Soon (within 24 hours)
  const notifiedDueSoonTaskIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    // Filter tasks that are due within 24 hours and not completed
    const dueSoonTasks = tasks.filter((t) => isTaskDueSoon(t));

    dueSoonTasks.forEach((task) => {
      const taskKey = `${task.id || task.title}_${task.dueDate}`;
      if (!notifiedDueSoonTaskIdsRef.current.has(taskKey)) {
        notifiedDueSoonTaskIdsRef.current.add(taskKey);
        
        const dueLabel = task.dueDate ? ` (${task.dueDate})` : '';
        addToast(
          `⏰ Due Soon: Task "${task.title}" is due within 24 hours${dueLabel}!`,
          'warning'
        );
      }
    });
  }, [tasks]);

  // Real-time Toast Notification for HR Admin when new pending leave request arrives
  const knownPendingLeaveIdsRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    const isAdminOrHR = currentUser?.role === 'Super Admin' || currentUser?.role === 'Owner' || currentUser?.role === 'Admin' || currentUser?.role === 'Manager';
    const currentPending = leaveRequests.filter((l) => l.status === 'Pending');
    const currentPendingIds = new Set(currentPending.map((l) => String(l.id)));

    if (knownPendingLeaveIdsRef.current === null) {
      knownPendingLeaveIdsRef.current = currentPendingIds;
    } else {
      if (isAdminOrHR) {
        currentPending.forEach((leave) => {
          if (leave.id && !knownPendingLeaveIdsRef.current?.has(String(leave.id))) {
            addToast(
              `📋 Pengajuan Cuti Baru: ${leave.employeeName} (${leave.leaveType}, ${leave.totalDays} hari) membutuhkan persetujuan HR.`,
              'info'
            );
          }
        });
      }
      knownPendingLeaveIdsRef.current = currentPendingIds;
    }
  }, [leaveRequests, currentUser]);

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Logout Handler
  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setActiveView('landing');
    addToast('Anda berhasil keluar dari akun', 'info');
  };

  // --- Handlers for HRIS & Kepegawaian ---
  const handleAddEmployee = async (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    const docId = await addEmployee(data);
    await logFirestoreActivity('contact', `Menambahkan karyawan baru HRIS: ${data.name} (${data.employeeCode})`, 'contact', docId);
    addToast(`Karyawan "${data.name}" (${data.employeeCode}) berhasil ditambahkan ke Cloud Firestore`, 'success');
  };

  const handleUpdateEmployee = async (id: any, data: Partial<Employee>) => {
    await updateEmployee(String(id), data);
    await logFirestoreActivity('contact', `Memperbarui data karyawan HRIS ID #${id}`, 'contact', String(id));
    addToast('Data karyawan berhasil diperbarui', 'success');
  };

  const handleDeleteEmployee = async (id: any) => {
    const target = employees.find(e => String(e.id) === String(id));
    const name = target?.name || `ID #${id}`;
    askConfirmation({
      title: 'Hapus Data Karyawan',
      message: `Apakah Anda yakin ingin menghapus data karyawan "${name}" dari sistem HRIS Firestore? Tindakan ini permanen.`,
      onConfirm: async () => {
        await deleteEmployee(String(id));
        await logFirestoreActivity('contact', `Menghapus karyawan HRIS ID #${id}`, 'contact', String(id));
        addToast(`Karyawan "${name}" berhasil dihapus`, 'info');
      }
    });
  };

  const handleAddAttendance = async (data: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>) => {
    await syncCheckIn(data);
    addToast(`Presensi tanggal ${data.date} berhasil dicatat di Firestore`, 'success');
  };

  const handleUpdateAttendance = async (id: any, data: Partial<Attendance>) => {
    await syncCheckOut(String(id), data);
    addToast('Presensi & Check-Out berhasil diperbarui di Firestore', 'success');
  };

  const handleDeleteAttendance = async (id: any) => {
    askConfirmation({
      title: 'Hapus Catatan Presensi',
      message: 'Apakah Anda yakin ingin menghapus catatan presensi ini dari Cloud Firestore?',
      onConfirm: async () => {
        await deleteAttendance(String(id));
        addToast('Catatan presensi berhasil dihapus', 'info');
      }
    });
  };

  const handleCreateLeaveRequest = async (data: Omit<LeaveRequest, 'id' | 'createdAt'>) => {
    await createLeaveRequest(data);
    addToast(`Pengajuan cuti / izin berhasil dikirim ke Cloud Firestore`, 'success');
  };

  const handleUpdateLeaveStatus = async (id: any, status: 'Approved' | 'Rejected', approvedBy?: string) => {
    await updateLeaveStatus(String(id), status, approvedBy || currentUser?.displayName || 'HR Admin');
    addToast(`Pengajuan cuti statusnya diubah menjadi "${status}"`, status === 'Approved' ? 'success' : 'info');
  };

  const handleDeleteLeaveRequest = async (id: any) => {
    askConfirmation({
      title: 'Hapus Pengajuan Cuti',
      message: 'Apakah Anda yakin ingin menghapus pengajuan cuti ini dari Cloud Firestore?',
      onConfirm: async () => {
        await deleteLeaveRequest(String(id));
        addToast('Pengajuan cuti berhasil dihapus', 'info');
      }
    });
  };

  const handleGeneratePayroll = async (data: Omit<Payroll, 'id' | 'createdAt'>) => {
    await generateOrUpdatePayroll(data);
    addToast(`Gaji periode ${data.periodName} berhasil diproses di Firestore`, 'success');
  };

  const handleMarkPayrollPaid = async (id: any) => {
    await markPayrollPaid(String(id));
    addToast('Status slip gaji berhasil diperbarui menjadi TERBAYAR (Paid)', 'success');
  };

  const handleDeletePayroll = async (id: any) => {
    askConfirmation({
      title: 'Hapus Slip Gaji Payroll',
      message: 'Apakah Anda yakin ingin menghapus slip gaji periode ini dari Cloud Firestore?',
      onConfirm: async () => {
        await deletePayroll(String(id));
        addToast('Slip gaji berhasil dihapus', 'info');
      }
    });
  };

  // --- Handlers for Companies ---
  const handleAddCompany = async (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const tempId = 'temp-' + Date.now();
    const payload = {
      ...data,
      createdBy: data.createdBy || currentUser?.uid || '',
      assignedTo: data.assignedTo || currentUser?.uid || '',
      owner: data.owner || currentUser?.displayName || currentUser?.email || 'Sales'
    };

    // Optimistic local state update so record appears immediately
    const optimisticCompany: Company = {
      id: tempId,
      ...payload,
      createdAt: now,
      updatedAt: now
    };
    setCompanies((prev) => [optimisticCompany, ...prev]);

    try {
      const docId = await addCompany(payload);
      // Replace optimistic tempId with real docId
      setCompanies((prev) =>
        prev.map((c) => (c.id === tempId ? { ...c, id: docId } : c))
      );
      addToast(`Perusahaan "${data.name}" berhasil didaftarkan`, 'success');
    } catch (err: any) {
      // Revert optimistic update on error
      setCompanies((prev) => prev.filter((c) => c.id !== tempId));
      addToast(`Gagal menambahkan perusahaan: ${err.message}`, 'error');
      throw err;
    }
  };

  const handleUpdateCompany = async (id: string, data: Partial<Company>) => {
    const now = new Date().toISOString();
    setCompanies((prev) =>
      prev.map((c) => (String(c.id) === String(id) ? { ...c, ...data, updatedAt: now } : c))
    );
    try {
      await updateCompany(id, data);
      addToast('Data perusahaan berhasil diperbarui', 'success');
    } catch (err: any) {
      addToast(`Gagal memperbarui perusahaan: ${err.message}`, 'error');
      throw err;
    }
  };

  const handleDeleteCompany = async (id: string) => {
    const target = companies.find((c) => String(c.id) === String(id));
    const name = target?.name || `ID #${id}`;
    askConfirmation({
      title: 'Hapus Data Perusahaan',
      message: `Apakah Anda yakin ingin menghapus data perusahaan "${name}" beserta seluruh asosiasi datanya?`,
      onConfirm: async () => {
        setCompanies((prev) => prev.filter((c) => String(c.id) !== String(id)));
        try {
          await deleteCompany(id);
          addToast(`Perusahaan "${name}" berhasil dihapus`, 'info');
        } catch (err: any) {
          addToast(`Gagal menghapus perusahaan: ${err.message}`, 'error');
          throw err;
        }
      }
    });
  };

  // --- Handlers for Quotations ---
  const handleAddQuotation = async (data: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const docId = await addQuotation(data);
    await logFirestoreActivity('deal', `Penerbitan Penawaran #${data.quotationNumber} untuk ${data.companyName}`, 'deal', docId, { companyId: data.companyId, dealId: data.dealId });
    addToast(`Quotation #${data.quotationNumber} berhasil dibuat`, 'success');
  };

  const handleUpdateQuotation = async (id: string, data: Partial<Quotation>) => {
    await updateQuotation(id, data);
    addToast('Data Penawaran berhasil diperbarui', 'success');
  };

  const handleDeleteQuotation = async (id: string) => {
    const target = quotations.find((q) => String(q.id) === String(id));
    const num = target?.quotationNumber || `ID #${id}`;
    askConfirmation({
      title: 'Hapus Surat Penawaran',
      message: `Apakah Anda yakin ingin menghapus surat penawaran #${num}?`,
      onConfirm: async () => {
        await deleteQuotation(id);
        addToast(`Penawaran #${num} berhasil dihapus`, 'info');
      }
    });
  };

  // --- Lead Conversion & Deal Automation Handlers ---
  const handleConvertLeadToDeal = async (lead: Lead) => {
    try {
      const dealId = await convertLeadToDeal(lead, currentUser?.displayName || 'Sales');
      addToast(`Lead "${lead.name}" berhasil dikonversi menjadi Deal Baru!`, 'success');
      handleNavigate('deals');
    } catch (err: any) {
      addToast(`Gagal mengonversi Lead: ${err.message}`, 'error');
    }
  };

  const handleMarkDealWon = async (deal: Deal) => {
    try {
      if (!deal.id) return;
      await markDealWon(String(deal.id), deal);
      addToast(`Selamat! Deal "${deal.title}" berhasil CLOSING WON! Data customer otomatis diperbarui.`, 'success');
    } catch (err: any) {
      addToast(`Gagal memperbarui status deal: ${err.message}`, 'error');
    }
  };

  const handleMarkDealLost = async (deal: Deal, lostReason: string) => {
    try {
      if (!deal.id) return;
      await markDealLost(String(deal.id), deal, lostReason);
      addToast(`Deal "${deal.title}" ditandai sebagai LOST (Batal). Alasan: ${lostReason}`, 'info');
    } catch (err: any) {
      addToast(`Gagal memperbarui deal: ${err.message}`, 'error');
    }
  };

  const handleLogActivityWithFollowUp = async (
    type: 'CALL' | 'MEETING' | 'EMAIL' | 'SURVEY' | 'TASK' | 'NOTE',
    notesText: string,
    extraData: { companyId?: string; contactId?: string; leadId?: string; dealId?: string; quotationId?: string },
    followUpDate?: string
  ) => {
    await logActivityWithFollowUp({
      type: extraData.dealId ? 'deal' : extraData.leadId ? 'lead' : 'company',
      activityType: type as any,
      description: notesText,
      companyId: extraData.companyId,
      contactId: extraData.contactId,
      leadId: extraData.leadId,
      dealId: extraData.dealId,
      quotationId: extraData.quotationId,
      createdByName: currentUser?.displayName || 'Sales',
      nextFollowUpDate: followUpDate
    });
    addToast('Aktivitas berhasil dicatat' + (followUpDate ? ` & Task Follow-Up dijadwalkan pada ${followUpDate}` : ''), 'success');
  };
  const handleAddContact = async (data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const payload = {
      ...data,
      createdBy: data.createdBy || currentUser?.uid || '',
      assignedTo: data.assignedTo || currentUser?.uid || ''
    };
    const docId = await addContact(payload);
    await logFirestoreActivity('contact', `Menambahkan kontak baru: ${data.name} (${data.company})`, 'contact', docId);
    addToast(`Kontak "${data.name}" berhasil ditambahkan ke Firestore`, 'success');
  };

  const handleUpdateContact = async (id: any, data: Partial<Contact>) => {
    await updateContact(String(id), data);
    await logFirestoreActivity('contact', `Memperbarui kontak: ${data.name || 'ID #' + id}`, 'contact', String(id));
    addToast('Kontak berhasil diperbarui', 'success');
  };

  const handleDeleteContact = async (id: any) => {
    const target = contacts.find((c) => String(c.id) === String(id));
    const name = target?.name || `ID #${id}`;
    askConfirmation({
      title: 'Hapus Data Kontak',
      message: `Apakah Anda yakin ingin menghapus kontak "${name}" dari Cloud Firestore?`,
      onConfirm: async () => {
        await deleteContact(String(id));
        await logFirestoreActivity('contact', `Hapus kontak ID #${id}`, 'contact', String(id));
        addToast(`Kontak "${name}" berhasil dihapus`, 'info');
      }
    });
  };

  // --- Handlers for Leads ---
  const handleAddLead = async (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const payload = {
      ...data,
      createdBy: data.createdBy || currentUser?.uid || '',
      assignedTo: data.assignedTo || currentUser?.uid || ''
    };
    const docId = await addLead(payload);
    await logFirestoreActivity('lead', `Menambahkan lead baru: ${data.name} (${data.company})`, 'lead', docId);
    addToast(`Lead "${data.name}" berhasil ditambahkan ke Firestore`, 'success');
  };

  const handleUpdateLead = async (id: any, data: Partial<Lead>) => {
    await updateLead(String(id), data);
    if (data.stage) {
      await logFirestoreActivity('lead', `Lead #${id} dipindahkan ke stage: ${data.stage}`, 'lead', String(id));
    } else {
      await logFirestoreActivity('lead', `Memperbarui lead #${id}`, 'lead', String(id));
    }
    addToast('Lead berhasil diperbarui', 'success');
  };

  const handleDeleteLead = async (id: any) => {
    const target = leads.find((l) => String(l.id) === String(id));
    const name = target?.name || `ID #${id}`;
    askConfirmation({
      title: 'Hapus Data Lead',
      message: `Apakah Anda yakin ingin menghapus calon prospek / lead "${name}"?`,
      onConfirm: async () => {
        await deleteLead(String(id));
        await logFirestoreActivity('lead', `Hapus lead ID #${id}`, 'lead', String(id));
        addToast(`Lead "${name}" berhasil dihapus`, 'info');
      }
    });
  };

  // --- Handlers for Deals ---
  const handleAddDeal = async (data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const payload = {
      ...data,
      createdBy: data.createdBy || currentUser?.uid || '',
      assignedTo: data.assignedTo || currentUser?.uid || ''
    };
    const docId = await addDeal(payload);
    await logFirestoreActivity('deal', `Menambahkan deal baru: ${data.title} ($${data.value})`, 'deal', docId);
    addToast(`Deal "${data.title}" berhasil ditambahkan ke Firestore`, 'success');
  };

  const handleUpdateDeal = async (id: any, data: Partial<Deal>) => {
    await updateDeal(String(id), data);
    if (data.stage) {
      await logFirestoreActivity('deal', `Deal #${id} dipindahkan ke stage: ${data.stage}`, 'deal', String(id));
    } else {
      await logFirestoreActivity('deal', `Memperbarui deal #${id}`, 'deal', String(id));
    }
    addToast('Deal berhasil diperbarui', 'success');
  };

  const handleDeleteDeal = async (id: any) => {
    const target = deals.find((d) => String(d.id) === String(id));
    const title = target?.title || `ID #${id}`;
    askConfirmation({
      title: 'Hapus Deal Bisnis',
      message: `Apakah Anda yakin ingin menghapus deal "${title}" dari pipeline penjualan?`,
      onConfirm: async () => {
        await deleteDeal(String(id));
        await logFirestoreActivity('deal', `Hapus deal ID #${id}`, 'deal', String(id));
        addToast(`Deal "${title}" berhasil dihapus`, 'info');
      }
    });
  };

  // --- Handlers for Tasks ---
  const handleAddTask = async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const payload = {
      ...data,
      createdBy: data.createdBy || currentUser?.uid || '',
      assignedTo: data.assignedTo || currentUser?.uid || ''
    };
    const docId = await addTask(payload);
    await logFirestoreActivity('task', `Menambahkan task baru: ${data.title}`, 'task', docId);
    addToast(`Task "${data.title}" berhasil ditambahkan ke Firestore`, 'success');
  };

  const handleUpdateTask = async (id: any, data: Partial<Task>) => {
    await updateTask(String(id), data);
    addToast('Task berhasil diperbarui', 'success');
  };

  const handleDeleteTask = async (id: any) => {
    const target = tasks.find((t) => String(t.id) === String(id));
    const title = target?.title || `ID #${id}`;
    askConfirmation({
      title: 'Hapus Tugas / Task',
      message: `Apakah Anda yakin ingin menghapus tugas "${title}"?`,
      onConfirm: async () => {
        await deleteTask(String(id));
        await logFirestoreActivity('task', `Hapus task ID #${id}`, 'task', String(id));
        addToast(`Tugas "${title}" berhasil dihapus`, 'info');
      }
    });
  };

  const handleToggleTaskStatus = async (id: any) => {
    const task = tasks.find((t) => String(t.id) === String(id));
    if (!task) return;
    const newStatus: TaskStatus = task.status === 'Completed' ? 'Todo' : 'Completed';
    await updateTask(String(id), { status: newStatus });
    await logFirestoreActivity('task', `Status task #${id} diubah ke ${newStatus}`, 'task', String(id));
    addToast(`Status task diubah menjadi "${newStatus}"`, 'info');
  };

  // --- Handlers for Pipeline Stages ---
  const handleAddStage = async (module: 'leads' | 'deals', stageName: string, color: string) => {
    const existing = pipelineStages.filter((s) => s.module === module);
    await addPipelineStage({
      module,
      stageName,
      order: existing.length,
      color
    });
    addToast(`Stage "${stageName}" berhasil ditambahkan ke ${module}`, 'success');
  };

  const handleDeleteStage = async (id: any) => {
    askConfirmation({
      title: 'Hapus Stage Pipeline',
      message: 'Apakah Anda yakin ingin menghapus stage ini? Data lead/deal terkait akan tetap tersimpan di database.',
      variant: 'warning',
      onConfirm: async () => {
        await deletePipelineStage(String(id));
        addToast('Stage berhasil dihapus', 'info');
      }
    });
  };

  // --- Handlers for Settings & Data ---
  const handleSaveCompanySetting = async (key: 'companyName' | 'currency', value: string) => {
    await setAppSetting(key, value);
    addToast(`Pengaturan "${key}" berhasil disimpan di Cloud Firestore`, 'success');
  };

  const handleSaveCompanyProfile = async (profile: Partial<CompanyProfile>) => {
    await saveCompanyProfile(profile);
    addToast('Profil & Identitas Perusahaan berhasil diperbarui di Cloud Firestore', 'success');
  };

  const handleExportData = async () => {
    const data = {
      contacts,
      leads,
      deals,
      tasks,
      activities,
      pipelineStages,
      employees,
      attendances,
      leaveRequests,
      payrolls,
      settingsMap,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ermapps-firestore-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Backup data JSON CRM & HRIS berhasil didownload', 'success');
  };

  const handleImportData = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.contacts && Array.isArray(data.contacts)) {
        for (const item of data.contacts) await addContact(item);
      }
      if (data.leads && Array.isArray(data.leads)) {
        for (const item of data.leads) await addLead(item);
      }
      if (data.deals && Array.isArray(data.deals)) {
        for (const item of data.deals) await addDeal(item);
      }
      if (data.tasks && Array.isArray(data.tasks)) {
        for (const item of data.tasks) await addTask(item);
      }
      if (data.employees && Array.isArray(data.employees)) {
        for (const item of data.employees) await addEmployee(item);
      }
      addToast('Data backup berhasil diimport ke Cloud Firestore', 'success');
      setActiveView('dashboard');
    } catch (err) {
      console.error(err);
      addToast('Gagal mengimport data — format file tidak valid', 'error');
    }
  };

  const handleLoadDemoData = async () => {
    try {
      await seedFirestoreSampleData();
      addToast('Data sampel CRM & HRIS berhasil dipopulasikan ke Cloud Firestore!', 'success');
      if (activeView === 'landing') {
        setActiveView('dashboard');
      }
    } catch (err) {
      console.error(err);
      addToast('Gagal memuat data sampel ke Firestore', 'error');
    }
  };

  const handleClearAllData = async () => {
    askConfirmation({
      title: 'Hapus Seluruh Data CRM & HRIS',
      message: 'PERINGATAN KRUSIAL: Tindakan ini akan menghapus seluruh data Kontak, Deals, Leads, Tasks, Karyawan, Presensi, dan Payroll dari Cloud Firestore. Apakah Anda benar-benar yakin?',
      variant: 'danger',
      confirmText: 'Ya, Bersihkan Seluruh Data',
      onConfirm: async () => {
        await clearAllFirestoreCollections();
        addToast('Seluruh data CRM & HRIS di Cloud Firestore berhasil dibersihkan', 'info');
        setActiveView('dashboard');
      }
    });
  };

  // Role checks for filtering CRM and settings
  const isAdminOrAbove = currentUser?.role === 'Super Admin' || currentUser?.role === 'Owner' || currentUser?.role === 'Admin';
  const isManager = currentUser?.role === 'Manager';

  const isOwnedOrAssignedToUser = (
    item: { assignedTo?: string; createdBy?: string; email?: string; owner?: string },
    user: { uid?: string; email?: string; displayName?: string }
  ) => {
    if (!item.assignedTo && !item.createdBy && !item.owner && !item.email) return true;

    const uid = user.uid;
    const userEmail = user.email ? user.email.toLowerCase() : '';
    const userName = user.displayName ? user.displayName.toLowerCase() : '';

    if (item.owner) {
      const ownerLower = item.owner.toLowerCase();
      if (
        ownerLower === 'sales' ||
        ownerLower === 'unassigned' ||
        ownerLower === 'belum ditugaskan' ||
        ownerLower === '' ||
        ownerLower === 'all'
      ) {
        return true;
      }
      if ((uid && item.owner === uid) || (userEmail && ownerLower === userEmail) || (userName && ownerLower === userName)) {
        return true;
      }
    }

    if (item.assignedTo) {
      const assignedLower = item.assignedTo.toLowerCase();
      if ((uid && item.assignedTo === uid) || (userEmail && assignedLower === userEmail) || (userName && assignedLower === userName)) {
        return true;
      }
    }

    if (item.createdBy) {
      const createdLower = item.createdBy.toLowerCase();
      if ((uid && item.createdBy === uid) || (userEmail && createdLower === userEmail) || (userName && createdLower === userName)) {
        return true;
      }
    }

    if (item.email && userEmail && item.email.toLowerCase() === userEmail) {
      return true;
    }

    return false;
  };

  const isOwnedOrAssigned = (item: { assignedTo?: string; createdBy?: string; email?: string; owner?: string }) => {
    if (!currentUser) return true;
    if (isAdminOrAbove) return true;

    // 1. Direct match with current user
    if (isOwnedOrAssignedToUser(item, currentUser)) return true;

    // 2. For Manager role: ONLY view pipeline, companies, and contacts belonging to Staff subordinates assigned to this Manager
    if (isManager) {
      const mySubordinateStaff = systemUsers.filter((u) => {
        if (u.role !== 'Staff') return false;
        if (u.managerId && u.managerId === currentUser.uid) return true;
        if (u.managerEmail && currentUser.email && u.managerEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
        if (u.managerName && currentUser.displayName && u.managerName.toLowerCase() === currentUser.displayName.toLowerCase()) return true;
        return false;
      });

      for (const staff of mySubordinateStaff) {
        if (isOwnedOrAssignedToUser(item, staff)) return true;
      }
    }

    return false;
  };

  const visibleCompanies = useMemo(() => {
    if (isAdminOrAbove || !currentUser) return companies;
    return companies.filter(isOwnedOrAssigned);
  }, [companies, isAdminOrAbove, currentUser, systemUsers, isManager]);

  const visibleContacts = useMemo(() => {
    if (isAdminOrAbove || !currentUser) return contacts;
    return contacts.filter(isOwnedOrAssigned);
  }, [contacts, isAdminOrAbove, currentUser, systemUsers, isManager]);

  const visibleLeads = useMemo(() => {
    if (isAdminOrAbove || !currentUser) return leads;
    return leads.filter(isOwnedOrAssigned);
  }, [leads, isAdminOrAbove, currentUser, systemUsers, isManager]);

  const visibleDeals = useMemo(() => {
    if (isAdminOrAbove || !currentUser) return deals;
    return deals.filter(isOwnedOrAssigned);
  }, [deals, isAdminOrAbove, currentUser, systemUsers, isManager]);

  const visibleQuotations = useMemo(() => {
    if (isAdminOrAbove || !currentUser) return quotations;
    return quotations.filter(isOwnedOrAssigned);
  }, [quotations, isAdminOrAbove, currentUser, systemUsers, isManager]);

  const visibleCustomers = useMemo(() => {
    return visibleCompanies.filter((c) => c.status === 'Customer' || c.isCustomer);
  }, [visibleCompanies]);

  const visibleTasks = useMemo(() => {
    if (isAdminOrAbove || !currentUser) return tasks;
    return tasks.filter(isOwnedOrAssigned);
  }, [tasks, isAdminOrAbove, currentUser, systemUsers, isManager]);

  // Counts for sidebar badges based on visible data
  const counts = {
    companies: visibleCompanies.length,
    contacts: visibleContacts.length,
    leads: visibleLeads.length,
    deals: visibleDeals.length,
    quotations: visibleQuotations.length,
    customers: visibleCustomers.length,
    tasks: visibleTasks.filter((t) => t.status !== 'Done').length,
    employees: isAdminOrAbove ? employees.length : (employees.some((e) => e.email.toLowerCase() === currentUser?.email?.toLowerCase()) ? 1 : 0),
    pendingLeaves: isAdminOrAbove
      ? leaveRequests.filter((l) => l.status === 'Pending').length
      : leaveRequests.filter(
          (l) =>
            l.status === 'Pending' &&
            currentUser?.email &&
            ((l.employeeName && currentUser.displayName && l.employeeName.toLowerCase() === currentUser.displayName.toLowerCase()) ||
              (l.employeeId && String(l.employeeId) === String(employees.find((e) => e.email.toLowerCase() === currentUser.email?.toLowerCase())?.id)))
        ).length
  };

  // If initial/current view is Landing Page, render full screen without Sidebar
  if (activeView === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
        <LandingPage
          onOpenApp={(view) => handleNavigate(view || 'dashboard')}
          onLoadDemoData={handleLoadDemoData}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUserProfile={currentUser}
          addToast={addToast}
          onAuthSuccess={(profile) => {
            setCurrentUser(profile);
            setIsAuthModalOpen(false);
            addToast(`Selamat datang kembali, ${profile.displayName || profile.email}! Role: ${profile.role}`, 'success');
            handleNavigate('dashboard');
          }}
        />

        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        activeHrisTab={activeHrisTab}
        setActiveView={handleNavigate}
        isOpenMobile={isOpenMobileSidebar}
        setIsOpenMobile={setIsOpenMobileSidebar}
        counts={counts}
        companyName={companyNameSetting}
        companyProfile={companyProfile}
        currentUser={currentUser}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Navbar */}
        <Navbar
          activeView={activeView}
          setActiveView={handleNavigate}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenSearch={(q) => {
            setSearchQuery(q);
            setIsSearchOpen(true);
          }}
          onOpenMobileMenu={() => setIsOpenMobileSidebar(true)}
          companyName={companyNameSetting}
          currency={currencySetting}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeView === 'dashboard' && (
            <DashboardView
              contacts={visibleContacts}
              leads={visibleLeads}
              deals={visibleDeals}
              tasks={visibleTasks}
              companies={visibleCompanies}
              quotations={visibleQuotations}
              customers={visibleCustomers}
              employees={employees}
              attendances={attendances}
              leaveRequests={leaveRequests}
              payrolls={payrolls}
              activities={activities}
              currency={currencySetting}
              companyProfile={companyProfile}
              currentUser={currentUser}
              onNavigate={handleNavigate}
              onOpenAddModal={(type) => {
                if (type === 'contact') handleNavigate('contacts');
                if (type === 'lead') handleNavigate('leads');
                if (type === 'deal') handleNavigate('deals');
                if (type === 'task') handleNavigate('tasks');
                if (type === 'quotation') handleNavigate('quotations');
                if (type === 'company') handleNavigate('companies');
              }}
              onToggleTaskStatus={handleToggleTaskStatus}
            />
          )}

          {activeView === 'hris' && (
            <HRISView
              initialTab={activeHrisTab}
              employees={employees}
              attendances={attendances}
              leaveRequests={leaveRequests}
              payrolls={payrolls}
              currency={currencySetting}
              companyProfile={companyProfile}
              currentUser={currentUser}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onAddAttendance={handleAddAttendance}
              onUpdateAttendance={handleUpdateAttendance}
              onDeleteAttendance={handleDeleteAttendance}
              onAddLeaveRequest={handleCreateLeaveRequest}
              onUpdateLeaveStatus={handleUpdateLeaveStatus}
              onDeleteLeaveRequest={handleDeleteLeaveRequest}
              onGenerateMonthlyPayroll={async (month, year) => {
                try {
                  const activeEmps = employees.filter((emp) => emp.status === 'Active');
                  if (activeEmps.length === 0) {
                    addToast('Tidak ada karyawan aktif untuk diproses payroll', 'info');
                    return;
                  }
                  let count = 0;
                  for (const emp of activeEmps) {
                    const payCalculated = calculateEmployeePayroll(emp, month, year, attendances);
                    await generateOrUpdatePayroll(payCalculated);
                    count++;
                  }
                  addToast(`Berhasil memproses & me-hitung PPh 21/BPJS payroll untuk ${count} karyawan aktif (${month}/${year})`, 'success');
                } catch (err: any) {
                  addToast(`Gagal memproses payroll: ${err.message}`, 'error');
                }
              }}
              onUpdatePayrollStatus={handleMarkPayrollPaid}
              onDeletePayroll={handleDeletePayroll}
            />
          )}

          {activeView === 'companies' && (
            <CompaniesView
              companies={visibleCompanies}
              contacts={visibleContacts}
              currentUser={currentUser}
              onAddCompany={handleAddCompany}
              onUpdateCompany={handleUpdateCompany}
              onDeleteCompany={handleDeleteCompany}
              onSelectCompany360={(comp) => setSelectedCustomer360Company(comp)}
            />
          )}

          {activeView === 'contacts' && (
            <ContactsView
              contacts={visibleContacts}
              companies={visibleCompanies}
              onAddContact={handleAddContact}
              onUpdateContact={handleUpdateContact}
              onDeleteContact={handleDeleteContact}
            />
          )}

          {activeView === 'leads' && (
            <LeadsView
              leads={visibleLeads}
              contacts={visibleContacts}
              companies={visibleCompanies}
              currentUser={currentUser}
              onAddLead={handleAddLead}
              onUpdateLead={handleUpdateLead}
              onDeleteLead={handleDeleteLead}
              onConvertLeadToDeal={handleConvertLeadToDeal}
            />
          )}

          {activeView === 'deals' && (
            <DealsView
              deals={visibleDeals}
              companies={visibleCompanies}
              contacts={visibleContacts}
              currentUser={currentUser}
              onAddDeal={handleAddDeal}
              onUpdateDeal={handleUpdateDeal}
              onDeleteDeal={handleDeleteDeal}
              onMarkDealWon={handleMarkDealWon}
              onMarkDealLost={handleMarkDealLost}
              onCreateQuotationForDeal={(deal) => {
                handleNavigate('quotations');
              }}
            />
          )}

          {activeView === 'quotations' && (
            <QuotationsView
              quotations={visibleQuotations}
              companies={visibleCompanies}
              contacts={visibleContacts}
              deals={visibleDeals}
              currentUser={currentUser}
              onAddQuotation={handleAddQuotation}
              onUpdateQuotation={handleUpdateQuotation}
              onDeleteQuotation={handleDeleteQuotation}
            />
          )}

          {activeView === 'customers' && (
            <CustomersView
              companies={visibleCompanies}
              deals={visibleDeals}
              quotations={visibleQuotations}
              onSelectCompany360={(comp) => setSelectedCustomer360Company(comp)}
            />
          )}

          {activeView === 'tasks' && (
            <TasksView
              tasks={visibleTasks}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onToggleTaskStatus={handleToggleTaskStatus}
            />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView
              deals={visibleDeals}
              leads={visibleLeads}
              contacts={visibleContacts}
              tasks={visibleTasks}
              pipelineStages={pipelineStages}
              currency={currencySetting}
            />
          )}

          {activeView === 'pipeline' && (
            <PipelineConfigView
              pipelineStages={pipelineStages}
              onAddStage={handleAddStage}
              onDeleteStage={handleDeleteStage}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              companyProfile={companyProfile}
              stats={{
                contactsCount: contacts.length,
                leadsCount: leads.length,
                dealsCount: deals.length,
                tasksCount: tasks.length,
                activitiesCount: activities.length
              }}
              currentUser={currentUser}
              addToast={addToast}
              onSaveCompanyProfile={handleSaveCompanyProfile}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onLoadDemoData={handleLoadDemoData}
              onClearAllData={handleClearAllData}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          )}
        </main>
      </div>

      {/* Customer 360 View Modal */}
      {selectedCustomer360Company && (
        <Customer360Modal
          company={selectedCustomer360Company}
          onClose={() => setSelectedCustomer360Company(null)}
          contacts={contacts}
          leads={leads}
          deals={deals}
          quotations={quotations}
          tasks={tasks}
          activities={activities}
          currentUser={currentUser}
          onAddContact={handleAddContact}
          onAddLead={handleAddLead}
          onAddDeal={handleAddDeal}
          onCreateQuotation={(dealId) => {
            setSelectedCustomer360Company(null);
            setActiveView('quotations');
          }}
          onAddTask={handleAddTask}
          onLogActivityWithFollowUp={async (actData) => {
            await logActivityWithFollowUp(actData);
            addToast('Aktivitas & Task Follow-up berhasil dicatat', 'success');
          }}
          onConvertLead={handleConvertLeadToDeal}
          onMarkDealWon={handleMarkDealWon}
          onMarkDealLost={(deal) => handleMarkDealLost(deal, 'Batal / Klien Tidak Merespons')}
        />
      )}

      {/* Floating Modals & Auth & Toasts */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSelect={(type) => {
          setIsQuickAddOpen(false);
          if (type === 'employee') setActiveView('hris');
          if (type === 'company') setActiveView('companies');
          if (type === 'contact') setActiveView('contacts');
          if (type === 'lead') setActiveView('leads');
          if (type === 'deal') setActiveView('deals');
          if (type === 'task') setActiveView('tasks');
        }}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        companies={companies}
        contacts={contacts}
        leads={leads}
        deals={deals}
        quotations={quotations}
        onSelectCompany360={(comp) => setSelectedCustomer360Company(comp)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUserProfile={currentUser}
        addToast={addToast}
        onAuthSuccess={(profile) => {
          setCurrentUser(profile);
          setIsAuthModalOpen(false);
          addToast(`Selamat datang kembali, ${profile.displayName || profile.email}! Role: ${profile.role}`, 'success');
        }}
      />

      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        variant={confirmModalConfig.variant}
        confirmText={confirmModalConfig.confirmText}
        cancelText={confirmModalConfig.cancelText}
        onConfirm={confirmModalConfig.onConfirm}
        onCancel={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onClose={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
