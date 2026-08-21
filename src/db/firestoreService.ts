import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Company,
  Contact,
  Lead,
  Deal,
  Quotation,
  Task,
  Activity,
  ActivityType,
  PipelineStage,
  AppSetting,
  Employee,
  Attendance,
  LeaveRequest,
  Payroll,
  UserProfile,
  Invitation,
  UserRole,
  CompanyProfile,
  DEFAULT_COMPANY_PROFILE
} from '../types/crm';

// Default Stages and Colors
export const DEF_LEAD_STAGES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'NEED ANALYSIS',
  'MEETING / SURVEY',
  'PROPOSAL REQUIRED',
  'CONVERTED',
  'LOST'
];

export const DEF_DEAL_STAGES = [
  'QUALIFICATION',
  'SURVEY / MEETING',
  'PROPOSAL',
  'NEGOTIATION',
  'APPROVAL',
  'PO / SPK',
  'WON',
  'LOST'
];

export const STAGE_PROBABILITIES: Record<string, number> = {
  'QUALIFICATION': 20,
  'SURVEY / MEETING': 40,
  'PROPOSAL': 60,
  'NEGOTIATION': 75,
  'APPROVAL': 90,
  'PO / SPK': 95,
  'WON': 100,
  'LOST': 0,
  'Prospecting': 20,
  'Qualification': 20,
  'Proposal': 60,
  'Negotiation': 75,
  'Closed Won': 100,
  'Closed Lost': 0
};

export const STAGE_COLORS = [
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#16A34A', // Green
  '#EF4444'  // Red
];

// Helper to convert Firestore snapshots
const snapshotToArray = <T>(snapshot: any): T[] => {
  return snapshot.docs.map((docSnap: any) => ({
    id: docSnap.id,
    ...docSnap.data()
  })) as T[];
};

// ==========================================
// --- USER & INVITATION MANAGEMENT ---
// ==========================================

export function isDeveloperOrSystemAdminEmail(email?: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean === 'andrymahardika@gmail.com' || clean.startsWith('andrymahardika@') || clean.includes('andrymahardika');
}

export async function findRegisteredUserOrEmployee(email: string): Promise<{ profile?: UserProfile; employee?: Employee } | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;

  // 0. App Developer / System Owner Bypass (Always granted Super Admin)
  if (isDeveloperOrSystemAdminEmail(cleanEmail)) {
    return {
      profile: {
        uid: '',
        email: cleanEmail,
        displayName: 'Andry Mahardika',
        role: 'Super Admin',
        status: 'Active',
        joinedAt: new Date().toISOString(),
        invitedBy: 'System Owner / Super Admin'
      }
    };
  }
  
  // 1. Check users collection by email
  const usersRef = collection(db, 'users');
  const userQ = query(usersRef, where('email', '==', cleanEmail));
  const userSnap = await getDocs(userQ);
  if (!userSnap.empty) {
    const docSnap = userSnap.docs[0];
    return { profile: { uid: docSnap.id, ...docSnap.data() } as UserProfile };
  }

  // 2. Check employees collection by email
  const empRef = collection(db, 'employees');
  const empQ = query(empRef, where('email', '==', cleanEmail));
  const empSnap = await getDocs(empQ);
  if (!empSnap.empty) {
    const empDoc = empSnap.docs[0];
    return { employee: { id: empDoc.id, ...empDoc.data() } as Employee };
  }

  return null;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', uid);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { uid: snap.id, ...snap.data() } as UserProfile;
  }
  return null;
}

export async function checkHasAnyUsers(): Promise<boolean> {
  const usersRef = collection(db, 'users');
  const snap = await getDocs(query(usersRef, limit(1)));
  return !snap.empty;
}

export async function findPendingInvitationForEmail(email: string): Promise<Invitation | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;

  try {
    const invRef = collection(db, 'invitations');
    // Fetch pending invitations and match email case-insensitively
    const q = query(invRef, where('status', '==', 'Pending'));
    const snap = await getDocs(q);
    
    for (const docSnap of snap.docs) {
      const data = docSnap.data() as Invitation;
      if (data.email && data.email.trim().toLowerCase() === cleanEmail) {
        return { id: docSnap.id, ...data };
      }
    }
    return null;
  } catch (err) {
    console.warn('Error querying pending invitation by email:', err);
    return null;
  }
}

export async function claimInvitationForUser(
  uid: string,
  email: string,
  displayName: string,
  invitation: Invitation
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const role: UserRole = invitation.role || 'Staff';
  const invitedBy = invitation.createdByName || invitation.createdBy || 'Admin';
  const managerId = invitation.managerId || '';
  const managerName = invitation.managerName || '';
  const managerEmail = invitation.managerEmail || '';

  const newProfile: UserProfile = {
    uid,
    email: cleanEmail,
    displayName: displayName || cleanEmail.split('@')[0],
    role,
    status: 'Active',
    joinedAt: new Date().toISOString(),
    invitedBy,
    ...(managerId ? { managerId, managerName, managerEmail } : {})
  };

  await setDoc(doc(db, 'users', uid), cleanData(newProfile));

  if (invitation.id) {
    await updateDoc(doc(db, 'invitations', invitation.id), {
      status: 'Used',
      usedBy: uid,
      usedAt: new Date().toISOString()
    });
  }

  await logActivity('system', `User baru mendaftar via undangan (${cleanEmail}) sebagai ${role}`, 'user', uid);
  return newProfile;
}

export async function verifyInvitationCode(code: string, email?: string): Promise<Invitation | null> {
  const cleanCode = code.trim().toUpperCase();
  const invRef = collection(db, 'invitations');
  const q = query(invRef, where('code', '==', cleanCode), where('status', '==', 'Pending'));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    return null;
  }
  
  const invDoc = snap.docs[0];
  const invData = { id: invDoc.id, ...invDoc.data() } as Invitation;
  
  // Optional email restriction check
  if (invData.email && email && invData.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
    return null;
  }
  
  return invData;
}

export async function createUserProfileWithInvitation(
  uid: string,
  email: string,
  displayName: string,
  invitationCode?: string
): Promise<UserProfile> {
  let role: UserRole = 'Staff';
  let invitedBy = '';
  let managerId = '';
  let managerName = '';
  let managerEmail = '';
  
  // Check if first user in system
  const hasUsers = await checkHasAnyUsers();
  if (!hasUsers) {
    // First user is automatically Super Admin!
    role = 'Admin';
  } else if (invitationCode) {
    const invData = await verifyInvitationCode(invitationCode, email);
    if (!invData) {
      throw new Error('Kode undangan tidak valid, sudah digunakan, atau telah kedaluwarsa.');
    }
    role = invData.role;
    invitedBy = invData.createdByName || invData.createdBy;
    if (invData.managerId) {
      managerId = invData.managerId;
      managerName = invData.managerName || '';
      managerEmail = invData.managerEmail || '';
    }
    
    // Mark invitation as Used
    if (invData.id) {
      await updateDoc(doc(db, 'invitations', invData.id), {
        status: 'Used',
        usedBy: uid,
        usedAt: new Date().toISOString()
      });
    }
  } else {
    throw new Error('Kode undangan diperlukan untuk mendaftar ke internal perusahaan.');
  }

  const newProfile: UserProfile = {
    uid,
    email,
    displayName: displayName || email.split('@')[0],
    role,
    status: 'Active',
    joinedAt: new Date().toISOString(),
    invitedBy,
    ...(managerId ? { managerId, managerName, managerEmail } : {})
  };

  await setDoc(doc(db, 'users', uid), cleanData(newProfile));
  await logActivity('system', `User baru mendaftar (${email}) sebagai ${role}`, 'user', uid);
  return newProfile;
}

export async function createInvitation(
  createdByUid: string,
  createdByName: string,
  role: UserRole,
  email?: string,
  managerId?: string,
  managerName?: string,
  managerEmail?: string
): Promise<Invitation> {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const now = new Date().toISOString();
  
  const newInv: Omit<Invitation, 'id'> = {
    code,
    email: email ? email.trim() : '',
    role,
    status: 'Pending',
    createdBy: createdByUid,
    createdByName,
    createdAt: now,
    ...(managerId ? { managerId, managerName, managerEmail } : {})
  };

  const docRef = await addDoc(collection(db, 'invitations'), cleanData(newInv));
  await logActivity('system', `${createdByName} membuat kode undangan ${code} (${role})`, 'invitation', docRef.id);
  
  return { id: docRef.id, ...newInv };
}

export function subscribeInvitations(callback: (invitations: Invitation[]) => void) {
  const q = query(collection(db, 'invitations'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshotToArray<Invitation>(snapshot));
    },
    (error) => {
      console.warn('Invitations subscription error:', error.message);
    }
  );
}

export async function revokeInvitation(invitationId: string) {
  await updateDoc(doc(db, 'invitations', invitationId), {
    status: 'Expired'
  });
}

export function subscribeUsers(callback: (users: UserProfile[]) => void) {
  const q = query(collection(db, 'users'), orderBy('joinedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshotToArray<UserProfile>(snapshot));
    },
    (error) => {
      console.warn('Users subscription error:', error.message);
    }
  );
}

export async function updateUserRole(uid: string, newRole: UserRole) {
  await updateDoc(doc(db, 'users', uid), { role: newRole });
  await logActivity('system', `Memperbarui peran user ${uid} menjadi ${newRole}`, 'user', uid);
}

export async function updateUserManager(
  uid: string,
  managerId?: string,
  managerName?: string,
  managerEmail?: string
) {
  await updateDoc(doc(db, 'users', uid), {
    managerId: managerId || '',
    managerName: managerName || '',
    managerEmail: managerEmail || ''
  });
  await logActivity('system', `Memperbarui atasan manager user ${uid} menjadi ${managerName || 'Kosong'}`, 'user', uid);
}

export async function updateUserStatus(uid: string, newStatus: 'Active' | 'Suspended') {
  await updateDoc(doc(db, 'users', uid), { status: newStatus });
  await logActivity('system', `Mengubah status user ${uid} menjadi ${newStatus}`, 'user', uid);
}

export async function deleteUserProfile(
  uid: string,
  actorName?: string,
  userEmail?: string,
  userRole?: string
) {
  await deleteDoc(doc(db, 'users', uid));

  // Revoke any invitations associated with this email
  if (userEmail) {
    try {
      const invRef = collection(db, 'invitations');
      const q = query(invRef, where('email', '==', userEmail.trim().toLowerCase()));
      const snap = await getDocs(q);
      for (const docSnap of snap.docs) {
        await updateDoc(doc(db, 'invitations', docSnap.id), {
          status: 'Expired'
        });
      }
    } catch (err) {
      console.warn('Could not revoke related invitations for deleted user:', err);
    }
  }

  await logActivity(
    'system',
    `${actorName || 'Admin'} menghapus akun pengguna terdaftar: ${userEmail || uid} (${userRole || 'User'})`,
    'user',
    uid
  );
}

// ==========================================
// --- REAL-TIME SUBSCRIBERS FOR COLLECTIONS ---
// ==========================================

export function subscribeCompanies(callback: (companies: Company[]) => void) {
  const q = query(collection(db, 'companies'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => callback(snapshotToArray<Company>(snap)),
    (err) => console.warn('Companies subscription error:', err.message)
  );
}

export function subscribeQuotations(callback: (quotations: Quotation[]) => void) {
  const q = query(collection(db, 'quotations'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => callback(snapshotToArray<Quotation>(snap)),
    (err) => console.warn('Quotations subscription error:', err.message)
  );
}

export function subscribeContacts(callback: (contacts: Contact[]) => void) {
  const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => callback(snapshotToArray<Contact>(snap)),
    (err) => console.warn('Contacts subscription error:', err.message)
  );
}

export function subscribeLeads(callback: (leads: Lead[]) => void) {
  const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => callback(snapshotToArray<Lead>(snap)),
    (err) => console.warn('Leads subscription error:', err.message)
  );
}

export function subscribeDeals(callback: (deals: Deal[]) => void) {
  const q = query(collection(db, 'deals'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => callback(snapshotToArray<Deal>(snap)),
    (err) => console.warn('Deals subscription error:', err.message)
  );
}

export function subscribeTasks(callback: (tasks: Task[]) => void) {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => callback(snapshotToArray<Task>(snap)),
    (err) => console.warn('Tasks subscription error:', err.message)
  );
}

export function subscribeActivities(callback: (activities: Activity[]) => void) {
  const q = query(collection(db, 'activities'), orderBy('timestamp', 'desc'), limit(100));
  return onSnapshot(
    q,
    (snap) => callback(snapshotToArray<Activity>(snap)),
    (err) => console.warn('Activities subscription error:', err.message)
  );
}

export function subscribePipelineStages(callback: (stages: PipelineStage[]) => void) {
  const q = query(collection(db, 'pipelineStages'), orderBy('order', 'asc'));
  return onSnapshot(
    q,
    (snap) => callback(snapshotToArray<PipelineStage>(snap)),
    (err) => console.warn('PipelineStages subscription error:', err.message)
  );
}

export function subscribeSettings(callback: (settingsMap: Record<string, string>) => void) {
  return onSnapshot(
    collection(db, 'settings'),
    (snap) => {
      const map: Record<string, string> = {};
      snap.docs.forEach((doc) => {
        const data = doc.data();
        if (data.key && data.value !== undefined) {
          map[data.key] = data.value;
        }
      });
      callback(map);
    },
    (err) => console.warn('Settings subscription error:', err.message)
  );
}

export function subscribeEmployees(callback: (employees: Employee[]) => void) {
  const q = query(collection(db, 'employees'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => callback(snapshotToArray<Employee>(snap)),
    (err) => console.warn('Employees subscription error:', err.message)
  );
}

export function subscribeAttendances(callback: (attendances: Attendance[]) => void) {
  const q = query(collection(db, 'attendances'), orderBy('date', 'desc'));
  return onSnapshot(
    q,
    (snap) => callback(snapshotToArray<Attendance>(snap)),
    (err) => console.warn('Attendances subscription error:', err.message)
  );
}

export function subscribeLeaveRequests(callback: (requests: LeaveRequest[]) => void) {
  const q = query(collection(db, 'leaveRequests'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => callback(snapshotToArray<LeaveRequest>(snap)),
    (err) => console.warn('LeaveRequests subscription error:', err.message)
  );
}

export function subscribePayrolls(callback: (payrolls: Payroll[]) => void) {
  const q = query(collection(db, 'payrolls'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => callback(snapshotToArray<Payroll>(snap)),
    (err) => console.warn('Payrolls subscription error:', err.message)
  );
}

// ==========================================
// --- CRUD OPERATIONS FOR CRM & HRIS ---
// ==========================================

export async function logActivity(
  type: Activity['type'],
  description: string,
  entityType?: string,
  entityId?: string | number,
  extraData?: Partial<Activity>
) {
  try {
    const rawData = {
      type,
      description,
      entityType: entityType || '',
      entityId: entityId ? String(entityId) : '',
      timestamp: new Date().toISOString(),
      ...(extraData || {})
    };
    await addDoc(collection(db, 'activities'), cleanData(rawData));
  } catch (err) {
    console.error('Failed to log activity to Firestore', err);
  }
}

// Helper to sanitize objects for Firestore (removes undefined values)
function cleanData<T extends object>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    const value = (obj as any)[key];
    if (value !== undefined) {
      result[key] = value;
    }
  });
  return result;
}

// Companies
export async function addCompany(data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  const payload = cleanData(data);
  const docRef = await addDoc(collection(db, 'companies'), {
    ...payload,
    createdAt: now,
    updatedAt: now
  });
  await logActivity('company', `Menambahkan Perusahaan baru: ${data.name}`, 'company', docRef.id, { companyId: docRef.id });
  return docRef.id;
}

export async function updateCompany(id: string, data: Partial<Company>) {
  const now = new Date().toISOString();
  const payload = cleanData(data);
  await updateDoc(doc(db, 'companies', id), {
    ...payload,
    updatedAt: now
  });
  await logActivity('company', `Memperbarui Perusahaan: ${data.name || 'ID #' + id}`, 'company', id, { companyId: id });
}

export async function deleteCompany(id: string) {
  await deleteDoc(doc(db, 'companies', id));
  await logActivity('company', `Menghapus Perusahaan ID #${id}`, 'company', id);
}

// Contacts
export async function addContact(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'contacts'), {
    ...data,
    createdAt: now,
    updatedAt: now
  });
  await logActivity('contact', `Menambahkan kontak baru PIC: ${data.name} (${data.company})`, 'contact', docRef.id, {
    contactId: docRef.id,
    companyId: data.companyId
  });
  return docRef.id;
}

export async function updateContact(id: string, data: Partial<Contact>) {
  const now = new Date().toISOString();
  await updateDoc(doc(db, 'contacts', id), {
    ...data,
    updatedAt: now
  });
  await logActivity('contact', `Memperbarui kontak PIC: ${data.name || 'ID #' + id}`, 'contact', id, { contactId: id });
}

export async function deleteContact(id: string) {
  await deleteDoc(doc(db, 'contacts', id));
  await logActivity('contact', `Menghapus kontak ID #${id}`, 'contact', id);
}

// Leads
export async function addLead(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'leads'), {
    ...data,
    createdAt: now,
    updatedAt: now
  });
  await logActivity('lead', `Lead dibuat: ${data.company} - ${data.name}`, 'lead', docRef.id, {
    activityType: 'Lead Created',
    companyId: data.companyId,
    contactId: data.contactId,
    leadId: docRef.id
  });
  return docRef.id;
}

export async function updateLead(id: string, data: Partial<Lead>) {
  const now = new Date().toISOString();
  await updateDoc(doc(db, 'leads', id), {
    ...data,
    updatedAt: now
  });
  if (data.stage) {
    await logActivity('lead', `Stage Lead berubah menjadi "${data.stage}"`, 'lead', id, {
      activityType: 'Status Changed',
      leadId: id
    });
  }
}

export async function deleteLead(id: string) {
  await deleteDoc(doc(db, 'leads', id));
  await logActivity('lead', `Menghapus lead ID #${id}`, 'lead', id);
}

// Convert Lead to Deal (End-to-End Workflow Rule)
export async function convertLeadToDeal(lead: Lead, customDealData?: Partial<Deal>) {
  const now = new Date().toISOString();
  
  // 1. Update Lead stage to CONVERTED
  if (lead.id) {
    await updateDoc(doc(db, 'leads', String(lead.id)), {
      stage: 'CONVERTED',
      updatedAt: now
    });
  }

  // 2. Prepare Deal Title & Values
  const dealTitle = customDealData?.title || `${lead.company || lead.name} - ${lead.productService || 'Peluang Baru'}`;
  const dealValue = customDealData?.value !== undefined ? customDealData.value : (lead.estimatedValue || 0);

  // 3. Create Deal record
  const dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'> = {
    dealNumber: `DEAL-${Date.now().toString().slice(-6)}`,
    title: dealTitle,
    company: lead.company,
    companyId: lead.companyId,
    contactId: lead.contactId,
    leadId: lead.id,
    contactName: lead.name,
    productService: lead.productService,
    value: dealValue,
    stage: 'QUALIFICATION',
    probability: STAGE_PROBABILITIES['QUALIFICATION'] || 20,
    expectedClose: customDealData?.expectedClose || lead.expectedClosingDate || '',
    assignedTo: lead.assignedTo || customDealData?.assignedTo || '',
    notes: customDealData?.notes || lead.notes || ''
  };

  const dealDocRef = await addDoc(collection(db, 'deals'), {
    ...dealData,
    createdAt: now,
    updatedAt: now
  });

  // 4. Log Activity Rule: Lead Converted
  await logActivity('deal', `Lead "${lead.name}" (${lead.company}) dikonversi menjadi Deal: ${dealTitle}`, 'deal', dealDocRef.id, {
    activityType: 'Status Changed',
    leadId: lead.id,
    dealId: dealDocRef.id,
    companyId: lead.companyId,
    contactId: lead.contactId
  });

  // 5. Automation Rule 4: Deal dibuat -> Otomatis membuat Task "Initial Follow Up"
  await addTask({
    title: `Initial Follow Up Deal - ${dealTitle}`,
    description: `Follow up awal untuk deal baru yang dikonversi dari Lead ${lead.name}`,
    status: 'Todo',
    priority: 'High',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedTo: dealData.assignedTo || 'Tim Sales',
    relatedType: 'deal',
    relatedId: dealDocRef.id,
    dealId: dealDocRef.id,
    companyId: lead.companyId,
    contactId: lead.contactId,
    leadId: lead.id
  });

  return dealDocRef.id;
}

// Deals
export async function addDeal(data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  const prob = data.probability ?? (STAGE_PROBABILITIES[data.stage] || 20);
  const docRef = await addDoc(collection(db, 'deals'), {
    ...data,
    dealNumber: data.dealNumber || `DEAL-${Date.now().toString().slice(-6)}`,
    probability: prob,
    createdAt: now,
    updatedAt: now
  });

  await logActivity('deal', `Deal dibuat: ${data.title} (Rp ${(data.value || 0).toLocaleString('id-ID')})`, 'deal', docRef.id, {
    activityType: 'Status Changed',
    dealId: docRef.id,
    companyId: data.companyId,
    contactId: data.contactId,
    leadId: data.leadId
  });

  // Automation Rule 4: Deal dibuat -> Otomatis membuat Task Initial Follow Up
  await addTask({
    title: `Initial Follow Up - ${data.title}`,
    description: `Follow up awal untuk deal baru`,
    status: 'Todo',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedTo: data.assignedTo || 'Sales',
    relatedType: 'deal',
    relatedId: docRef.id,
    dealId: docRef.id,
    companyId: data.companyId,
    contactId: data.contactId
  });

  return docRef.id;
}

export async function updateDeal(id: string, data: Partial<Deal>) {
  const now = new Date().toISOString();
  const updatePayload: any = {
    ...data,
    updatedAt: now
  };

  if (data.stage && STAGE_PROBABILITIES[data.stage] !== undefined && data.probability === undefined) {
    updatePayload.probability = STAGE_PROBABILITIES[data.stage];
  }

  await updateDoc(doc(db, 'deals', id), updatePayload);

  if (data.stage) {
    await logActivity('deal', `Stage Deal diperbarui menjadi "${data.stage}"`, 'deal', id, {
      activityType: 'Status Changed',
      dealId: id
    });
  }
}

// Mark Deal Won (Automation Rule 9)
export async function markDealWon(dealId: string, deal: Deal) {
  const now = new Date().toISOString();
  const wonDate = now.split('T')[0];

  // 1. Update deal stage to WON and probability to 100%
  await updateDoc(doc(db, 'deals', dealId), {
    stage: 'WON',
    probability: 100,
    wonDate,
    updatedAt: now
  });

  // 2. Mark Company or Contact as Customer
  if (deal.companyId) {
    await updateDoc(doc(db, 'companies', String(deal.companyId)), {
      isCustomer: true,
      updatedAt: now
    }).catch(() => {});
  }

  if (deal.contactId) {
    await updateDoc(doc(db, 'contacts', String(deal.contactId)), {
      type: 'Customer',
      updatedAt: now
    }).catch(() => {});
  }

  // 3. Log Activity "Deal Won"
  await logActivity('deal', `🎉 DEAL WON! ${deal.title} senilai Rp ${(deal.value || 0).toLocaleString('id-ID')} resmi closing!`, 'deal', dealId, {
    activityType: 'Deal Won',
    dealId,
    companyId: deal.companyId,
    contactId: deal.contactId
  });
}

// Mark Deal Lost (Automation Rule 10)
export async function markDealLost(dealId: string, deal: Deal, lostReason: string) {
  const now = new Date().toISOString();

  // 1. Update deal stage to LOST and probability to 0%
  await updateDoc(doc(db, 'deals', dealId), {
    stage: 'LOST',
    probability: 0,
    lostReason,
    updatedAt: now
  });

  // 2. Log Activity "Deal Lost"
  await logActivity('deal', `❌ DEAL LOST: ${deal.title}. Alasan: ${lostReason}`, 'deal', dealId, {
    activityType: 'Deal Lost',
    dealId,
    companyId: deal.companyId,
    contactId: deal.contactId
  });
}

export async function deleteDeal(id: string) {
  await deleteDoc(doc(db, 'deals', id));
  await logActivity('deal', `Menghapus deal ID #${id}`, 'deal', id);
}

// Quotations
export async function addQuotation(data: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'quotations'), {
    ...data,
    createdAt: now,
    updatedAt: now
  });

  // Log Activity Rule 5: Quotation dibuat -> otomatis buat Activity "Quotation Created"
  await logActivity('quotation', `Penawaran/Quotation dibuat: ${data.quotationNumber} untuk ${data.companyName} (Rp ${data.grandTotal.toLocaleString('id-ID')})`, 'quotation', docRef.id, {
    activityType: 'Quotation Created',
    quotationId: docRef.id,
    dealId: data.dealId,
    companyId: data.companyId,
    contactId: data.contactId
  });

  return docRef.id;
}

export async function updateQuotation(id: string, data: Partial<Quotation>) {
  const now = new Date().toISOString();
  await updateDoc(doc(db, 'quotations', id), {
    ...data,
    updatedAt: now
  });

  if (data.status) {
    const actType = data.status === 'SENT' ? 'Quotation Sent' : 'Status Changed';
    await logActivity('quotation', `Status Quotation #${data.quotationNumber || id} diubah menjadi "${data.status}"`, 'quotation', id, {
      activityType: actType,
      quotationId: id,
      dealId: data.dealId
    });

    // Workflow Rule 10: If Quotation ACCEPTED -> Auto move Deal stage to NEGOTIATION / APPROVAL
    if (data.status === 'ACCEPTED' && data.dealId) {
      await updateDoc(doc(db, 'deals', String(data.dealId)), {
        stage: 'APPROVAL',
        probability: STAGE_PROBABILITIES['APPROVAL'] || 90,
        updatedAt: now
      }).catch(() => {});
      
      await logActivity('deal', `Quotation #${data.quotationNumber || id} DITERIMA! Deal otomatis naik ke stage APPROVAL.`, 'deal', String(data.dealId), {
        activityType: 'Status Changed',
        dealId: data.dealId,
        quotationId: id
      });
    }
  }
}

export async function deleteQuotation(id: string) {
  await deleteDoc(doc(db, 'quotations', id));
  await logActivity('quotation', `Menghapus quotation ID #${id}`, 'quotation', id);
}

// Tasks & Automatic Follow-Up
export async function addTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'tasks'), {
    ...data,
    createdAt: now,
    updatedAt: now
  });
  await logActivity('task', `Menambahkan tugas baru: ${data.title}`, 'task', docRef.id, {
    companyId: data.companyId,
    contactId: data.contactId,
    leadId: data.leadId,
    dealId: data.dealId
  });
  return docRef.id;
}

export async function updateTask(id: string, data: Partial<Task>) {
  const now = new Date().toISOString();
  await updateDoc(doc(db, 'tasks', id), {
    ...data,
    updatedAt: now
  });
  await logActivity('task', `Memperbarui tugas: ${data.title || 'ID #' + id} (${data.status || 'Updated'})`, 'task', id);
}

// Automatic Follow-Up Logger
export async function logActivityWithFollowUp(activityData: {
  type: Activity['type'];
  activityType: ActivityType;
  description: string;
  companyId?: string | number;
  contactId?: string | number;
  leadId?: string | number;
  dealId?: string | number;
  quotationId?: string | number;
  createdByName?: string;
  nextFollowUpDate?: string;
  nextFollowUpTask?: string;
}) {
  const now = new Date().toISOString();
  await addDoc(collection(db, 'activities'), {
    ...activityData,
    timestamp: now
  });

  // If next follow up date is set, automatically create task (Rule 8)
  if (activityData.nextFollowUpDate) {
    const taskTitle = activityData.nextFollowUpTask || `Follow up: ${activityData.description}`;
    await addTask({
      title: taskTitle,
      description: `Otomatis dibuat dari aktivitas "${activityData.activityType}"`,
      status: 'Todo',
      priority: 'Medium',
      dueDate: activityData.nextFollowUpDate,
      assignedTo: activityData.createdByName || 'Sales',
      relatedType: activityData.dealId ? 'deal' : activityData.leadId ? 'lead' : 'contact',
      relatedId: activityData.dealId || activityData.leadId || activityData.contactId,
      companyId: activityData.companyId,
      contactId: activityData.contactId,
      leadId: activityData.leadId,
      dealId: activityData.dealId
    });
  }
}

export async function deleteTask(id: string) {
  await deleteDoc(doc(db, 'tasks', id));
  await logActivity('task', `Menghapus tugas ID #${id}`, 'task', id);
}

// Pipeline Stages
export async function addPipelineStage(data: Omit<PipelineStage, 'id'>) {
  const docRef = await addDoc(collection(db, 'pipelineStages'), data);
  return docRef.id;
}

export async function updatePipelineStage(id: string, data: Partial<PipelineStage>) {
  await updateDoc(doc(db, 'pipelineStages', id), data);
}

export async function deletePipelineStage(id: string) {
  await deleteDoc(doc(db, 'pipelineStages', id));
}

// Settings & Company Profile
export async function setAppSetting(key: string, value: string) {
  await setDoc(doc(db, 'settings', key), { key, value });
  await logActivity('system', `Memperbarui pengatur sistem: ${key} = ${value}`, 'setting', key);
}

export async function saveCompanyProfile(profile: Partial<CompanyProfile>) {
  const batch = writeBatch(db);
  const entries = Object.entries(profile);
  
  for (const [key, value] of entries) {
    if (value !== undefined) {
      const settingRef = doc(db, 'settings', key);
      batch.set(settingRef, { key, value: String(value) });
    }
  }
  
  // Also save the entire companyProfile doc for structured querying
  const profileRef = doc(db, 'settings', 'companyProfile');
  batch.set(profileRef, {
    key: 'companyProfile',
    ...cleanData(profile),
    updatedAt: new Date().toISOString()
  });

  await batch.commit();
  await logActivity('system', `Memperbarui Profil & Identitas Perusahaan (${profile.legalName || profile.companyName || 'Sistem'})`, 'setting', 'companyProfile');
}

// HRIS Employees
export async function addEmployee(data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'employees'), cleanData({
    ...data,
    createdAt: now,
    updatedAt: now
  }));
  await logActivity('hris', `Menambahkan karyawan baru HRIS: ${data.name} (${data.employeeCode})`, 'employee', docRef.id);
  return docRef.id;
}

export async function updateEmployee(id: string, data: Partial<Employee>) {
  const now = new Date().toISOString();
  await updateDoc(doc(db, 'employees', id), cleanData({
    ...data,
    updatedAt: now
  }));
  await logActivity('hris', `Memperbarui data karyawan ${data.name || 'ID #' + id}`, 'employee', id);
}

export async function deleteEmployee(id: string) {
  await deleteDoc(doc(db, 'employees', id));
  await logActivity('hris', `Menghapus karyawan HRIS ID #${id}`, 'employee', id);
}

// HRIS Attendances
export async function addOrUpdateAttendance(data: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  const cleanPayload = cleanData(data);

  // Query attendances for the given date or fetch collection
  const attRef = collection(db, 'attendances');
  let snap;
  try {
    const q = query(attRef, where('date', '==', data.date));
    snap = await getDocs(q);
  } catch (err) {
    snap = await getDocs(attRef);
  }

  const existingDoc = snap.docs.find(
    (d) =>
      d.data().date === data.date &&
      String(d.data().employeeId) === String(data.employeeId)
  );

  if (existingDoc) {
    const existingData = existingDoc.data();
    const updatePayload = cleanData({
      checkIn: data.checkIn || existingData.checkIn,
      checkOut: data.checkOut || existingData.checkOut,
      status: data.status || existingData.status,
      hoursWorked: data.hoursWorked !== undefined ? data.hoursWorked : existingData.hoursWorked,
      overtimeHours: data.overtimeHours !== undefined ? data.overtimeHours : existingData.overtimeHours,
      notes: data.notes || existingData.notes,
      workLocation: data.workLocation || existingData.workLocation,
      checkInPhoto: data.checkInPhoto || existingData.checkInPhoto,
      checkOutPhoto: data.checkOutPhoto || existingData.checkOutPhoto,
      photoUrl: data.photoUrl || existingData.photoUrl,
      latitude: data.latitude !== undefined ? data.latitude : existingData.latitude,
      longitude: data.longitude !== undefined ? data.longitude : existingData.longitude,
      locationAddress: data.locationAddress || existingData.locationAddress,
      geotag: data.geotag || existingData.geotag,
      updatedAt: now
    });
    await updateDoc(doc(db, 'attendances', existingDoc.id), updatePayload);
    return existingDoc.id;
  } else {
    const docRef = await addDoc(collection(db, 'attendances'), cleanData({
      ...cleanPayload,
      createdAt: now,
      updatedAt: now
    }));
    return docRef.id;
  }
}

export async function updateAttendance(id: string, data: Partial<Attendance>) {
  const now = new Date().toISOString();
  const cleanPayload = cleanData({
    ...data,
    updatedAt: now
  });

  const isTemp = !id || String(id).startsWith('temp-');

  if (isTemp) {
    if (data.employeeId && data.date) {
      const attRef = collection(db, 'attendances');
      const snap = await getDocs(attRef);
      const existingDoc = snap.docs.find(
        (d) =>
          d.data().date === data.date &&
          String(d.data().employeeId) === String(data.employeeId)
      );
      if (existingDoc) {
        await updateDoc(doc(db, 'attendances', existingDoc.id), cleanPayload);
        return existingDoc.id;
      }
    }
    const docRef = await addDoc(collection(db, 'attendances'), cleanData({
      ...data,
      createdAt: now,
      updatedAt: now
    }));
    return docRef.id;
  } else {
    try {
      await updateDoc(doc(db, 'attendances', id), cleanPayload);
      return id;
    } catch (err) {
      console.warn(`Doc #${id} not found directly, falling back to lookup by employeeId and date`, err);
      if (data.employeeId && data.date) {
        const attRef = collection(db, 'attendances');
        const snap = await getDocs(attRef);
        const existingDoc = snap.docs.find(
          (d) =>
            d.data().date === data.date &&
            String(d.data().employeeId) === String(data.employeeId)
        );
        if (existingDoc) {
          await updateDoc(doc(db, 'attendances', existingDoc.id), cleanPayload);
          return existingDoc.id;
        }
      }
      throw err;
    }
  }
}

export async function deleteAttendance(id: string) {
  await deleteDoc(doc(db, 'attendances', id));
  await logActivity('hris', `Menghapus data presensi ID #${id}`, 'attendance', id);
}

// HRIS Leave Requests
export async function createLeaveRequest(data: Omit<LeaveRequest, 'id' | 'createdAt'>) {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'leaveRequests'), cleanData({
    ...data,
    createdAt: now
  }));
  await logActivity('hris', `Pengajuan cuti/izin baru oleh ${data.employeeName} (${data.leaveType})`, 'leave', docRef.id);
  return docRef.id;
}

export async function updateLeaveStatus(id: string, status: 'Approved' | 'Rejected', approvedBy?: string) {
  await updateDoc(doc(db, 'leaveRequests', id), cleanData({
    status,
    approvedBy: approvedBy || 'HR Admin'
  }));
  await logActivity('hris', `Pengajuan cuti ID #${id} diubah statusnya menjadi ${status}`, 'leave', id);
}

export async function deleteLeaveRequest(id: string) {
  await deleteDoc(doc(db, 'leaveRequests', id));
  await logActivity('hris', `Menghapus pengajuan cuti ID #${id}`, 'leave', id);
}

// HRIS Payroll
export async function generateOrUpdatePayroll(data: Omit<Payroll, 'id' | 'createdAt'>) {
  const now = new Date().toISOString();
  const payRef = collection(db, 'payrolls');
  const q = query(payRef, where('employeeId', '==', data.employeeId), where('month', '==', data.month), where('year', '==', data.year));
  const snap = await getDocs(q);

  if (!snap.empty) {
    const existingDoc = snap.docs[0];
    await updateDoc(doc(db, 'payrolls', existingDoc.id), cleanData({
      ...data
    }));
    return existingDoc.id;
  } else {
    const docRef = await addDoc(collection(db, 'payrolls'), cleanData({
      ...data,
      createdAt: now
    }));
    return docRef.id;
  }
}

export async function markPayrollPaid(id: string) {
  const now = new Date().toISOString();
  await updateDoc(doc(db, 'payrolls', id), {
    paymentStatus: 'Paid',
    paymentDate: now.split('T')[0]
  });
  await logActivity('hris', `Payroll ID #${id} ditandai TERBAYAR`, 'payroll', id);
}

export async function deletePayroll(id: string) {
  await deleteDoc(doc(db, 'payrolls', id));
  await logActivity('hris', `Menghapus slip payroll ID #${id}`, 'payroll', id);
}


// ==========================================
// --- SEED SAMPLE DATA TO FIRESTORE ---
// ==========================================

export async function seedFirestoreSampleData() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  const dateAgoStr = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const daysAhead = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Pipeline stages
  const psSnap = await getDocs(collection(db, 'pipelineStages'));
  if (psSnap.empty) {
    for (let i = 0; i < DEF_LEAD_STAGES.length; i++) {
      await addDoc(collection(db, 'pipelineStages'), {
        module: 'leads',
        stageName: DEF_LEAD_STAGES[i],
        order: i,
        color: STAGE_COLORS[i % STAGE_COLORS.length]
      });
    }
    for (let i = 0; i < DEF_DEAL_STAGES.length; i++) {
      await addDoc(collection(db, 'pipelineStages'), {
        module: 'deals',
        stageName: DEF_DEAL_STAGES[i],
        order: i,
        color: STAGE_COLORS[i % STAGE_COLORS.length]
      });
    }
  }

  // Settings
  await setDoc(doc(db, 'settings', 'companyName'), { key: 'companyName', value: 'ERM Enterprise Internal' });
  await setDoc(doc(db, 'settings', 'currency'), { key: 'currency', value: 'IDR' });

  // Contacts
  const c1Ref = await addDoc(collection(db, 'contacts'), {
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

  const c2Ref = await addDoc(collection(db, 'contacts'), {
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

  const c3Ref = await addDoc(collection(db, 'contacts'), {
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

  // Leads
  await addDoc(collection(db, 'leads'), {
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

  await addDoc(collection(db, 'leads'), {
    name: 'Amanda Wijaya',
    email: 'amanda@globalretail.co.id',
    phone: '+6281399887766',
    company: 'Global Retail Corp',
    source: 'Referral',
    stage: 'Proposal Sent',
    score: 92,
    notes: 'Rekomendasi dari Budi Santoso Techindo.',
    contactId: c1Ref.id,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1)
  });

  // Deals
  await addDoc(collection(db, 'deals'), {
    title: 'Enterprise CRM License - PT Techindo',
    company: 'PT Techindo Solution',
    value: 450000000,
    stage: 'Negotiation',
    probability: 80,
    expectedClose: daysAhead(10),
    contactId: c1Ref.id,
    notes: 'Diskon 10% disetujui untuk kontrak 2 tahun.',
    createdAt: daysAgo(14),
    updatedAt: daysAgo(1)
  });

  await addDoc(collection(db, 'deals'), {
    title: 'Omnichannel CRM Deployment - Nusantara Digital',
    company: 'Nusantara Digital',
    value: 280000000,
    stage: 'Proposal',
    probability: 60,
    expectedClose: daysAhead(20),
    contactId: c2Ref.id,
    notes: 'Draft proposal dikirim. Menunggu meeting direksi.',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(2)
  });

  await addDoc(collection(db, 'deals'), {
    title: 'Regional Logistics System - Asia Pacific',
    company: 'Asia Pacific Logistics',
    value: 950000000,
    stage: 'Closed Won',
    probability: 100,
    expectedClose: daysAgo(2).split('T')[0],
    contactId: c3Ref.id,
    notes: 'Kontrak resmi ditandatangani Rp 950.000.000.',
    createdAt: daysAgo(25),
    updatedAt: daysAgo(2)
  });

  // Tasks
  await addDoc(collection(db, 'tasks'), {
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

  // Employees
  const e1Ref = await addDoc(collection(db, 'employees'), {
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
    transportAllowance: 1000000,
    mealAllowance: 1000000,
    positionAllowance: 500000,
    taxStatus: 'K/1',
    taxId: '09.234.567.8-012.000',
    pph21PaidBy: 'Perusahaan',
    pph21Scheme: 'Ditanggung Perusahaan (Nett / Gross Up)',
    bpjsKesehatanActive: true,
    bpjsKetenagakerjaanActive: true,
    bankName: 'BCA',
    bankAccount: '8830192831',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    notes: 'Senior Developer penanggung jawab modul backend. Pajak PPh 21 ditanggung perusahaan.',
    createdAt: daysAgo(300),
    updatedAt: daysAgo(10)
  });

  const e2Ref = await addDoc(collection(db, 'employees'), {
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
    transportAllowance: 800000,
    mealAllowance: 800000,
    positionAllowance: 400000,
    taxStatus: 'TK/0',
    taxId: '08.123.456.7-013.000',
    pph21PaidBy: 'Karyawan',
    pph21Scheme: 'Ditanggung Karyawan (Gross)',
    bpjsKesehatanActive: true,
    bpjsKetenagakerjaanActive: true,
    bankName: 'Mandiri',
    bankAccount: '127000982312',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    notes: 'Penanggung jawab operasional HR, rekrutmen & payroll.',
    createdAt: daysAgo(250),
    updatedAt: daysAgo(5)
  });

  // Attendances
  await addDoc(collection(db, 'attendances'), {
    employeeId: e1Ref.id,
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

  await addDoc(collection(db, 'attendances'), {
    employeeId: e2Ref.id,
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

  // Leave Request
  await addDoc(collection(db, 'leaveRequests'), {
    employeeId: e2Ref.id,
    employeeName: 'Nabila Putri',
    leaveType: 'Cuti Tahunan',
    startDate: daysAhead(5),
    endDate: daysAhead(7),
    totalDays: 3,
    reason: 'Cuti tahunan liburan keluarga.',
    status: 'Pending',
    createdAt: daysAgo(1)
  });

  // Payroll
  await addDoc(collection(db, 'payrolls'), {
    payrollCode: 'PAY-202608-001',
    month: 8,
    year: 2026,
    periodName: 'Agustus 2026',
    employeeId: e1Ref.id,
    employeeName: 'Aditya Pratama',
    department: 'Engineering',
    position: 'Lead Software Engineer',
    baseSalary: 18500000,
    allowances: 2500000,
    overtimePay: 1250000,
    bonus: 1000000,
    deductions: 250000,
    bpjsAmount: 740000,
    netSalary: 22260000,
    paymentStatus: 'Paid',
    paymentDate: todayStr,
    paymentMethod: 'Bank Transfer',
    notes: 'Transfer via BCA.',
    createdAt: daysAgo(1)
  });

  await logActivity('system', 'Database Firestore berhasil disemaikan dengan data sampel multi-user', 'system', 0);
}

export async function clearAllFirestoreCollections() {
  const colNames = ['companies', 'contacts', 'leads', 'deals', 'quotations', 'tasks', 'activities', 'pipelineStages', 'employees', 'attendances', 'leaveRequests', 'payrolls', 'invitations'];
  for (const c of colNames) {
    const snap = await getDocs(collection(db, c));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  }
}

