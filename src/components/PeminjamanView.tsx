/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Clipboard, 
  Clock, 
  Check, 
  X, 
  Undo2, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';
import { PeminjamanRecord, User as UserType, Settings } from '../types';

interface PeminjamanViewProps {
  pembina: UserType;
  loans: PeminjamanRecord[];
  settings: Settings;
  onApproveLoan: (id: string, pembinaNama: string, ttd: string) => void;
  onRejectLoan: (id: string) => void;
  onReturnLoan: (id: string, denda: number, keteranganDenda: string, kondisiAkhir: 'Baik' | 'Rusak Ringan' | 'Rusak Berat' | 'Hilang') => void;
}

export default function PeminjamanView({
  pembina,
  loans,
  settings,
  onApproveLoan,
  onRejectLoan,
  onReturnLoan
}: PeminjamanViewProps) {
  const [activeTab, setActiveTab] = useState<'semua' | 'menunggu' | 'disetujui' | 'sejarah'>('menunggu');
  const [returnMopdalOpen, setReturnModalOpen] = useState(false);
  const [selectedReturnLoan, setSelectedReturnLoan] = useState<PeminjamanRecord | null>(null);

  // Form states for returning item
  const [returnDenda, setReturnDenda] = useState(0);
  const [returnKeterangan, setReturnKeterangan] = useState('');
  const [returnKondisiBaru, setReturnKondisiBaru] = useState<'Baik' | 'Rusak Ringan' | 'Rusak Berat' | 'Hilang'>('Baik');

  // Trigger return process modal
  const handleInitiateReturn = (loan: PeminjamanRecord) => {
    setSelectedReturnLoan(loan);
    
    // Calculate simulated denda based on current date vs jatuh tempo
    const today = new Date('2026-05-23'); // Fixed sample date from instruction session
    const dueDate = new Date(loan.tanggal_jatuh_tempo);
    const timeDiff = today.getTime() - dueDate.getTime();
    const daysLate = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    let calculatedDenda = 0;
    let autoKetDenda = '';

    if (daysLate > 0) {
      calculatedDenda = daysLate * settings.nominal_denda_per_hari;
      autoKetDenda = `Terlambat ${daysLate} hari (Tarif denda Rp${settings.nominal_denda_per_hari.toLocaleString('id-ID')} / hari)`;
    } else {
      calculatedDenda = 0;
      autoKetDenda = 'Dikembalikan tepat waktu';
    }

    setReturnDenda(calculatedDenda);
    setReturnKeterangan(autoKetDenda);
    setReturnKondisiBaru('Baik');
    setReturnModalOpen(true);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturnLoan) return;

    onReturnLoan(
      selectedReturnLoan.id,
      returnDenda,
      returnKeterangan,
      returnKondisiBaru
    );
    setReturnModalOpen(false);
    setSelectedReturnLoan(null);
  };

  // Adjust denda when condition is modified
  const handleKondisiChange = (cond: 'Baik' | 'Rusak Ringan' | 'Rusak Berat' | 'Hilang') => {
    setReturnKondisiBaru(cond);
    if (!selectedReturnLoan) return;

    if (cond === 'Hilang') {
      setReturnDenda(prev => prev + 150000); // Base fee for replacement
      setReturnKeterangan(prev => `${prev ? prev + ' + ' : ''}Sanksi Hilang: Wajib mengganti item baru atau denda pengadaan barang Rp150.000`);
    } else if (cond === 'Rusak Berat') {
      setReturnDenda(prev => prev + 75000);
      setReturnKeterangan(prev => `${prev ? prev + ' + ' : ''}Sanksi Rusak Berat: Denda perbaikan/pengantian komponen Rp75.000`);
    } else if (cond === 'Rusak Ringan') {
      setReturnDenda(prev => prev + 25000);
      setReturnKeterangan(prev => `${prev ? prev + ' + ' : ''}Sanksi Rusak Ringan: Denda perbaikan ringan Rp25.000`);
    }
  };

  // Safe checks for signature
  const handleApprove = (loan: PeminjamanRecord) => {
    if (!pembina.ttd) {
      alert('Anda harus mendaftarkan Tanda Tangan Anda di Dashboard terlebih dahulu sebelum menyetujui peminjaman!');
      return;
    }
    
    const confirmApprove = confirm(`Setujui permohonan peminjaman ${loan.nama_barang} oleh ${loan.nama_peminjam}?`);
    if (confirmApprove) {
      onApproveLoan(loan.id, pembina.nama, pembina.ttd);
    }
  };

  // Format IDR Currency
  const formatIDR = (value: number) => {
    return 'Rp' + value.toLocaleString('id-ID');
  };

  // Filtering loans
  const filteredLoans = loans.filter(loan => {
    if (activeTab === 'menunggu') return loan.status === 'Menunggu Persetujuan';
    if (activeTab === 'disetujui') return loan.status === 'Disetujui';
    if (activeTab === 'sejarah') return loan.status === 'Dikembalikan' || loan.status === 'Ditolak';
    return true; // semua
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Kelola Peminjaman Barang</h1>
        <p className="text-xs text-slate-400 mt-1">Gunakan panel ini untuk memverifikasi entri peminjaman dan mengatur kepatuhan pengembalian barang</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('menunggu')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition
            ${activeTab === 'menunggu' 
              ? 'border-teal-500 text-teal-600 dark:text-teal-400' 
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
        >
          Menunggu ({loans.filter(l => l.status === 'Menunggu Persetujuan').length})
        </button>
        <button
          onClick={() => setActiveTab('disetujui')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition
            ${activeTab === 'disetujui' 
              ? 'border-teal-500 text-teal-600 dark:text-teal-400' 
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
        >
          Disetujui / Aktif ({loans.filter(l => l.status === 'Disetujui').length})
        </button>
        <button
          onClick={() => setActiveTab('sejarah')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition
            ${activeTab === 'sejarah' 
              ? 'border-teal-500 text-teal-600 dark:text-teal-400' 
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
        >
          Riwayat Pengembalian
        </button>
        <button
          onClick={() => setActiveTab('semua')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition
            ${activeTab === 'semua' 
              ? 'border-teal-500 text-teal-600 dark:text-teal-400' 
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
        >
          Semua Data ({loans.length})
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-350">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase tracking-widest font-black text-[9px] border-b border-slate-100 dark:border-slate-850">
              <tr>
                <th className="px-6 py-4">ID Transaksi</th>
                <th className="px-6 py-4">Peminjam</th>
                <th className="px-6 py-4 font-normal text-slate-400">Nama Barang / Kode</th>
                <th className="px-6 py-4">Pinjam - Jatuh Tempo</th>
                <th className="px-6 py-4">Kondisi / Denda</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                  
                  {/* Transaction ID */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-slate-900 dark:text-white font-bold">{loan.id}</span>
                  </td>

                  {/* Borrower */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-teal-400">
                        {loan.nama_peminjam.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white leading-tight">{loan.nama_peminjam}</p>
                        <span className="text-[10px] text-slate-400 font-medium tracking-wide">@{loan.peminjam}</span>
                      </div>
                    </div>
                  </td>

                  {/* Borrowed Item */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-slate-850 dark:text-slate-200 line-clamp-1">{loan.nama_barang}</p>
                      <span className="text-[10px] font-mono text-teal-500 font-bold tracking-wider">{loan.kode_barang}</span>
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-700 dark:text-slate-350">{loan.tanggal_pinjam}</p>
                      <span className="text-[10px] text-red-500 font-medium">Batas: {loan.tanggal_jatuh_tempo}</span>
                    </div>
                  </td>

                  {/* Cond/Fine */}
                  <td className="px-6 py-4">
                    {loan.status === 'Dikembalikan' ? (
                      <div>
                        {loan.denda > 0 ? (
                          <>
                            <p className="font-bold text-rose-500">{formatIDR(loan.denda)}</p>
                            <span className="text-[9px] text-slate-400 block line-clamp-1" title={loan.keterangan_denda}>{loan.keterangan_denda}</span>
                          </>
                        ) : (
                          <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">Tepat Waktu</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium">-</span>
                    )}
                  </td>

                  {/* Status Badges */}
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider
                      ${loan.status === 'Menunggu Persetujuan' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : ''}
                      ${loan.status === 'Disetujui' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : ''}
                      ${loan.status === 'Dikembalikan' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : ''}
                      ${loan.status === 'Ditolak' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700' : ''}
                    `}>
                      {loan.status}
                    </span>
                  </td>

                  {/* Action buttons */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      {loan.status === 'Menunggu Persetujuan' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(loan)}
                            className="bg-teal-500 hover:bg-teal-400 text-slate-950 p-1.5 rounded-lg transition"
                            title="Setujui Peminjaman"
                          >
                            <Check size={14} className="stroke-2" />
                          </button>
                          <button
                            type="button"
                            onClick={() => { if(confirm('Yakin ingin menolak pengajuan ini?')) onRejectLoan(loan.id); }}
                            className="bg-rose-500 hover:bg-rose-400 text-white p-1.5 rounded-lg transition"
                            title="Tolak Pengajuan"
                          >
                            <X size={14} className="stroke-2" />
                          </button>
                        </>
                      )}

                      {loan.status === 'Disetujui' && (
                        <button
                          type="button"
                          onClick={() => handleInitiateReturn(loan)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1"
                        >
                          <Undo2 size={11} />
                          <span>Kembalikan</span>
                        </button>
                      )}

                      {loan.status === 'Dikembalikan' && loan.tanda_tangan_pembina && (
                        <div className="text-[10px] text-teal-500 font-bold flex items-center space-x-1 py-1">
                          <CheckCircle size={12} />
                          <span>TERVERIFIKASI TTD</span>
                        </div>
                      )}
                      
                      {loan.status === 'Ditolak' && (
                        <span className="text-slate-400 italic text-[10px] font-medium">- Ditolak -</span>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLoans.length === 0 && (
          <div className="text-center py-10">
            <Clipboard size={32} className="mx-auto text-slate-350 dark:text-slate-750 stroke-1 mb-2" />
            <p className="text-slate-400 font-bold text-xs">Tidak ada usulan data transaksi peminjaman di tab ini</p>
          </div>
        )}
      </div>

      {/* DETAILED RETURN FORM MODAL (Fitur Denda & Penggantian Sanksi) */}
      {returnMopdalOpen && selectedReturnLoan && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/55">
              <div>
                <h3 className="text-slate-900 dark:text-white font-extrabold text-sm tracking-wider uppercase">Proses Pengembalian Barang</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">Evaluasi kondisi akhir barang dan denda keterlambatan</p>
              </div>
              <button 
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Nama Barang:</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedReturnLoan.nama_barang}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Peminjam:</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedReturnLoan.nama_peminjam}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Jatuh Tempo:</span>
                  <span className="text-red-500">{selectedReturnLoan.tanggal_jatuh_tempo}</span>
                </div>
              </div>

              {/* Kondisi Akhir Barang */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Kondisi Akhir Barang</label>
                <select
                  value={returnKondisiBaru}
                  onChange={(e) => handleKondisiChange(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none"
                >
                  <option value="Baik">Bagus / Utuh / Normal (Baik)</option>
                  <option value="Rusak Ringan">Rusak Ringan (Tergores / Komponen Longgar)</option>
                  <option value="Rusak Berat">Rusak Berat (Tidak Berfungsi / Patah)</option>
                  <option value="Hilang">Hilang / Lenyap (Ganti Baru)</option>
                </select>
                <span className="text-[9px] text-slate-400 mt-1 block leading-normal italic">
                  *Memilih 'Rusak Berat' atau 'Hilang' akan secara otomatis menyusutkan stok total inventaris seutuhnya.
                </span>
              </div>

              {/* Denda */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Nominal Denda (Rupiah)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-xs text-rose-500">Rp</span>
                  <input
                    type="number"
                    min={0}
                    value={returnDenda}
                    onChange={(e) => setReturnDenda(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-rose-500 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-extrabold outline-none"
                  />
                </div>
              </div>

              {/* Keterangan Denda */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Catatan / Keterangan Sanksi & Denda</label>
                <textarea
                  rows={2}
                  required
                  value={returnKeterangan}
                  onChange={(e) => setReturnKeterangan(e.target.value)}
                  placeholder="Contoh: Terlambat dikembalikan 2 hari, kondisi aman..."
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>

              {/* TTD notice */}
              <div className="flex gap-2 items-start p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-[10px] text-slate-500 leading-normal">
                <CheckCircle className="text-teal-400 w-5 h-5 shrink-0 mt-0.5" />
                <span>
                  <strong>Terintegrasi TTD Digital Pembina!</strong> Pengesahan tanda tangan Anda akan secara otomatis terlampir pada resi digital pengembalian ini.
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReturnModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-lg transition"
                >
                  PROSES PENGEMBALIAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
