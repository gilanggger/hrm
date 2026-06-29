/**
 * ============================================================
 *  FILE: src/api/monitorAbsensi.js
 *  TUJUAN: Semua pemanggilan API Monitor Absensi terpusat di sini.
 *
 *  UNTUK BACKEND:
 *  - Ubah BASE_URL di .env (VITE_API_URL)
 *  - Pastikan setiap endpoint mengembalikan JSON
 *    dengan struktur yang sudah didefinisikan di bawah
 * ============================================================
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
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
// GET /api/absensi/stats?date=2026-05-25
// Response:
// [
//   { "title": "Total Hadir", "value": 328 },
//   { "title": "Terlambat",   "value": 8   },
//   { "title": "Izin",        "value": 12  },
//   { "title": "Alpha",       "value": 4   }
// ]
export const getAbsensiStats = (date) =>
  apiFetch(`/absensi/stats?date=${date}`)

// ─────────────────────────────────────────────
// 📌 ENDPOINT 2: Ringkasan Kehadiran per Shift
// ─────────────────────────────────────────────
// GET /api/absensi/shift-summary?date=2026-05-25
// Response:
// [
//   { "label": "Pagi",  "hadir": 140, "total": 148 },
//   { "label": "Siang", "hadir": 105, "total": 112 },
//   { "label": "Malam", "hadir": 83,  "total": 92  }
// ]
export const getShiftSummary = (date) =>
  apiFetch(`/absensi/shift-summary?date=${date}`)

// ─────────────────────────────────────────────
// 📌 ENDPOINT 3: Ringkasan Umum (Total, Tingkat, Shift Aktif)
// ─────────────────────────────────────────────
// GET /api/absensi/summary?date=2026-05-25
// Response:
// {
//   "totalPegawai": 352,
//   "tingkatKehadiran": "93.2%",
//   "shiftAktif": 3
// }
export const getAbsensiSummary = (date) =>
  apiFetch(`/absensi/summary?date=${date}`)

// ─────────────────────────────────────────────
// 📌 ENDPOINT 4: Log Kehadiran Pegawai
// ─────────────────────────────────────────────
// GET /api/absensi/logs?date=2026-05-25
// Response:
// [
//   {
//     "id": 1,
//     "name": "Andi Saputra",
//     "division": "Produksi",
//     "shift": "Pagi",
//     "checkIn": "06:01",
//     "checkOut": "14:02",
//     "status": "Hadir",
//     "late": 0
//   },
//   ...
// ]
// ⚠️ status hanya: "Hadir" | "Terlambat" | "Izin" | "Alpha"
// ⚠️ checkIn/checkOut format "HH:MM" atau "-" jika tidak ada
// ⚠️ late = integer (menit keterlambatan, 0 jika tidak terlambat)
export const getAbsensiLogs = (date) =>
  apiFetch(`/absensi/logs?date=${date}`)