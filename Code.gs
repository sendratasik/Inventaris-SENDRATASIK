/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * Untuk Aplikasi Inventaris SENDRATASIK MAN Purbalingga
 * 
 * Integrasikan file ini ke Google Apps Script Anda untuk menjadikan Google Sheets sebagai database real-time.
 */

// Silakan ganti SPREADSHEET_ID dengan ID Google Spreadsheet Anda jika menggunakan standalone script,
// atau kosongkan jika script ini terikat (container-bound) ke Spreadsheet terkait.
var SPREADSHEET_ID = "SILAKAN_ISI_ID_SPREADSHEET_ANDA_DI_SINI";

function getSpreadsheet() {
  try {
    if (SPREADSHEET_ID && SPREADSHEET_ID !== "SILAKAN_ISI_ID_SPREADSHEET_ANDA_DI_SINI") {
      return SpreadsheetApp.openById(SPREADSHEET_ID);
    }
  } catch (e) {
    Logger.log("Gagal membuka spreadsheet berdasarkan ID: " + e.toString());
  }
  
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    Logger.log("Gagal mendapatkan active spreadsheet: " + e.toString());
  }
  return null;
}

function doGet(e) {
  // Menangani permintaan API REST luar (misal dari Vercel/Localhost) jika terdapat parameter 'action'
  if (e && e.parameter && e.parameter.action) {
    var action = e.parameter.action;
    var result;
    
    try {
      if (action === "getSettings") {
        result = getSettings();
      } else if (action === "getInventory") {
        result = getInventory();
      } else if (action === "getUsers") {
        result = getUsers();
      } else if (action === "getPeminjaman") {
        result = getPeminjaman();
      } else if (action === "getLogs") {
        result = getLogs();
      } else if (action === "loginUser") {
        result = loginUser(e.parameter.username, e.parameter.password);
      } else {
        result = { success: false, message: "Aksi GET tidak dikenal: " + action };
      }
    } catch (err) {
      result = { success: false, message: err.toString() };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Menggunakan createHtmlOutputFromFile menghindari evaluasi scriptlet (<? ?>) yang sering membuat error di file JS/CSS hasil bundling.
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('E-Inventaris Sendratasik MAN Purbalingga')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  var result;
  
  try {
    var contents = e.postData.contents;
    var params = JSON.parse(contents);
    var action = params.action;
    
    if (action === "saveInventaris") {
      result = saveInventaris(params.item);
    } else if (action === "deleteInventaris") {
      result = deleteInventaris(params.kode);
    } else if (action === "addPeminjaman") {
      result = addPeminjaman(params.record);
    } else if (action === "processPeminjaman") {
      result = processPeminjaman(params.id, params.status, params.pembinaName, params.ttdBase64);
    } else if (action === "kembalikanBarang") {
      result = kembalikanBarang(params.id, params.denda, params.keteranganDenda, params.kondisiAkhir);
    } else if (action === "addUser") {
      result = addUser(params.user);
    } else if (action === "deleteUser") {
      result = deleteUser(params.id);
    } else if (action === "saveSettings") {
      result = saveSettings(params.settings);
    } else if (action === "addLog") {
      addLog(params.username, params.role, params.aksi, params.keterangan);
      result = { success: true };
    } else {
      result = { success: false, message: "Aksi POST tidak dikenal: " + action };
    }
  } catch (err) {
    result = { success: false, message: "REST API Error: " + err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (e) {
    return "";
  }
}

// ================= USER OPERATIONS =================

function loginUser(username, password) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false, message: "Koneksi ke Spreadsheet gagal!" };
    var sheet = ss.getSheetByName("Users");
    if (!sheet) return { success: false, message: "Tabel Users tidak ditemukan!" };
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] && data[i][2] && data[i][1].toString() === username && data[i][2].toString() === password) {
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
  } catch (e) {
    return { success: false, message: "Database Error: " + e.toString() };
  }
}

function getUsers() {
  try {
    var ss = getSpreadsheet();
    if (!ss) return [];
    var sheet = ss.getSheetByName("Users");
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    var users = [];
    
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      users.push({
        id: data[i][0],
        username: data[i][1],
        password: data[i][2], // Diperlukan pembina
        nama: data[i][3],
        role: data[i][4],
        cabang: data[i][5],
        telepon: data[i][6] || "",
        ttd: data[i][7] || ""
      });
    }
    return users;
  } catch (e) {
    Logger.log("Error getUsers: " + e.toString());
    return [];
  }
}

function addUser(user) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false, message: "Spreadsheet tidak terhubung" };
    var sheet = ss.getSheetByName("Users");
    if (!sheet) return { success: false, message: "Tabel Users tidak ditemukan" };
    
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
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function deleteUser(id) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false };
    var sheet = ss.getSheetByName("Users");
    if (!sheet) return { success: false };
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: false, message: "User tidak ditemukan" };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// ================= INVENTARIS OPERATIONS =================

function getInventory() {
  try {
    var ss = getSpreadsheet();
    if (!ss) return [];
    var sheet = ss.getSheetByName("Inventaris");
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    var items = [];
    
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      items.push({
        kode: data[i][0],
        nama: data[i][1],
        kategori: data[i][2],
        kondisi: data[i][3],
        lokasi: data[i][4],
        foto: data[i][5] || "",
        stok: parseInt(data[i][6] || 0),
        stok_tersedia: parseInt(data[i][7] || 0),
        qr_code: data[i][8] || data[i][0]
      });
    }
    return items;
  } catch (e) {
    Logger.log("Error getInventory: " + e.toString());
    return [];
  }
}

function saveInventaris(item) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false };
    var sheet = ss.getSheetByName("Inventaris");
    if (!sheet) return { success: false };
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
      sheet.getRange(r, 6).setValue(item.foto || "");
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
        item.foto || "",
        item.stok,
        item.stok_tersedia,
        item.kode
      ]);
    }
    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function deleteInventaris(kode) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false };
    var sheet = ss.getSheetByName("Inventaris");
    if (!sheet) return { success: false };
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === kode) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: false };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// ================= PEMINJAMAN OPERATIONS =================

function getPeminjaman() {
  try {
    var ss = getSpreadsheet();
    if (!ss) return [];
    var sheet = ss.getSheetByName("Peminjaman");
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    var records = [];
    
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
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
  } catch (e) {
    Logger.log("Error getPeminjaman: " + e.toString());
    return [];
  }
}

function addPeminjaman(record) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false };
    var sheet = ss.getSheetByName("Peminjaman");
    if (!sheet) return { success: false };
    
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
    var invSheet = ss.getSheetByName("Inventaris");
    if (invSheet) {
      var data = invSheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] === record.kode_barang) {
          var currentTersedia = parseInt(data[i][7] || 0);
          if (currentTersedia > 0) {
            invSheet.getRange(i + 1, 8).setValue(currentTersedia - 1);
          }
        }
      }
    }
    
    return { success: true, id: id };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function processPeminjaman(id, status, pembinaName, ttdBase64) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false };
    var sheet = ss.getSheetByName("Peminjaman");
    if (!sheet) return { success: false };
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
          var invSheet = ss.getSheetByName("Inventaris");
          if (invSheet) {
            var invData = invSheet.getDataRange().getValues();
            for (var j = 1; j < invData.length; j++) {
              if (invData[j][0] === kodeB) {
                invSheet.getRange(j + 1, 8).setValue(parseInt(invData[j][7] || 0) + 1);
              }
            }
          }
        }
        return { success: true };
      }
    }
  } catch (e) {
    return { success: false, message: e.toString() };
  }
  return { success: false };
}

function kembalikanBarang(id, denda, keteranganDenda, kondisiAkhir) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false };
    var sheet = ss.getSheetByName("Peminjaman");
    if (!sheet) return { success: false };
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        var dateNowStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
        sheet.getRange(i + 1, 8).setValue(dateNowStr); // tanggal_kembali
        sheet.getRange(i + 1, 9).setValue("Dikembalikan"); // status
        sheet.getRange(i + 1, 11).setValue(denda); // denda
        sheet.getRange(i + 1, 12).setValue(keteranganDenda || ""); // keterangan
        
        var kodeB = data[i][1];
        var invSheet = ss.getSheetByName("Inventaris");
        if (invSheet) {
          var invData = invSheet.getDataRange().getValues();
          for (var j = 1; j < invData.length; j++) {
            if (invData[j][0] === kodeB) {
              // Tambahkan stok_tersedia
              invSheet.getRange(j + 1, 8).setValue(parseInt(invData[j][7] || 0) + 1);
              // Jika kondisi akhir adalah Hilang/Rusak, ubah kondisi barang
              if (kondisiAkhir && kondisiAkhir !== "Baik") {
                invSheet.getRange(j + 1, 4).setValue(kondisiAkhir);
                if (kondisiAkhir === "Hilang" || kondisiAkhir === "Rusak Berat") {
                  // Kurangi stok total juga karena tidak layak
                  invSheet.getRange(j + 1, 7).setValue(parseInt(invData[j][6] || 0) - 1);
                  invSheet.getRange(j + 1, 8).setValue(parseInt(invData[j][7] || 0)); // stok tersedia tetap
                }
              }
            }
          }
        }
        return { success: true };
      }
    }
  } catch (e) {
    return { success: false, message: e.toString() };
  }
  return { success: false };
}

// ================= UTILS & CONFIGS =================

function getSettings() {
  try {
    var ss = getSpreadsheet();
    if (ss) {
      var sheet = ss.getSheetByName("Pengaturan");
      if (sheet) {
        var data = sheet.getDataRange().getValues();
        if (data.length > 1) {
          return {
            nama_aplikasi: data[1][0] || "E-INVENTARIS SENDRATASIK MAN PURBALINGGA",
            logo_url: data[1][1] || "",
            nominal_denda_per_hari: parseFloat(data[1][2] || 5000),
            backup_otomatis: data[1][3] === true || data[1][3] === "TRUE"
          };
        }
      }
    }
  } catch (e) {
    Logger.log("Error getSettings: " + e.toString());
  }
  return getDefaultSettings();
}

function getDefaultSettings() {
  return {
    nama_aplikasi: "E-INVENTARIS SENDRATASIK MAN PURBALINGGA",
    logo_url: "",
    nominal_denda_per_hari: 5000,
    backup_otomatis: true
  };
}

function saveSettings(sets) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return { success: false };
    var sheet = ss.getSheetByName("Pengaturan");
    if (!sheet) return { success: false };
    sheet.getRange(2, 1).setValue(sets.nama_aplikasi);
    sheet.getRange(2, 2).setValue(sets.logo_url);
    sheet.getRange(2, 3).setValue(sets.nominal_denda_per_hari);
    sheet.getRange(2, 4).setValue(sets.backup_otomatis);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function addLog(username, role, aksi, keterangan) {
  try {
    var ss = getSpreadsheet();
    if (!ss) return;
    var sheet = ss.getSheetByName("Aktivitas");
    if (!sheet) return;
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
  } catch (e) {
    Logger.log("Error addLog: " + e.toString());
  }
}

function getLogs() {
  try {
    var ss = getSpreadsheet();
    if (!ss) return [];
    var sheet = ss.getSheetByName("Aktivitas");
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    var logs = [];
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
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
  } catch (e) {
    Logger.log("Error getLogs: " + e.toString());
    return [];
  }
}
