/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, InventarisItem, PeminjamanRecord, AktivitasLog, Settings } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_pembina',
    username: 'pembina',
    nama: 'Drs. H. Mulyono, M.Pd.',
    role: 'pembina',
    cabang: 'SENDRATASIK',
    password: '12345678',
    ttd: '' // Initially empty, can be signed digitally
  },
  {
    id: 'usr_sarpras',
    username: 'sarpras',
    nama: 'Eko Sulistyo',
    role: 'anggota',
    cabang: 'Sub-Mekanik & Sarpras',
    password: '11223344',
    ttd: ''
  },
  {
    id: 'usr_tari_01',
    username: 'lailatun',
    nama: 'Lailatun Naimah',
    role: 'anggota',
    cabang: 'Kesenian Tari Tradisional',
    password: 'password123',
    ttd: ''
  },
  {
    id: 'usr_musik_01',
    username: 'fajar',
    nama: 'Fajar Nugroho',
    role: 'anggota',
    cabang: 'Grup Hadroh & Teater',
    password: 'password123',
    ttd: ''
  }
];

export const INITIAL_ITEMS: InventarisItem[] = [
  {
    kode: 'SND-001',
    nama: 'Keyboard Yamaha PSR-S975',
    kategori: 'Alat Musik',
    kondisi: 'Baik',
    lokasi: 'Ruang Seni Utama',
    foto: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=60',
    stok: 1,
    stok_tersedia: 1,
    qr_code: 'SND-001'
  },
  {
    kode: 'SND-002',
    nama: 'Gamelan Saron Perunggu',
    kategori: 'Alat Musik',
    kondisi: 'Baik',
    lokasi: 'Gedung Serbaguna',
    foto: 'https://images.unsplash.com/photo-1616194165565-df04e4c278c7?w=400&auto=format&fit=crop&q=60',
    stok: 2,
    stok_tersedia: 2,
    qr_code: 'SND-002'
  },
  {
    kode: 'SND-003',
    nama: 'Rebana Hadroh Super Quality (1 Set)',
    kategori: 'Alat Musik',
    kondisi: 'Baik',
    lokasi: 'Ruang Rebana',
    foto: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&auto=format&fit=crop&q=60',
    stok: 4,
    stok_tersedia: 3,
    qr_code: 'SND-003'
  },
  {
    kode: 'SND-004',
    nama: 'Kostum Tari Saman Aceh (10 Stel)',
    kategori: 'Kostum & Make Up',
    kondisi: 'Baik',
    lokasi: 'Lemari Kostum R-A',
    foto: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=60',
    stok: 10,
    stok_tersedia: 10,
    qr_code: 'SND-004'
  },
  {
    kode: 'SND-005',
    nama: 'Mic Wireless Shure SVX24/PG58',
    kategori: 'Audio System',
    kondisi: 'Rusak Ringan',
    lokasi: 'Lemari Audio B4',
    foto: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&auto=format&fit=crop&q=60',
    stok: 3,
    stok_tersedia: 2,
    qr_code: 'SND-005'
  },
  {
    kode: 'SND-006',
    nama: 'Proyektor BenQ MX535',
    kategori: 'Drama & Media',
    kondisi: 'Baik',
    lokasi: 'Ruang Teater',
    foto: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&auto=format&fit=crop&q=60',
    stok: 2,
    stok_tersedia: 1,
    qr_code: 'SND-006'
  },
  {
    kode: 'SND-007',
    nama: 'Biola Akustik Karl Steinhoff',
    kategori: 'Alat Musik',
    kondisi: 'Rusak Berat',
    lokasi: 'Gudang Inventaris',
    foto: 'https://images.unsplash.com/photo-1612222869069-a10ec76d00b7?w=400&auto=format&fit=crop&q=60',
    stok: 1,
    stok_tersedia: 0,
    qr_code: 'SND-007'
  }
];

export const INITIAL_PEMINJAMAN: PeminjamanRecord[] = [
  {
    id: 'TX-1001',
    kode_barang: 'SND-003',
    nama_barang: 'Rebana Hadroh Super Quality (1 Set)',
    peminjam: 'sarpras',
    nama_peminjam: 'Eko Sulistyo',
    tanggal_pinjam: '2026-05-15',
    tanggal_jatuh_tempo: '2026-05-20',
    tanggal_kembali: '2026-05-21',
    status: 'Dikembalikan',
    disetujui_oleh: 'Drs. H. Mulyono, M.Pd.',
    denda: 5000,
    keterangan_denda: 'Terlambat 1 Hari dari jatuh tempo (Denda Rp5.000 / hari)',
  },
  {
    id: 'TX-1002',
    kode_barang: 'SND-006',
    nama_barang: 'Proyektor BenQ MX535',
    peminjam: 'fajar',
    nama_peminjam: 'Fajar Nugroho',
    tanggal_pinjam: '2026-05-22',
    tanggal_jatuh_tempo: '2026-05-27',
    status: 'Disetujui',
    disetujui_oleh: 'Drs. H. Mulyono, M.Pd.',
    denda: 0
  },
  {
    id: 'TX-1003',
    kode_barang: 'SND-001',
    nama_barang: 'Keyboard Yamaha PSR-S975',
    peminjam: 'lailatun',
    nama_peminjam: 'Lailatun Naimah',
    tanggal_pinjam: '2026-05-23',
    tanggal_jatuh_tempo: '2026-05-26',
    status: 'Menunggu Persetujuan',
    denda: 0
  }
];

export const INITIAL_LOGS: AktivitasLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-05-23T08:30:00Z',
    username: 'pembina',
    role: 'Pembina',
    aksi: 'Login',
    keterangan: 'Pembina masuk ke sistem inventaris'
  },
  {
    id: 'log-002',
    timestamp: '2026-05-23T09:15:00Z',
    username: 'pembina',
    role: 'Pembina',
    aksi: 'Persiapan Backup',
    keterangan: 'Melakukan pengecekan sinkronisasi database Google Sheets'
  },
  {
    id: 'log-003',
    timestamp: '2026-05-23T11:00:00Z',
    username: 'lailatun',
    role: 'Anggota',
    aksi: 'Saran Pinjam',
    keterangan: 'Mengajukan peminjaman baru untuk Keyboard Yamaha'
  }
];

export const INITIAL_SETTINGS: Settings = {
  nama_aplikasi: 'E-INVENTARIS SENDRATASIK - MAN PURBALINGGA',
  logo_url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&auto=format&fit=crop&q=80',
  sheet_url: 'https://docs.google.com/spreadsheets/d/1DFkC9dVowWgJRRsYh1TjHZIc1W70N5pB/edit#gid=0',
  multi_ekskul_enabled: true,
  backup_otomatis: true,
  nominal_denda_per_hari: 5000
};

export const CATEGORIES = [
  'Alat Musik',
  'Kostum & Make Up',
  'Audio System',
  'Drama & Media',
  'Properti Panggung',
  'Lain-Lain'
];
