/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardCheck, 
  FileText, 
  Users, 
  Settings as SettingsIcon, 
  User as UserIcon, 
  LogOut, 
  CodeXml, 
  Menu, 
  X,
  Moon,
  Sun,
  ShieldCheck,
  UserCheck,
  Database
} from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  role: Role;
  username: string;
  nama: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  appName: string;
  logoUrl: string;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  isGASConnected?: boolean;
  hasApiUrl?: boolean;
  isSyncing?: boolean;
}

export default function Sidebar({
  role,
  username,
  nama,
  activeTab,
  setActiveTab,
  onLogout,
  appName,
  logoUrl,
  darkMode,
  setDarkMode,
  isGASConnected = false,
  hasApiUrl = false,
  isSyncing = false,
}: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = role === 'pembina' 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'inventaris', label: 'Kelola Inventaris', icon: Package },
        { id: 'peminjaman', label: 'Kelola Peminjaman', icon: ClipboardCheck },
        { id: 'anggota', label: 'Pengelola Pengguna', icon: Users },
        { id: 'laporan', label: 'Laporan Inventaris', icon: FileText },
        { id: 'pengaturan', label: 'Pengaturan Sistem', icon: SettingsIcon },
        { id: 'exporter', label: 'Exporter Apps Script', icon: CodeXml },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'inventaris', label: 'Daftar Inventaris', icon: Package },
        { id: 'peminjaman_saya', label: 'Peminjaman Saya', icon: ClipboardCheck },
        { id: 'profil', label: 'Profil Saya', icon: UserIcon },
      ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navbar */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-full border border-teal-500 object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center font-bold text-sm">S</div>
          )}
          <span className="font-semibold text-sm tracking-tight line-clamp-1">
            {appName.split('-')[0].trim()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            type="button"
            id="mobile-dark-mode-btn"
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            id="mobile-menu-btn"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Backdrop for Mobile Drawer */}
      {isOpen && (
        <div 
          role="button"
          tabIndex={0}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          aria-label="Close Sidebar"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(false); }}
        />
      )}

      {/* Main Sidebar (Desktop & Mobile Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 bg-slate-900 border-r border-slate-800 text-slate-300 z-50 w-72 transform transition-transform duration-300 ease-in-out md:sticky md:transform-none md:flex md:flex-col md:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header Branding */}
        <div className="p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3 mb-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-full border-2 border-teal-500 shadow-teal-500/20 object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white text-lg">S</div>
            )}
            <div>
              <h2 className="text-white font-bold leading-none text-sm tracking-wider">MAN PURBALINGGA</h2>
              <span className="text-xs text-teal-400 font-medium tracking-widest uppercase">SENDRATASIK</span>
            </div>
          </div>
          <div className="text-xs bg-slate-850 px-3 py-2 rounded-lg border border-slate-800 text-slate-400 leading-normal line-clamp-2">
            {appName}
          </div>
          <div className="mt-2.5 flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950/40 border border-slate-850 no-print">
            <div className="flex items-center space-x-2">
              <span className="flex h-1.5 w-1.5 relative shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 
                  ${isGASConnected ? 'bg-emerald-400' : hasApiUrl ? 'bg-teal-400' : 'bg-slate-400'}
                `}></span>
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 
                  ${isGASConnected ? 'bg-emerald-500' : hasApiUrl ? 'bg-teal-500' : 'bg-slate-500'}
                `}></span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Database size={10} className={isGASConnected ? 'text-emerald-400' : hasApiUrl ? 'text-teal-400' : 'text-slate-400'} />
                <span>
                  {isGASConnected ? 'Google Sheet Aktif' : hasApiUrl ? 'Vercel Cloud Sync' : 'Simulasi (Offline)'}
                </span>
              </span>
            </div>
            {isSyncing && (
              <span className="text-[8px] font-black tracking-widest text-teal-400 animate-pulse uppercase leading-none">Sync...</span>
            )}
          </div>
        </div>

        {/* Logged in User Profile Info */}
        <div className="px-6 py-4 border-b border-slate-850 shrink-0 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
              {role === 'pembina' ? <ShieldCheck size={18} className="text-teal-400" /> : <UserCheck size={18} className="text-amber-400" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate leading-none mb-1">{nama}</p>
              <div className="flex items-center space-x-1.5">
                <span className={`inline-block w-2 h-2 rounded-full ${role === 'pembina' ? 'bg-teal-500' : 'bg-amber-500'}`}></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{role === 'pembina' ? 'Pembina Ekstra' : 'Anggota / Sarpras'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Menu Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`
                  w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-teal-500/15 via-teal-500/5 to-transparent border-l-4 border-teal-500 text-teal-400 font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border-l-4 border-transparent'}
                `}
              >
                <Icon size={18} className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Settings & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950/20 shrink-0">
          {/* Theme Toggle Button (Desktop Only) */}
          <button
            type="button"
            id="desktop-theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            className="hidden md:flex w-full items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <span className="flex items-center space-x-2">
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              <span>{darkMode ? 'Mode Terang (Light)' : 'Mode Gelap (Dark)'}</span>
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] ${darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
              {darkMode ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            id="logout-btn"
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Keluar Aplikasi</span>
          </button>
        </div>
      </aside>
    </>
  );
}
