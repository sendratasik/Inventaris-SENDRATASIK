/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  UserCheck, 
  PenTool, 
  Save, 
  MapPin, 
  Key, 
  Phone,
  CheckCircle,
  X
} from 'lucide-react';
import { User } from '../types';

interface ProfilViewProps {
  user: User;
  onUpdateProfil: (updatedData: { nama: string; password?: string; telepon?: string; ttd?: string }) => void;
}

export default function ProfilView({
  user,
  onUpdateProfil
}: ProfilViewProps) {
  const [profileNama, setProfileNama] = useState(user.nama);
  const [profilePassword, setProfilePassword] = useState(user.password || 'password123');
  const [profileTelepon, setProfileTelepon] = useState(user.telepon || '');
  const [profileTtd, setProfileTtd] = useState(user.ttd || '');

  const [ttdModalOpen, setTtdModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileNama.trim() || !profilePassword.trim()) {
      alert('Nama lengkap dan password wajib diisi!');
      return;
    }

    onUpdateProfil({
      nama: profileNama.trim(),
      password: profilePassword.trim(),
      telepon: profileTelepon.trim(),
      ttd: profileTtd
    });

    alert('Kredensial profil Anda berhasil diperbarui di local storage!');
  };

  // Drawing signature processes
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#f59e0b'; // Amber-500
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setProfileTtd(dataUrl);
    setTtdModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-slate-100 dark:text-white uppercase tracking-wider">Profil Anggota</h1>
        <p className="text-xs text-slate-400 mt-1">Kelola informasi pribadi, ubah kata sandi, dan bubuhkan tanda tangan digital Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card & TTD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="w-20 h-20 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full flex items-center justify-center font-bold text-2xl mx-auto shadow-inner">
              {profileNama.charAt(0)}
            </div>
            <div>
              <h2 className="text-slate-850 dark:text-white font-black text-base leading-snug">{profileNama}</h2>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cabang: {user.cabang}</span>
            </div>
          </div>

          {/* TTD Section */}
          <div className="border-t border-slate-100 dark:border-slate-850 pt-5 space-y-3.5 text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1">
              <PenTool size={13} className="text-amber-500" />
              <span>Tanda Tangan Elektronik</span>
            </h3>

            {profileTtd ? (
              <div className="bg-slate-50 dark:bg-slate-950/40 p-3 border border-slate-150 dark:border-slate-850 rounded-xl flex flex-col items-center justify-center">
                <img src={profileTtd} alt="TTD Anggota" className="max-h-16 object-contain filter mt-1 dark:invert" referrerPolicy="no-referrer" />
                <button
                  type="button"
                  onClick={() => setProfileTtd('')}
                  className="text-[9px] text-red-500 uppercase font-bold tracking-widest mt-3 hover:underline"
                >
                  Hapus Ttd
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-950/40 border-2 border-dashed border-slate-200 dark:border-slate-800 py-6 rounded-xl text-center text-slate-400 text-xs">
                <span className="block text-[10px] font-medium leading-normal mb-2 text-slate-450 px-2">Anda belum mendaftarkan tanda tangan elektronik</span>
                <button
                  onClick={() => setTtdModalOpen(true)}
                  type="button"
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-widest rounded-lg transition"
                >
                  Tulis Sekarang
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Update Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm md:col-span-2">
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-850 dark:text-slate-105 border-b border-slate-100 dark:border-slate-850 pb-3 mb-5">Ubah Akun Informasi</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Username Disabled */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Username Masuk (Akun)</label>
                <input
                  type="text"
                  disabled
                  value={user.username.toUpperCase()}
                  className="w-full bg-slate-100 dark:bg-slate-950 text-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold cursor-not-allowed uppercase font-mono"
                />
              </div>
              {/* Cabang Disabled */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Cabang Kesenian</label>
                <input
                  type="text"
                  disabled
                  value={user.cabang}
                  className="w-full bg-slate-100 dark:bg-slate-950 text-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold cursor-not-allowed"
                />
              </div>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Nama Lengkap Anggota</label>
              <input
                type="text"
                required
                value={profileNama}
                onChange={(e) => setProfileNama(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus:border-amber-500"
              />
            </div>

            {/* Telepon */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1">
                <Phone size={10} className="text-amber-500" />
                <span>Nomor Kontak Whatsapp</span>
              </label>
              <input
                type="tel"
                placeholder="Simulasi no wa: 0812345..."
                value={profileTelepon}
                onChange={(e) => setProfileTelepon(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus:border-amber-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1">
                <Key size={10} className="text-amber-500" />
                <span>Kata Sandi Baru (Kunci)</span>
              </label>
              <input
                type="password"
                required
                value={profilePassword}
                onChange={(e) => setProfilePassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono font-semibold outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end">
              <button
                type="submit"
                className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition shadow-lg shadow-amber-500/15 hover:scale-101 active:scale-99"
              >
                <Save size={14} />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* DRAW COMPILER SIGNATURE CANVAS */}
      {ttdModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div>
                <h3 className="text-white font-extrabold text-sm">Bubuhkan Tanda Tangan Anggota</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">Gambar ttd pada area canvas seutuhnya</p>
              </div>
              <button 
                type="button"
                onClick={() => setTtdModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-5 bg-slate-950 flex justify-center">
              <canvas
                id="profile-signature-canvas"
                ref={canvasRef}
                width={360}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="bg-white border rounded-xl cursor-crosshair max-w-full"
              />
            </div>

            <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={clearCanvas}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTtdModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-450 hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={saveSignature}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 hover:scale-101 active:scale-99 rounded-xl transition"
                >
                  Bubuhkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
