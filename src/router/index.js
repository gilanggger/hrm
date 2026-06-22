/**
 * FILE: src/router/index.js
 * Tambahan route: manajemenabsensi/*
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