import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Lock, 
  Mail, 
  Sun, 
  Moon, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  User as UserIcon,
  CheckCircle2,
  Clock,
  Key,
  Globe2,
  ShieldCheck,
  Check
} from 'lucide-react';
import { loginWithFirebase, registerWithFirebase, sendPasswordResetLink } from '../../services/authService';
import { AuthIllustration3D } from './AuthIllustration3D';
import { User } from '../../types';

const STORAGE_KEY_REMEMBER_EMAIL = 'proman_remembered_email';
const STORAGE_KEY_REMEMBER_SESSION = 'proman_remember_session';

export const LoginPage: React.FC = () => {
  const { login, showToast } = useProject();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<'signin' | 'signup' | 'pending_notice' | 'forgot_password'>('signin');

  // Sign In Form State with Remember Me persistence
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REMEMBER_SESSION);
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const [email, setEmail] = useState<string>(() => {
    try {
      const isRemembered = localStorage.getItem(STORAGE_KEY_REMEMBER_SESSION) !== 'false';
      if (isRemembered) {
        return localStorage.getItem(STORAGE_KEY_REMEMBER_EMAIL) || '';
      }
      return '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState('');

  // Sign Up Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState<User['department']>('Technology');
  const [regRole, setRegRole] = useState('IT Engineer');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isDark = theme === 'dark';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      const result = await loginWithFirebase(email, password);

      // Simpan preferensi dan email ke localStorage jika 'rememberMe' aktif
      try {
        if (rememberMe && email.trim()) {
          localStorage.setItem(STORAGE_KEY_REMEMBER_EMAIL, email.trim());
          localStorage.setItem(STORAGE_KEY_REMEMBER_SESSION, 'true');
        } else {
          localStorage.removeItem(STORAGE_KEY_REMEMBER_EMAIL);
          localStorage.setItem(STORAGE_KEY_REMEMBER_SESSION, 'false');
        }
      } catch (storageErr) {
        console.warn('Gagal menyimpan preferensi email ke localStorage:', storageErr);
      }

      login(result.userProfile);
      showToast(`Selamat datang kembali, ${result.userProfile.name}! (${result.userProfile.personaType})`, 'success');
    } catch (error: any) {
      console.error('Login error:', error);

      if (error.code === 'auth/pending-approval') {
        setInfoMessage('Akun Anda telah terdaftar dan saat ini sedang menunggu verifikasi & persetujuan dari Super Admin. Silakan hubungi admin Anda.');
      } else if (error.code === 'auth/account-rejected') {
        setErrorMessage('Pendaftaran akun Anda ditolak oleh Super Admin.');
      } else if (error.code === 'auth/account-removed') {
        setErrorMessage('Akun ini telah dinonaktifkan. Silakan hubungi Super Admin.');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setErrorMessage('Email atau password salah. Silakan periksa kembali.');
      } else if (error.code === 'auth/user-not-found') {
        setErrorMessage('Email belum terdaftar. Silakan klik "Daftar Akun Baru".');
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage('Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat lalu coba lagi.');
      } else if (error.code === 'auth/network-request-failed') {
        setErrorMessage('Koneksi ke server terputus. Periksa koneksi internet Anda.');
      } else {
        setErrorMessage('Gagal login. Silakan coba lagi atau hubungi Super Admin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!agreeTerms) {
      setErrorMessage('Anda harus menyetujui ketentuan layanan untuk mendaftar.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password minimal 6 karakter!');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok!');
      return;
    }

    setIsLoading(true);

    try {
      await registerWithFirebase({
        name: regName,
        email: regEmail,
        password: regPassword,
        department: regDepartment,
        role: regRole,
      });

      setMode('pending_notice');
      showToast('Pendaftaran akun berhasil!', 'success');
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Email tersebut sudah terdaftar dalam sistem. Silakan login.');
      } else {
        setErrorMessage(`Gagal mendaftar: ${error.message || 'Terjadi kesalahan sistem.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setForgotSuccessMessage('');

    if (!forgotEmail.trim()) {
      setErrorMessage('Masukkan email perusahaan yang terdaftar!');
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetLink(forgotEmail.trim());
      setForgotSuccessMessage(
        `Jika ${forgotEmail.trim()} terdaftar, tautan reset password sudah dikirim. ` +
        'Buka email Anda dan ikuti instruksi di dalamnya untuk membuat password baru.'
      );
      showToast('Tautan reset password terkirim!', 'success');
    } catch (fbErr: any) {
      console.warn('[Reset] Firebase reset email gagal:', fbErr);
      if (fbErr?.code === 'auth/too-many-requests') {
        setErrorMessage('Terlalu banyak permintaan reset. Silakan coba beberapa saat lagi.');
      } else if (fbErr?.code === 'auth/missing-android-pkg-name' || fbErr?.code === 'auth/operation-not-allowed') {
        setErrorMessage('Reset password via email belum diaktifkan. Hubungi Super Admin untuk mengatur ulang password Anda.');
      } else {
        setErrorMessage(
          `Jika ${forgotEmail.trim()} terdaftar, tautan reset akan dikirim. ` +
          'Periksa folder spam, atau hubungi Super Admin bila tautan tidak sampai.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 w-full h-full min-h-dvh overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start md:justify-center p-3 sm:p-6 md:p-8 pb-10 sm:pb-8 transition-colors duration-300 ${
      isDark 
        ? 'bg-[#0B1120] text-slate-100' 
        : 'bg-[#DDEBFC] text-slate-900'
    }`} style={{ 
      WebkitOverflowScrolling: 'touch',
      touchAction: 'pan-y'
    }}>

      {/* Main Split-Card Container */}
      <div className={`w-full max-w-245 rounded-3xl sm:rounded-4xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col md:flex-row my-auto shrink-0 ${
        isDark
          ? 'bg-slate-900/95 border border-slate-800 shadow-blue-950/40'
          : 'bg-white border border-white/80 shadow-[0_25px_50px_-12px_rgba(59,130,246,0.18)]'
      }`}>

        {/* ── LEFT COLUMN: Blue 3D Branding & Illustration Panel ── */}
        <div className="w-full md:w-[42%] lg:w-[40%] bg-linear-to-br from-[#4D96FF] via-[#3B82F6] to-brand-blue-accent p-5 sm:p-7 md:p-9 flex flex-col justify-between text-white relative overflow-hidden shrink-0">
          
          {/* Subtle Ambient Shapes behind left panel */}
          <div className="absolute -top-12 -left-12 w-44 h-44 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-cyan-300/20 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
                <img 
                  src="/proman-icon.png" 
                  alt="ProMan" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white leading-none">
                  ProMan
                </span>
              </div>
            </div>

            <p className="text-xs text-blue-50/90 leading-relaxed font-normal max-w-xs">
              Interface assets &amp; workspace cerdas untuk manajemen proyek dan tata kelola operasional enterprise.
            </p>
          </div>

          {/* Middle 3D Illustration Graphic (hidden on small mobile screens to keep registration forms accessible, visible on md+) */}
          <div className="relative z-10 my-4 md:my-0 hidden md:flex items-center justify-center">
            <AuthIllustration3D />
          </div>

          {/* Bottom Switcher Navigation (desktop view) */}
          <div className="relative z-10 pt-4 border-t border-white/15 text-xs text-blue-50/90 hidden md:flex items-center justify-between">
            {mode === 'signin' ? (
              <p>
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMessage(''); setInfoMessage(''); }}
                  className="font-bold text-white hover:underline transition ml-1 cursor-pointer"
                >
                  Daftar di sini
                </button>
              </p>
            ) : mode === 'signup' ? (
              <p>
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMessage(''); setInfoMessage(''); }}
                  className="font-bold text-white hover:underline transition ml-1 cursor-pointer"
                >
                  Masuk di sini
                </button>
              </p>
            ) : (
              <p>
                Kembali ke login?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMessage(''); setInfoMessage(''); setForgotSuccessMessage(''); }}
                  className="font-bold text-white hover:underline transition ml-1 cursor-pointer"
                >
                  Klik di sini
                </button>
              </p>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Clean White Form Panel ── */}
        <div className="flex-1 p-5 sm:p-8 md:p-11 flex flex-col justify-between overflow-visible md:overflow-y-auto">

          {/* Top Bar: Language & Dark Mode Switcher */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Globe2 className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Indonesia (WIB)</span>
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Ubah Tema (Dark / Light)"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
              <span className="text-[11px] font-bold">{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          {/* Form Content Body */}
          <div className="space-y-6 my-auto py-2">

            {/* Header Titles */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Sign Up'}
                {mode === 'forgot_password' && 'Reset Password'}
                {mode === 'pending_notice' && 'Verifikasi Akun'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'signin' && 'Selamat datang kembali! Silakan masukkan kredensial akun Anda.'}
                {mode === 'signup' && 'Daftarkan akun perusahaan baru untuk mulai berkolaborasi di ProMan.'}
                {mode === 'forgot_password' && 'Masukkan email terdaftar untuk menerima tautan pembaruan kata sandi.'}
                {mode === 'pending_notice' && 'Pendaftaran akun Anda telah berhasil diterima oleh sistem.'}
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Info / Pending Banner */}
            {infoMessage && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5 animate-fade-in">
                <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span className="leading-relaxed font-medium">{infoMessage}</span>
              </div>
            )}

            {/* 1. SIGN IN FORM */}
            {mode === 'signin' && (
              <form onSubmit={handleLogin} className="space-y-4 animate-fade-in text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => {
                        try {
                          if (rememberMe && email.trim()) {
                            localStorage.setItem(STORAGE_KEY_REMEMBER_EMAIL, email.trim());
                          }
                        } catch (err) {
                          console.warn('LocalStorage error on blur:', err);
                        }
                      }}
                      placeholder="nama@bitcorp.id"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { 
                        setMode('forgot_password'); 
                        setErrorMessage(''); 
                        setInfoMessage(''); 
                        setForgotSuccessMessage('');
                        if (email) setForgotEmail(email);
                      }}
                      className="text-xs font-semibold text-[#3B82F6] hover:underline"
                    >
                      Lupa password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="remember_me"
                    checked={rememberMe}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setRememberMe(isChecked);
                      try {
                        if (!isChecked) {
                          localStorage.removeItem(STORAGE_KEY_REMEMBER_EMAIL);
                          localStorage.setItem(STORAGE_KEY_REMEMBER_SESSION, 'false');
                        } else {
                          localStorage.setItem(STORAGE_KEY_REMEMBER_SESSION, 'true');
                          if (email.trim()) {
                            localStorage.setItem(STORAGE_KEY_REMEMBER_EMAIL, email.trim());
                          }
                        }
                      } catch (err) {
                        console.warn('LocalStorage error on remember me toggle:', err);
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-[#3B82F6] focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="remember_me" className="text-xs text-slate-600 dark:text-slate-400 font-medium cursor-pointer">
                    Ingat sesi saya di workstation ini
                  </label>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-[#4D96FF] to-brand-blue-accent hover:from-[#3B82F6] hover:to-[#1D4ED8] text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Mobile Quick Switcher */}
                <div className="pt-2 text-center md:hidden">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Belum punya akun?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('signup'); setErrorMessage(''); setInfoMessage(''); }}
                      className="font-bold text-[#3B82F6] hover:underline transition ml-1 cursor-pointer"
                    >
                      Daftar di sini
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* 2. SIGN UP FORM */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5 animate-fade-in text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Joey Willson"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="jowillson@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Departemen
                    </label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6] transition"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Operations">Operations</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="Management">Management</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Jabatan / Posisi
                    </label>
                    <input
                      type="text"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      placeholder="Contoh: IT Engineer"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Set password
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Ulangi password
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] transition"
                      required
                    />
                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <input
                    type="checkbox"
                    id="agree_terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#3B82F6] focus:ring-blue-500"
                  />
                  <label htmlFor="agree_terms" className="leading-tight cursor-pointer">
                    By creating an account, you agree to the <span className="text-[#3B82F6] font-semibold hover:underline">Terms of Service</span> and <span className="text-[#3B82F6] font-semibold hover:underline">Privacy Policy</span>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-[#4D96FF] to-brand-blue-accent hover:from-[#3B82F6] hover:to-[#1D4ED8] text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Mendaftarkan Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Mobile Quick Switcher */}
                <div className="pt-2 text-center md:hidden">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sudah punya akun?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('signin'); setErrorMessage(''); setInfoMessage(''); }}
                      className="font-bold text-[#3B82F6] hover:underline transition ml-1 cursor-pointer"
                    >
                      Masuk di sini
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* 3. FORGOT PASSWORD FORM */}
            {mode === 'forgot_password' && (
              <div className="space-y-4 animate-fade-in text-left">
                {forgotSuccessMessage ? (
                  <div className="space-y-4 text-center py-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Tautan Reset Terkirim
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {forgotSuccessMessage}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { 
                        setMode('signin'); 
                        setEmail(forgotEmail);
                        setPassword('');
                        setForgotSuccessMessage(''); 
                        setErrorMessage(''); 
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-[#3B82F6] hover:bg-brand-blue-accent text-white text-xs font-bold shadow-md transition active:scale-95"
                    >
                      Kembali ke Halaman Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Email Perusahaan Terdaftar
                      </label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="nama@bitcorp.id"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] transition"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => { setMode('signin'); setErrorMessage(''); }}
                        className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
                      >
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#3B82F6] hover:bg-brand-blue-accent text-white text-xs font-bold shadow-md transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {isLoading ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5 animate-spin" />
                            <span>Memproses...</span>
                          </>
                        ) : (
                          <>
                            <span>Kirim Tautan</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Mobile Quick Switcher */}
                    <div className="pt-2 text-center md:hidden">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Kembali ke login?{' '}
                        <button
                          type="button"
                          onClick={() => { setMode('signin'); setErrorMessage(''); setInfoMessage(''); setForgotSuccessMessage(''); }}
                          className="font-bold text-[#3B82F6] hover:underline transition ml-1 cursor-pointer"
                        >
                          Klik di sini
                        </button>
                      </p>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* 4. PENDING NOTICE SUCCESS SCREEN */}
            {mode === 'pending_notice' && (
              <div className="space-y-4 text-center animate-fade-in py-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto shadow-md">
                  <Clock className="w-7 h-7 animate-pulse" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Pendaftaran Berhasil Dikirim!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                    Akun Anda telah berhasil terdaftar ke database ProMan. Demi keamanan perusahaan, akun Anda saat ini berstatus:
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700 my-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    STATUS: MENUNGGU VERIFIKASI ADMIN
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Silakan konfirmasi ke Super Admin untuk mengaktifkan akun Anda agar dapat masuk ke dashboard.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMessage(''); }}
                  className="px-6 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-brand-blue-accent text-white text-xs font-bold shadow-md transition active:scale-95"
                >
                  Kembali ke Halaman Sign In
                </button>
              </div>
            )}


          </div>

          {/* Bottom Security Notice */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Terenkripsi &amp; Terlindungi Protokol Firebase Enterprise</span>
          </div>

        </div>

      </div>

    </div>
  );
};
