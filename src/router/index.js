/**
 * FILE: src/router/index.js
 * Tambahan route: manajemenabsensi/*, profilpegawai/*
 */

import { createRouter, createWebHistory } from 'vue-router'
import LoginView        from '@/views/LoginView.vue'
import Dashboard        from '@/views/Dashboard.vue'
import MonitorAbsensi   from '@/views/MonitorAbsensi.vue'
import RingkasanPegawai from '@/views/RingkasanPegawai.vue'
import PanelPersetujuan from '@/views/PanelPersetujuan.vue'
import LobbyDisplay     from '@/views/LobbyDisplay.vue'

// ── Manajemen Absensi ──────────────────────────────────────
import LogKehadiran    from '@/manajemenabsensi/LogKehadiran.vue'
import PenjadwalanShift from '@/manajemenabsensi/PenjadwalanShift.vue'
import Cuti            from '@/manajemenabsensi/Cuti.vue'
import LogLembur       from '@/manajemenabsensi/LogLembur.vue'

// ── Profil Pegawai ──────────────────────────────────────────────
import PegawaiTetap      from '@/profilpegawai/PegawaiTetap.vue'
import PegawaiMusiman    from '@/profilpegawai/PegawaiMusiman.vue'
import BHL                from '@/profilpegawai/BHL.vue'
import StrukturOrganisasi from '@/profilpegawai/StrukturOrganisasi.vue'

// ── Penggajian ───────────────────────────────────────────────
import ProsesGaji from '@/penggajian/ProsesGaji.vue'
import UpahHarian from '@/penggajian/UpahHarian.vue'
import Insentif   from '@/penggajian/Insentif.vue'
import SlipGaji   from '@/penggajian/SlipGaji.vue'

// ── Keselamatan Kerja ───────────────────────────────────
import LaporanInsiden from '@/keselamatankerja/LaporanInsiden.vue'
import MedicalCheckUp from '@/keselamatankerja/MedicalCheckUp.vue'
import InventarisAPD  from '@/keselamatankerja/InventarisAPD.vue'

// ── Rekrutmen ───────────────────────────────────────────────
import LowonganAktif   from '@/rekrutmen/LowonganAktif.vue'
import DatabasePelamar from '@/rekrutmen/DatabasePelamar.vue' 

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/dashboard/monitor-absensi',
    name: 'MonitorAbsensi',
    component: MonitorAbsensi,
  },
  {
    path: '/dashboard/ringkasan-pegawai',
    name: 'RingkasanPegawai',
    component: RingkasanPegawai,
  },
  {
    path: '/dashboard/panel-persetujuan',
    name: 'PanelPersetujuan',
    component: PanelPersetujuan,
  },
  {
    path: '/lobby',
    name: 'LobbyDisplay',
    component: LobbyDisplay,
  },

  // ── Manajemen Absensi ──────────────────────────────────
  {
    path: '/manajemen-absensi/log-kehadiran',
    name: 'LogKehadiran',
    component: LogKehadiran,
  },
  {
    path: '/manajemen-absensi/penjadwalan-shift',
    name: 'PenjadwalanShift',
    component: PenjadwalanShift,
  },
  {
    path: '/manajemen-absensi/pengajuan-cuti-izin',
    name: 'Cuti',
    component: Cuti,
  },
  {
    path: '/manajemen-absensi/log-lembur',
    name: 'LogLembur',
    component: LogLembur,
  },

  // ── Profil Pegawai ───────────────────────────────────────
  {
    path: '/profil-pegawai/pegawai-tetap',
    name: 'PegawaiTetap',
    component: PegawaiTetap,
  },
  {
    path: '/profil-pegawai/pegawai-musiman',
    name: 'PegawaiMusiman',
    component: PegawaiMusiman,
  },
  {
    path: '/profil-pegawai/bhl',
    name: 'BHL',
    component: BHL,
  },
  {
    path: '/profil-pegawai/struktur-organisasi',
    name: 'StrukturOrganisasi',
    component: StrukturOrganisasi,
  },

  // ── Penggajian ───────────────────────────────────────────────
  {
    path: '/penggajian/proses-gaji',
    name: 'ProsesGaji',
    component: ProsesGaji,
  },
  {
    path: '/penggajian/upah-harian',
    name: 'UpahHarian',
    component: UpahHarian,
  },
  {
    path: '/penggajian/insentif',
    name: 'Insentif',
    component: Insentif,
  },
  {
      path: '/penggajian/slip-gaji',
      name: 'SlipGaji',
      component: SlipGaji,
  },
  // ── Keselamatan Kerja ───────────────────────────────────
  {
    path: '/keselamatan-kerja/laporan-insiden',
    name: 'LaporanInsiden',
    component: () => import('@/keselamatankerja/LaporanInsiden.vue'),
  },
  {
    path: '/keselamatan-kerja/medical-check-up',
    name: 'MedicalCheckUp',
    component: () => import('@/keselamatankerja/MedicalCheckUp.vue'),
  },
  {path: '/keselamatan-kerja/inventaris-apd',
    name: 'InventarisAPD',
    component: () => import('@/keselamatankerja/InventarisAPD.vue'),      
  },
  // ── Rekrutmen ───────────────────────────────────────────────
  {
    path: '/rekrutmen/lowongan-aktif',
    name: 'LowonganAktif',
    component: () => import('@/rekrutmen/LowonganAktif.vue'),
  },
  {
    path: '/rekrutmen/database-pelamar',
    name: 'DatabasePelamar',
    component: () => import('@/rekrutmen/DatabasePelamar.vue'), 
  },
  // ── Fallback ───────────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router