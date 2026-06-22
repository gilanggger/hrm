/**
 * ============================================================
 *  FILE: src/api/dashboard.js
 *  TUJUAN: Semua pemanggilan API dashboard terpusat di sini.
 *
 *  ✅ UNTUK BACKEND:
 *  - Ubah BASE_URL sesuai alamat server backend kamu
 *  - Pastikan setiap endpoint mengembalikan JSON
 *    dengan struktur yang sudah didefinisikan di bawah
 *  - Gunakan CORS jika frontend & backend beda domain
 * ============================================================
 */

// 🔧 GANTI dengan URL backend kamu
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Helper fetch dengan error handling
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      // Tambahkan Authorization jika pakai token:
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      ...options.headers,
    },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

// ─────────────────────────────────────────────
// 📌 ENDPOINT 1: Statistik Absensi Hari Ini
// ─────────────────────────────────────────────
// GET /api/dashboard/attendance-today
// Response JSON yang diharapkan:
// [
//   { "title": "Hadir",       "total": 328 },
//   { "title": "Izin",        "total": 12  },
//   { "title": "Terlambat",   "total": 8   },
//   { "title": "Shift Aktif", "total": 3   }
// ]
export const getAttendanceToday = () =>
  apiFetch('/dashboard/attendance-today')

// ─────────────────────────────────────────────
// 📌 ENDPOINT 2: Ringkasan Jumlah Pegawai
// ─────────────────────────────────────────────
// GET /api/dashboard/employee-summary
// Response JSON yang diharapkan:
// [
//   { "title": "Pegawai Tetap",   "total": 145 },
//   { "title": "Pegawai Musiman", "total": 87  },
//   { "title": "BHL",             "total": 96  }
// ]
export const getEmployeeSummary = () =>
  apiFetch('/dashboard/employee-summary')

// ─────────────────────────────────────────────
// 📌 ENDPOINT 3: Antrian Persetujuan (Approval)
// ─────────────────────────────────────────────
// GET /api/dashboard/approvals
// Response JSON yang diharapkan:
// [
//   { "id": 1, "name": "Cuti Tahunan",  "employee": "Budi Santoso", "status": "Menunggu" },
//   { "id": 2, "name": "Lembur Giling", "employee": "Andi Saputra", "status": "Menunggu" }
// ]
export const getApprovals = () =>
  apiFetch('/dashboard/approvals')

// ─────────────────────────────────────────────
// 📌 ENDPOINT 4: Log Aktivitas Sistem
// ─────────────────────────────────────────────
// GET /api/dashboard/activities
// Response JSON yang diharapkan:
// [
//   "Absensi shift pagi berhasil diperbarui",
//   "Slip gaji Mei telah diproses"
// ]
export const getActivities = () =>
  apiFetch('/dashboard/activities')

// ─────────────────────────────────────────────
// 📌 ENDPOINT 5: Pegawai Absen Tercepat Hari Ini
// ─────────────────────────────────────────────
// GET /api/dashboard/fastest-attendance
// Response JSON yang diharapkan:
// [
//   { "name": "Andi Saputra",  "division": "Produksi", "time": "06:01" },
//   { "name": "Budi Santoso",  "division": "QC",       "time": "06:03" }
// ]
export const getFastestAttendance = () =>
  apiFetch('/dashboard/fastest-attendance')

// ─────────────────────────────────────────────
// 📌 ENDPOINT 6: Pegawai Terlambat Hari Ini
// ─────────────────────────────────────────────
// GET /api/dashboard/late-employees
// Response JSON yang diharapkan:
// [
//   { "name": "Ahmad Rizki",  "division": "Produksi", "late": "18 Menit" },
//   { "name": "Yoga Pratama", "division": "Gudang",   "late": "12 Menit" }
// ]
export const getLateEmployees = () =>
  apiFetch('/dashboard/late-employees')

// ─────────────────────────────────────────────
// 📌 ENDPOINT 7: Rekap Absensi Bulanan
// ─────────────────────────────────────────────
// GET /api/dashboard/monthly-attendance
// Response JSON yang diharapkan:
// [
//   { "name": "Andi Saputra", "hadir": "22/31", "alpha": 1, "izin": 2 },
//   { "name": "Budi Santoso", "hadir": "28/31", "alpha": 0, "izin": 1 }
// ]
export const getMonthlyAttendance = () =>
  apiFetch('/dashboard/monthly-attendance')

// ─────────────────────────────────────────────
// 📌 ENDPOINT 8: Pegawai Sering Terlambat (SP)
// ─────────────────────────────────────────────
// GET /api/dashboard/warning-employees
// Response JSON yang diharapkan:
// [
//   { "name": "Ahmad Rizki",  "division": "Produksi", "totalLate": 14, "warning": "SP 1" },
//   { "name": "Rio Saputra",  "division": "QC",       "totalLate": 18, "warning": "SP 2" }
// ]
export const getWarningEmployees = () =>
  apiFetch('/dashboard/warning-employees')

// ─────────────────────────────────────────────
// 📌 ENDPOINT 9: Data Chart Absensi Mingguan
// ─────────────────────────────────────────────
// GET /api/dashboard/chart-bars
// Response JSON yang diharapkan:
// [
//   { "label": "Sen", "value": 85 },
//   { "label": "Sel", "value": 70 },
//   { "label": "Rab", "value": 45 },
//   { "label": "Kam", "value": 30 },
//   { "label": "Jum", "value": 92 }
// ]
export const getChartBars = () =>
  apiFetch('/dashboard/chart-bars')

// ─────────────────────────────────────────────
// 📌 ENDPOINT 10: Info Payroll Bulan Ini
// ─────────────────────────────────────────────
// GET /api/dashboard/payroll
// Response JSON yang diharapkan:
// {
//   "amount": "Rp 245 JT",
//   "status": "Tersinkron",
//   "description": "Proses payroll berjalan lancar dan seluruh data sinkron."
// }
export const getPayroll = () =>
  apiFetch('/dashboard/payroll')

// ─────────────────────────────────────────────
// 📌 ACTION: Kirim Surat Peringatan
// ─────────────────────────────────────────────
// POST /api/dashboard/send-warning
// Request body: { "employeeName": "Ahmad Rizki", "warning": "SP 1" }
// Response JSON yang diharapkan:
// { "success": true, "message": "Surat peringatan berhasil dikirim" }
export const sendWarningLetter = (employeeName, warning) =>
  apiFetch('/dashboard/send-warning', {
    method: 'POST',
    body: JSON.stringify({ employeeName, warning }),
  })