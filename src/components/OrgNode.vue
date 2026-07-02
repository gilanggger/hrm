<script setup>
/**
 * ============================================================
 *  FILE: src/components/OrgNode.vue
 * ============================================================
 *  Komponen rekursif untuk merender satu node + children-nya
 *  pada halaman Struktur Organisasi. Vue SFC otomatis bisa
 *  memanggil dirinya sendiri lewat nama file (<OrgNode />)
 *  tanpa perlu import manual.
 * ============================================================
 */

const props = defineProps({
  node: { type: Object, required: true },
  warnaDivisi: { type: Function, required: true },
  level: { type: Number, default: 0 },
})
</script>

<template>
  <div class="org-branch flex flex-col items-center">

    <!-- ── Kartu Node ── -->
    <div
      class="org-card rounded-2xl px-5 py-3.5 text-center min-w-[190px] max-w-[220px] cursor-default"
      :style="`background:${warnaDivisi(node.divisi).bg}; border-color:${warnaDivisi(node.divisi).border}`"
    >
      <div
        class="w-9 h-9 mx-auto rounded-xl flex items-center justify-center text-sm font-black mb-2 border-2"
        :style="`background:#fff; border-color:${warnaDivisi(node.divisi).border}; color:${warnaDivisi(node.divisi).text}`"
      >
        {{ node.nama.charAt(0) }}
      </div>
      <p class="text-sm font-black text-slate-800 leading-tight">{{ node.nama }}</p>
      <p
        class="text-[10px] font-black uppercase tracking-[0.08em] mt-1"
        :style="`color:${warnaDivisi(node.divisi).text}`"
      >
        {{ node.jabatan }}
      </p>
    </div>

    <!-- ── Garis + Children ── -->
    <template v-if="node.children && node.children.length">
      <div class="org-line-down" />
      <div class="relative flex items-start justify-center gap-6 pt-0">
        <div
          v-for="(child, i) in node.children"
          :key="child.id"
          class="flex flex-col items-center relative org-child"
          :style="`animation-delay:${level * 120 + i * 90}ms`"
        >
          <div class="org-line-across" :class="{
            'org-line-first': i === 0 && node.children.length > 1,
            'org-line-last': i === node.children.length - 1 && node.children.length > 1,
            'org-line-mid': node.children.length === 1,
          }" />
          <OrgNode :node="child" :warna-divisi="warnaDivisi" :level="level + 1" />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.org-branch {
  opacity: 0;
  animation: fadeIn 0.4s ease forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.org-card {
  border: 2px solid;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.org-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 26px rgba(0,0,0,0.10);
}

.org-child {
  opacity: 0;
  animation: fadeIn 0.4s ease forwards;
}

/* Garis vertikal turun dari kartu induk */
.org-line-down {
  width: 2px;
  height: 22px;
  background: #cbd5e1;
}

/* Garis mendatar penghubung antar-anak, lalu turun ke tiap kartu anak */
.org-line-across {
  position: absolute;
  top: 0;
  height: 22px;
  width: 100%;
  border-top: 2px solid #cbd5e1;
}
.org-line-across::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  width: 2px;
  height: 22px;
  background: #cbd5e1;
  transform: translateX(-50%);
}
.org-line-first  { left: 50%; right: 0; width: 50%; border-left: 2px solid transparent; }
.org-line-last   { left: 0; right: 50%; width: 50%; }
.org-line-mid    { border-top: none; }

.org-child { margin-top: 22px; }
.org-child > .org-line-across { top: -22px; }
</style>