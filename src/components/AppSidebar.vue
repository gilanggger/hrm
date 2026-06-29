<script setup>
import {
  ChevronDown, ChevronLeft, Menu, LogOut, X,
} from 'lucide-vue-next'
import { useSidebar } from '@/composables/useSidebar.js'
import logoImg from '@/assets/logo.png'

const {
  sidebarOpen,
  mobileSidebarOpen,
  openedMenu,
  toggleMenu,
  navigateTo,
  handleLogout,
  ROUTE_MAP,
  MENUS,
} = useSidebar()

/* ── Ripple helper ─────────────────────────────────────────── */
function createRipple(event) {
  const btn  = event.currentTarget
  const rect = btn.getBoundingClientRect()
  const r    = Math.max(btn.offsetWidth, btn.offsetHeight)
  const x    = event.clientX - rect.left  - r / 2
  const y    = event.clientY - rect.top   - r / 2
  const el   = document.createElement('span')
  el.className   = 'ripple-wave'
  el.style.cssText = `width:${r}px;height:${r}px;left:${x}px;top:${y}px`
  btn.appendChild(el)
  setTimeout(() => el.remove(), 650)
}
</script>

<template>

  <!-- ═══════════════════════════════════════════════════════
       MOBILE · Overlay
  ══════════════════════════════════════════════════════════ -->
  <transition name="fade-overlay">
    <div
      v-if="mobileSidebarOpen"
      class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
      @click="mobileSidebarOpen = false"
    />
  </transition>

  <!-- ═══════════════════════════════════════════════════════
       MOBILE · Sidebar Drawer
  ══════════════════════════════════════════════════════════ -->
  <transition name="drawer">
    <aside
      v-if="mobileSidebarOpen"
      class="fixed top-0 left-0 z-50 h-full w-[280px] flex flex-col
             bg-white border-r-2 border-slate-300 px-4 py-6
             lg:hidden overflow-y-auto scrollbar-hide shadow-2xl"
      role="navigation"
      aria-label="Navigasi mobile"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 pb-5 border-b-2 border-slate-200">
        <div class="flex items-center gap-3">
          <div class="logo-glow w-11 h-11 flex items-center justify-center shrink-0 rounded-xl">
            <img :src="logoImg" alt="Logo" class="w-full h-full object-contain" />
          </div>
          <div>
            <h1 class="text-base font-black tracking-[0.15em] text-slate-900 uppercase leading-tight">HRM</h1>
            <p class="text-blue-600 text-xs font-bold tracking-widest uppercase leading-tight">Pabrik Gula Modern</p>
          </div>
        </div>
        <button
          @click="mobileSidebarOpen = false"
          class="close-btn w-9 h-9 rounded-xl border-2 border-slate-300 bg-slate-100
                 flex items-center justify-center transition-all duration-200"
          aria-label="Tutup menu"
        >
          <X :size="16" class="text-slate-600" />
        </button>
      </div>

      <!-- Daftar Menu -->
      <nav class="space-y-1 flex-1">
        <div v-for="(menu, index) in MENUS" :key="index">
          <button
            @click="toggleMenu(menu.title)"
            class="menu-btn w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all duration-200"
            :class="openedMenu === menu.title
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-transparent border-transparent hover:bg-slate-100 hover:border-slate-200 hover:translate-x-0.5'"
            :aria-expanded="openedMenu === menu.title"
          >
            <div class="flex items-center gap-3">
              <component
                :is="menu.icon" :size="16"
                class="shrink-0 transition-all duration-200"
                :class="openedMenu === menu.title
                  ? 'text-blue-600 scale-110'
                  : 'text-slate-500 scale-100'"
              />
              <span
                class="font-black text-sm tracking-wide"
                :class="openedMenu === menu.title ? 'text-blue-800' : 'text-slate-700'"
              >
                {{ menu.title }}
              </span>
            </div>
            <ChevronDown
              :size="13"
              class="shrink-0 transition-all duration-300"
              :class="openedMenu === menu.title
                ? 'rotate-180 text-blue-500 chevron-spring'
                : 'text-slate-400'"
            />
          </button>

          <!-- Submenu Mobile -->
          <transition name="submenu">
            <div
              v-if="openedMenu === menu.title"
              class="mt-1 ml-3 border-l-2 border-blue-300 space-y-0.5 pl-2"
            >
              <button
                v-for="(child, ci) in menu.children" :key="ci"
                @click="navigateTo(child)"
                class="sub-item w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all duration-150"
                :class="ROUTE_MAP[child]
                  ? 'text-slate-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'
                  : 'text-slate-400 cursor-default'"
                :style="`animation-delay: ${ci * 50}ms`"
              >
                <div
                  class="dot w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 transition-all duration-200"
                />
                {{ child }}
              </button>
            </div>
          </transition>
        </div>
      </nav>

      <!-- Logout Mobile -->
      <div class="mt-6 pt-4 border-t-2 border-slate-200">
        <button
          @click="(e) => { createRipple(e); mobileSidebarOpen = false; handleLogout() }"
          class="ripple-host w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                 border-2 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300
                 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
                 transition-all duration-200 overflow-hidden relative"
        >
          <LogOut :size="16" class="text-red-500 shrink-0" />
          <span class="text-sm font-black text-red-600 tracking-wide">Keluar</span>
        </button>
      </div>
    </aside>
  </transition>

  <!-- ═══════════════════════════════════════════════════════
       DESKTOP · Sidebar Permanen (collapsible)
  ══════════════════════════════════════════════════════════ -->
  <aside
    :class="sidebarOpen ? 'w-[272px]' : 'w-[68px]'"
    class="hidden lg:flex flex-col h-screen z-30 px-3 py-5 shrink-0
           transition-all duration-400 ease-in-out
           border-r-2 border-slate-300 bg-white
           shadow-sm overflow-y-auto scrollbar-hide relative"
    role="navigation"
    aria-label="Navigasi desktop"
  >
    <!-- Header Desktop -->
    <div class="flex items-center justify-between mb-5 px-1 pb-4 border-b-2 border-slate-200 shrink-0">
      <transition name="brand-fade">
        <div v-if="sidebarOpen" class="flex items-center gap-3">
          <div class="logo-glow w-11 h-11 flex items-center justify-center shrink-0 rounded-xl">
            <img :src="logoImg" alt="Logo" class="w-full h-full object-contain" />
          </div>
          <div>
            <h1 class="text-base font-black tracking-[0.15em] text-slate-900 uppercase leading-tight">HRM</h1>
            <p class="text-blue-600 text-[10px] font-black tracking-widest uppercase leading-tight mt-0.5">Pabrik Gula Modern</p>
          </div>
        </div>
      </transition>

      <!-- Logo collapsed -->
      <transition name="logo-only">
        <div
          v-if="!sidebarOpen"
          class="logo-glow w-10 h-10 flex items-center justify-center shrink-0 rounded-xl mx-auto"
        >
          <img :src="logoImg" alt="Logo" class="w-full h-full object-contain" />
        </div>
      </transition>

      <button
        v-if="sidebarOpen"
        @click="sidebarOpen = !sidebarOpen"
        class="toggle-btn w-9 h-9 rounded-xl border-2 border-slate-300 bg-slate-100
               flex items-center justify-center shrink-0
               hover:bg-slate-200 hover:border-slate-400
               active:scale-95 transition-all duration-200"
        aria-label="Tutup sidebar"
      >
        <ChevronLeft :size="15" class="text-slate-600 transition-transform duration-300" />
      </button>
    </div>

    <!-- Toggle saat collapsed -->
    <div v-if="!sidebarOpen" class="flex justify-center mb-5">
      <button
        @click="sidebarOpen = !sidebarOpen"
        class="toggle-btn w-9 h-9 rounded-xl border-2 border-slate-300 bg-slate-100
               flex items-center justify-center
               hover:bg-slate-200 hover:border-slate-400
               active:scale-95 transition-all duration-200"
        aria-label="Buka sidebar"
      >
        <Menu :size="15" class="text-slate-600" />
      </button>
    </div>

    <!-- Daftar Menu Desktop -->
    <nav class="space-y-0.5 flex-1 scrollbar-hide overflow-y-auto">
      <div v-for="(menu, index) in MENUS" :key="index">
        <button
          @click="toggleMenu(menu.title)"
          class="menu-btn w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all duration-200"
          :class="openedMenu === menu.title
            ? 'bg-blue-50 border-blue-300'
            : 'border-transparent hover:bg-slate-100 hover:border-slate-200 hover:translate-x-0.5'"
          :title="!sidebarOpen ? menu.title : ''"
          :aria-expanded="openedMenu === menu.title"
        >
          <div
            class="flex items-center gap-3"
            :class="!sidebarOpen ? 'justify-center w-full' : ''"
          >
            <component
              :is="menu.icon" :size="17"
              class="shrink-0 transition-all duration-200"
              :class="openedMenu === menu.title
                ? 'text-blue-600 scale-110'
                : 'text-slate-400 scale-100'"
            />
            <transition name="label-fade">
              <span
                v-if="sidebarOpen"
                class="font-black text-sm tracking-wide transition-colors duration-200"
                :class="openedMenu === menu.title ? 'text-blue-800' : 'text-slate-700'"
              >
                {{ menu.title }}
              </span>
            </transition>
          </div>
          <ChevronDown
            v-if="sidebarOpen"
            :size="13"
            class="shrink-0 transition-all duration-300"
            :class="openedMenu === menu.title
              ? 'rotate-180 text-blue-500'
              : 'text-slate-400'"
            style="transition-timing-function: cubic-bezier(0.34,1.56,0.64,1)"
          />
        </button>

        <!-- Submenu Desktop -->
        <transition name="submenu">
          <div
            v-if="openedMenu === menu.title && sidebarOpen"
            class="mt-0.5 ml-3 border-l-2 border-blue-300 space-y-0.5 pl-2"
          >
            <button
              v-for="(child, ci) in menu.children" :key="ci"
              @click="navigateTo(child)"
              class="sub-item w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all duration-150"
              :class="ROUTE_MAP[child]
                ? 'text-slate-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'
                : 'text-slate-400 cursor-default'"
              :style="`animation-delay: ${ci * 55}ms`"
            >
              <div
                class="dot w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 transition-all duration-200"
              />
              {{ child }}
            </button>
          </div>
        </transition>
      </div>
    </nav>

    <!-- Footer Desktop -->
    <div class="mt-5 pt-4 border-t-2 border-slate-200 space-y-3 shrink-0">

      <!-- Status sistem -->
      <transition name="status-slide">
        <div
          v-if="sidebarOpen"
          class="rounded-xl p-3 bg-emerald-50 border-2 border-emerald-300"
        >
          <div class="flex items-center gap-2 mb-1">
            <div class="status-pulse w-2 h-2 rounded-full bg-emerald-500" />
            <span class="text-xs text-emerald-700 font-black tracking-widest uppercase">SISTEM AKTIF</span>
          </div>
          <p class="text-xs text-emerald-700 font-semibold leading-relaxed">
            Semua modul HRM berjalan normal & realtime.
          </p>
        </div>
      </transition>

      <!-- Logout expanded -->
      <button
        v-if="sidebarOpen"
        @click="createRipple($event); handleLogout()"
        class="ripple-host w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
               border-2 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300
               hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
               transition-all duration-200 relative overflow-hidden"
      >
        <LogOut :size="16" class="text-red-500 shrink-0" />
        <span class="text-sm font-black text-red-600 tracking-wide">Keluar</span>
      </button>

      <!-- Logout collapsed -->
      <div v-if="!sidebarOpen" class="flex justify-center">
        <button
          @click="createRipple($event); handleLogout()"
          title="Keluar"
          class="ripple-host w-10 h-10 rounded-xl border-2 border-red-200 bg-red-50
                 flex items-center justify-center
                 hover:bg-red-100 hover:border-red-300
                 hover:-translate-y-0.5 active:translate-y-0 active:scale-95
                 transition-all duration-200 relative overflow-hidden"
        >
          <LogOut :size="17" class="text-red-500" />
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>

/* ────────────────────────────────────────────────────────────
   LOGO · Ambient glow pulse
──────────────────────────────────────────────────────────── */
.logo-glow {
  animation: logoPulse 3s ease-in-out infinite;
}
@keyframes logoPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.22); }
  50%       { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
}

/* ────────────────────────────────────────────────────────────
   STATUS DOT · Ripple pulse (lebih halus dari animate-pulse)
──────────────────────────────────────────────────────────── */
.status-pulse {
  animation: statusPulse 1.8s ease-in-out infinite;
}
@keyframes statusPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.55); }
  70%       { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
}

/* ────────────────────────────────────────────────────────────
   MENU BUTTON · hover slide
──────────────────────────────────────────────────────────── */
.menu-btn {
  transform: translateX(0);
}
.menu-btn:hover {
  transform: translateX(2px);
}
.menu-btn.active,
.menu-btn[aria-expanded="true"] {
  transform: translateX(0);
}

/* ────────────────────────────────────────────────────────────
   SUB-ITEM · staggered slide-in + hover left-border reveal
──────────────────────────────────────────────────────────── */
.sub-item {
  position: relative;
  overflow: hidden;
  opacity: 0;
  animation: subItemIn 0.22s ease forwards;
}
@keyframes subItemIn {
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
}

.sub-item::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  transform: translateY(-50%);
  width: 2px; height: 0;
  background: #3b82f6;
  border-radius: 2px;
  transition: height 0.2s ease;
}
.sub-item:hover::before {
  height: 60%;
}

/* dot scale on sub-item hover */
.sub-item:hover .dot {
  transform: scale(1.5);
  background: #2563eb;
}

/* ────────────────────────────────────────────────────────────
   RIPPLE · click effect (logout & mobile logout)
──────────────────────────────────────────────────────────── */
.ripple-host {
  position: relative;
  overflow: hidden;
}
:deep(.ripple-wave) {
  position: absolute;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.18);
  transform: scale(0);
  animation: rippleExpand 0.65s linear forwards;
  pointer-events: none;
}
@keyframes rippleExpand {
  to { transform: scale(4); opacity: 0; }
}

/* ────────────────────────────────────────────────────────────
   TOGGLE BUTTON · press bounce
──────────────────────────────────────────────────────────── */
.toggle-btn:active {
  transform: scale(0.9);
}

/* ────────────────────────────────────────────────────────────
   CLOSE BUTTON (mobile) · rotate on hover
──────────────────────────────────────────────────────────── */
.close-btn:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  transform: rotate(90deg);
}

/* ────────────────────────────────────────────────────────────
   TRANSITIONS
──────────────────────────────────────────────────────────── */

/* Overlay fade */
.fade-overlay-enter-active,
.fade-overlay-leave-active { transition: opacity 0.25s ease; }
.fade-overlay-enter-from,
.fade-overlay-leave-to      { opacity: 0; }

/* Mobile drawer slide */
.drawer-enter-active { transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
.drawer-leave-active { transition: transform 0.24s cubic-bezier(0.4, 0, 1, 1); }
.drawer-enter-from,
.drawer-leave-to     { transform: translateX(-100%); }

/* Brand text fade (desktop expand/collapse) */
.brand-fade-enter-active { transition: opacity 0.2s ease 0.1s, transform 0.2s ease 0.1s; }
.brand-fade-leave-active { transition: opacity 0.12s ease; }
.brand-fade-enter-from   { opacity: 0; transform: translateX(-8px); }
.brand-fade-leave-to     { opacity: 0; }

/* Label fade */
.label-fade-enter-active { transition: opacity 0.18s ease 0.08s; }
.label-fade-leave-active { transition: opacity 0.1s ease; }
.label-fade-enter-from,
.label-fade-leave-to     { opacity: 0; }

/* Logo only (collapsed) */
.logo-only-enter-active { transition: opacity 0.2s ease 0.15s; }
.logo-only-leave-active { transition: opacity 0.1s ease; }
.logo-only-enter-from,
.logo-only-leave-to     { opacity: 0; }

/* Submenu height + opacity */
.submenu-enter-active {
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.25s ease;
  overflow: hidden;
  max-height: 300px;
}
.submenu-leave-active {
  transition: max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.18s ease;
  overflow: hidden;
}
.submenu-enter-from {
  max-height: 0;
  opacity: 0;
}
.submenu-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Status card slide up */
.status-slide-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.status-slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.status-slide-enter-from   { opacity: 0; transform: translateY(6px); }
.status-slide-leave-to     { opacity: 0; transform: translateY(4px); }

/* ────────────────────────────────────────────────────────────
   MISC
──────────────────────────────────────────────────────────── */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* Sidebar width transition */
aside {
  transition-property: width;
  transition-duration: 350ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>