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
  findRegisteredUserOrEmployee
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
  HelpCircle
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
        // Check if user is pre-registered by Admin or Employee
        const regData = await findRegisteredUserOrEmployee(cred.user.email || userEmail);
        
        if (regData?.profile) {
          profile = { ...regData.profile, uid: cred.user.uid };
          await setDoc(doc(db, 'users', cred.user.uid), profile);
        } else if (regData?.employee) {
          // Pre-registered employee! Auto link user profile
          const newProf: UserProfile = {
            uid: cred.user.uid,
            email: cred.user.email || userEmail,
            displayName: regData.employee.name || displayName || userEmail.split('@')[0],
            role: 'Staff',
            status: 'Active',
            joinedAt: new Date().toISOString(),
            invitedBy: 'Admin (Pre-registered Employee)'
          };
          await setDoc(doc(db, 'users', cred.user.uid), newProf);
          profile = newProf;
        } else if (inviteCode.trim()) {
          profile = await createUserProfileWithInvitation(
            cred.user.uid,
            cred.user.email || userEmail,
            displayName || cred.user.displayName || userEmail.split('@')[0],
            inviteCode
          );
        } else {
          // Auto-provision user account so user is not blocked
          const hasUsers = await checkHasAnyUsers();
          const userRole: UserRole = hasUsers ? 'Admin' : 'Super Admin';
          profile = {
            uid: cred.user.uid,
            email: cred.user.email || userEmail,
            displayName: displayName || (cred.user.email ? cred.user.email.split('@')[0] : 'User'),
            role: userRole,
            status: 'Active',
            joinedAt: new Date().toISOString(),
            invitedBy: 'System Auto-Provisioning'
          };
          await setDoc(doc(db, 'users', cred.user.uid), profile);
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
      if (err.message && err.message.includes('belum terdaftar')) {
        msg = err.message;
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'User belum terdaftar atau kombinasi email/kata sandi salah. Silakan hubungi admin.';
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
        if (!verifiedInvite && !regData?.employee && !regData?.profile) {
          throw new Error('User belum terdaftar. Silakan hubungi admin perusahaan Anda.');
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
        if (regData?.employee) {
          profile = {
            uid: cred.user.uid,
            email: cred.user.email || userEmail,
            displayName: regData.employee.name || displayName || userEmail.split('@')[0],
            role: 'Staff',
            status: 'Active',
            joinedAt: new Date().toISOString(),
            invitedBy: 'Admin (Pre-registered Employee)'
          };
          await setDoc(doc(db, 'users', cred.user.uid), profile);
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
      if (err.message && err.message.includes('belum terdaftar')) {
        msg = err.message;
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Email ini sudah terdaftar dalam sistem.';
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
      let profile = await getUserProfile(user.uid);

      if (!profile) {
        const regData = await findRegisteredUserOrEmployee(user.email || '');
        if (regData?.profile) {
          profile = { ...regData.profile, uid: user.uid };
          await setDoc(doc(db, 'users', user.uid), profile);
        } else if (regData?.employee) {
          profile = {
            uid: user.uid,
            email: user.email || '',
            displayName: regData.employee.name || user.displayName || 'Employee',
            role: regData.employee.department === 'HR & Finance' ? 'Admin' : 'Staff',
            status: 'Active',
            joinedAt: new Date().toISOString(),
            invitedBy: 'Admin (Pre-registered Employee)'
          };
          await setDoc(doc(db, 'users', user.uid), profile);
        } else if (inviteCode.trim()) {
          profile = await createUserProfileWithInvitation(
            user.uid,
            user.email || '',
            user.displayName || 'Invited User',
            inviteCode
          );
        } else {
          // Auto-provision Google-authenticated user as Super Admin / Admin
          const hasUsers = await checkHasAnyUsers();
          const userRole: UserRole = hasUsers ? 'Admin' : 'Super Admin';
          profile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Administrator'),
            role: userRole,
            status: 'Active',
            joinedAt: new Date().toISOString(),
            invitedBy: 'Google Single Sign-On'
          };
          await setDoc(doc(db, 'users', user.uid), profile);
          if (!hasUsers) {
            await seedFirestoreSampleData();
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
      <div className="relative w-full max-w-md max-h-[88vh] my-auto flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100">
        
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

          <h3 className="text-lg font-bold tracking-tight">Single-Tenant Enterprise CRM</h3>
          <p className="text-[11px] text-blue-100 mt-0.5 font-medium">
            Sistem Database Terpusat Multi-User Internal Perusahaan
          </p>

          {isFirstTenantUser && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-0.5 text-[11px] font-semibold text-amber-200 border border-amber-300/30">
              <Sparkles className="h-3.5 w-3.5" />
              Inisialisasi Tenant Pertama (Super Admin)
            </div>
          )}
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 shrink-0">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Daftar (Undangan)
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            
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
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
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
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
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
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            {/* Invitation Code Section for Registration or Google auth when tenant exists */}
            {mode === 'register' && !isFirstTenantUser && (
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-indigo-600" />
                    Kode Undangan Internal (Wajib)
                  </label>
                  {verifiedInvite && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3" /> Valid ({verifiedInvite.role})
                    </span>
                  )}
                </div>
                
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan 6-digit Kode (contoh: AB12CD)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase tracking-wider font-mono font-bold text-slate-900 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
                
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <HelpCircle className="h-3 w-3 text-slate-400" />
                  Minta kode undangan dari Admin / HR perusahan Anda.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  {mode === 'login' ? 'Masuk ke Portal Internal' : isFirstTenantUser ? 'Buat Tenant & Jadi Admin' : 'Daftar dengan Kode Undangan'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-slate-400 font-medium">Atau</span></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100 transition-all cursor-pointer"
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
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center shrink-0">
          <p className="text-[11px] text-slate-500">
            🔒 Keamanan terverifikasi dengan Firebase Auth & Database Firestore. Hanya anggota internal terdaftar yang diizinkan mengakses data.
          </p>
        </div>

      </div>
    </div>
  );
};
