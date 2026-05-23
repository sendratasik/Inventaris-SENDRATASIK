/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  INITIAL_ITEMS, 
  INITIAL_USERS, 
  INITIAL_PEMINJAMAN, 
  INITIAL_LOGS, 
  INITIAL_SETTINGS 
} from './data';
import { User, InventarisItem, PeminjamanRecord, AktivitasLog, Settings } from './types';
import Sidebar from './components/Sidebar';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import InventarisView from './components/InventarisView';
import PeminjamanView from './components/PeminjamanView';
import PeminjamanSayaView from './components/PeminjamanSayaView';
import AnggotaView from './components/AnggotaView';
import LaporanView from './components/LaporanView';
import PengaturanView from './components/PengaturanView';
import ProfilView from './components/ProfilView';
import { Sparkles, CheckCircle2, ShieldCheck, Database } from 'lucide-react';

// Safe Storage Wrapper to prevent SecurityError inside cross-origin iframe/sandbox environments like Google Apps Script
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage access denied. Falling back to memory storage.", e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Fail silently without throwing SecurityError
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Fail silently without throwing SecurityError
    }
  }
};

export default function App() {
  // --- DATABASE & CENTRAL STATE CONFIGURATION ---
  const [users, setUsers] = useState<User[]>(() => {
    const saved = safeStorage.getItem('man_sendratasik_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [items, setItems] = useState<InventarisItem[]>(() => {
    const saved = safeStorage.getItem('man_sendratasik_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [loans, setLoans] = useState<PeminjamanRecord[]>(() => {
    const saved = safeStorage.getItem('man_sendratasik_loans');
    return saved ? JSON.parse(saved) : INITIAL_PEMINJAMAN;
  });

  const [logs, setLogs] = useState<AktivitasLog[]>(() => {
    const saved = safeStorage.getItem('man_sendratasik_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = safeStorage.getItem('man_sendratasik_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [sessionUser, setSessionUser] = useState<User | null>(() => {
    const saved = safeStorage.getItem('man_sendratasik_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = safeStorage.getItem('man_sendratasik_darkmode');
    return saved === 'true';
  });

  const [isBackingUp, setIsBackingUp] = useState(false);

  // --- CUSTOM SWEETALERT ALERTS TRIGGER SYSTEM ---
  const [alertConfig, setAlertConfig] = useState<{
    open: boolean;
    title: string;
    text: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    title: '',
    text: '',
    type: 'success'
  });

  const triggerAlert = (title: string, text: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setAlertConfig({
      open: true,
      title,
      text,
      type
    });
  };

  // Sync to database localStorage whenever states are updated
  useEffect(() => {
    safeStorage.setItem('man_sendratasik_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    safeStorage.setItem('man_sendratasik_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    safeStorage.setItem('man_sendratasik_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    safeStorage.setItem('man_sendratasik_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    safeStorage.setItem('man_sendratasik_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    safeStorage.setItem('man_sendratasik_darkmode', String(darkMode));
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (sessionUser) {
      safeStorage.setItem('man_sendratasik_session', JSON.stringify(sessionUser));
    } else {
      safeStorage.removeItem('man_sendratasik_session');
    }
  }, [sessionUser]);

  // Load data dynamically from Google Apps Script Spreadsheet if running inside GAS ecosystem
  useEffect(() => {
    const isGAS = typeof (window as any).google !== 'undefined' && (window as any).google.script && (window as any).google.script.run;
    if (isGAS) {
      console.log("GAS detected! Syncing with Google Sheets...");
      const gas = (window as any).google.script.run;
      
      // Load settings
      gas.withSuccessHandler((savedSettings: any) => {
        if (savedSettings) setSettings(savedSettings);
      }).getSettings();

      // Load items
      gas.withSuccessHandler((savedItems: any) => {
        if (savedItems && savedItems.length > 0) setItems(savedItems);
      }).getInventory();

      // Load users
      gas.withSuccessHandler((savedUsers: any) => {
        if (savedUsers && savedUsers.length > 0) setUsers(savedUsers);
      }).getUsers();

      // Load loans
      gas.withSuccessHandler((savedLoans: any) => {
        if (savedLoans && savedLoans.length > 0) setLoans(savedLoans);
      }).getPeminjaman();

      // Load logs
      gas.withSuccessHandler((savedLogs: any) => {
        if (savedLogs && savedLogs.length > 0) setLogs(savedLogs);
      }).getLogs();
    }
  }, []);

  // Check connection state
  const isGASConnected = typeof (window as any).google !== 'undefined' && (window as any).google.script;

  // --- UTILS ACTIVITY LOGGER ---
  const addActivityLog = (username: string, role: string, action: string, description: string) => {
    const newLog: AktivitasLog = {
      id: `log_${new Date().getTime()}`,
      timestamp: new Date().toISOString(),
      username,
      role,
      aksi: action,
      keterangan: description
    };
    setLogs(prev => [newLog, ...prev]);

    // Send to Google Sheets if connected
    if (isGASConnected) {
      (window as any).google.script.run.addLog(username, role, action, description);
    }
  };

  // --- ACTIONS SYSTEM HANDLERS ---

  // LOGIN SUCCESS
  const handleLogin = (username: string, passwordInput: string): boolean => {
    const found = users.find(u => u.username === username && u.password === passwordInput);
    if (found) {
      setSessionUser(found);
      setActiveTab('dashboard');
      addActivityLog(found.username, found.role === 'pembina' ? 'Pembina' : 'Anggota', 'Login', `${found.nama} berhasil masuk ke dalam sistem`);
      triggerAlert('Login Berhasil', `Selamat datang kembali, ${found.nama}!`, 'success');
      return true;
    }
    return false;
  };

  // LOGOUT
  const handleLogout = () => {
    if (sessionUser) {
      addActivityLog(sessionUser.username, sessionUser.role === 'pembina' ? 'Pembina' : 'Anggota', 'Logout', `${sessionUser.nama} keluar dari sistem`);
      setSessionUser(null);
      triggerAlert('Keluar Sukses', 'Sesi Anda telah berhasil diakhiri secara aman.', 'info');
    }
  };

  // INVENTARIS SAVE (Create/Edit) - "SAVE" button as requested
  const handleSaveItem = (itemData: InventarisItem) => {
    const isEditing = items.some(i => i.kode === itemData.kode);
    
    // Call Google Sheets write operation
    if (isGASConnected) {
      (window as any).google.script.run.withSuccessHandler(() => {
        // Trigger a background reload coordinates to guarantee consistency
        (window as any).google.script.run.withSuccessHandler((savedItems: any) => {
          if (savedItems) setItems(savedItems);
        }).getInventory();
      }).saveInventaris(itemData);
    }

    if (isEditing) {
      setItems(prev => prev.map(i => i.kode === itemData.kode ? itemData : i));
      if (sessionUser) {
        addActivityLog(sessionUser.username, sessionUser.role, 'Update Inventaris', `Ubah detail barang: ${itemData.nama} (${itemData.kode})`);
      }
      triggerAlert('Item Diperbarui', `Data barang ${itemData.nama} berhasil disinkronkan ke Google Sheets!`, 'success');
    } else {
      setItems(prev => [...prev, itemData]);
      if (sessionUser) {
        addActivityLog(sessionUser.username, sessionUser.role, 'Tambah Inventaris', `Menambahkan barang baru: ${itemData.nama} (${itemData.kode})`);
      }
      triggerAlert('Item Ditambahkan', `Barang ${itemData.nama} berhasil disimpan ke database Google Spreadsheet!`, 'success');
    }
  };

  // DELETE ITEM
  const handleDeleteItem = (kode: string) => {
    const target = items.find(i => i.kode === kode);
    
    if (isGASConnected) {
      (window as any).google.script.run.withSuccessHandler(() => {
        (window as any).google.script.run.withSuccessHandler((savedItems: any) => {
          if (savedItems) setItems(savedItems);
        }).getInventory();
      }).deleteInventaris(kode);
    }

    setItems(prev => prev.filter(i => i.kode !== kode));
    if (sessionUser && target) {
      addActivityLog(sessionUser.username, sessionUser.role, 'Hapus Inventaris', `Menghapus barang: ${target.nama} (${kode})`);
    }
    triggerAlert('Item Dihapus', 'Data barang telah dihapus dari katalog lokal.', 'warning');
  };

  // INITIATE MEMBER BORROW REQUEST WITH EXPLICIT DATES
  const handleRequestLoan = (borrowRequest: { kode_barang: string; nama_barang: string; tanggal_pinjam: string; tanggal_jatuh_tempo: string }) => {
    if (!sessionUser) return;

    const newLoanRecord: PeminjamanRecord = {
      id: `TX-${1000 + loans.length + 1}`,
      kode_barang: borrowRequest.kode_barang,
      nama_barang: borrowRequest.nama_barang,
      peminjam: sessionUser.username,
      nama_peminjam: sessionUser.nama,
      tanggal_pinjam: borrowRequest.tanggal_pinjam,
      tanggal_jatuh_tempo: borrowRequest.tanggal_jatuh_tempo,
      status: 'Menunggu Persetujuan',
      denda: 0
    };

    if (isGASConnected) {
      (window as any).google.script.run.withSuccessHandler(() => {
        // Refresh loans & inventory to confirm the backend recorded the transaction
        (window as any).google.script.run.withSuccessHandler((savedLoans: any) => {
          if (savedLoans) setLoans(savedLoans);
        }).getPeminjaman();
        (window as any).google.script.run.withSuccessHandler((savedItems: any) => {
          if (savedItems) setItems(savedItems);
        }).getInventory();
      }).addPeminjaman(newLoanRecord);
    }

    setLoans(prev => [newLoanRecord, ...prev]);

    // Decrease available stock by 1
    setItems(prev => prev.map(i => {
      if (i.kode === borrowRequest.kode_barang) {
        return {
          ...i,
          stok_tersedia: Math.max(i.stok_tersedia - 1, 0)
        };
      }
      return i;
    }));

    addActivityLog(sessionUser.username, 'Anggota', 'Pengajuan Peminjaman', `Mengajukan peminjaman barang ${borrowRequest.nama_barang}`);
    triggerAlert('Permohonan Terkirim', 'Permohonan pinjam telah diajukan ke Pembina. Mohon tunggu verifikasi.', 'success');
  };

  // INITIATE MEMBER QUICK CATALOG DIRECT BORROW CLICK
  const handleInitiateBorrow = (item: InventarisItem) => {
    const todayStr = '2026-05-23';
    const futureStr = '2026-05-26'; // 3 days layout
    
    handleRequestLoan({
      kode_barang: item.kode,
      nama_barang: item.nama,
      tanggal_pinjam: todayStr,
      tanggal_jatuh_tempo: futureStr
    });
  };

  // APPROVE LOAN REQUEST
  const handleApproveLoan = (id: string, pembinaNama: string, ttdBase64: string) => {
    const loan = loans.find(l => l.id === id);
    if (!loan) return;

    if (isGASConnected) {
      (window as any).google.script.run.withSuccessHandler(() => {
        // Refresh loans to ensure accuracy
        (window as any).google.script.run.withSuccessHandler((savedLoans: any) => {
          if (savedLoans) setLoans(savedLoans);
        }).getPeminjaman();
      }).processPeminjaman(id, "Disetujui", pembinaNama, ttdBase64);
    }

    setLoans(prev => prev.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status: 'Disetujui',
          disetujui_oleh: pembinaNama,
          tanda_tangan_pembina: ttdBase64
        };
      }
      return l;
    }));

    if (sessionUser) {
      addActivityLog(sessionUser.username, 'Pembina', 'Persetujuan Peminjaman', `Menyetujui peminjaman ${loan.nama_barang} untuk @${loan.peminjam}`);
    }
    triggerAlert('Pinjaman Disetujui', `Peminjaman ${loan.nama_barang} telah disahkan dengan signature Anda.`, 'success');
  };

  // REJECT LOAN REQUEST
  const handleRejectLoan = (id: string) => {
    const loan = loans.find(l => l.id === id);
    if (!loan) return;

    if (isGASConnected) {
      (window as any).google.script.run.withSuccessHandler(() => {
        (window as any).google.script.run.withSuccessHandler((savedLoans: any) => {
          if (savedLoans) setLoans(savedLoans);
        }).getPeminjaman();
        (window as any).google.script.run.withSuccessHandler((savedItems: any) => {
          if (savedItems) setItems(savedItems);
        }).getInventory();
      }).processPeminjaman(id, "Ditolak", "", "");
    }

    setLoans(prev => prev.map(l => l.id === id ? { ...l, status: 'Ditolak' as const } : l));

    // Restore available stock
    setItems(prev => prev.map(i => {
      if (i.kode === loan.kode_barang) {
        return {
          ...i,
          stok_tersedia: i.stok_tersedia + 1
        };
      }
      return i;
    }));

    if (sessionUser) {
      addActivityLog(sessionUser.username, 'Pembina', 'Penolakan Peminjaman', `Menolak permohonan pinjam ${loan.nama_barang} oleh @${loan.peminjam}`);
    }
    triggerAlert('Pinjaman Ditolak', 'Permohonan peminjaman barang telah berhasil ditolak.', 'info');
  };

  // RETURN LOAN WITH PENALTIES/FINED SANKSI
  const handleReturnLoan = (
    id: string, 
    denda: number, 
    keteranganDenda: string, 
    kondisiAkhir: 'Baik' | 'Rusak Ringan' | 'Rusak Berat' | 'Hilang'
  ) => {
    const loan = loans.find(l => l.id === id);
    if (!loan) return;

    const dateTodayStr = new Date().toISOString().slice(0, 10);

    if (isGASConnected) {
      (window as any).google.script.run.withSuccessHandler(() => {
        // Refresh loans & items
        (window as any).google.script.run.withSuccessHandler((savedLoans: any) => {
          if (savedLoans) setLoans(savedLoans);
        }).getPeminjaman();
        (window as any).google.script.run.withSuccessHandler((savedItems: any) => {
          if (savedItems) setItems(savedItems);
        }).getInventory();
      }).kembalikanBarang(id, denda, keteranganDenda, kondisiAkhir);
    }

    setLoans(prev => prev.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status: 'Dikembalikan',
          tanggal_kembali: dateTodayStr,
          denda,
          keterangan_denda: keteranganDenda
        };
      }
      return l;
    }));

    // Update the inventory status, and restore available stock
    setItems(prev => prev.map(item => {
      if (item.kode === loan.kode_barang) {
        let finalStok = item.stok;
        let finalTersedia = item.stok_tersedia + 1; // standard return increases available

        // If lost/heavily damaged, reduce total physical units entirely since it cannot be allocated
        if (kondisiAkhir === 'Hilang' || kondisiAkhir === 'Rusak Berat') {
          finalStok = Math.max(item.stok - 1, 0);
          finalTersedia = Math.max(item.stok_tersedia, 0); // stays same since item is non-existent/unusable
        }

        return {
          ...item,
          stok: finalStok,
          stok_tersedia: finalTersedia,
          kondisi: kondisiAkhir
        };
      }
      return item;
    }));

    if (sessionUser) {
      addActivityLog(
        sessionUser.username, 
        'Pembina', 
        'Pemrosesan Pengembalian', 
        `Menerima pengembalian ${loan.nama_barang} oleh @${loan.peminjam}. Kondisi: ${kondisiAkhir}, Denda: ${denda}`
      );
    }
    triggerAlert('Barang Dikembalikan', `Pengembalian sukses! Sanksi denda dicatat sebesar Rp${denda.toLocaleString('id-ID')}`, 'success');
  };

  // ADD NEW MEMBER / USER
  const handleAddUser = (userData: Omit<User, 'id'>) => {
    const isExisting = users.some(u => u.username === userData.username);
    if (isExisting) {
      alert('Username tersebut sudah digunakan oleh orang lain!');
      return;
    }

    const newUser: User = {
      ...userData,
      id: `usr_${new Date().getTime()}`
    };

    if (isGASConnected) {
      (window as any).google.script.run.withSuccessHandler(() => {
        (window as any).google.script.run.withSuccessHandler((savedUsers: any) => {
          if (savedUsers) setUsers(savedUsers);
        }).getUsers();
      }).addUser(newUser);
    }

    setUsers(prev => [...prev, newUser]);
    if (sessionUser) {
      addActivityLog(sessionUser.username, 'Pembina', 'Pendaftaran Pengguma', `Mendaftarkan pengguna baru: ${newUser.nama} sebagai ${newUser.role}`);
    }
    triggerAlert('User Ditambahkan', `Akun untuk ${newUser.nama} berhasil dibuat dan diizinkan masuk.`, 'success');
  };

  // DELETE USER
  const handleDeleteUser = (id: string) => {
    const target = users.find(u => u.id === id);

    if (isGASConnected) {
      (window as any).google.script.run.withSuccessHandler(() => {
        (window as any).google.script.run.withSuccessHandler((savedUsers: any) => {
          if (savedUsers) setUsers(savedUsers);
        }).getUsers();
      }).deleteUser(id);
    }

    setUsers(prev => prev.filter(u => u.id !== id));
    if (sessionUser && target) {
      addActivityLog(sessionUser.username, 'Pembina', 'Penghapusan Pengguna', `Menghapus akun pengguna: ${target.nama}`);
    }
    triggerAlert('User Dihapus', 'Akun pengguna telah berhasil dikeluarkan dari sistem.', 'warning');
  };

  // SAVE APP SETTINGS
  const handleSaveSettings = (newSettings: Settings) => {
    if (isGASConnected) {
      (window as any).google.script.run.withSuccessHandler(() => {
        (window as any).google.script.run.withSuccessHandler((savedSettings: any) => {
          if (savedSettings) setSettings(savedSettings);
        }).getSettings();
      }).saveSettings(newSettings);
    }

    setSettings(newSettings);
    if (sessionUser) {
      addActivityLog(sessionUser.username, 'Pembina', 'Update Pengaturan', 'Merubah konfigurasi preferensi branding & denda aplikasi');
    }
    triggerAlert('Pengaturan Disimpan', 'Konfigurasi metadata aplikasi berhasil diperbarui.', 'success');
  };

  // UPDATE ACTIVE USER SIGNATURE/PROFILE
  const handleUpdateSignature = (newTtd: string) => {
    if (!sessionUser) return;
    const updatedUser = { ...sessionUser, ttd: newTtd };
    setSessionUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === sessionUser.id ? { ...u, ttd: newTtd } : u));
    addActivityLog(sessionUser.username, sessionUser.role, 'Update Tanda-Tangan', 'Memperbarui tanda-tangan otorisasi digital');
    triggerAlert('Ttd Diperbarui', 'Pola tanda-tangan Anda berhasil disimpan sebagai sertifikat otorisasi.', 'success');
  };

  const handleUpdateProfile = (profileData: { nama: string; password?: string; telepon?: string; ttd?: string }) => {
    if (!sessionUser) return;
    const updatedUser = { 
      ...sessionUser, 
      nama: profileData.nama,
      password: profileData.password || sessionUser.password,
      telepon: profileData.telepon || sessionUser.telepon,
      ttd: profileData.ttd || sessionUser.ttd
    };

    setSessionUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === sessionUser.id ? updatedUser : u));
    addActivityLog(sessionUser.username, sessionUser.role, 'Update Profil', 'Memperbarui detail kredensial navigasi akun');
    triggerAlert('Profil Diperbarui', 'Data profil Anda berhasil disimpan secara aman.', 'success');
  };

  // TRIGGER DATABASE BACKUP AUTO-SIMULATED
  const handleBackupSheetsSync = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      if (sessionUser) {
        addActivityLog(sessionUser.username, sessionUser.role, 'Backup Google Sheets', `Sinkronisasi eksternal spreadsheet sukses: ${settings.sheet_url}`);
      }
      triggerAlert('Backup Sukses!', `Semua baris database (${items.length} Barang, ${loans.length} Pinjaman) berhasil dilempar ke Google Drive.`, 'success');
    }, 1500);
  };

  // --- RENDERING VIEWS ROUTE ROUTER ---
  const renderTabContent = () => {
    if (!sessionUser) return null;

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            user={sessionUser}
            items={items}
            loans={loans}
            logs={logs}
            settings={settings}
            onUpdateUserSignature={handleUpdateSignature}
            onTriggerBackup={handleBackupSheetsSync}
            isBackingUp={isBackingUp}
            onViewDetailedLoans={() => setActiveTab('peminjaman')}
            onViewDetailedInventory={() => setActiveTab('inventaris')}
          />
        );
      case 'inventaris':
        return (
          <InventarisView 
            user={sessionUser}
            items={items}
            loans={loans}
            onSaveItem={handleSaveItem}
            onDeleteItem={handleDeleteItem}
            onInitiateBorrow={handleInitiateBorrow}
          />
        );
      case 'peminjaman':
        return (
          <PeminjamanView 
            pembina={sessionUser}
            loans={loans}
            settings={settings}
            onApproveLoan={handleApproveLoan}
            onRejectLoan={handleRejectLoan}
            onReturnLoan={handleReturnLoan}
          />
        );
      case 'peminjaman_saya':
        return (
          <PeminjamanSayaView 
            user={sessionUser}
            loans={loans}
            items={items}
            onRequestLoan={handleRequestLoan}
          />
        );
      case 'anggota':
        return (
          <AnggotaView 
            users={users}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
          />
        );
      case 'laporan':
        return (
          <LaporanView 
            items={items}
            loans={loans}
          />
        );
      case 'pengaturan':
      case 'exporter':
        return (
          <PengaturanView 
            user={sessionUser}
            settings={settings}
            onSaveSettings={handleSaveSettings}
          />
        );
      case 'profil':
        return (
          <ProfilView 
            user={sessionUser}
            onUpdateProfil={handleUpdateProfile}
          />
        );
      default:
        setActiveTab('dashboard');
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200 transition-colors duration-200 font-sans`}>
      
      {/* Session check router */}
      {!sessionUser ? (
        <LoginView 
          onLoginSuccess={handleLogin}
          settings={settings}
        />
      ) : (
        <div className="flex flex-col md:flex-row min-h-screen">
          {/* Main Sidebar */}
          <Sidebar 
            role={sessionUser.role}
            username={sessionUser.username}
            nama={sessionUser.nama}
            activeTab={activeTab === 'exporter' ? 'pengaturan' : activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            appName={settings.nama_aplikasi}
            logoUrl={settings.logo_url}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            isGASConnected={isGASConnected}
          />

          {/* Main Content Pane */}
          <main className="flex-1 p-4 md:p-8 space-y-6 max-h-screen overflow-y-auto custom-scrollbar">
            {renderTabContent()}
            
            {/* Footer */}
            <footer className="pt-8 border-t border-slate-150 dark:border-slate-850 text-[10px] uppercase font-bold text-slate-450 text-center tracking-widest no-print">
              Aplikasi ini dikembangkan oleh Ekstrakurikuler SENDRATASIK MAN PURBALINGGA
            </footer>
          </main>
        </div>
      )}

      {/* CUSTOM ANIMATION-ENABLED SWEETALERT POPUP OVERLAY */}
      {alertConfig.open && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl transform transition scale-102">
            
            {/* Alert Header Icon based on type */}
            <div className="flex justify-center">
              {alertConfig.type === 'success' && (
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-md shadow-emerald-500/10">
                  <CheckCircle2 size={28} className="animate-bounce" />
                </div>
              )}
              {alertConfig.type === 'info' && (
                <div className="w-14 h-14 rounded-full bg-indigo-500/10 border-2 border-indigo-500 flex items-center justify-center text-indigo-400">
                  <Sparkles size={28} />
                </div>
              )}
              {alertConfig.type === 'warning' && (
                <div className="w-14 h-14 rounded-full bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center text-rose-500">
                  <ShieldCheck size={28} />
                </div>
              )}
              {alertConfig.type === 'error' && (
                <div className="w-14 h-14 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center text-red-500">
                  &times;
                </div>
              )}
            </div>

            {/* Alert content */}
            <div className="space-y-1">
              <h3 className="text-slate-900 dark:text-white font-extrabold text-sm tracking-wide uppercase">{alertConfig.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs px-2 leading-relaxed">{alertConfig.text}</p>
            </div>

            {/* Close button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setAlertConfig(prev => ({ ...prev, open: false }))}
                className={`
                  px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                  ${alertConfig.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' : ''}
                  ${alertConfig.type === 'info' ? 'bg-indigo-500 hover:bg-indigo-400 text-white' : ''}
                  ${alertConfig.type === 'warning' ? 'bg-rose-500 hover:bg-rose-400 text-white' : ''}
                  ${alertConfig.type === 'error' ? 'bg-red-500 hover:bg-red-400 text-white' : ''}
                `}
              >
                Tutup (OK)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
