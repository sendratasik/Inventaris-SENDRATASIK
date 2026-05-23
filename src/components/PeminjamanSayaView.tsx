/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  History,
  Tag,
  ArrowRight
} from 'lucide-react';
import { PeminjamanRecord, InventarisItem, User } from '../types';

interface PeminjamanSayaViewProps {
  user: User;
  loans: PeminjamanRecord[];
  items: InventarisItem[];
  onRequestLoan: (record: { kode_barang: string; nama_barang: string; tanggal_pinjam: string; tanggal_jatuh_tempo: string }) => void;
}

export default function PeminjamanSayaView({
  user,
  loans,
  items,
  onRequestLoan
}: PeminjamanSayaViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItemKode, setSelectedItemKode] = useState('');
  const [tanggalPinjam, setTanggalPinjam] = useState('2026-05-23'); // Standard default
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState('2026-05-26');

  // Filter only current user's loans
  const myLoans = loans.filter(l => l.peminjam === user.username);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemKode) {
      alert('Pilih barang terlebih dahulu!');
      return;
    }

    const targetItem = items.find(i => i.kode === selectedItemKode);
    if (!targetItem) return;

    if (new Date(tanggalJatuhTempo) <= new Date(tanggalPinjam)) {
      alert('Tanggal jatuh tempo pengembalian wajib setelah tanggal peminjaman!');
      return;
    }

    onRequestLoan({
      kode_barang: targetItem.kode,
      nama_barang: targetItem.nama,
      tanggal_pinjam: tanggalPinjam,
      tanggal_jatuh_tempo: tanggalJatuhTempo
    });

    setModalOpen(false);
    setSelectedItemKode('');
  };

  // Safe availability check
  const availableItems = items.filter(i => i.stok_tersedia > 0 && i.kondisi === 'Baik');

  return (
    <div className="space-y-6">
      
      {/* Upper Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Peminjaman Saya</h1>
          <p className="text-xs text-slate-400 mt-1">Daftar peminjaman barang aktif dan peninjauan riwayat permohonan Anda</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          type="button"
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-amber-500/15"
        >
          <Plus size={16} />
          <span>Ajukan Peminjaman</span>
        </button>
      </div>

      {/* Grid of Peminjaman Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myLoans.map(loan => (
          <div 
            key={loan.id}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 shadow-sm space-y-4 hover:border-amber-500/20 transition duration-300"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs text-slate-400 font-bold tracking-wider">{loan.id}</span>
                <h3 className="font-bold text-sm text-slate-800 dark:text-gray-100 line-clamp-1 mt-0.5">{loan.nama_barang}</h3>
                <span className="text-[10px] bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-850 text-teal-400 font-bold font-mono tracking-wide">{loan.kode_barang}</span>
              </div>
              <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider
                ${loan.status === 'Menunggu Persetujuan' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : ''}
                ${loan.status === 'Disetujui' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : ''}
                ${loan.status === 'Dikembalikan' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : ''}
                ${loan.status === 'Ditolak' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700' : ''}
              `}>
                {loan.status}
              </span>
            </div>

            {/* Timeline info */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between font-bold">
                <span className="flex items-center space-x-1.5">
                  <Calendar size={12} />
                  <span>Tgl Pinjam:</span>
                </span>
                <span className="text-slate-700 dark:text-slate-350">{loan.tanggal_pinjam}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="flex items-center space-x-1.5">
                  <Clock size={12} className="text-red-400" />
                  <span>Batas Kembali:</span>
                </span>
                <span className="text-red-500">{loan.tanggal_jatuh_tempo}</span>
              </div>
              {loan.tanggal_kembali && (
                <div className="flex justify-between font-semibold">
                  <span>Realisasi Kembali:</span>
                  <span className="text-teal-500">{loan.tanggal_kembali}</span>
                </div>
              )}
            </div>

            {/* Verificator */}
            {loan.disetujui_oleh && (
              <p className="text-[10px] text-slate-400 font-bold flex items-center space-x-1.5">
                <CheckCircle size={12} className="text-emerald-500" />
                <span>Otorisator: {loan.disetujui_oleh}</span>
              </p>
            )}

            {/* Fines if any */}
            {loan.status === 'Dikembalikan' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold block">Status Sanksi/Denda:</span>
                {loan.denda > 0 ? (
                  <span className="text-rose-500 font-extrabold bg-rose-500/10 px-2.5 py-1 rounded">
                    Denda: Rp{loan.denda.toLocaleString('id-ID')}
                  </span>
                ) : (
                  <span className="text-emerald-500 font-black bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">Lunas/Aman</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {myLoans.length === 0 && (
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <History size={32} className="stroke-1 text-slate-300 dark:text-slate-750 mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-350 text-sm">Belum ada pengajuan peminjaman</h3>
          <p className="text-slate-400 text-xs px-6 mt-1">Klik tombol 'Ajukan Peminjaman' untuk mulai memesan dan meminjam peralatan Sendratasik.</p>
        </div>
      )}

      {/* REQUEST LOAN MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/55">
              <div>
                <h3 className="text-slate-900 dark:text-white font-extrabold text-sm tracking-wider uppercase">Ajukan Peminjaman</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">Permohonan pemakaian aset inventaris Purbalingga</p>
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
              {/* Select Item */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Pilih Barang Siap Pakai</label>
                <select
                  required
                  value={selectedItemKode}
                  onChange={(e) => setSelectedItemKode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none"
                >
                  <option value="">-- Silakan Pilih Barang --</option>
                  {availableItems.map(item => (
                    <option key={item.kode} value={item.kode}>
                      {item.kode} - {item.nama} (Stok: {item.stok_tersedia})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={tanggalPinjam}
                    onChange={(e) => setTanggalPinjam(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Jatuh Tempo Kembali</label>
                  <input
                    type="date"
                    required
                    value={tanggalJatuhTempo}
                    onChange={(e) => setTanggalJatuhTempo(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1 text-[10px] text-slate-500 leading-normal">
                <p className="font-extrabold text-amber-500 flex items-center space-x-1 uppercase tracking-wider">
                  <AlertTriangle size={12} />
                  <span>Sanksi & Denda Keterlambatan:</span>
                </p>
                <p>Wajib mengembalikan barang tepat waktu. Keterlambatan berkonsekuensi denda harian hulu. Apabila barang rusak berat/hilang, wajib meregenerasi/mengganti dengan barang baru serupa.</p>
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
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-lg transition"
                >
                  Ajukan Permohonan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
