import React, { useState, useEffect } from 'react';
import {
  Invitation,
  UserProfile,
  UserRole
} from '../types/crm';
import {
  createInvitation,
  revokeInvitation,
  subscribeInvitations,
  subscribeUsers,
  updateUserRole,
  updateUserStatus,
  updateUserManager
} from '../db/firestoreService';
import {
  UserPlus,
  Copy,
  Check,
  Shield,
  Trash2,
  Users,
  KeyRound,
  Mail,
  UserCheck,
  UserX,
  RefreshCw,
  BadgeCheck,
  Sparkles,
  UserCheck2,
  AlertCircle
} from 'lucide-react';

interface UserInvitationManagementProps {
  currentUser: UserProfile;
  addToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const UserInvitationManagement: React.FC<UserInvitationManagementProps> = ({
  currentUser,
  addToast
}) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'invites' | 'users'>('invites');
  
  // New invitation form state
  const [newRole, setNewRole] = useState<UserRole>('Staff');
  const [restrictedEmail, setRestrictedEmail] = useState('');
  const [selectedManagerUid, setSelectedManagerUid] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubInv = subscribeInvitations((data) => setInvitations(data));
    const unsubUsers = subscribeUsers((data) => setUsers(data));
    return () => {
      unsubInv();
      unsubUsers();
    };
  }, []);

  const managersList = users.filter(
    (u) => u.role === 'Manager' || u.role === 'Admin' || u.role === 'Owner' || u.role === 'Super Admin'
  );

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      let mgrId = '';
      let mgrName = '';
      let mgrEmail = '';

      if (newRole === 'Staff' && selectedManagerUid) {
        const mgrObj = managersList.find((m) => m.uid === selectedManagerUid);
        if (mgrObj) {
          mgrId = mgrObj.uid;
          mgrName = mgrObj.displayName || mgrObj.email;
          mgrEmail = mgrObj.email;
        }
      }

      const inv = await createInvitation(
        currentUser.uid,
        currentUser.displayName || currentUser.email,
        newRole,
        restrictedEmail,
        mgrId,
        mgrName,
        mgrEmail
      );
      addToast(`Kode Undangan (${inv.code}) untuk peran ${newRole} berhasil dibuat!`, 'success');
      setRestrictedEmail('');
      setSelectedManagerUid('');
    } catch (err: any) {
      console.error('Failed to create invite:', err);
      addToast(err.message || 'Gagal membuat kode undangan.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    addToast(`Kode undangan ${code} telah disalin!`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = async (invId: string, code: string) => {
    if (!confirm(`Apakah Anda yakin ingin menonaktifkan kode undangan ${code}?`)) return;
    try {
      await revokeInvitation(invId);
      addToast(`Kode undangan ${code} telah dinonaktifkan.`, 'info');
    } catch (err: any) {
      addToast('Gagal mengubah status undangan', 'error');
    }
  };

  const handleRoleChange = async (targetUid: string, role: UserRole) => {
    try {
      await updateUserRole(targetUid, role);
      addToast(`Peran user berhasil diubah menjadi ${role}`, 'success');
    } catch (err: any) {
      addToast('Gagal mengubah peran user', 'error');
    }
  };

  const handleManagerChange = async (targetUid: string, managerUid: string) => {
    try {
      if (!managerUid) {
        await updateUserManager(targetUid, '', '', '');
        addToast('Atasan manager berhasil dikosongkan', 'info');
        return;
      }
      const mgr = users.find((m) => m.uid === managerUid);
      if (mgr) {
        await updateUserManager(
          targetUid,
          mgr.uid,
          mgr.displayName || mgr.email,
          mgr.email
        );
        addToast(`Atasan manager untuk user berhasil diubah menjadi ${mgr.displayName || mgr.email}`, 'success');
      }
    } catch (err: any) {
      addToast('Gagal mengubah atasan manager', 'error');
    }
  };

  const handleToggleStatus = async (targetUid: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await updateUserStatus(targetUid, nextStatus);
      addToast(`Status user diubah menjadi ${nextStatus}`, 'info');
    } catch (err: any) {
      addToast('Gagal mengubah status user', 'error');
    }
  };

  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Super Admin' || currentUser.role === 'Owner';
  const canEditManager = isAdmin || currentUser.role === 'Manager';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      
      {/* Component Header */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">Manajemen Anggota & Undangan Internal</h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
              <Shield className="h-3 w-3" />
              Hierarki Atasan & Pipeline Filter
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola pengguna terverifikasi, tentukan Manager Atasan untuk Staff agar pipeline data hanya terbaca oleh Manager terkait.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-200/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('invites')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'invites'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            Kode Undangan ({invitations.filter((i) => i.status === 'Pending').length} Aktif)
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Pengguna Terverifikasi ({users.length})
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Generate Invitation Form (For Admin / Manager) */}
        {activeTab === 'invites' && (
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 p-4 space-y-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-indigo-600" />
              Buat Kode Undangan Baru
            </h4>

            <form onSubmit={handleGenerateInvite} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Peran Access (Role)</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
                >
                  <option value="Staff">Staff (Akses Standar CRM/HRIS)</option>
                  <option value="Manager">Manager (Akses Tim & Laporan)</option>
                  {isAdmin && <option value="Admin">Admin (Full Control & Pengaturan)</option>}
                </select>
              </div>

              {newRole === 'Staff' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Atasan Manager <span className="text-amber-600 font-bold">*Wajib untuk Staff</span>
                  </label>
                  <select
                    value={selectedManagerUid}
                    onChange={(e) => setSelectedManagerUid(e.target.value)}
                    className="w-full rounded-lg border border-amber-300 bg-amber-50/50 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Pilih Manager Atasan --</option>
                    {managersList.map((m) => (
                      <option key={m.uid} value={m.uid}>
                        {m.displayName || m.email} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={newRole === 'Staff' ? '' : 'md:col-span-2'}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Batasi Email (Opsional)</label>
                <input
                  type="email"
                  value={restrictedEmail}
                  onChange={(e) => setRestrictedEmail(e.target.value)}
                  placeholder="Kosongkan jika bisa untuk siapa saja"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 px-4 text-xs font-semibold text-white shadow hover:bg-indigo-700 active:bg-indigo-800 transition-all cursor-pointer"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Generate Kode Undangan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 1: Invitations List */}
        {activeTab === 'invites' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800">Daftar Kode Undangan Internal</h4>
              <span className="text-xs text-slate-500">Total: {invitations.length} kode</span>
            </div>

            {invitations.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <KeyRound className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-medium">Belum ada kode undangan yang dibuat.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Gunakan form di atas untuk men-generate kode pertama.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Kode Undangan</th>
                      <th className="px-4 py-3">Peran (Role)</th>
                      <th className="px-4 py-3">Manager Atasan</th>
                      <th className="px-4 py-3">Pembatas Email</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Dibuat Oleh</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invitations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-200/80">
                            {inv.code}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                            inv.role === 'Admin' ? 'bg-purple-100 text-purple-700 font-bold' :
                            inv.role === 'Manager' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {inv.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {inv.managerName ? (
                            <span className="font-bold text-blue-700 flex items-center gap-1">
                              <UserCheck2 className="w-3.5 h-3.5 text-blue-500" />
                              {inv.managerName}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {inv.email ? (
                            <span className="flex items-center gap-1 font-medium text-slate-800">
                              <Mail className="h-3 w-3 text-slate-400" />
                              {inv.email}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Semua Email Internal</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {inv.status === 'Pending' && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Aktif / Tersedia
                            </span>
                          )}
                          {inv.status === 'Used' && (
                            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-[11px]">
                              <UserCheck className="h-3 w-3" /> Sudah Digunakan
                            </span>
                          )}
                          {inv.status === 'Expired' && (
                            <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                              Nonaktif / Expired
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{inv.createdByName || 'Admin'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleCopyCode(inv.code, inv.id!)}
                                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-md text-[11px] transition-colors"
                                  title="Salin Kode Undangan"
                                >
                                  {copiedId === inv.id ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-600" /> Tersalin
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" /> Salin Kode
                                    </>
                                  )}
                                </button>
                                {isAdmin && (
                                  <button
                                    onClick={() => handleRevoke(inv.id!, inv.code)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                    title="Revoke Kode"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Users List */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Daftar Anggota / User Terverifikasi</h4>
                <p className="text-[11px] text-slate-500">
                  Pengaturan Atasan Manager menentukan visibilitas pipeline CRM pada dashboard Manager.
                </p>
              </div>
              <span className="text-xs text-slate-500">Total: {users.length} pengguna</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Nama User</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Peran (Role)</th>
                    <th className="px-4 py-3">Manager Atasan (Wajib untuk Staff)</th>
                    <th className="px-4 py-3">Status Akun</th>
                    <th className="px-4 py-3">Diundang Oleh</th>
                    {isAdmin && <th className="px-4 py-3 text-right">Kelola Akses</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                          {u.displayName ? u.displayName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div>{u.displayName || 'Tanpa Nama'}</div>
                          {u.uid === currentUser.uid && (
                            <span className="text-[10px] text-blue-600 font-bold">(Anda)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{u.email}</td>
                      <td className="px-4 py-3">
                        {isAdmin && u.uid !== currentUser.uid ? (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
                          >
                            <option value="Staff">Staff</option>
                            <option value="Manager">Manager</option>
                            <option value="Admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            u.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                            u.role === 'Manager' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role}
                          </span>
                        )}
                      </td>

                      {/* Column: Manager Atasan */}
                      <td className="px-4 py-3">
                        {u.role === 'Staff' ? (
                          canEditManager ? (
                            <div className="space-y-1">
                              <select
                                value={u.managerId || ''}
                                onChange={(e) => handleManagerChange(u.uid, e.target.value)}
                                className={`w-full rounded-lg border px-2.5 py-1 text-xs font-bold outline-none transition-all ${
                                  u.managerId
                                    ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                                    : 'bg-amber-50 border-amber-300 text-amber-900 font-extrabold animate-pulse'
                                }`}
                              >
                                <option value="">-- Pilih Manager Atasan (Wajib) --</option>
                                {managersList.map((m) => (
                                  <option key={m.uid} value={m.uid}>
                                    {m.displayName || m.email} ({m.role})
                                  </option>
                                ))}
                              </select>
                              {!u.managerId && (
                                <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Atasan belum dipilih (Pipeline belum terbaca di Manager)
                                </p>
                              )}
                            </div>
                          ) : (
                            u.managerName ? (
                              <span className="font-bold text-blue-700 flex items-center gap-1">
                                <UserCheck2 className="w-3.5 h-3.5 text-blue-500" />
                                {u.managerName}
                              </span>
                            ) : (
                              <span className="text-amber-600 font-bold text-[10px]">Belum Ditugaskan</span>
                            )
                          )
                        ) : (
                          <span className="text-slate-400 font-semibold text-[11px] italic">
                            - (Level Atasan/Management)
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {u.status === 'Active' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                            <BadgeCheck className="h-3 w-3" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                            <UserX className="h-3 w-3" /> Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{u.invitedBy || 'Pendaftar Pertama / System'}</td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          {u.uid !== currentUser.uid && (
                            <button
                              onClick={() => handleToggleStatus(u.uid, u.status)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                                u.status === 'Active'
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {u.status === 'Active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
