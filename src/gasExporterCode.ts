/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const GOOGLE_SHEETS_STRUCTURE = `
=== STRUKTUR GOOGLE SPREADSHEET ===

Buat sebuah Google Spreadsheet baru dan beri nama bebas (misalnya: "DB_SENDRATASIK_MAN_PBG").
Buat 5 Buah Sheet (Tab) di dalamnya dengan nama-nama berikut secara persis (case-sensitive):

1. Sheet: "Users"
   Kolom-kolom (Baris Pertama):
   A1: id
   B1: username
   C1: password
   D1: nama
   E1: role
   F1: cabang
   G1: telepon
   H1: ttd

   *Isikan baris contoh pertama berikut:*
   Baris 2: usr_pembina | pembina | 12345678 | Drs. H. Mulyono, M.Pd. | pembina | SENDRATASIK | 08123456789 | (kosong)
   Baris 3: usr_sarpras | sarpras | 11223344 | Eko Sulistyo | anggota | Sub-Mekanik & Sarpras | 08123456780 | (kosong)

2. Sheet: "Inventaris"
   Kolom-kolom:
   A1: kode
   B1: nama
   C1: kategori
   D1: kondisi
   E1: lokasi
   F1: foto
   G1: stok
   H1: stok_tersedia
   I1: qr_code

3. Sheet: "Peminjaman"
   Kolom-kolom:
   A1: id
   B1: kode_barang
   C1: nama_barang
   D1: peminjam
   E1: nama_peminjam
   F1: tanggal_pinjam
   G1: tanggal_jatuh_tempo
   H1: tanggal_kembali
   I1: status
   J1: disetujui_oleh
   K1: denda
   L1: keterangan_denda
   M1: tanda_tangan_pembina

4. Sheet: "Aktivitas"
   Kolom-kolom:
   A1: id
   B1: timestamp
   C1: username
   D1: role
   E1: aksi
   F1: keterangan

5. Sheet: "Pengaturan"
   Kolom-kolom:
   A1: nama_aplikasi
   B1: logo_url
   C1: nominal_denda_per_hari
   D1: backup_otomatis

   *Isikan baris pertama:*
   Baris 2: E-INVENTARIS SENDRATASIK - MAN PURBALINGGA | https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae | 5000 | TRUE
`;

export const GAS_CODE_GS = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * Untuk Aplikasi Inventaris SENDRATASIK MAN Purbalingga
 */

// Silakan ganti SPREADSHEET_ID dengan ID Google Spreadsheet Anda
var SPREADSHEET_ID = "SILAKAN_ISI_ID_SPREADSHEET_ANDA_DI_SINI";

function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID !== "SILAKAN_ISI_ID_SPREADSHEET_ANDA_DI_SINI") {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('E-Inventaris Secndratasik MAN Purbalingga')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ================= USER OPERATIONS =================

function loginUser(username, password) {
  var sheet = getSpreadsheet().getSheetByName("Users");
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][1].toString() === username && data[i][2].toString() === password) {
      return {
        success: true,
        user: {
          id: data[i][0],
          username: data[i][1],
          nama: data[i][3],
          role: data[i][4],
          cabang: data[i][5],
          telepon: data[i][6],
          ttd: data[i][7]
        }
      };
    }
  }
  return { success: false, message: "Username atau Password salah!" };
}

function getUsers() {
  var sheet = getSpreadsheet().getSheetByName("Users");
  var data = sheet.getDataRange().getValues();
  var users = [];
  
  for (var i = 1; i < data.length; i++) {
    users.push({
      id: data[i][0],
      username: data[i][1],
      password: data[i][2], // Diperlukan pembina
      nama: data[i][3],
      role: data[i][4],
      cabang: data[i][5],
      telepon: data[i][6],
      ttd: data[i][7]
    });
  }
  return users;
}

function addUser(user) {
  var sheet = getSpreadsheet().getSheetByName("Users");
  var id = "usr_" + new Date().getTime();
  sheet.appendRow([
    id,
    user.username,
    user.password,
    user.nama,
    user.role,
    user.cabang,
    user.telepon || "",
    ""
  ]);
  
  addLog(user.username, "Pembina API", "Tambah Pengguna", "Menambahkan pengguna baru: " + user.nama);
  return { success: true, id: id };
}

function deleteUser(id) {
  var sheet = getSpreadsheet().getSheetByName("Users");
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, message: "User tidak ditemukan" };
}

// ================= INVENTARIS OPERATIONS =================

function getInventory() {
  var sheet = getSpreadsheet().getSheetByName("Inventaris");
  var data = sheet.getDataRange().getValues();
  var items = [];
  
  for (var i = 1; i < data.length; i++) {
    items.push({
      kode: data[i][0],
      nama: data[i][1],
      kategori: data[i][2],
      kondisi: data[i][3],
      lokasi: data[i][4],
      foto: data[i][5],
      stok: parseInt(data[i][6]),
      stok_tersedia: parseInt(data[i][7]),
      qr_code: data[i][8]
    });
  }
  return items;
}

function saveInventaris(item) {
  var sheet = getSpreadsheet().getSheetByName("Inventaris");
  var data = sheet.getDataRange().getValues();
  
  // Periksa apakah edit atau baru
  var foundIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === item.kode) {
      foundIndex = i;
      break;
    }
  }
  
  if (foundIndex !== -1) {
    // Edit item
    var r = foundIndex + 1;
    sheet.getRange(r, 2).setValue(item.nama);
    sheet.getRange(r, 3).setValue(item.kategori);
    sheet.getRange(r, 4).setValue(item.kondisi);
    sheet.getRange(r, 5).setValue(item.lokasi);
    sheet.getRange(r, 6).setValue(item.foto);
    sheet.getRange(r, 7).setValue(item.stok);
    sheet.getRange(r, 8).setValue(item.stok_tersedia);
    sheet.getRange(r, 9).setValue(item.kode); // QR Code value
  } else {
    // Tambah Baru
    sheet.appendRow([
      item.kode,
      item.nama,
      item.kategori,
      item.kondisi,
      item.lokasi,
      item.foto,
      item.stok,
      item.stok_tersedia,
      item.kode
    ]);
  }
  return { success: true };
}

function deleteInventaris(kode) {
  var sheet = getSpreadsheet().getSheetByName("Inventaris");
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === kode) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false };
}

// ================= PEMINJAMAN OPERATIONS =================

function getPeminjaman() {
  var sheet = getSpreadsheet().getSheetByName("Peminjaman");
  var data = sheet.getDataRange().getValues();
  var records = [];
  
  for (var i = 1; i < data.length; i++) {
    records.push({
      id: data[i][0],
      kode_barang: data[i][1],
      nama_barang: data[i][2],
      peminjam: data[i][3],
      nama_peminjam: data[i][4],
      tanggal_pinjam: data[i][5],
      tanggal_jatuh_tempo: data[i][6],
      tanggal_kembali: data[i][7] || "",
      status: data[i][8],
      disetujui_oleh: data[i][9] || "",
      denda: parseFloat(data[i][10] || 0),
      keterangan_denda: data[i][11] || "",
      tanda_tangan_pembina: data[i][12] || ""
    });
  }
  return records;
}

function addPeminjaman(record) {
  var sheet = getSpreadsheet().getSheetByName("Peminjaman");
  var id = "TX-" + (1000 + sheet.getLastRow());
  
  sheet.appendRow([
    id,
    record.kode_barang,
    record.nama_barang,
    record.peminjam,
    record.nama_peminjam,
    record.tanggal_pinjam,
    record.tanggal_jatuh_tempo,
    "",
    "Menunggu Persetujuan",
    "",
    0,
    "",
    ""
  ]);
  
  // Kurangi stok_tersedia di Inventaris
  var invSheet = getSpreadsheet().getSheetByName("Inventaris");
  var data = invSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === record.kode_barang) {
      var currentTersedia = parseInt(data[i][7]);
      if (currentTersedia > 0) {
        invSheet.getRange(i + 1, 8).setValue(currentTersedia - 1);
      }
    }
  }
  
  return { success: true, id: id };
}

function processPeminjaman(id, status, pembinaName, ttdBase64) {
  var sheet = getSpreadsheet().getSheetByName("Peminjaman");
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 9).setValue(status); // Status disetujui / ditolak
      sheet.getRange(i + 1, 10).setValue(pembinaName || "");
      if (ttdBase64) {
        sheet.getRange(i + 1, 13).setValue(ttdBase64);
      }
      
      // Jika ditolak, kembalikan stok_tersedia
      if (status === "Ditolak") {
        var kodeB = data[i][1];
        var invSheet = getSpreadsheet().getSheetByName("Inventaris");
        var invData = invSheet.getDataRange().getValues();
        for (var j = 1; j < invData.length; j++) {
          if (invData[j][0] === kodeB) {
            invSheet.getRange(j + 1, 8).setValue(parseInt(invData[j][7]) + 1);
          }
        }
      }
      return { success: true };
    }
  }
  return { success: false };
}

function kembalikanBarang(id, denda, keteranganDenda, kondisiAkhir) {
  var sheet = getSpreadsheet().getSheetByName("Peminjaman");
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      var dateNowStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
      sheet.getRange(i + 1, 8).setValue(dateNowStr); // tanggal_kembali
      sheet.getRange(i + 1, 9).setValue("Dikembalikan"); // status
      sheet.getRange(i + 1, 11).setValue(denda); // denda
      sheet.getRange(i + 1, 12).setValue(keteranganDenda || ""); // keterangan
      
      var kodeB = data[i][1];
      var invSheet = getSpreadsheet().getSheetByName("Inventaris");
      var invData = invSheet.getDataRange().getValues();
      for (var j = 1; j < invData.length; j++) {
        if (invData[j][0] === kodeB) {
          // Tambahkan stok_tersedia
          invSheet.getRange(j + 1, 8).setValue(parseInt(invData[j][7]) + 1);
          // Jika kondisi akhir adalah Hilang/Rusak, ubah kondisi barang
          if (kondisiAkhir && kondisiAkhir !== "Baik") {
            invSheet.getRange(j + 1, 4).setValue(kondisiAkhir);
            if (kondisiAkhir === "Hilang" || kondisiAkhir === "Rusak Berat") {
              // Kurangi stok total juga karena tidak layak
              invSheet.getRange(j + 1, 7).setValue(parseInt(invData[j][6]) - 1);
              invSheet.getRange(j + 1, 8).setValue(parseInt(invData[j][7])); // stok tersedia tetap
            }
          }
        }
      }
      return { success: true };
    }
  }
  return { success: false };
}

// ================= UTILS & CONFIGS =================

function getSettings() {
  var sheet = getSpreadsheet().getSheetByName("Pengaturan");
  var data = sheet.getDataRange().getValues();
  if (data.length > 1) {
    return {
      nama_aplikasi: data[1][0],
      logo_url: data[1][1],
      nominal_denda_per_hari: parseFloat(data[1][2] || 5000),
      backup_otomatis: data[1][3] === true || data[1][3] === "TRUE"
    };
  }
  return {
    nama_aplikasi: "E-INVENTARIS SENDRATASIK MAN PURBALINGGA",
    logo_url: "",
    nominal_denda_per_hari: 5000,
    backup_otomatis: true
  };
}

function saveSettings(sets) {
  var sheet = getSpreadsheet().getSheetByName("Pengaturan");
  sheet.getRange(2, 1).setValue(sets.nama_aplikasi);
  sheet.getRange(2, 2).setValue(sets.logo_url);
  sheet.getRange(2, 3).setValue(sets.nominal_denda_per_hari);
  sheet.getRange(2, 4).setValue(sets.backup_otomatis);
  return { success: true };
}

function addLog(username, role, aksi, keterangan) {
  var sheet = getSpreadsheet().getSheetByName("Aktivitas");
  var id = "log_" + new Date().getTime();
  var timestamp = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd'T'HH:mm:ss'Z'");
  sheet.appendRow([
    id,
    timestamp,
    username,
    role,
    aksi,
    keterangan
  ]);
}

function getLogs() {
  var sheet = getSpreadsheet().getSheetByName("Aktivitas");
  var data = sheet.getDataRange().getValues();
  var logs = [];
  for (var i = 1; i < data.length; i++) {
    logs.push({
      id: data[i][0],
      timestamp: data[i][1],
      username: data[i][2],
      role: data[i][3],
      aksi: data[i][4],
      keterangan: data[i][5]
    });
  }
  return logs.reverse().slice(0, 50); // limit 50 logs terbaru
}
`;

export const DEPLOY_MANUAL = `
=== PANDUAN DEPLOY WEB APP GOOGLE APPS SCRIPT ===

Langkah-langkah untuk mempublikasikan aplikasi ini secara real ke internet menggunakan Google Sheets sebagai database:

1. SIAPKAN GOOGLE SPREADSHEET
   - Buat sebuah Google Spreadsheet baru.
   - Ketik atau buat sheet/tab sesuai Struktur Spreadsheet (Users, Inventaris, Peminjaman, Aktivitas, Pengaturan).
   - Masukkan baris data pemicu awal seperti yang dijelaskan di tab struktur sheet.

2. BUKA GOOGLE APPS SCRIPT
   - Di dalam Google Spreadsheet Anda, klik menu "Ekstensi" -> "Apps Script".
   - Hapus semua kode default di dalam file "editor gratis" yang disediakan (biasanya function myFunction()).

3. BUAT FILE BACKEND (Code.gs)
   - Beri nama file script tersebut "Code.gs".
   - Salin dan tempel (paste) seluruh konten program yang ada di tab "Kode Backend (Code.gs)".
   - Ambil ID Spreadsheet Anda dari URL bar browser. URL spreadsheet memiliki format: 
     https://docs.google.com/spreadsheets/d/[SINI_ID_SPREADSHEET_ANDA]/edit
     Salin ID tersebut dan tempelkan mengisi variabel: SPREADSHEET_ID di baris paling atas Code.gs.

4. BUAT FILE FRONTEND (Index.html)
   - Pada panel kiri editor Apps Script, klik tombol "+" di samping label "File" lalu pilih "HTML".
   - Beri nama file baru ini "Index". (Ingat, ketik "Index" saja, Apps Script akan otomatis menyimpannya sebagai "Index.html").
   - Cari baris kode hasil download atau salinan kode Bundle Frontend, lalu masukkan ke dalam Index.html.

5. SIMPAN DAN DEPLOY
   - Klik ikon "Simpan Project" (ikon disket) di bar atas editor Apps Script.
   - Klik tombol "Terapkan" atau "Deploy" di sebelah kanan atas editor -> Pilih "Penerapan Baru" (New Deployment).
   - Klik tombol roda gigi di samping "Pilih tipe" -> pilih "Aplikasi Web" (Web App).
   - Konfigurasikan pengaturan penerapan berikut:
     * Deskripsi: rilis awal aplikasi inventaris sendratasik
     * Jalankan sebagai: "Saya" (akun email Google Anda)
     * Siapa yang memiliki akses: "Siapa saja" (Anyone) atau "Siapa saja yang memiliki akun Google" agar multiuser.
   - Klik tombol "Terapkan" (Deploy).
   - Google akan meminta persetujuan otorisasi ("Sahkan akses" / Authorize Access). Pilih akun Google Anda, klik "Lanjutan" (Advanced) di bagian bawah peringatan keamanan, lalu klik "Buka Aplikasi Inventaris (tidak aman)" -> klik "Izinkan" (Allow).

6. DAPATKAN LINK APLIKASI
   - Setelah deployment berhasil, Anda akan menerima "URL Aplikasi Web" seperti:
     https://script.google.com/macros/s/AKfycb.../exec
   - URL ini siap dibagikan kepada Pembina dan Anggota untuk diakses melalui smartphone, tablet, maupun komputer. Sukses!
`;
