/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  QrCode, 
  Edit, 
  Trash2, 
  Camera, 
  AlertCircle, 
  Check, 
  ArrowLeft,
  Eye,
  History,
  TrendingDown,
  ShoppingBag
} from 'lucide-react';
import { InventarisItem, User, PeminjamanRecord } from '../types';
import { CATEGORIES } from '../data';

interface InventarisViewProps {
  user: User;
  items: InventarisItem[];
  loans: PeminjamanRecord[];
  onSaveItem: (item: InventarisItem) => void;
  onDeleteItem: (kode: string) => void;
  onInitiateBorrow: (item: InventarisItem) => void;
}

export default function InventarisView({
  user,
  items,
  loans,
  onSaveItem,
  onDeleteItem,
  onInitiateBorrow,
}: InventarisViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedCondition, setSelectedCondition] = useState('Semua');

  const [activeFormOpen, setActiveFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventarisItem | null>(null);

  // Form states
  const [formKode, setFormKode] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formKategori, setFormKategori] = useState(CATEGORIES[0]);
  const [formKondisi, setFormKondisi] = useState<'Baik' | 'Rusak Ringan' | 'Rusak Berat' | 'Hilang'>('Baik');
  const [formLokasi, setFormLokasi] = useState('');
  const [formFoto, setFormFoto] = useState('');
  const [formStok, setFormStok] = useState(1);
  const [formStokTersedia, setFormStokTersedia] = useState(1);

  // Detail Modal view
  const [detailItem, setDetailItem] = useState<InventarisItem | null>(null);
  
  // Camera scan modal
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanValueInput, setScanValueInput] = useState('');
  const [isScanningStatus, setIsScanningStatus] = useState(false);

  // Generate automatically code (SND-00X)
  const generateAutoCode = () => {
    const existingNumbers = items
      .map(item => {
        const match = item.kode.match(/SND-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);
    
    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const nextNum = maxNum + 1;
    return `SND-${String(nextNum).padStart(3, '0')}`;
  };

  const handleOpenCreateForm = () => {
    const generated = generateAutoCode();
    setEditingItem(null);
    setFormKode(generated);
    setFormNama('');
    setFormKategori(CATEGORIES[0]);
    setFormKondisi('Baik');
    setFormLokasi('');
    setFormFoto('');
    setFormStok(1);
    setFormStokTersedia(1);
    setActiveFormOpen(true);
  };

  const handleOpenEditForm = (item: InventarisItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setFormKode(item.kode);
    setFormNama(item.nama);
    setFormKategori(item.kategori);
    setFormKondisi(item.kondisi);
    setFormLokasi(item.lokasi);
    setFormFoto(item.foto);
    setFormStok(item.stok);
    setFormStokTersedia(item.stok_tersedia);
    setActiveFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formLokasi.trim()) {
      alert('Nama barang dan lokasi wajib diisi!');
      return;
    }

    const itemData: InventarisItem = {
      kode: formKode,
      nama: formNama,
      kategori: formKategori,
      kondisi: formKondisi,
      lokasi: formLokasi,
      foto: formFoto.trim() || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400',
      stok: formStok,
      stok_tersedia: Math.min(formStokTersedia, formStok), // cannot exceed total stok
      qr_code: formKode
    };

    onSaveItem(itemData);
    setActiveFormOpen(false);
  };

  // Simulated base64 image generator
  const handleSimulateLogoUpload = (type: string) => {
    let simulatedUrl = '';
    if (type === 'gamelan') simulatedUrl = 'https://images.unsplash.com/photo-1616194165565-df04e4c278c7?w=400';
    else if (type === 'makeup') simulatedUrl = 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400';
    else if (type === 'audio') simulatedUrl = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400';
    else simulatedUrl = 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400';

    setFormFoto(simulatedUrl);
  };

  // QR Scanning handling
  const handleSimulatedScan = () => {
    setIsScanningStatus(true);
    setTimeout(() => {
      setIsScanningStatus(false);
      const cleanedCode = scanValueInput.trim().toUpperCase();
      const matchedItem = items.find(i => i.kode.toUpperCase() === cleanedCode);
      if (matchedItem) {
        setDetailItem(matchedItem);
        setScanModalOpen(false);
        setScanValueInput('');
      } else {
        alert('Barang dengan Kode / QR tidak ditemukan!');
      }
    }, 1200);
  };

  const quickScanSelect = (code: string) => {
    setScanValueInput(code);
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.kode.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || item.kategori === selectedCategory;
    const matchesCondition = selectedCondition === 'Semua' || item.kondisi === selectedCondition;
    return matchesSearch && matchesCategory && matchesCondition;
  });

  return (
    <div className="space-y-6">
      
      {/* Search and Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
            {user.role === 'pembina' ? 'Manajemen Inventaris' : 'Katalog Peminjaman'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">Daftar koleksi perlengkapan drama, tari, musik, dan sarpras</p>
        </div>

        <div className="flex items-center gap-2">
          {/* QR Scan Button */}
          <button
            onClick={() => setScanModalOpen(true)}
            type="button"
            className="flex items-center space-x-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            <Camera size={16} />
            <span>Scan QR Kamera</span>
          </button>

          {/* Add Item Button (Pembina Only) */}
          {user.role === 'pembina' && (
            <button
              onClick={handleOpenCreateForm}
              type="button"
              className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-teal-500/10"
            >
              <Plus size={16} />
              <span>Tambah Inventaris</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama barang, kode, atau lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white pl-9 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 focus:ring-1 focus:ring-teal-500 text-xs font-semibold outline-none transition"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-gray-300 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 focus:ring-1 focus:ring-teal-500 text-xs font-semibold outline-none transition"
            >
              <option value="Semua">Semua Kategori</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Condition Dropdown */}
          <div>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-gray-300 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 focus:ring-1 focus:ring-teal-500 text-xs font-semibold outline-none transition"
            >
              <option value="Semua">Semua Kondisi</option>
              <option value="Baik">Kondisi Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
              <option value="Hilang">Hilang</option>
            </select>
          </div>

        </div>
      </div>

      {/* Grid of Inventory Cards (Mobile-first, responsive grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map(item => (
          <div 
            key={item.kode}
            onClick={() => setDetailItem(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDetailItem(item); }}
            className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-black/20 hover:border-teal-500/30 transition-all duration-300 cursor-pointer flex flex-col h-full text-left"
          >
            {/* Visual Photo */}
            <div className="relative aspect-video w-full bg-slate-150 dark:bg-slate-950 overflow-hidden shrink-0">
              <img 
                src={item.foto} 
                alt={item.nama}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 bg-slate-950/70 border border-slate-800 text-teal-400 font-bold font-mono text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                {item.kode}
              </span>
              <span className={`
                absolute top-3 right-3 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full shadow backdrop-blur-sm
                ${item.kondisi === 'Baik' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : ''}
                ${item.kondisi === 'Rusak Ringan' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : ''}
                ${item.kondisi === 'Rusak Berat' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : ''}
                ${item.kondisi === 'Hilang' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : ''}
              `}>
                {item.kondisi}
              </span>
            </div>

            {/* Content info */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">{item.kategori}</span>
                <h3 className="font-bold text-slate-850 dark:text-slate-100 text-sm mt-1 leading-snug group-hover:text-teal-500 transition line-clamp-2">
                  {item.nama}
                </h3>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs font-semibold text-slate-400">
                <span className="flex items-center space-x-1">
                  <MapPin size={12} className="text-slate-300" />
                  <span className="truncate max-w-[120px] text-slate-500 dark:text-slate-400">{item.lokasi}</span>
                </span>

                <span className="bg-slate-50 dark:bg-slate-950/60 px-2 py-1 rounded border border-slate-100 dark:border-slate-850 text-[10px]">
                  Stok: <strong className="text-slate-700 dark:text-slate-200">{item.stok_tersedia}/{item.stok}</strong>
                </span>
              </div>
            </div>

            {/* Hover actions panel */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850 flex gap-1 justify-end shrink-0">
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setDetailItem(item); }}
                className="p-1 px-3 text-[10px] font-bold hover:text-white uppercase tracking-wider hover:bg-slate-850 rounded"
              >
                Detail
              </button>
              {user.role === 'pembina' ? (
                <>
                  <button 
                    type="button" 
                    onClick={(e) => handleOpenEditForm(item, e)}
                    className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-400/10 rounded"
                    title="Edit Item"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); if(confirm('Yakin ingin menghapus item ini?')) onDeleteItem(item.kode); }}
                    className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded"
                    title="Hapus Item"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={item.stok_tersedia <= 0}
                  onClick={(e) => { e.stopPropagation(); onInitiateBorrow(item); }}
                  className={`
                    flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                    ${item.stok_tersedia > 0 
                      ? 'bg-teal-500 hover:bg-teal-400 text-slate-950' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-550 cursor-not-allowed'}
                  `}
                >
                  <ShoppingBag size={12} />
                  <span>Pinjam</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl py-12 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          <AlertCircle size={32} className="stroke-1 text-slate-350 dark:text-slate-750 mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-250 text-sm">Tidak ada barang ditemukan</h3>
          <p className="text-slate-400 text-xs px-6 mt-1">Gunakan kata kunci pencarian yang berbeda atau hilangkan filter kategori dan kondisi barang.</p>
        </div>
      )}

      {/* CREATE / EDIT FORM DRAWER */}
      {activeFormOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl my-6">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/55">
              <div>
                <h3 className="text-slate-900 dark:text-white font-bold text-sm tracking-wider uppercase">
                  {editingItem ? `Edit Inventaris: ${formKode}` : 'Tambah Inventaris Baru'}
                </h3>
                <p className="text-slate-400 text-[10px] mt-0.5">Lengkapi formulir untuk menyelaraskan aset data inventaris</p>
              </div>
              <button 
                type="button"
                onClick={() => setActiveFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                {/* Kode */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Kode Barang</label>
                  <input
                    type="text"
                    value={formKode}
                    disabled
                    className="w-full bg-slate-100 dark:bg-slate-950 text-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none cursor-not-allowed"
                  />
                </div>
                {/* Kategori */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Kategori</label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nama Barang */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Nama Barang</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kendang Ciblon Kayu Nangka"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>

              {/* Lokasi Penyimpanan */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Lokasi Penyimpanan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lemari Musik C-3, Gedung Serbaguna"
                  value={formLokasi}
                  onChange={(e) => setFormLokasi(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Kondisi */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Kondisi Barang</label>
                  <select
                    value={formKondisi}
                    onChange={(e) => setFormKondisi(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none"
                  >
                    <option value="Baik">Baik (Siap Pakai)</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                    <option value="Hilang">Hilang (Sistem Sanksi)</option>
                  </select>
                </div>
                {/* Stok */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Stok</label>
                    <input
                      type="number"
                      min={1}
                      value={formStok}
                      onChange={(e) => setFormStok(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Kini</label>
                    <input
                      type="number"
                      min={0}
                      max={formStok}
                      value={formStokTersedia}
                      onChange={(e) => setFormStokTersedia(Math.min(parseInt(e.target.value) || 0, formStok))}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Foto URL atau Upload Simulation */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Tautan URL Foto Barang</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formFoto}
                    onChange={(e) => setFormFoto(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus:border-teal-500"
                  />
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5 justify-end">
                  <span className="text-[9px] text-slate-410 mr-auto self-center">Pilih Cepat Simolator Gbr:</span>
                  <button 
                    type="button" 
                    onClick={() => handleSimulateLogoUpload('gamelan')} 
                    className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-2 py-1 rounded"
                  >
                    Gamelan
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleSimulateLogoUpload('makeup')} 
                    className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-2 py-1 rounded"
                  >
                    Tari
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleSimulateLogoUpload('audio')} 
                    className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-2 py-1 rounded"
                  >
                    Mic/Audio
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveFormOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-wider bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl shadow-lg transition"
                >
                  SIMPAN (SAVE TO SHEETS)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL VIEW MODAL */}
      {detailItem && (
        <div className="fixed inset-0 bg-slate-950/85 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 max-w-xl w-full rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/55">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-widest">{detailItem.kode}</span>
                <h3 className="text-slate-900 dark:text-white font-black text-sm tracking-wide leading-none">{detailItem.nama}</h3>
              </div>
              <button 
                type="button"
                onClick={() => setDetailItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 md:grid md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              {/* Lefter Photo & QR */}
              <div className="space-y-4">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                  <img src={detailItem.foto} alt={detailItem.nama} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                
                {/* QR Code image & Generator */}
                <div className="bg-slate-50 dark:bg-slate-950/50 p-4 border border-slate-100 dark:border-slate-850 rounded-xl text-center space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Automated QR Code</span>
                  <div className="flex justify-center py-2">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${detailItem.kode}`}
                      alt={`QR Code ${detailItem.kode}`}
                      className="w-28 h-28 p-1.5 bg-white border rounded shadow object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1 block font-mono">{detailItem.kode}</span>
                </div>
              </div>

              {/* Righter Specifications & Logs */}
              <div className="space-y-4 mt-4 md:mt-0">
                <div className="space-y-2.5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Kategori Ekskul</span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{detailItem.kategori}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Kondisi Fisik</span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full 
                        ${detailItem.kondisi === 'Baik' ? 'bg-emerald-500' : ''}
                        ${detailItem.kondisi === 'Rusak Ringan' ? 'bg-amber-500' : ''}
                        ${detailItem.kondisi === 'Rusak Berat' ? 'bg-rose-500' : ''}
                        ${detailItem.kondisi === 'Hilang' ? 'bg-indigo-500' : ''}
                      `}></span>
                      <span>Kondisi {detailItem.kondisi}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Lokasi Penyimpanan</span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                      <MapPin size={12} className="text-teal-400" />
                      <span>{detailItem.lokasi}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status Stok Tersedia</span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <strong className="text-emerald-500">{detailItem.stok_tersedia}</strong> Dari total <strong className="text-slate-500">{detailItem.stok}</strong> Unit dalam Database
                    </p>
                  </div>
                </div>

                {/* History loan inside modal */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1 mb-2">
                    <History size={12} />
                    <span>Riwayat Peminjaman Khusus</span>
                  </h4>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar text-[10px] leading-tight">
                    {loans.filter(l => l.kode_barang === detailItem.kode).length > 0 ? (
                      loans.filter(l => l.kode_barang === detailItem.kode).map(l => (
                        <div key={l.id} className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100">Pinjam: {l.nama_peminjam}</p>
                            <span className="text-slate-400 font-medium">{l.tanggal_pinjam} s/d {l.tanggal_jatuh_tempo}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider 
                            ${l.status === 'Dikembalikan' ? 'bg-emerald-500/10 text-emerald-400' : ''}
                            ${l.status === 'Disetujui' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : ''}
                            ${l.status === 'Menunggu Persetujuan' ? 'bg-amber-500/10 text-amber-400' : ''}
                          `}>
                            {l.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 font-medium italic text-center py-4">Belum pernah dipinjam sebelumnya</p>
                    )}
                  </div>
                </div>

              </div>

            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-450 hover:bg-slate-800 rounded-xl transition"
              >
                Tutup
              </button>
              {user.role === 'anggota' && detailItem.stok_tersedia > 0 && (
                <button
                  type="button"
                  onClick={() => { onInitiateBorrow(detailItem); setDetailItem(null); }}
                  className="px-5 py-2 text-xs font-extrabold uppercase tracking-wider bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl shadow-lg transition"
                >
                  Ajukan Pinjam Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR CAMERA SCANNER EMULATOR MODAL */}
      {scanModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div>
                <h3 className="text-white font-extrabold text-sm flex items-center space-x-1.5 uppercase tracking-wider">
                  <Camera size={16} className="text-teal-400" />
                  <span>Scan Kode QR Barang</span>
                </h3>
                <p className="text-slate-400 text-[10px] mt-0.5">Akses kamera HP/Laptop Terintegrasi</p>
              </div>
              <button 
                type="button"
                onClick={() => setScanModalOpen(false)}
                className="text-slate-450 hover:text-white font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 text-center space-y-6 bg-slate-950">
              
              {/* Circular Camera Visual Area */}
              <div className="relative aspect-square max-w-[240px] mx-auto rounded-3xl overflow-hidden border-2 border-teal-500 ring-4 ring-teal-500/10 flex items-center justify-center bg-slate-900 group">
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-lg text-teal-400 text-center ${isScanningStatus ? 'animate-bounce' : 'animate-pulse'}`} style={{ top: '30%' }}></div>
                
                {isScanningStatus ? (
                  <div className="space-y-2 z-10 text-center">
                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-[10px] text-teal-400 font-semibold uppercase tracking-widest">Menganalisis Kode...</p>
                  </div>
                ) : (
                  <div className="space-y-1 text-slate-500 text-center z-10">
                    <Camera size={36} className="mx-auto text-slate-700 animate-pulse" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Umpan Kamera Aktif</p>
                    <p className="text-[9px] font-medium max-w-[180px] text-slate-600 leading-normal mx-auto">Arahkan lensa kamera perangkat pintar Anda ke kode QR barang di MAN Purbalingga</p>
                  </div>
                )}
              </div>

              {/* Input for testing simulated scans */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Simulator Pembaca Barcode / QR Cepat</span>
                <div className="flex gap-2 max-w-xs mx-auto">
                  <input
                    type="text"
                    placeholder="Ketik/Pilih kode, misal: SND-001"
                    value={scanValueInput}
                    onChange={(e) => setScanValueInput(e.target.value)}
                    className="w-full bg-slate-900 text-white border border-slate-700 pl-3 pr-2 py-1.5 rounded-xl text-xs font-semibold outline-none"
                  />
                  <button
                    onClick={handleSimulatedScan}
                    type="button"
                    className="bg-teal-505 bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider"
                  >
                    Scan!
                  </button>
                </div>
                
                {/* List of sample items to click simulate scanning */}
                <div className="pt-2 text-left bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest mb-1.5">Pilih Cepat untuk Simulasi:</p>
                  <div className="flex flex-wrap gap-1">
                    {items.slice(0, 5).map(i => (
                      <button
                        key={i.kode}
                        type="button"
                        onClick={() => quickScanSelect(i.kode)}
                        className="text-[9px] font-mono bg-slate-800 hover:bg-slate-750 border border-slate-750 text-slate-350 hover:text-white px-2 py-1 rounded"
                      >
                        {i.kode} ({i.nama.split(' ')[0]})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setScanModalOpen(false)}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
