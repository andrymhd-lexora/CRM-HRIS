import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import {
  getUserProfile,
  createUserProfileWithInvitation,
  verifyInvitationCode,
  checkHasAnyUsers,
  seedFirestoreSampleData,
  findRegisteredUserOrEmployee,
  findPendingInvitationForEmail,
  claimInvitationForUser,
  isDeveloperOrSystemAdminEmail
} from '../db/firestoreService';
import { UserProfile, Invitation, UserRole } from '../types/crm';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  UserPlus,
  Building2,
  LogIn,
  LogOut,
  HelpCircle,
  ShieldAlert,
  Info
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProfile: UserProfile | null;
  onAuthSuccess: (profile: UserProfile) => void;
  addToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUserProfile,
  onAuthSuccess,
  addToast
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Status check for initial tenant bootstrap
  const [isFirstTenantUser, setIsFirstTenantUser] = useState(false);
  const [verifiedInvite, setVerifiedInvite] = useState<Invitation | null>(null);
  const [verifyingCode, setVerifyingCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkHasAnyUsers().then((hasUsers) => {
        setIsFirstTenantUser(!hasUsers);
      });
    }
  }, [isOpen]);

  // Real-time verification of invite code input
  useEffect(() => {
    if (mode === 'register' && inviteCode.trim().length >= 4 && !isFirstTenantUser) {
      setVerifyingCode(true);
      verifyInvitationCode(inviteCode, email)
        .then((inv) => {
          setVerifiedInvite(inv);
          if (!inv) {
            setError('Kode undangan tidak ditemukan, salah, atau telah digunakan.');
          } else {
            setError(null);
          }
        })
        .finally(() => setVerifyingCode(false));
    } else {
      setVerifiedInvite(null);
      if (mode === 'register' && !isFirstTenantUser && inviteCode.trim().length > 0 && inviteCode.trim().length < 4) {
        setError('Masukkan 6 digit kode undangan perusahaan.');
      } else if (mode === 'register' && !isFirstTenantUser && !inviteCode.trim()) {
        setError(null);
      }
    }
  }, [inviteCode, email, mode, isFirstTenantUser]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userEmail = email.trim().toLowerCase();
      const cred = await signInWithEmailAndPassword(auth, userEmail, password);
      let profile = await getUserProfile(cred.user.uid);
      
      if (!profile) {
        if (isDeveloperOrSystemAdminEmail(userEmail)) {
          profile = {
            uid: cred.user.uid,
            email: userEmail,
            displayName: cred.user.displayName || displayName || 'Andry Mahardika',
            role: 'Super Admin',
            status: 'Active',
            joinedAt: new Date().toISOString(),
            invitedBy: 'System Owner / Super Admin'
          };
          await setDoc(doc(db, 'users', cred.user.uid), profile);
        } else {
          // Check if user is pre-registered by Admin or Employee
          const regData = await findRegisteredUserOrEmployee(userEmail);
          
          if (regData?.profile) {
            profile = { ...regData.profile, uid: cred.user.uid };
            await setDoc(doc(db, 'users', cred.user.uid), profile);
          } else if (regData?.employee) {
            // Pre-registered employee! Auto link user profile
            const newProf: UserProfile = {
              uid: cred.user.uid,
              email: userEmail,
              displayName: regData.employee.name || displayName || userEmail.split('@')[0],
              role: regData.employee.department === 'HR & Finance' ? 'Admin' : 'Staff',
              status: 'Active',
              joinedAt: new Date().toISOString(),
              invitedBy: 'Admin (Pre-registered Employee)'
            };
            await setDoc(doc(db, 'users', cred.user.uid), newProf);
            profile = newProf;
          } else {
            // Check if there is a pending invitation for this email
            const pendingInv = await findPendingInvitationForEmail(userEmail);
            if (pendingInv) {
              profile = await claimInvitationForUser(
                cred.user.uid,
                userEmail,
                displayName || cred.user.displayName || userEmail.split('@')[0],
                pendingInv
              );
            } else if (inviteCode.trim()) {
              profile = await createUserProfileWithInvitation(
                cred.user.uid,
                userEmail,
                displayName || cred.user.displayName || userEmail.split('@')[0],
                inviteCode
              );
            } else {
              const hasUsers = await checkHasAnyUsers();
              if (!hasUsers) {
                profile = {
                  uid: cred.user.uid,
                  email: userEmail,
                  displayName: displayName || userEmail.split('@')[0],
                  role: 'Super Admin',
                  status: 'Active',
                  joinedAt: new Date().toISOString(),
                  invitedBy: 'System Bootstrap'
                };
                await setDoc(doc(db, 'users', cred.user.uid), profile);
                await seedFirestoreSampleData();
              } else {
                // STRICT BLOCK: User is NOT invited or registered!
                await signOut(auth);
                throw new Error(`Akses Ditolak: Email (${userEmail}) belum terdaftar dalam sistem perusahaan atau belum menerima undangan resmi. Silakan hubungi Administrator HR / IT untuk mendapatkan undangan.`);
              }
            }
          }
        }
      }

      if (profile.status === 'Suspended') {
        await signOut(auth);
        throw new Error('Akun Anda telah dinonaktifkan oleh Administrator Perusahaan.');
      }
      
      onAuthSuccess(profile);
      addToast(`Selamat datang kembali, ${profile.displayName || email}!`, 'success');
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = 'Gagal masuk. Periksa email dan kata sandi Anda.';
      if (err.message && (err.message.includes('belum terdaftar') || err.message.includes('Akses Ditolak') || err.message.includes('dinonaktifkan'))) {
        msg = err.message;
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'User belum terdaftar atau kombinasi email/kata sandi salah. Jika Anda staf baru, pastikan telah menerima kode undangan dari Admin.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userEmail = email.trim().toLowerCase();
      
      // Check pre-registration if not first user
      if (!isFirstTenantUser) {
        const regData = await findRegisteredUserOrEmployee(userEmail);
        const pendingInv = await findPendingInvitationForEmail(userEmail);

        if (inviteCode.trim()) {
          const verified = await verifyInvitationCode(inviteCode, userEmail);
          if (!verified) {
            throw new Error('Kode Undangan tidak valid, salah, atau telah kedaluwarsa.');
          }
        } else if (!pendingInv && !regData?.employee && !regData?.profile) {
          throw new Error(`Pendaftaran Ditolak: Email (${userEmail}) belum terdaftar dari undangan resmi. Masukkan Kode Undangan yang valid atau hubungi Administrator Perusahaan.`);
        }
      }

      const cred = await createUserWithEmailAndPassword(auth, userEmail, password);
      
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }

      let profile: UserProfile;

      if (isFirstTenantUser) {
        profile = await createUserProfileWithInvitation(
          cred.user.uid,
          cred.user.email || userEmail,
          displayName || userEmail.split('@')[0],
          ''
        );
        await seedFirestoreSampleData();
        addToast('Tenant internal perusahaan berhasil dibuat sebagai Super Admin / Owner!', 'success');
      } else {
        const regData = await findRegisteredUserOrEmployee(userEmail);
        const pendingInv = await findPendingInvitationForEmail(userEmail);

        if (regData?.employee) {
          profile = {
            uid: cred.user.uid,
            email: cred.user.email || userEmail,
            displayName: regData.employee.name || displayName || userEmail.split('@')[0],
            role: regData.employee.department === 'HR & Finance' ? 'Admin' : 'Staff',
            status: 'Active',
            joinedAt: new Date().toISOString(),
            invitedBy: 'Admin (Pre-registered Employee)'
          };
          await setDoc(doc(db, 'users', cred.user.uid), profile);
        } else if (pendingInv) {
          profile = await claimInvitationForUser(
            cred.user.uid,
            userEmail,
            displayName || userEmail.split('@')[0],
            pendingInv
          );
        } else {
          profile = await createUserProfileWithInvitation(
            cred.user.uid,
            cred.user.email || userEmail,
            displayName || userEmail.split('@')[0],
            inviteCode
          );
        }
      }

      onAuthSuccess(profile);
      addToast(`Akun berhasil dibuat. Peran Anda: ${profile.role}`, 'success');
      onClose();
    } catch (err: any) {
      console.error('Register error:', err);
      let msg = 'Gagal mendaftar. Silakan coba lagi.';
      if (err.message && (err.message.includes('belum terdaftar') || err.message.includes('Ditolak') || err.message.includes('Kode Undangan'))) {
        msg = err.message;
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Email ini sudah terdaftar dalam sistem. Silakan langsung masuk di menu Login.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Kata sandi minimal 6 karakter.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const user = cred.user;
      const userEmail = (user.email || '').trim().toLowerCase();
      let profile = await getUserProfile(user.uid);

      if (!profile) {
        if (isDeveloperOrSystemAdminEmail(userEmail)) {
          profile = {
            uid: user.uid,
            email: userEmail,
            displayName: user.displayName || 'Andry Mahardika',
            role: 'Super Admin',
            status: 'Active',
            joinedAt: new Date().toISOString(),
            invitedBy: 'System Owner / Super Admin'
          };
          await setDoc(doc(db, 'users', user.uid), profile);
        } else {
          const regData = await findRegisteredUserOrEmployee(userEmail);
          if (regData?.profile) {
            profile = { ...regData.profile, uid: user.uid };
            await setDoc(doc(db, 'users', user.uid), profile);
          } else if (regData?.employee) {
            profile = {
              uid: user.uid,
              email: userEmail,
              displayName: regData.employee.name || user.displayName || userEmail.split('@')[0],
              role: regData.employee.department === 'HR & Finance' ? 'Admin' : 'Staff',
              status: 'Active',
              joinedAt: new Date().toISOString(),
              invitedBy: 'Admin (Pre-registered Employee)'
            };
            await setDoc(doc(db, 'users', user.uid), profile);
          } else {
            // Check if there is an invitation for this email
            const pendingInv = await findPendingInvitationForEmail(userEmail);
            if (pendingInv) {
              profile = await claimInvitationForUser(
                user.uid,
                userEmail,
                user.displayName || userEmail.split('@')[0],
                pendingInv
              );
            } else if (inviteCode.trim()) {
              profile = await createUserProfileWithInvitation(
                user.uid,
                userEmail,
                user.displayName || userEmail.split('@')[0],
                inviteCode
              );
            } else {
              const hasUsers = await checkHasAnyUsers();
              if (!hasUsers) {
                profile = {
                  uid: user.uid,
                  email: userEmail,
                  displayName: user.displayName || userEmail.split('@')[0],
                  role: 'Super Admin',
                  status: 'Active',
                  joinedAt: new Date().toISOString(),
                  invitedBy: 'Google Single Sign-On'
                };
                await setDoc(doc(db, 'users', user.uid), profile);
                await seedFirestoreSampleData();
              } else {
                // STRICT BLOCK: User is NOT invited or registered!
                await signOut(auth);
                throw new Error(`Akses Ditolak: Akun Google (${userEmail}) belum terdaftar dalam sistem perusahaan atau belum menerima undangan resmi. Silakan hubungi Administrator HR / IT.`);
              }
            }
          }
        }
      }

      if (profile.status === 'Suspended') {
        await signOut(auth);
        throw new Error('Akun Google ini telah dinonaktifkan oleh Admin.');
      }

      onAuthSuccess(profile);
      addToast(`Berhasil masuk dengan Google (${profile.displayName})`, 'success');
      onClose();
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(err.message || 'Gagal autentikasi Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md max-h-[90vh] my-auto flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 p-5 text-white text-center relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-30 text-white/90 hover:text-white bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors cursor-pointer"
            title="Tutup Form Login"
          >
            ✕
          </button>
          
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
            <Building2 className="h-6 w-6 text-blue-100" />
          </div>

          <h3 className="text-lg font-bold tracking-tight">Enterprise CRM x HRIS</h3>
          <p className="text-[11px] text-blue-100 mt-0.5 font-medium">
            Sistem Database Terpusat Multi-User Internal Perusahaan
          </p>

          {isFirstTenantUser ? (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-0.5 text-[11px] font-semibold text-amber-200 border border-amber-300/30">
              <Sparkles className="h-3.5 w-3.5" />
              Inisialisasi Tenant Pertama (Super Admin)
            </div>
          ) : (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 text-[10px] font-semibold text-white border border-white/20">
              <Lock className="h-3 w-3 text-blue-200" />
              Akses Tertutup: Khusus Anggota / Undangan Resmi
            </div>
          )}
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 shrink-0">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Daftar (Undangan)
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Prominent Access Rejected / Unregistered Error Notice */}
          {error && (
            <div className="flex flex-col gap-2 rounded-2xl bg-rose-50 p-4 text-xs text-rose-800 border border-rose-200/90 shadow-2xs animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-extrabold text-rose-900 block text-xs">Pemberitahuan Akses</span>
                  <p className="leading-relaxed font-medium">{error}</p>
                </div>
              </div>

              {(error.includes('belum terdaftar') || error.includes('undangan')) && mode === 'login' && (
                <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-rose-700 font-semibold">Punya Kode Undangan?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Daftar di Sini →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Closed Access System Info */}
          {!error && !isFirstTenantUser && mode === 'login' && (
            <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/70 p-3 text-[11px] text-blue-900 border border-blue-200/60">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Hanya user yang telah <strong>diundang oleh Admin / HR</strong> atau <strong>terdaftar di database karyawan</strong> yang dapat masuk.
              </p>
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-3.5">
            
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Contoh: Budi Gunawan"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-xs bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Perusahaan</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.co.id"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-xs bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-xs bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Invitation Code Section for Registration */}
            {mode === 'register' && !isFirstTenantUser && (
              <div className="rounded-2xl bg-indigo-50/60 p-3.5 border border-indigo-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-indigo-600" />
                    Kode Undangan Resmi (Wajib)
                  </label>
                  {verifiedInvite && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Valid ({verifiedInvite.role})
                    </span>
                  )}
                </div>
                
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: AB12CD"
                  className="w-full rounded-xl border border-indigo-200 px-3 py-2 text-xs uppercase tracking-wider font-mono font-black text-indigo-950 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
                
                <p className="text-[10px] text-indigo-700 flex items-center gap-1 font-medium">
                  <HelpCircle className="h-3 w-3 text-indigo-500" />
                  Minta kode undangan 6 digit kepada Admin / HRD perusahaan Anda.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  {mode === 'login' ? 'Masuk ke Portal Internal' : isFirstTenantUser ? 'Buat Tenant & Jadi Admin' : 'Daftar dengan Kode Undangan'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-3 text-slate-400 font-bold">Atau Masuk Dengan</span></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 active:bg-slate-100 transition-all cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Masuk dengan Google Work Account
          </button>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-100 text-center shrink-0">
          <p className="text-[10px] text-slate-500 font-medium">
            🔒 Keamanan terverifikasi Firebase. Hanya akun terdaftar / berundangan yang diizinkan mengakses data.
          </p>
        </div>

      </div>
    </div>
  );
};

