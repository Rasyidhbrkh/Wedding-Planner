import React, { useState } from 'react';
import { api } from '../api/client';
import { 
  Heart, 
  Lock, 
  User, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff,
  UserPlus,
  LogIn,
  Check
} from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const switchMode = (toRegister) => {
    setIsRegisterMode(toRegister);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (isRegisterMode) {
      // Register validation
      if (!name.trim()) {
        setErrorMessage('Silakan masukkan nama lengkap Anda');
        return;
      }
      if (!username.trim()) {
        setErrorMessage('Silakan tentukan username Anda');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Kata sandi minimal harus 6 karakter');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Konfirmasi kata sandi tidak cocok dengan kata sandi');
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.register({
          name: name.trim(),
          username: username.trim(),
          password: password,
        });

        if (res && res.token) {
          localStorage.setItem('wedding_token', res.token);
          localStorage.setItem('wedding_user', JSON.stringify(res.user));
          setSuccessMessage('Pendaftaran berhasil! Mengalihkan...');
          setTimeout(() => {
            if (onLoginSuccess) {
              onLoginSuccess(res.user, res.token);
            }
          }, 400);
        } else {
          throw new Error('Respon pendaftaran tidak lengkap');
        }
      } catch (err) {
        console.error('Register error:', err);
        setErrorMessage(err.message || 'Gagal mendaftar akun baru.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Login validation
      if (!username.trim() || !password.trim()) {
        setErrorMessage('Silakan masukkan username dan kata sandi Anda');
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.login({
          username: username.trim(),
          password: password.trim(),
        });

        if (res && res.token) {
          localStorage.setItem('wedding_token', res.token);
          localStorage.setItem('wedding_user', JSON.stringify(res.user));
          if (onLoginSuccess) {
            onLoginSuccess(res.user, res.token);
          }
        } else {
          throw new Error('Respon login tidak lengkap');
        }
      } catch (err) {
        console.error('Login error:', err);
        setErrorMessage(err.message || 'Username atau kata sandi salah.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-rose-50/70 via-stone-50 to-amber-50/50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Rings/Blobs */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-rose-200/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-amber-200/25 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 border border-rose-200/60 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Wedding Planner Portal</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Wedding <span className="text-rose-500 font-normal italic">Planner</span>
          </h1>
          <p className="text-sm text-slate-500 font-sans">
            Portal Manajemen &amp; Perencanaan Hari Bahagia
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-rose-100">
          {/* Tab Navigation: Masuk vs Daftar */}
          <div className="flex rounded-2xl bg-slate-100/80 p-1 mb-6 border border-slate-200/60">
            <button
              type="button"
              onClick={() => switchMode(false)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                !isRegisterMode
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
            <button
              type="button"
              onClick={() => switchMode(true)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                isRegisterMode
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun</span>
            </button>
          </div>

          {/* Card Title */}
          <div className="flex items-center gap-3 pb-5 mb-5 border-b border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-rose-500 to-rose-400 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg leading-tight">
                {isRegisterMode ? 'Daftar Akun Pengantin' : 'Masuk ke Akun'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRegisterMode 
                  ? 'Lengkapi data diri untuk membuat akun baru' 
                  : 'Silakan masukkan username dan kata sandi Anda'}
              </p>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Lengkap (Hanya saat Register) */}
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400 bg-slate-50/50 hover:bg-white transition"
                    required={isRegisterMode}
                  />
                </div>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400 bg-slate-50/50 hover:bg-white transition"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegisterMode ? 'Minimal 6 karakter' : 'Masukkan kata sandi'}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400 bg-slate-50/50 hover:bg-white transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Kata Sandi (Hanya saat Register) */}
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ulangi Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi Anda"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400 bg-slate-50/50 hover:bg-white transition"
                    required={isRegisterMode}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-500/25 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isRegisterMode ? 'Mendaftarkan Akun...' : 'Memverifikasi...'}</span>
                </>
              ) : (
                <>
                  <span>{isRegisterMode ? 'Daftar & Masuk' : 'Masuk Sekarang'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch mode footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            {isRegisterMode ? (
              <p className="text-xs text-slate-500">
                Sudah memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => switchMode(false)}
                  className="font-bold text-rose-500 hover:text-rose-600 underline cursor-pointer"
                >
                  Masuk di sini
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Belum memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => switchMode(true)}
                  className="font-bold text-rose-500 hover:text-rose-600 underline cursor-pointer"
                >
                  Daftar Akun Pengantin
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
          <p>© 2026 Wedding Planner Digital • Sistem Perencanaan Pernikahan</p>
          <p className="text-[11px] text-slate-400">Terkoneksi dengan Golang REST API &amp; MySQL Database</p>
        </div>
      </div>
    </div>
  );
}
