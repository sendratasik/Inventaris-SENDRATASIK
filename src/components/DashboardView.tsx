/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Package, 
  ClipboardCopy, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Database,
  Calendar,
  PenTool,
  Clock,
  ArrowUpRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { User, InventarisItem, PeminjamanRecord, AktivitasLog, Settings } from '../types';

interface DashboardViewProps {
  user: User;
  items: InventarisItem[];
  loans: PeminjamanRecord[];
  logs: AktivitasLog[];
  settings: Settings;
  onUpdateUserSignature: (newTtd: string) => void;
  onTriggerBackup: () => void;
  isBackingUp: boolean;
  onViewDetailedLoans: () => void;
  onViewDetailedInventory: () => void;
}

export default function DashboardView({
  user,
  items,
  loans,
  logs,
  settings,
  onUpdateUserSignature,
  onTriggerBackup,
  isBackingUp,
  onViewDetailedLoans,
  onViewDetailedInventory
}: DashboardViewProps) {
  const [sigCanvasOpen, setSigCanvasOpen] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);

  // Statistics calculation
  const totalItems = items.reduce((acc, item) => acc + item.stok, 0);
  const totalUniqueItems = items.length;
  const damagedItems = items.filter(item => item.kondisi === 'Rusak Ringan' || item.kondisi === 'Rusak Berat').reduce((acc, i) => acc + (i.stok - i.stok_tersedia), 0);
  const missingItems = items.filter(item => item.kondisi === 'Hilang').reduce((acc, i) => acc + i.stok, 0);
  
  const pendingLoans = loans.filter(l => l.status === 'Menunggu Persetujuan').length;
  const activeLoans = loans.filter(l => l.status === 'Disetujui').length;
  const totalLoansCount = loans.length;

  // Pie/Bar calculation for SVG charts
  const categoryCounts: { [key: string]: number } = {};
  items.forEach(item => {
    categoryCounts[item.kategori] = (categoryCounts[item.kategori] || 0) + item.stok;
  });

  const categoriesData = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    value: categoryCounts[cat]
  })).sort((a, b) => b.value - a.value);

  // Signature Canvas Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#2dd4bf'; // Teal-400
    ctx.lineWidth = 3;
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

  const clearSignature = () => {
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
    onUpdateUserSignature(dataUrl);
    setSigCanvasOpen(false);
  };

  // Safe Date conversion for recent items
  const formatTimeAgo = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Sync Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl shadow-slate-950/10">
        <div>
          <div className="flex items-center space-x-2 text-teal-400 mb-1">
            <Sparkles size={16} className="animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase">Halo, {user.nama}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            {user.role === 'pembina' ? 'Pusat Kendali Pengelola' : 'Gerbang Layanan Anggota'}.
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Selamat datang di E-Inventaris Ekstrakurikuler SENDRATASIK MAN Purbalingga. Gunakan platform ini untuk memantau, mengajukan, dan mengelola peralatan seni.
          </p>
        </div>

        {user.role === 'pembina' && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onTriggerBackup}
              disabled={isBackingUp}
              type="button"
              className={`
                flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all
                ${isBackingUp 
                  ? 'bg-teal-600/30 text-teal-400 border border-teal-500/20 cursor-wait' 
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950 border border-teal-400 hover:scale-105 active:scale-95'}
              `}
            >
              <Database className={`w-4 h-4 ${isBackingUp ? 'animate-spin' : ''}`} />
              <span>{isBackingUp ? 'Melakukan Sinkronisasi...' : 'Sinkron Google Sheets'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase">Total Unit Barang</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalItems} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Unit</span></h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <span className="text-teal-500 font-semibold">{totalUniqueItems}</span> <span>Katalog Item Unik</span>
            </p>
          </div>
          <div className="bg-teal-50 dark:bg-teal-950/40 p-4 rounded-xl text-teal-600 dark:text-teal-400 transition-colors group-hover:bg-teal-100 dark:group-hover:bg-teal-950">
            <Package size={24} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase">Peminjaman Aktif</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{activeLoans} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Unit</span></h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <span className="text-amber-500 font-bold">{pendingLoans}</span> <span>Menunggu Persetujuan</span>
            </p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl text-amber-600 dark:text-amber-400 transition-colors group-hover:bg-amber-100 dark:group-hover:bg-amber-950">
            <ClipboardCopy size={24} />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-rose-500 dark:hover:border-rose-500 transition-all duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase">Rusak dlm Pinjaman</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{damagedItems} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Unit</span></h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <span className="text-rose-500 font-semibold">{missingItems}</span> <span>Item Berstatus Hilang</span>
            </p>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-xl text-rose-600 dark:text-rose-400 transition-colors group-hover:bg-rose-100 dark:group-hover:bg-rose-950">
            <AlertTriangle size={24} />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase">Rasio Ketersediaan</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalItems > 0 ? Math.round(((items.reduce((acc, i) => acc + i.stok_tersedia, 0)) / totalItems) * 100) : 0}%
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
              <span className="text-emerald-500 font-semibold">{items.reduce((acc, i) => acc + i.stok_tersedia, 0)}</span> <span>Barang Siap Dipinjam</span>
            </p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl text-emerald-600 dark:text-emerald-400 transition-colors group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Main Grid: Graph and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graph Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Statistik Koleksi Barang</h2>
              <p className="text-xs text-slate-400 mt-0.5">Proporsi inventaris berdasarkan kategori utama ekstrakurikuler</p>
            </div>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center space-x-1">
              <Calendar size={12} />
              <span>Real-time</span>
            </span>
          </div>

          {/* Elegant Custom CSS SVG Graph */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* Vertical Bars and Metrics */}
              <div className="space-y-3.5">
                {categoriesData.map((cat, index) => {
                  const percentage = totalItems > 0 ? Math.round((cat.value / totalItems) * 100) : 0;
                  const barColors = [
                    'bg-teal-500', 
                    'bg-indigo-500', 
                    'bg-amber-500', 
                    'bg-emerald-500', 
                    'bg-rose-500', 
                    'bg-slate-500'
                  ];
                  return (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>{cat.name}</span>
                        <span>{cat.value} Unit ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${barColors[index % barColors.length]}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Graphic Visual Representation (SVG Circle Chart) */}
              <div className="flex flex-col items-center justify-center py-4 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-100 dark:border-slate-850">
                <svg className="w-36 h-36" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* We draw beautiful segments for the major categories */}
                  {categoriesData.slice(0, 3).map((cat, index) => {
                    const percentage = totalItems > 0 ? (cat.value / totalItems) * 100 : 0;
                    const strokeColors = ['#14b8a6', '#6366f1', '#f59e0b']; // teal, indigo, amber
                    
                    // Basic stroke calculations
                    let accum = 0;
                    for (let k = 0; k < index; k++) {
                      accum += totalItems > 0 ? (categoriesData[k].value / totalItems) * 100 : 0;
                    }
                    
                    return (
                      <path
                        key={cat.name}
                        className="transition-all duration-300 hover:stroke-[4]"
                        strokeWidth="3"
                        strokeDasharray={`${percentage}, 100`}
                        strokeDashoffset={`${-accum}`}
                        strokeLinecap="round"
                        stroke={strokeColors[index % strokeColors.length]}
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    );
                  })}
                  <text x="18" y="20.5" className="font-extrabold text-[7px] text-center dark:fill-white text-slate-800 font-sans" textAnchor="middle">
                    SENDRATASIK
                  </text>
                </svg>
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-4 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded bg-teal-500 inline-block"></span> <span>{categoriesData[0]?.name || '-'}</span></span>
                  <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block"></span> <span>{categoriesData[1]?.name || '-'}</span></span>
                  <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span> <span>{categoriesData[2]?.name || '-'}</span></span>
                </div>
              </div>

            </div>
            
            {/* Quick Navigation Footer */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-850 gap-4 mt-2">
              <button 
                onClick={onViewDetailedInventory}
                type="button" 
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1"
              >
                <span>Lihat Koleksi Inventaris</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activities & TTD Section */}
        <div className="space-y-6">
          
          {/* Activities Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Aktivitas Sistem</h2>
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-400 dark:text-slate-300">
                <Activity size={16} />
              </div>
            </div>
            
            <div className="space-y-4 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
              {logs.map((log) => (
                <div key={log.id} className="flex space-x-3 text-xs leading-normal">
                  <div className="mt-1 flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-teal-400 border-2 border-teal-200 dark:border-teal-900 animate-pulse"></span>
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <p className="text-slate-800 dark:text-slate-200">
                      <span className="font-bold">{log.username}</span> ({log.role}): {log.keterangan}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                      <Clock size={10} />
                      <span>{formatTimeAgo(log.timestamp)}</span>
                      <span className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded">{log.id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pembina Signature Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center space-x-1.5">
                  <PenTool size={16} className="text-teal-500" />
                  <span>Tanda Tangan Digital</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Otorisasi peminjaman instan</p>
              </div>
              <button 
                onClick={() => setSigCanvasOpen(true)}
                type="button" 
                className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg transition"
              >
                {user.ttd ? 'Ubah' : 'Tulis Ttd'}
              </button>
            </div>

            {user.ttd ? (
              <div className="bg-teal-50/20 dark:bg-teal-950/20 border border-dashed border-teal-500/20 rounded-xl p-3 flex flex-col items-center justify-center">
                <img src={user.ttd} alt="Digital Signature" className="max-h-16 object-contain filter dark:invert" referrerPolicy="no-referrer" />
                <span className="text-[9px] text-teal-500 font-bold uppercase tracking-wider mt-2 bg-teal-500/10 px-2 py-0.5 rounded">Tandatangan Pembina Terdaftar</span>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl py-6 flex flex-col items-center justify-center text-slate-400 text-xs">
                <PenTool size={20} className="stroke-1 mb-1.5 text-slate-300 dark:text-slate-650" />
                <span className="text-[10px] font-medium">Belum ada tanda tangan</span>
                <span className="text-[9px] text-slate-400 text-center px-4 mt-0.5">Wajib diisi oleh Pembina untuk memproses persetujuan berkas pinjam secara otomatis</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Signature Pad Modal Drawer */}
      {sigCanvasOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div>
                <h3 className="text-white font-bold text-sm">Gambarkan Tanda Tangan Digital</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">Gunakan touchpad atau jari Anda pada layar smartphone</p>
              </div>
              <button 
                type="button"
                onClick={() => setSigCanvasOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            
            <div className="p-5 bg-slate-950 flex justify-center">
              <canvas
                id="signature-pad-canvas"
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
                onClick={clearSignature}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSigCanvasOpen(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-450 hover:bg-slate-800 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={saveSignature}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl shadow-lg transition"
                >
                  Simpan TTD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
