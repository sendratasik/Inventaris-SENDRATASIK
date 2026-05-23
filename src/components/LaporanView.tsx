/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  MapPin, 
  Compass, 
  TrendingUp, 
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { InventarisItem, PeminjamanRecord } from '../types';
import { CATEGORIES } from '../data';

interface LaporanViewProps {
  items: InventarisItem[];
  loans: PeminjamanRecord[];
}

export default function LaporanView({
  items,
  loans
}: LaporanViewProps) {
  const [reportCategory, setReportCategory] = useState('Semua');
  const [reportCondition, setReportCondition] = useState('Semua');

  // Filter items for report
  const reportItems = items.filter(item => {
    const matchesCategory = reportCategory === 'Semua' || item.kategori === reportCategory;
    const matchesCondition = reportCondition === 'Semua' || item.kondisi === reportCondition;
    return matchesCategory && matchesCondition;
  });

  // Export to Excel (CSV format that opens instantly in Excel with correct encodings)
  const handleExportExcel = () => {
    if (reportItems.length === 0) {
      alert('Tidak ada data untuk diexport!');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Header
    csvContent += 'LAPORAN INVENTARIS BARANG EKSTRAKURIKULER SENDRATASIK MAN PURBALINGGA\r\n';
    csvContent += `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}\r\n\r\n`;
    csvContent += 'Kode Barang,Nama Barang,Kategori,Kondisi,Lokasi Penyimpanan,Total Stok,Stok Tersedia,Nilai Kelayakan\r\n';

    // Rows
    reportItems.forEach(item => {
      const row = [
        `"${item.kode}"`,
        `"${item.nama}"`,
        `"${item.kategori}"`,
        `"${item.kondisi}"`,
        `"${item.lokasi}"`,
        item.stok,
        item.stok_tersedia,
        item.kondisi === 'Baik' ? '100% Layak' : item.kondisi === 'Rusak Ringan' ? '70% Layak' : '0% Rusak'
      ].join(',');
      csvContent += row + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Inventaris_SENDRATASIK_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Browser print window driver
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Laporan Inventaris & Pengembalian</h1>
          <p className="text-xs text-slate-400 mt-1">Hasilkan berkas administrasi dan lembar audit aset fisik Sendratasik</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV button */}
          <button
            onClick={handleExportExcel}
            type="button"
            className="flex items-center space-x-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            <FileSpreadsheet size={16} />
            <span>Unduh Excel (CSV)</span>
          </button>

          {/* Print button */}
          <button
            onClick={handlePrint}
            type="button"
            className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-teal-500/15"
          >
            <Printer size={16} />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Filters ledger */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Saring Kategori</label>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-gray-300 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs font-semibold outline-none focus:ring-1 focus:ring-teal-500 transition animate-none"
            >
              <option value="Semua">Semua Kategori</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Saring Kondisi Perlengkapan</label>
            <select
              value={reportCondition}
              onChange={(e) => setReportCondition(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-gray-300 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs font-semibold outline-none focus:ring-1 focus:ring-teal-500 transition animate-none"
            >
              <option value="Semua">Semua Kondisi Fisik</option>
              <option value="Baik">Layak Pakai (Baik)</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
              <option value="Hilang">Hilang</option>
            </select>
          </div>
        </div>
      </div>

      {/* Printable Ledger Layout */}
      <div className="bg-white text-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 dark:bg-slate-900 p-8 shadow-sm space-y-6" id="printable-report-card">
        
        {/* Printable Header - hidden in normal dashboard but visible in print media */}
        <div className="text-center pb-6 border-b-2 border-slate-900 space-y-2">
          <h2 className="text-sm font-black tracking-widest uppercase text-slate-900 dark:text-white">PEMERINTAH PROVINSI JAWA TENGAH</h2>
          <h1 className="text-lg font-black tracking-wider text-slate-950 dark:text-white leading-none">MADRASAH ALIYAH NEGERI (MAN) PURBALINGGA</h1>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Jalan KH. Ahmad Dahlan No.3 Purbalingga | Telp: (0281) 891334</p>
          <div className="pt-2">
            <span className="inline-block border-t border-slate-300 dark:border-slate-800 w-full mb-1"></span>
            <h3 className="text-xs font-extrabold tracking-widest uppercase text-slate-900 dark:text-white">LAPORAN REKAPITULASI INVENTARIS EKSTRAKURIKULER SENDRATASIK</h3>
            <p className="text-[9px] text-slate-400 mt-1 font-bold">Periode: Mei 2026 | Saringan: Kategori [{reportCategory}] | Kondisi [{reportCondition}]</p>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 text-center border-b border-slate-150 dark:border-slate-850">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
            <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Item Jenis</span>
            <strong className="text-xl text-slate-800 dark:text-slate-200">{reportItems.length}</strong>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
            <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Total Fisik Unit</span>
            <strong className="text-xl text-slate-800 dark:text-slate-200">
              {reportItems.reduce((acc, i) => acc + i.stok, 0)}
            </strong>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
            <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Unit Siap Pakai</span>
            <strong className="text-xl text-emerald-500">
              {reportItems.reduce((acc, i) => acc + i.stok_tersedia, 0)}
            </strong>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
            <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Rasio Layak</span>
            <strong className="text-xl text-indigo-500">
              {reportItems.length > 0 ? Math.round((reportItems.filter(i => i.kondisi === 'Baik').length / reportItems.length) * 100) : 0}%
            </strong>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-[11px] text-left border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-950 font-extrabold uppercase text-[9px] tracking-wider border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-800">Kode</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-800">Nama Barang Inventaris</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-800">Kategori</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-800">Kondisi</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-800">Lokasi Pos</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-800 text-center">Stok Total</th>
                <th className="px-4 py-3 text-center">Tersedia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800">
              {reportItems.map((item) => (
                <tr key={item.kode} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 text-slate-700 dark:text-slate-200">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white border-r border-slate-150 dark:border-slate-800">{item.kode}</td>
                  <td className="px-4 py-3 font-bold border-r border-slate-150 dark:border-slate-800">{item.nama}</td>
                  <td className="px-4 py-3 border-r border-slate-150 dark:border-slate-800">{item.kategori}</td>
                  <td className="px-4 py-3 font-semibold border-r border-slate-150 dark:border-slate-800">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider
                      ${item.kondisi === 'Baik' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : ''}
                      ${item.kondisi === 'Rusak Ringan' ? 'bg-amber-500/10 text-amber-500' : ''}
                      ${item.kondisi === 'Rusak Berat' ? 'bg-rose-500/10 text-rose-500' : ''}
                      ${item.kondisi === 'Hilang' ? 'bg-indigo-500/10 text-indigo-400' : ''}
                    `}>
                      {item.kondisi}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-150 dark:border-slate-800 font-medium">{item.lokasi}</td>
                  <td className="px-4 py-3 text-center font-bold border-r border-slate-150 dark:border-slate-800">{item.stok}</td>
                  <td className="px-4 py-3 text-center font-bold">{item.stok_tersedia}</td>
                </tr>
              ))}
              {reportItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400 italic">Tidak ada catatan data inventaris terpilih.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Autograph signature box - visible in prints */}
        <div className="pt-10 flex justify-end gap-12">
          <div className="text-center w-48 space-y-12">
            <div>
              <p className="text-[10px] font-bold text-slate-500">Purbalingga, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-xs font-bold text-slate-800 dark:text-white leading-none mt-1">Pembina Ekstrakurikuler,</p>
            </div>
            
            <div className="border-b border-slate-400 py-3 flex justify-center h-16 items-center">
              <span className="text-[9px] text-slate-400 italic font-medium">[Tandatangan Autis Digital]</span>
            </div>

            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase">Drs. H. Mulyono, M.Pd.</p>
              <p className="text-[9px] font-bold text-slate-400">NIP. 196904121995031002</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
