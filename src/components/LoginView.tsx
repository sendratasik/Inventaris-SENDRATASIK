/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Lock, 
  User as UserIcon, 
  Music, 
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { Settings } from '../types';

interface LoginViewProps {
  onLoginSuccess: (username: string, role: 'pembina' | 'anggota') => boolean;
  settings: Settings;
}

export default function LoginView({
  onLoginSuccess,
  settings
}: LoginViewProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Username dan password wajib diisi!');
      return;
    }

    // Try verifying credentials
    const success = onLoginSuccess(usernameInput.trim().toLowerCase(), passwordInput.trim() as any);
    if (!success) {
      setErrorMessage('Username atau Password yang Anda masukkan tidak sesuai!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-[120px] -z-10"></div>

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative">
        
         {/* Branding header */}
        <div className="text-center space-y-3 mb-6">
          <div className="flex justify-center">
            {settings.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt="Logo Ekstra" 
                className="w-16 h-16 rounded-full border-2 border-teal-500 object-cover shadow-lg shadow-teal-500/10"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-teal-500/15 border-2 border-teal-500 flex items-center justify-center text-teal-400">
                <Music size={28} />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black tracking-widest text-teal-400 uppercase">E-INVENTARIS SYSTEM</span>
            <h1 className="text-xs font-bold leading-tight text-white tracking-widest line-clamp-1">
              {settings.nama_aplikasi}
            </h1>
            <p className="text-[10px] text-slate-450 uppercase tracking-widest font-extrabold max-w-xs mx-auto text-center text-slate-400">
              MAN PURBALINGGA
            </p>
          </div>
        </div>

        {/* Form panel */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Error notice */}
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/25 p-3 rounded-xl text-rose-450 hover:text-rose-400 text-xs font-bold text-center">
              {errorMessage}
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Nama Pengguna (Username)</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="pembina / sarpras"
                className="w-full bg-slate-950/70 border border-slate-800 text-white pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Sandi Masuk (Password)</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Ketik password"
                className="w-full bg-slate-950/70 border border-slate-800 text-white pl-10 pr-10 py-2.5 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 transition"
              />
              <button
                type="button"
                id="toggle-password-visibility"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-350"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-99 transition-all flex items-center justify-center space-x-2 mt-2"
          >
            <span>Masuk Aplikasi</span>
            <ArrowRight size={14} className="stroke-2" />
          </button>
        </form>

      </div>

      {/* Footer Branding text */}
      <footer className="text-slate-500 text-[10px] uppercase font-bold tracking-widest text-center mt-6 py-4 max-w-sm px-6 leading-relaxed">
        Aplikasi ini dikembangkan oleh Ekstrakurikuler SENDRATASIK MAN PURBALINGGA
      </footer>

    </div>
  );
}
