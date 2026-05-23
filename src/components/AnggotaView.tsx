/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Key, 
  MapPin, 
  UserCheck, 
  Check,
  AlertCircle
} from 'lucide-react';
import { User } from '../types';

interface AnggotaViewProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onDeleteUser: (id: string) => void;
}

export default function AnggotaView({
  users,
  onAddUser,
  onDeleteUser
}: AnggotaViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [nama, setNama] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'pembina' | 'anggota'>('anggota');
  const [cabang, setCabang] = useState(''); // Text manual as requested!
  const [telepon, setTelepon] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !nama.trim() || !password.trim() || !cabang.trim()) {
      alert('Semua isian wajib diisi lengkap!');
      return;
    }

    onAddUser({
      username: username.toLowerCase().trim(),
      nama: nama.trim(),
      password: password.trim(),
      role,
      cabang: cabang.trim(),
      telepon: telepon.trim() || undefined,
      ttd: ''
    });

    setModalOpen(false);
    setUsername('');
    setNama('');
    setPassword('');
    setRole('anggota');
    setCabang('');
    setTelepon('');
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Pengelola Pengguna / Anggota</h1>
          <p className="text-xs text-slate-400 mt-1">Daftar otoritas user dengan akses masuk ke sistem E-Inventaris MAN Purbalingga</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          type="button"
          className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-teal-500/15"
        >
          <UserPlus size={16} />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Users table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-350">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase tracking-widest font-black text-[9px] border-b border-slate-100 dark:border-slate-850">
              <tr>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Username Akun</th>
                <th className="px-6 py-4">Password (Kunci)</th>
                <th className="px-6 py-4">Cabang Kesenian (Manual)</th>
                <th className="px-6 py-4">Kontak Telepon</th>
                <th className="px-6 py-4">Otoritas Link</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
              {users.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                  
                  {/* Name and avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-teal-400 text-xs">
                        {item.nama.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-850 dark:text-white leading-tight">{item.nama}</p>
                        <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase font-mono">{item.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Username */}
                  <td className="px-6 py-4 uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300">
                    {item.username}
                  </td>

                  {/* Password (explicitly requested to assist Pembina's memory) */}
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Key size={12} className="text-amber-500 shrink-0" />
                      <span>{item.password || '********'}</span>
                    </span>
                  </td>

                  {/* Manual Cabang */}
                  <td className="px-6 py-4 font-semibold text-slate-700 dark:text-gray-300">
                    {item.cabang || 'Seni - Umum'}
                  </td>

                  {/* Telepon */}
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold">
                    {item.telepon || '(Belum mendaftar)'}
                  </td>

                  {/* Role Badge */}
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border
                      ${item.role === 'pembina' 
                        ? 'bg-teal-500/10 text-teal-500 border-teal-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}
                    >
                      {item.role}
                    </span>
                  </td>

                  {/* Delete button (cannot delete main admin) */}
                  <td className="px-6 py-4 text-right">
                    {item.username !== 'pembina' && item.username !== 'sarpras' ? (
                      <button
                        type="button"
                        onClick={() => { if(confirm('Yakin ingin menghapus pengguna ini secara permanen?')) onDeleteUser(item.id); }}
                        className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition"
                        title="Hapus Pengguna"
                      >
                        <Trash2 size={13} />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold italic">Sistem Utama</span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW USER MODAL (Tampilan Manual Cabang & Password) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/55">
              <div>
                <h3 className="text-slate-900 dark:text-white font-extrabold text-sm tracking-wider uppercase">Registrasi Pengguna Baru</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">Membuat kredensial akun pembina atau anggota</p>
              </div>
              <button 
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Nama Lengkap */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Fatma Az-Zahra, S.Sn."
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Username */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Username Masuk</label>
                  <input
                    type="text"
                    required
                    placeholder="fatma"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus:border-teal-500"
                  />
                </div>
                {/* Password */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Kunci Sandi (Password)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ketik manual"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono font-semibold outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Cabang Kesenian - Tulis Manual (Not Dropdown!) as requested */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Cabang Ekstrakurikuler (TULIS MANUAL)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tari Tradisional, Teater Keramik, Musik Hadroh"
                  value={cabang}
                  onChange={(e) => setCabang(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus:border-teal-500"
                />
                <span className="text-[9px] text-amber-500 mt-1 block">
                  *Sesuai arahan, ketik manual nama sub-kesenian/tugas secara mandiri.
                </span>
              </div>

              {/* No Telepon */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Nomor WA / Telepon</label>
                <input
                  type="tel"
                  placeholder="0812345..."
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none"
                />
              </div>

              {/* Otoritas */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Otoritas Akses Sistem</label>
                <div className="flex gap-4 mt-1.5 text-xs font-bold">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="form-role"
                      checked={role === 'anggota'}
                      onChange={() => setRole('anggota')}
                      className="accent-amber-500"
                    />
                    <span className="text-slate-600 dark:text-slate-350">Anggota</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="form-role"
                      checked={role === 'pembina'}
                      onChange={() => setRole('pembina')}
                      className="accent-teal-500"
                    />
                    <span className="text-slate-600 dark:text-slate-350">Pembina</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-wider bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl shadow-lg transition"
                >
                  TAMBAH USER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
