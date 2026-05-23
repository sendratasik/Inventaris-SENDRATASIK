/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  HelpCircle, 
  Database, 
  Terminal, 
  Check, 
  Link, 
  CodeXml, 
  Copy, 
  Play, 
  Sparkles,
  Info
} from 'lucide-react';
import { Settings as SettingsType, User } from '../types';
import { GAS_CODE_GS, GOOGLE_SHEETS_STRUCTURE, DEPLOY_MANUAL } from '../gasExporterCode';

interface PengaturanViewProps {
  user: User;
  settings: SettingsType;
  onSaveSettings: (newSettings: SettingsType) => void;
}

export default function PengaturanView({
  user,
  settings,
  onSaveSettings
}: PengaturanViewProps) {
  const [appName, setAppName] = useState(settings.nama_aplikasi);
  const [logoUrl, setLogoUrl] = useState(settings.logo_url);
  const [nominalDenda, setNominalDenda] = useState(settings.nominal_denda_per_hari);
  const [backupOtomatis, setBackupOtomatis] = useState(settings.backup_otomatis);
  const [multiEkskul, setMultiEkskul] = useState(settings.multi_ekskul_enabled);
  const [sheetUrl, setSheetUrl] = useState(settings.sheet_url);

  const [copiedSection, setCopiedSection] = useState<'codegs' | 'structure' | 'manual' | null>(null);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      nama_aplikasi: appName.trim() || 'E-INVENTARIS SENDRATASIK - MAN PURBALINGGA',
      logo_url: logoUrl.trim(),
      nominal_denda_per_hari: nominalDenda,
      backup_otomatis: backupOtomatis,
      multi_ekskul_enabled: multiEkskul,
      sheet_url: sheetUrl.trim()
    });
    alert('Pengaturan aplikasi berhasil disimpan dan disinkronkan ke local storage!');
  };

  const handleCopyText = (content: string, type: 'codegs' | 'structure' | 'manual') => {
    navigator.clipboard.writeText(content);
    setCopiedSection(type);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
  };

  const selectQuickLogo = (url: string) => {
    setLogoUrl(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Pengaturan & Developer Kit</h1>
        <p className="text-xs text-slate-400 mt-1">Sesuaikan branding aplikasi MAN Purbalingga serta copy-paste kode untuk rilis nyata di Google Apps Script</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side: App Branding configuration */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center space-x-2">
            <Settings className="text-teal-500 w-5 h-5" />
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-850 dark:text-slate-100">Branding & Konfigurasi Aplikasi</h2>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            {/* App Name */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Nama Aplikasi (Tulis Manual)</label>
              <input
                type="text"
                required
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="E-INVENTARIS SENDRATASIK - MAN PURBALINGGA"
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus:border-teal-500"
              />
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">URL Logo Ekstrakurikuler </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus:border-teal-500"
              />
              {/* Quick logo presets */}
              <div className="mt-2 text-[10px] font-bold text-slate-400 space-y-1">
                <span>Pilih Cepat Simolator Logo:</span>
                <div className="flex flex-wrap gap-1">
                  <button 
                    type="button" 
                    onClick={() => selectQuickLogo('https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100')} 
                    className="bg-slate-50 hover:bg-slate-150 px-2.5 py-1 rounded border border-slate-150 dark:bg-slate-800 dark:hover:bg-slate-750 text-[9px]"
                  >
                    Sendratasik (Unsplash)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => selectQuickLogo('https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=100')} 
                    className="bg-slate-50 hover:bg-slate-150 px-2.5 py-1 rounded border border-slate-150 dark:bg-slate-800 dark:hover:bg-slate-750 text-[9px]"
                  >
                    Gamelan Artdraw
                  </button>
                  <button 
                    type="button" 
                    onClick={() => selectQuickLogo('')} 
                    className="bg-slate-50 hover:bg-slate-150 px-2.5 py-1 rounded border border-slate-150 dark:bg-slate-800 dark:hover:bg-slate-750 text-[9px]"
                  >
                    Hapus Logo
                  </button>
                </div>
              </div>
            </div>

            {/* Google sheet simulation backup ID */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Tautan Backup Google Sheets</label>
              <div className="relative">
                <Link className="absolute left-3 top-3.5 text-slate-400 w-3.5 h-3.5" />
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-gray-300 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-mono outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Fines per day standard configuration as requested: "Apabila terlambat mengembalikan" */}
            <div className="grid grid-cols-2 gap-3 pb-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Denda Harian (Rupiah)</label>
                <input
                  type="number"
                  min={0}
                  value={nominalDenda}
                  onChange={(e) => setNominalDenda(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold outline-none"
                />
              </div>
              <div className="space-y-1 mt-5">
                <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-white transition">
                  <input
                    type="checkbox"
                    checked={backupOtomatis}
                    onChange={(e) => setBackupOtomatis(e.target.checked)}
                    className="accent-teal-500"
                  />
                  <span>Backup Google otomatis</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-white transition">
                  <input
                    type="checkbox"
                    checked={multiEkskul}
                    onChange={(e) => setMultiEkskul(e.target.checked)}
                    className="accent-teal-500"
                  />
                  <span>Otoritas Multi Ekskul</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 px-5 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all shadow-lg shadow-teal-500/10 hover:scale-101 active:scale-99"
            >
              SIMPAN SELURUH KONFIGURASI
            </button>
          </form>
        </div>

        {/* Right Side: Google Apps Script Quick Sandbox Developer manual */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Terminal className="text-amber-400 w-5 h-5" />
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-white">Google Sheets SDK Sandbox</h2>
            </span>
            <span className="bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Active SDK</span>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-normal">
              Aplikasi ini didesain 100% kompatibel dengan Google Sheets & Google Apps Script (GAS). Anda dapat menyalin program backend kami di bawah, tempelkan pada editor Apps Script, dan kelola database secara global.
            </p>

            <div className="space-y-3.5">
              
              {/* Copy Code.gs */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span className="flex items-center space-x-1">
                    <CodeXml size={14} className="text-teal-400" />
                    <span>File Script Backend (Code.gs)</span>
                  </span>
                  <button
                    onClick={() => handleCopyText(GAS_CODE_GS, 'codegs')}
                    type="button"
                    className="p-1 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] rounded flex items-center space-x-1.5 transition text-slate-310"
                  >
                    {copiedSection === 'codegs' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    <span>{copiedSection === 'codegs' ? 'Tersalin' : 'Salin Kode'}</span>
                  </button>
                </div>
                <div className="font-mono text-[9px] text-slate-500 h-16 overflow-y-auto bg-slate-950 p-2 rounded border border-slate-900 leading-normal custom-scrollbar select-none">
                  {GAS_CODE_GS}
                </div>
              </div>

              {/* Copy Spreadsheet Structure */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span className="flex items-center space-x-1">
                    <Database size={14} className="text-amber-400" />
                    <span>Struktur Kolom Sheet Database</span>
                  </span>
                  <button
                    onClick={() => handleCopyText(GOOGLE_SHEETS_STRUCTURE, 'structure')}
                    type="button"
                    className="p-1 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] rounded flex items-center space-x-1.5 transition text-slate-310"
                  >
                    {copiedSection === 'structure' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    <span>{copiedSection === 'structure' ? 'Tersalin' : 'Salin Skema'}</span>
                  </button>
                </div>
                <div className="font-mono text-[9px] text-slate-500 h-16 overflow-y-auto bg-slate-950 p-2 rounded border border-slate-900 leading-normal custom-scrollbar select-none">
                  {GOOGLE_SHEETS_STRUCTURE}
                </div>
              </div>

              {/* Copy Deployment Manual */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span className="flex items-center space-x-1">
                    <HelpCircle size={14} className="text-indigo-400" />
                    <span>Panduan Deploy Lengkap</span>
                  </span>
                  <button
                    onClick={() => handleCopyText(DEPLOY_MANUAL, 'manual')}
                    type="button"
                    className="p-1 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] rounded flex items-center space-x-1.5 transition text-slate-310"
                  >
                    {copiedSection === 'manual' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    <span>{copiedSection === 'manual' ? 'Tersalin' : 'Salin Panduan'}</span>
                  </button>
                </div>
                <div className="font-mono text-[9px] text-slate-500 h-16 overflow-y-auto bg-slate-950 p-2 rounded border border-slate-900 leading-normal custom-scrollbar select-none max-w-full">
                  {DEPLOY_MANUAL}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
