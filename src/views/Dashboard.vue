<script setup>
/**
 * ============================================================
 *  FILE: src/views/Dashboard.vue
 *  TUJUAN: Tampilan dashboard HRM - data dari API, bukan hardcode.
 *
 *  ✅ UNTUK BACKEND:
 *  - File ini TIDAK perlu disentuh sama sekali
 *  - Semua perubahan data cukup di endpoint API
 *
 *  ✅ UNTUK FRONTEND DEVELOPER:
 *  - Semua data & logic ada di useDashboard composable
 *  - Hanya ubah tampilan (HTML/CSS) di sini
 * ============================================================
 */

import {
  Users, UserCheck, Clock3, CalendarClock, BadgeDollarSign,
  Building2, Factory, ClipboardCheck,
  TimerReset, Activity, Wallet, AlarmClock,
  UserX, CalendarDays, TriangleAlert, Send, Monitor,
  RefreshCw, AlertCircle, Loader2,
} from 'lucide-vue-next'

import AppLayout from '@/components/AppLayout.vue'
import { useDashboard } from '@/composables/useDashboard'

const {
  loading,
  error,
  attendanceToday,
  employees,
  approvals,
  activities,
  fastestAttendance,
  lateEmployees,
  monthlyAttendance,
  warningEmployees,
  chartBars,
  payroll,
  sendWarning,
  refetch,
} = useDashboard()

const statIcons  = [UserCheck, ClipboardCheck, TimerReset, Factory]
const statColors = [
  { from: '#10b981', to: '#34d399', glow: 'rgba(16,185,129,0.15)' },
  { from: '#f59e0b', to: '#fbbf24', glow: 'rgba(245,158,11,0.15)' },
  { from: '#ef4444', to: '#f87171', glow: 'rgba(239,68,68,0.15)'  },
  { from: '#0ea5e9', to: '#38bdf8', glow: 'rgba(14,165,233,0.15)' },
]

const empIcons = [Users, Building2, Clock3]

const attendancePercent = (hadir) => {
  const [n, total] = hadir.split('/').map(Number)
  return Math.round((n / total) * 100)
}

const barWidth = (totalLate) => `${Math.min((totalLate / 20) * 100, 100)}%`

const openLobby = () => window.open('/lobby', '_blank')
</script>

<template>
  <AppLayout breadcrumb="Welcome Back 👋" title="Dashboard HRM">

    <!-- ── Loading ── -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 :size="40" class="text-sky-500 animate-spin" />
      <p class="text-slate-500 text-sm font-black tracking-wide">Memuat data dashboard...</p>
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div class="w-14 h-14 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center">
        <AlertCircle :size="28" class="text-red-500" />
      </div>
      <p class="text-slate-800 font-black text-base">{{ error }}</p>
      <button
        @click="refetch"
        class="action-btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white font-black text-sm hover:bg-sky-600 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
      >
        <RefreshCw :size="15" />
        Coba Lagi
      </button>
    </div>

    <!-- ── Dashboard Content ── -->
    <div v-else class="space-y-5 pb-6 animate-fadein">

      <!-- ── Tombol Lobby Display ── -->
      <div class="flex justify-end">
        <button
          @click="openLobby"
          class="lobby-btn flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-black text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sky-300/50 active:scale-95 shadow-lg"
        >
          <Monitor :size="17" />
          Buka Lobby Display
        </button>
      </div>

      <!-- ── Stat Cards ── -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div
          v-for="(item, index) in attendanceToday" :key="index"
          class="stat-card rounded-[22px] p-5 sm:p-6 cursor-default relative overflow-hidden"
          :style="`--glow: ${statColors[index].glow}`"
          :class="`stagger-${index}`"
        >
          <!-- Glow blob -->
          <div
            class="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none opacity-30"
            :style="`background: radial-gradient(circle, ${statColors[index].from}, transparent 70%)`"
          />
          <div class="relative z-10">
            <!-- Icon -->
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center mb-5 border-2"
              :style="`background: ${statColors[index].glow}; border-color: ${statColors[index].from}33`"
            >
              <component :is="statIcons[index]" :size="19" :style="`color: ${statColors[index].from}`" />
            </div>
            <h2 class="text-3xl sm:text-4xl font-black tabular-nums text-slate-800 leading-none">
              {{ item.total }}
            </h2>
            <p class="mt-2 text-slate-500 text-xs font-black uppercase tracking-widest">
              {{ item.title }}
            </p>
          </div>
        </div>
      </div>

      <!-- ── Fastest + Late ── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

        <!-- Absen Tercepat -->
        <div class="card rounded-[24px] p-5 sm:p-6">
          <div class="card-header">
            <div>
              <h3 class="card-title">Absen Tercepat</h3>
              <p class="card-sub">Pegawai paling cepat hadir hari ini</p>
            </div>
            <div class="icon-box bg-emerald-50 border-emerald-200">
              <AlarmClock :size="20" class="text-emerald-500" />
            </div>
          </div>

          <p v-if="!fastestAttendance.length" class="empty-msg">Belum ada data hari ini</p>

          <div class="space-y-2">
            <div
              v-for="(item, index) in fastestAttendance" :key="index"
              class="row-item rounded-2xl px-4 py-3.5 flex items-center justify-between group"
              :style="`animation-delay: ${index * 60}ms`"
            >
              <div class="flex items-center gap-3">
                <div class="rank-num">{{ index + 1 }}</div>
                <div>
                  <h4 class="row-name group-hover:text-emerald-600">{{ item.name }}</h4>
                  <p class="row-sub">{{ item.division }}</p>
                </div>
              </div>
              <div class="badge badge-green tabular-nums">{{ item.time }}</div>
            </div>
          </div>
        </div>

        <!-- Pegawai Terlambat -->
        <div class="card rounded-[24px] p-5 sm:p-6">
          <div class="card-header">
            <div>
              <h3 class="card-title">Pegawai Terlambat</h3>
              <p class="card-sub">Keterlambatan masuk shift hari ini</p>
            </div>
            <div class="icon-box bg-red-50 border-red-200">
              <UserX :size="20" class="text-red-500" />
            </div>
          </div>

          <p v-if="!lateEmployees.length" class="empty-msg">Tidak ada keterlambatan hari ini 🎉</p>

          <div class="space-y-2">
            <div
              v-for="(item, index) in lateEmployees" :key="index"
              class="row-item rounded-2xl px-4 py-3.5 flex items-center justify-between group"
              :style="`animation-delay: ${index * 60}ms`"
            >
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                <div>
                  <h4 class="row-name group-hover:text-red-500">{{ item.name }}</h4>
                  <p class="row-sub">{{ item.division }}</p>
                </div>
              </div>
              <div class="badge badge-red">{{ item.late }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Monthly Attendance Table ── -->
      <div class="card rounded-[24px] p-5 sm:p-6">
        <div class="card-header">
          <div>
            <h3 class="card-title">Absensi Bulanan Pegawai</h3>
            <p class="card-sub">Rekap kehadiran bulan berjalan</p>
          </div>
          <div class="icon-box bg-sky-50 border-sky-200">
            <CalendarDays :size="20" class="text-sky-500" />
          </div>
        </div>

        <div class="overflow-x-auto -mx-1">
          <table class="w-full min-w-[460px]">
            <thead>
              <tr>
                <th class="th">Nama Pegawai</th>
                <th class="th">Kehadiran</th>
                <th class="th">Alpha</th>
                <th class="th">Izin</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in monthlyAttendance" :key="index"
                class="border-t-2 border-slate-100 hover:bg-slate-50 transition-colors duration-150 group"
              >
                <td class="td">
                  <div class="flex items-center gap-2.5">
                    <div class="avatar">{{ item.name.charAt(0) }}</div>
                    <span class="font-black text-sm text-slate-800">{{ item.name }}</span>
                  </div>
                </td>
                <td class="td">
                  <div class="flex items-center gap-2">
                    <div class="h-1.5 w-16 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        class="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-400 transition-all duration-700"
                        :style="`width: ${attendancePercent(item.hadir)}%`"
                      />
                    </div>
                    <span class="font-black text-sm text-slate-600 tabular-nums">{{ item.hadir }}</span>
                  </div>
                </td>
                <td class="td">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black border-2"
                    :class="item.alpha > 0
                      ? 'bg-red-50 text-red-500 border-red-200'
                      : 'bg-slate-100 text-slate-400 border-transparent'"
                  >{{ item.alpha }}</span>
                </td>
                <td class="td">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black border-2"
                    :class="item.izin > 0
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-slate-100 text-slate-400 border-transparent'"
                  >{{ item.izin }}</span>
                </td>
              </tr>
              <tr v-if="!monthlyAttendance.length">
                <td colspan="4" class="py-8 text-center text-slate-400 text-sm font-black">
                  Belum ada data absensi bulan ini
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Warning & Kirim SP ── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

        <!-- Sering Terlambat -->
        <div class="card rounded-[24px] p-5 sm:p-6">
          <div class="card-header">
            <div>
              <h3 class="card-title">Sering Terlambat</h3>
              <p class="card-sub">Monitoring keterlambatan pegawai</p>
            </div>
            <div class="icon-box bg-red-50 border-red-200">
              <TriangleAlert :size="19" class="text-red-500" />
            </div>
          </div>

          <p v-if="!warningEmployees.length" class="empty-msg">Tidak ada pegawai bermasalah</p>

          <div class="space-y-2">
            <div
              v-for="(item, index) in warningEmployees" :key="index"
              class="row-item rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 group"
            >
              <div class="min-w-0">
                <h4 class="row-name">{{ item.name }}</h4>
                <p class="row-sub">{{ item.division }}</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <div class="h-1.5 w-12 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-400 transition-all duration-700"
                    :style="`width: ${barWidth(item.totalLate)}`"
                  />
                </div>
                <div class="badge badge-red whitespace-nowrap">{{ item.totalLate }}x Terlambat</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Kirim SP -->
        <div class="card rounded-[24px] p-5 sm:p-6">
          <div class="card-header">
            <div>
              <h3 class="card-title">Kirim Surat Peringatan</h3>
              <p class="card-sub">Pengiriman SP otomatis pegawai</p>
            </div>
            <div class="icon-box bg-sky-50 border-sky-200">
              <Send :size="19" class="text-sky-500" />
            </div>
          </div>

          <div class="space-y-2">
            <div
              v-for="(item, index) in warningEmployees" :key="index"
              class="row-item rounded-2xl px-4 py-3.5"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <h4 class="row-name truncate">{{ item.name }}</h4>
                  <span
                    class="inline-flex items-center mt-1 px-2 py-0.5 rounded-md text-[11px] font-black border-2"
                    :class="item.warning === 'SP 2'
                      ? 'bg-red-50 text-red-500 border-red-200'
                      : 'bg-amber-50 text-amber-600 border-amber-200'"
                  >{{ item.warning }}</span>
                </div>
                <button
                  @click="sendWarning(item)"
                  class="send-btn px-4 py-2 rounded-xl shrink-0 font-black text-xs transition-all duration-200 hover:-translate-y-0.5 active:scale-95 border-2"
                >
                  Kirim SP
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Bottom Section ── -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">

        <!-- Kiri: Ringkasan + Chart -->
        <div class="xl:col-span-2 space-y-4 sm:space-y-5">

          <!-- Ringkasan Pegawai -->
          <div class="card rounded-[24px] p-5 sm:p-6">
            <div class="card-header">
              <div>
                <h3 class="card-title">Ringkasan Pegawai</h3>
                <p class="card-sub">Statistik pekerja aktif pabrik gula</p>
              </div>
              <div class="icon-box bg-slate-100 border-slate-200">
                <Users :size="19" class="text-slate-500" />
              </div>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div
                v-for="(item, index) in employees" :key="index"
                class="emp-card rounded-2xl p-4 sm:p-5 text-center group cursor-default border-2 border-slate-100 hover:border-sky-200 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div class="w-9 h-9 rounded-xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center mx-auto mb-3 group-hover:bg-sky-100 transition-colors">
                  <component :is="empIcons[index]" :size="18" class="text-sky-500" />
                </div>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-800 tabular-nums leading-none">{{ item.total }}</h2>
                <p class="mt-1.5 text-slate-500 text-[11px] font-black uppercase tracking-widest leading-tight">{{ item.title }}</p>
              </div>
            </div>
          </div>

          <!-- Chart Bar -->
          <div class="card rounded-[24px] p-5 sm:p-6">
            <div class="card-header">
              <div>
                <h3 class="card-title">Monitor Absensi</h3>
                <p class="card-sub">Statistik kehadiran minggu ini</p>
              </div>
              <div class="icon-box bg-slate-100 border-slate-200">
                <CalendarClock :size="19" class="text-slate-500" />
              </div>
            </div>

            <div class="flex items-end gap-3 sm:gap-4 h-[200px] sm:h-[220px] pt-6">
              <div
                v-for="(bar, i) in chartBars" :key="i"
                class="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  class="w-full relative group cursor-default"
                  :style="`height: ${bar.value * 1.8}px`"
                >
                  <div
                    class="absolute bottom-0 left-0 right-0 rounded-t-2xl chart-bar"
                    :class="[
                      i === 0 ? 'bg-gradient-to-t from-sky-500 to-blue-400'      : '',
                      i === 1 ? 'bg-gradient-to-t from-emerald-500 to-green-400' : '',
                      i === 2 ? 'bg-gradient-to-t from-amber-500 to-orange-400'  : '',
                      i === 3 ? 'bg-gradient-to-t from-red-500 to-rose-400'      : '',
                      i === 4 ? 'bg-gradient-to-t from-violet-500 to-purple-400' : '',
                    ]"
                    style="height: 100%"
                  />
                  <!-- Tooltip -->
                  <div class="tooltip">{{ bar.value }}%</div>
                </div>
                <span class="text-[11px] text-slate-500 font-black uppercase tracking-wide">{{ bar.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Kanan: Approvals + Activity + Payroll -->
        <div class="space-y-4 sm:space-y-5">

          <!-- Persetujuan -->
          <div class="card rounded-[24px] p-5 sm:p-6">
            <div class="card-header">
              <h3 class="card-title">Persetujuan</h3>
              <div class="icon-box bg-slate-100 border-slate-200">
                <ClipboardCheck :size="19" class="text-slate-500" />
              </div>
            </div>

            <p v-if="!approvals.length" class="empty-msg">Tidak ada persetujuan menunggu</p>

            <div class="space-y-2">
              <div
                v-for="(item, index) in approvals" :key="index"
                class="row-item rounded-2xl p-4"
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="min-w-0">
                    <h4 class="row-name truncate">{{ item.name }}</h4>
                    <p class="row-sub truncate">{{ item.employee }}</p>
                  </div>
                  <span class="badge badge-amber whitespace-nowrap shrink-0">{{ item.status }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Log Aktivitas -->
          <div class="card rounded-[24px] p-5 sm:p-6">
            <div class="card-header">
              <h3 class="card-title">Aktivitas</h3>
              <div class="icon-box bg-slate-100 border-slate-200">
                <Activity :size="19" class="text-slate-500" />
              </div>
            </div>
            <div class="space-y-3">
              <div
                v-for="(item, index) in activities" :key="index"
                class="flex gap-3 group"
              >
                <div class="flex flex-col items-center shrink-0 mt-1.5">
                  <div class="w-2 h-2 rounded-full bg-sky-400 group-hover:bg-sky-500 transition-colors ring-2 ring-sky-100" />
                  <div
                    v-if="index < activities.length - 1"
                    class="w-px flex-1 bg-slate-200 mt-1"
                    style="min-height: 16px"
                  />
                </div>
                <p class="text-slate-500 text-xs font-bold leading-relaxed pb-3 group-hover:text-slate-700 transition-colors">
                  {{ item }}
                </p>
              </div>
            </div>
          </div>

          <!-- Payroll Card -->
          <div class="payroll-card rounded-[24px] p-5 sm:p-6 relative overflow-hidden border-2 border-sky-200">
            <!-- Decorative rings -->
            <div class="absolute -top-6 -right-6 w-28 h-28 rounded-full border-2 border-sky-300/30 pointer-events-none" />
            <div class="absolute -top-2 -right-2 w-14 h-14 rounded-full border-2 border-sky-300/20 pointer-events-none" />

            <div class="relative z-10">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <p class="text-sky-600 text-[10px] font-black tracking-widest uppercase">Payroll Bulan Ini</p>
                  <h2 class="mt-1.5 text-2xl sm:text-3xl font-black text-slate-800 leading-none">{{ payroll.amount }}</h2>
                </div>
                <div class="w-11 h-11 rounded-xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center">
                  <Wallet :size="22" class="text-sky-500" />
                </div>
              </div>
              <div class="h-px bg-sky-200/60 mb-4" />
              <p class="text-slate-600 text-xs font-bold leading-relaxed">{{ payroll.description }}</p>
              <div class="flex items-center gap-1.5 mt-3">
                <div class="status-pulse w-2 h-2 rounded-full bg-emerald-500" />
                <span class="text-emerald-600 text-[11px] font-black tracking-wide uppercase">{{ payroll.status }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="h-4" />
    </div>
  </AppLayout>
</template>

<style scoped>

/* ────────────────────────────────────────────────────────────
   PAGE ENTER ANIMATION
──────────────────────────────────────────────────────────── */
.animate-fadein {
  animation: fadeInUp 0.4s ease both;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ────────────────────────────────────────────────────────────
   STAT CARDS — stagger entrance
──────────────────────────────────────────────────────────── */
.stat-card {
  background: #ffffff;
  border: 2px solid #e2e8f0;
  animation: cardIn 0.45s ease both;
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.07);
}
.stagger-0 { animation-delay: 0ms; }
.stagger-1 { animation-delay: 70ms; }
.stagger-2 { animation-delay: 140ms; }
.stagger-3 { animation-delay: 210ms; }
@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ────────────────────────────────────────────────────────────
   CARD BASE
──────────────────────────────────────────────────────────── */
.card {
  background: #ffffff;
  border: 2px solid #e2e8f0;
  transition: box-shadow 0.2s;
}
.card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

/* ────────────────────────────────────────────────────────────
   CARD HEADER PATTERN
──────────────────────────────────────────────────────────── */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  gap: 0.75rem;
}
.card-title {
  font-size: 1rem;
  font-weight: 900;
  color: #1e293b;
  letter-spacing: -0.01em;
}
.card-sub {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.icon-box {
  width: 40px; height: 40px;
  border-radius: 12px;
  border-width: 2px;
  border-style: solid;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ────────────────────────────────────────────────────────────
   TABLE
──────────────────────────────────────────────────────────── */
.th {
  padding-bottom: 1rem;
  padding-left: 4px;
  padding-right: 4px;
  font-size: 0.65rem;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: left;
}
.td {
  padding: 0.875rem 4px;
}

/* ────────────────────────────────────────────────────────────
   ROW ITEMS
──────────────────────────────────────────────────────────── */
.row-item {
  background: #f8fafc;
  border: 2px solid #f1f5f9;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
  animation: rowIn 0.3s ease both;
}
.row-item:hover {
  background: #f0f9ff;
  border-color: #bae6fd;
  transform: translateX(2px);
}
@keyframes rowIn {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ────────────────────────────────────────────────────────────
   TYPOGRAPHY HELPERS
──────────────────────────────────────────────────────────── */
.row-name {
  font-weight: 900;
  font-size: 0.8125rem;
  color: #1e293b;
  transition: color 0.15s;
}
.row-sub {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  margin-top: 2px;
}
.empty-msg {
  color: #cbd5e1;
  font-size: 0.8125rem;
  font-weight: 700;
  text-align: center;
  padding: 1rem 0;
}

/* ────────────────────────────────────────────────────────────
   RANK NUMBER
──────────────────────────────────────────────────────────── */
.rank-num {
  width: 24px; height: 24px;
  border-radius: 8px;
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  color: #64748b;
  flex-shrink: 0;
}

/* ────────────────────────────────────────────────────────────
   AVATAR
──────────────────────────────────────────────────────────── */
.avatar {
  width: 30px; height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, #e0f2fe, #dbeafe);
  border: 2px solid #bae6fd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  color: #0369a1;
  flex-shrink: 0;
}

/* ────────────────────────────────────────────────────────────
   BADGES
──────────────────────────────────────────────────────────── */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 900;
  border-width: 2px;
  border-style: solid;
}
.badge-green {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #16a34a;
}
.badge-red {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #e11d48;
}
.badge-amber {
  background: #fffbeb;
  border-color: #fed7aa;
  color: #d97706;
}

/* ────────────────────────────────────────────────────────────
   EMPLOYEE CARD
──────────────────────────────────────────────────────────── */
.emp-card {
  background: #f8fafc;
}

/* ────────────────────────────────────────────────────────────
   CHART BAR — grow from bottom
──────────────────────────────────────────────────────────── */
.chart-bar {
  animation: growBar 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
  transform-origin: bottom;
}
@keyframes growBar {
  from { transform: scaleY(0); opacity: 0; }
  to   { transform: scaleY(1); opacity: 1; }
}

/* Bar stagger */
.flex-1:nth-child(1) .chart-bar { animation-delay: 0ms; }
.flex-1:nth-child(2) .chart-bar { animation-delay: 80ms; }
.flex-1:nth-child(3) .chart-bar { animation-delay: 160ms; }
.flex-1:nth-child(4) .chart-bar { animation-delay: 240ms; }
.flex-1:nth-child(5) .chart-bar { animation-delay: 320ms; }

/* Chart Tooltip */
.tooltip {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  background: rgba(15,23,42,0.88);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 900;
  color: #ffffff;
  white-space: nowrap;
  pointer-events: none;
  transition: opacity 0.15s;
}
.group:hover .tooltip { opacity: 1; }

/* ────────────────────────────────────────────────────────────
   LOBBY BUTTON
──────────────────────────────────────────────────────────── */
.lobby-btn {
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  box-shadow: 0 4px 20px rgba(14,165,233,0.35);
}
.lobby-btn:hover {
  box-shadow: 0 6px 28px rgba(14,165,233,0.45);
}

/* ────────────────────────────────────────────────────────────
   SEND SP BUTTON
──────────────────────────────────────────────────────────── */
.send-btn {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #2563eb;
}
.send-btn:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

/* ────────────────────────────────────────────────────────────
   PAYROLL CARD
──────────────────────────────────────────────────────────── */
.payroll-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

/* ────────────────────────────────────────────────────────────
   STATUS PULSE DOT
──────────────────────────────────────────────────────────── */
.status-pulse {
  animation: statusPulse 1.8s ease-in-out infinite;
}
@keyframes statusPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
  70%       { box-shadow: 0 0 0 5px rgba(16,185,129,0); }
}

/* ────────────────────────────────────────────────────────────
   SCROLLBAR HIDE
──────────────────────────────────────────────────────────── */
::-webkit-scrollbar { display: none; }
* { -ms-overflow-style: none; scrollbar-width: none; }
</style>