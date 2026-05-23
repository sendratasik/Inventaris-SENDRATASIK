/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'pembina' | 'anggota';

export interface User {
  id: string;
  username: string;
  nama: string;
  role: Role;
  cabang?: string;
  password?: string; // Visible for pembina in user manager as requested
  ttd?: string; // Base64 signature
  telepon?: string;
}

export interface InventarisItem {
  kode: string;
  nama: string;
  kategori: string;
  kondisi: 'Baik' | 'Rusak Ringan' | 'Rusak Berat' | 'Hilang';
  lokasi: string;
  foto: string; // Base64 or placeholder url
  stok: number;
  stok_tersedia: number;
  qr_code: string; // Dynamic generator content or dataUrl
}

export interface PeminjamanRecord {
  id: string;
  kode_barang: string;
  nama_barang: string;
  peminjam: string; // username of user
  nama_peminjam: string; // full name of user
  tanggal_pinjam: string; // YYYY-MM-DD
  tanggal_jatuh_tempo: string; // YYYY-MM-DD
  tanggal_kembali?: string; // YYYY-MM-DD
  status: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak' | 'Dikembalikan';
  disetujui_oleh?: string; // name
  denda: number;
  keterangan_denda?: string;
  tanda_tangan_pembina?: string; // Base64 image
}

export interface AktivitasLog {
  id: string;
  timestamp: string; // ISO String
  username: string;
  role: string;
  aksi: string;
  keterangan: string;
}

export interface Settings {
  nama_aplikasi: string;
  logo_url: string;
  sheet_url: string;
  multi_ekskul_enabled: boolean;
  backup_otomatis: boolean;
  nominal_denda_per_hari: number;
  api_url?: string;
}
