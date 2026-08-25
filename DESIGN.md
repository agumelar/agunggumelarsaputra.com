---
name: "AGS High-Craft Material Design 3 (M3)"
version: "1.0.0"
author: "Agung Gumelar Saputra, S.Tr.T."
philosophy: "Anti AI-Slop, High-Craft, Border-Defined Depth, Vocational Technical Precision"
colors:
  background: "#090d16"
  foreground: "#f3f4f6"
  surface: "#090d16"
  surface-container-lowest: "#0d121e"
  surface-container-low: "#111827"
  surface-container: "#162032"
  surface-container-high: "#1c293e"
  surface-container-highest: "#23324d"
  primary: "#38bdf8"
  primary-container: "rgba(56, 189, 248, 0.12)"
  on-primary: "#082f49"
  on-primary-container: "#bae6fd"
  secondary: "#2dd4bf"
  secondary-container: "rgba(45, 212, 191, 0.12)"
  tertiary: "#fbbf24"
  tertiary-container: "rgba(251, 191, 36, 0.12)"
  outline: "rgba(255, 255, 255, 0.14)"
  outline-variant: "rgba(255, 255, 255, 0.08)"
  success: "#34d399"
  warning: "#fbbf24"
  danger: "#f87171"
typography:
  display: "Outfit, Inter, sans-serif"
  body: "Inter, system-ui, sans-serif"
  code: "JetBrains Mono, monospace"
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  full: "9999px"
---

# DESIGN.md — AGS High-Craft Design System (NeedMCP Style Lock)

> **Proyek:** `agunggumelarsaputra.com`  
> **Standar Arsitektur:** Material Design 3 (M3) + NeedMCP Theme-Driven Style Locking  
> **Target Audiens:** Siswa Konsentrasi Keahlian Rekayasa Perangkat Lunak (RPL), Guru, dan Komunitas Rekayasa Perangkat Lunak.

---

## 1. Filosofi Inti & Anti AI-Slop (Core Design Directives)

1. **Border-Defined Depth (Bukan Shadow Blur Sembarangan):**
   - Kedalaman dan pemisahan lapisan antar-konten ditentukan oleh kombinasi warna permukaan (*surface container elevation*) dan border halus berdefinisi tinggi (`rgba(255, 255, 255, 0.08)`).
   - Dilarang menggunakan box-shadow blur berlebihan atau efek neon kabur yang menurunkan keterbacaan (*readability*).
2. **Kelangkaan Aksen (Accent Scarcity):**
   - Warna aksen (`#38bdf8` Sky, `#2dd4bf` Teal/Emerald, `#fbbf24` Amber) digunakan secara terukur hanya untuk tombol aksi utama (*CTA*), chip indikator status, link interaktif, dan fokus visual.
   - Dilarang menjadikan warna aksen terang sebagai background area luas.
3. **Tipografi Hierarkis Tegas:**
   - **Display / Heading:** Menggunakan font `Outfit` dengan ketegasan berkarakter arsitektural.
   - **Body / Penjelasan Materi:** Menggunakan font `Inter` dengan kontras tinggi (`#f3f4f6` di atas dark canvas) untuk kenyamanan membaca dalam waktu lama.
   - **Angka / Token / XP / Kode:** Menggunakan font `JetBrains Mono` untuk presisi teknis.

---

## 2. Token Desain Resmi (Design Tokens)

### 2.1 Palet Warna & Surface Elevation

| Token CSS | Hex / RGBA | Peruntukan |
|---|---|---|
| `--md-sys-color-surface` | `#090d16` | Background kanvas utama halaman |
| `--md-sys-color-surface-container-lowest` | `#0d121e` | Background sidebar / background input field |
| `--md-sys-color-surface-container-low` | `#111827` | Kartu standar (*base card*) |
| `--md-sys-color-surface-container` | `#162032` | Kartu terangkat (*elevated card*), header sticky |
| `--md-sys-color-surface-container-high` | `#1c293e` | Modal dialog, popup, dropdown aktif |
| `--md-sys-color-surface-container-highest` | `#23324d` | Hover container, segmented button aktif |
| `--md-sys-color-primary` | `#38bdf8` | Aksen primer (Sky Blue 400) |
| `--md-sys-color-primary-container` | `rgba(56, 189, 248, 0.12)` | Container aktif dengan tinting halus |
| `--md-sys-color-outline-variant` | `rgba(255, 255, 255, 0.08)` | Garis batas elemen kontras tinggi |

---

## 3. Komponen Baku (Design Archetypes)

### 3.1 Tombol (Buttons)
- **Filled Button (`.m3-btn-filled`):** Tombol aksi utama (CTA submit, mulai ujian, daftar). Background solid dengan teks kontras dan micro-shadow.
- **Tonal Button (`.m3-btn-tonal`):** Tombol aksi sekunder. Background surface container dengan teks primer.
- **Outlined Button (`.m3-btn-outlined`):** Tombol aksi alternatif/navigasi (Login Google, Batal, Saring).

```html
<!-- Contoh Penggunaan Baku -->
<button class="m3-btn-filled">Mulai Belajar ➔</button>
<button class="m3-btn-tonal">Simpan Draf</button>
<button class="m3-btn-outlined">Kembali</button>
```

### 3.2 Kartu (Cards)
- **Elevated Card (`.m3-card-elevated`):** Container utama konten, modul silabus, kartu materi.
- **Outlined Card (`.m3-card-outlined`):** Container sub-bagian, kotak info instruksional, form field group.

### 3.3 Segmented Navigation (`.m3-segmented-container`)
- Digunakan untuk navigasi 4 Tab Modul Pembelajaran (*1. Materi, 2. LKPD, 3. Refleksi, 4. KKTP*) dan Tab Riwayat Evaluasi di Dashboard.

```html
<div class="m3-segmented-container">
  <button class="m3-segmented-item active">Tab 1</button>
  <button class="m3-segmented-item">Tab 2</button>
</div>
```

### 3.4 Form Fields & Textarea
- Berbasis **Outlined Style** dengan padding yang ramah sentuhan (min 40–44 px) dan focus ring tegas (`focus:border-primary focus:ring-1 focus:ring-primary`).

---

## 4. Do's and Don'ts (Panduan Wajib untuk AI & Pengembang)

### ✅ Do (Wajib Diterapkan)
- **Gunakan Token Resmi:** Selalu gunakan variabel CSS `--md-sys-color-*` atau kelas M3 (`.m3-card-elevated`, `.m3-btn-filled`, `.m3-chip-*`) alih-alih nilai warna hardcoded sembarangan.
- **Pelihara Kontras Tinggi:** Pastikan teks body selalu menggunakan warna terang di atas canvas gelap (`#f3f4f6` di atas `#090d16`).
- **Touch Target Ramah Mobile:** Pertahankan tinggi tombol interaktif minimal 44×44 px pada mode smartphone.
- **Gunakan Nomenklatur Resmi:** Program Keahlian adalah **Pengembangan Perangkat Lunak dan Gim (PPLG)**, Konsentrasi Keahlian adalah **Rekayasa Perangkat Lunak (RPL)**, dan Pengajar adalah **Guru Pengampu RPL / Guru Produktif RPL**.

### ❌ Don't (Dilarang Keras)
- **Dilarang AI-Slop:** Dilarang menambahkan gradien warna-warni acak di atas teks atau background glow kabur yang tidak fungsional.
- **Dilarang Menghilangkan Proteksi Integritas:** Form LKPD, Kuis, dan Refleksi wajib dilindungi oleh `AntiCopyPasteGuardian.astro`.
- **Dilarang Mengubah Posisi Tombol Selesai:** Tombol "Tandai Selesai & Buka Modul Selanjutnya" **HANYA BERADA DI TAB 3 (Jurnal Refleksi)**.

---

## 5. Responsive Strategy

| Breakpoint | Lebar Layar | Perilaku Antarmuka |
|---|---|---|
| **Mobile (`sm` kebawah)** | `< 640px` | Bottom navigation bar aktif, 1 kolom penuh, tab segmented horizontal scroll dengan snap, padding container 16px. |
| **Tablet (`md` / `lg`)** | `640px – 1024px` | 2 kolom grid, header navigasi ringkas, modal adaptif. |
| **Desktop (`xl` keatas)** | `> 1024px` | Sidebar navigasi penuh, layout 3 kolom dashboard, split-hero landing page. |
