# 📋 KONTRAK API — Dashboard HRM
> Dokumen ini adalah panduan lengkap untuk backend developer.
> Frontend **tidak perlu disentuh** selama endpoint sesuai kontrak ini.

---

## ⚙️ Setup

1. Copy `.env.example` → `.env`
2. Isi `VITE_API_URL` dengan URL backend kamu:
   ```
   VITE_API_URL=http://localhost:8000/api
   ```
3. Pastikan backend mengaktifkan **CORS** untuk domain frontend

---

## 🌐 Daftar Endpoint

### 1. `GET /api/dashboard/attendance-today`
Statistik absensi hari ini. **Urutan array penting** (index 0–3).

```json
[
  { "title": "Hadir",       "total": 328 },
  { "title": "Izin",        "total": 12  },
  { "title": "Terlambat",   "total": 8   },
  { "title": "Shift Aktif", "total": 3   }
]
```

---

### 2. `GET /api/dashboard/employee-summary`
Jumlah pegawai per kategori. **Urutan array penting** (index 0–2).

```json
[
  { "title": "Pegawai Tetap",   "total": 145 },
  { "title": "Pegawai Musiman", "total": 87  },
  { "title": "BHL",             "total": 96  }
]
```

---

### 3. `GET /api/dashboard/approvals`
Daftar pengajuan menunggu persetujuan.

```json
[
  { "id": 1, "name": "Cuti Tahunan",  "employee": "Budi Santoso", "status": "Menunggu" },
  { "id": 2, "name": "Lembur Giling", "employee": "Andi Saputra", "status": "Menunggu" },
  { "id": 3, "name": "Izin Sakit",    "employee": "Rudi Hartono", "status": "Menunggu" }
]
```

---

### 4. `GET /api/dashboard/activities`
Log aktivitas sistem terbaru (array of string).

```json
[
  "Absensi shift pagi berhasil diperbarui",
  "Slip gaji Mei telah diproses",
  "Pengajuan lembur baru masuk",
  "Data pegawai musiman diperbarui",
  "Sistem payroll berhasil sinkron"
]
```

---

### 5. `GET /api/dashboard/fastest-attendance`
Pegawai yang absen paling awal hari ini (urutkan dari tercepat).

```json
[
  { "name": "Andi Saputra",  "division": "Produksi", "time": "06:01" },
  { "name": "Budi Santoso",  "division": "QC",       "time": "06:03" },
  { "name": "Rudi Hartono",  "division": "Gudang",   "time": "06:05" },
  { "name": "Fajar Nugroho", "division": "Teknik",   "time": "06:07" }
]
```
> ⚠️ `time` format **HH:MM** (24 jam)

---

### 6. `GET /api/dashboard/late-employees`
Pegawai yang terlambat masuk shift hari ini.

```json
[
  { "name": "Ahmad Rizki",  "division": "Produksi", "late": "18 Menit" },
  { "name": "Yoga Pratama", "division": "Gudang",   "late": "12 Menit" },
  { "name": "Rio Saputra",  "division": "QC",       "late": "9 Menit"  }
]
```
> ⚠️ `late` = string bebas, contoh: "18 Menit", "1 Jam 5 Menit"

---

### 7. `GET /api/dashboard/monthly-attendance`
Rekap absensi bulanan pegawai.

```json
[
  { "name": "Andi Saputra",  "hadir": "22/31", "alpha": 1, "izin": 2 },
  { "name": "Budi Santoso",  "hadir": "28/31", "alpha": 0, "izin": 1 },
  { "name": "Rudi Hartono",  "hadir": "25/31", "alpha": 2, "izin": 1 },
  { "name": "Fajar Nugroho", "hadir": "30/31", "alpha": 0, "izin": 0 }
]
```
> ⚠️ `hadir` format: **"hadir_hari/total_hari_kerja"** (string)
> ⚠️ `alpha` dan `izin` = integer

---

### 8. `GET /api/dashboard/warning-employees`
Pegawai yang sering terlambat dan berstatus SP.

```json
[
  { "name": "Ahmad Rizki",  "division": "Produksi", "totalLate": 14, "warning": "SP 1" },
  { "name": "Yoga Pratama", "division": "Gudang",   "totalLate": 11, "warning": "SP 1" },
  { "name": "Rio Saputra",  "division": "QC",       "totalLate": 18, "warning": "SP 2" }
]
```
> ⚠️ `warning` hanya boleh: **"SP 1"** atau **"SP 2"** (tampilan berbeda)
> ⚠️ `totalLate` = integer (jumlah keterlambatan dalam sebulan)

---

### 9. `GET /api/dashboard/chart-bars`
Data chart kehadiran mingguan. **Urutan: Sen → Jum**.

```json
[
  { "label": "Sen", "value": 85 },
  { "label": "Sel", "value": 70 },
  { "label": "Rab", "value": 45 },
  { "label": "Kam", "value": 30 },
  { "label": "Jum", "value": 92 }
]
```
> ⚠️ `value` = persentase kehadiran (0–100, integer)

---

### 10. `GET /api/dashboard/payroll`
Info payroll bulan berjalan.

```json
{
  "amount": "Rp 245 JT",
  "status": "Tersinkron",
  "description": "Proses payroll berjalan lancar dan seluruh data sinkron."
}
```
> ⚠️ `amount` = string bebas (sudah diformat)
> ⚠️ `status` = string bebas, contoh: "Tersinkron", "Proses", "Gagal"

---

### 11. `POST /api/dashboard/send-warning`
Kirim surat peringatan ke pegawai.

**Request Body:**
```json
{
  "employeeName": "Ahmad Rizki",
  "warning": "SP 1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Surat peringatan berhasil dikirim"
}
```

---

## ❌ Jika Endpoint Belum Siap (Dev Mode)

Untuk testing frontend sementara, backend bisa pakai tools seperti:
- [json-server](https://github.com/typicode/json-server) — mock REST API instan
- [Mocky.io](https://mocky.io) — mock endpoint online
- [Postman Mock Server](https://www.postman.com/features/mock-api/)

---

## ✅ Checklist Backend

- [ ] Semua 11 endpoint tersedia
- [ ] Response menggunakan `Content-Type: application/json`
- [ ] CORS diaktifkan untuk domain frontend
- [ ] `VITE_API_URL` di `.env` sudah diisi dengan benar
- [ ] Struktur JSON sesuai kontrak di atas (terutama urutan array)
