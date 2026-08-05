# Personal Website & Learning Hub Specification - Agung Gumelar Saputra

> **Version:** 2.0 (Revamp)  
> **Last Updated:** 2026-08-05  
> **Status:** Active Development  
> **Target Deployment:** Vercel Static (SSG)  
> **Timezone:** GMT+7 (WIB)

---

## 1. Project Overview

### Project Name
Agung Gumelar Saputra Personal Website & PPLG Learning Hub

### Owner & Brand Identity
- **Name:** Agung Gumelar Saputra, S.Pd. (Cand. M.Pd. Teknologi Pendidikan & Vokasi)
- **Role:** Guru Rekayasa Perangkat Lunak (RPL / PPLG) SMKN 1 Rongga & Software Developer
- **Focus:** Edukasi Vokasi IT, Pemrograman Web Modern, EdTech, & Software Engineering

### Core Functionality
1. **Personal Portfolio & Showcase:** Memperkenalkan diri, pengalaman mengajar, riset teknologi pendidikan, serta showcase aplikasi/proyek.
2. **Interactive Learning Hub:** Modul pembelajaran RPL/PPLG (W3Schools/Dicoding style sidebar navigation) untuk HTML, CSS, JavaScript, Database, OOP, & Git.
3. **Drilling TKA PPLG CBT Simulator:** Bank soal & simulasi ujian Tes Keahlian Akademik PPLG Kurikulum Merdeka (Kemendikdasmen) dengan timer, scoring, breakdown topik, & pembahasan.
4. **Gamification Engine:** Sistem XP, Level (Apprentice Coder s/d Code Master), Lencana Achievements (Rongga Coder, TKA Champion), & Daily Streak yang tersimpan secara lokal (localStorage).
5. **Blog & Articles:** Artikel opini, tutorial dev, dan jurnal teknologi pendidikan vokasi.
6. **Interactive CV & Contact:** Halaman riwayat karir, pendidikan, keahlian, dan form kontak.

---

## 2. Technology Stack & Deployment

| Component | Technology | Version | Description |
|---|---|---|---|
| Framework | Astro | v5.x | High-performance SSG |
| Styling | TailwindCSS | v3.4 | Modern utility-first CSS |
| Typography | Google Fonts | Inter / Outfit & JetBrains Mono | Clean UI & Code readability |
| Icons | Lucide / Feather SVG | Latest | Lightweight vector icons |
| Gamification Engine | Native JS + LocalStorage | ES2024 | Fast client-side persistence |
| Content Format | MDX / Markdown | Astro Content Collections | Structured modules & blogs |
| Comments | Giscus | Latest | GitHub Discussions backed |
| Deployment | Vercel | Static SSG | Global Edge Network, 100% Free |

---

## 3. UI/UX & Design System

### 3.1 Color Palette (Sleek Modern Tech Aesthetic)

| Color Role | Hex Code | Usage |
|---|---|---|
| Background Primary | `#090d16` (Dark) / `#f8fafc` (Light) | Main page background |
| Background Secondary | `#111827` (Dark) / `#ffffff` (Light) | Cards, sidebars, containers |
| Background Glass | `rgba(17, 24, 39, 0.7)` | Glassmorphism overlays |
| Text Primary | `#f3f4f6` (Dark) / `#0f172a` (Light) | Main headings & content |
| Text Muted | `#9ca3af` (Dark) / `#64748b` (Light) | Secondary captions & dates |
| Accent Primary (Electric Sapphire)| `#2563eb` | Buttons, active navigation |
| Accent Secondary (Cyan Glow) | `#06b6d4` | Highlights, badges, gradients |
| Accent Success (Emerald) | `#10b981` | XP points, correct answers, status |
| Border Color | `rgba(255, 255, 255, 0.1)` | Subtle divider lines |

### 3.2 Key Typography
- **Headings & Body:** Inter / Outfit
- **Code Snippets & Terminal:** JetBrains Mono

---

## 4. Site Architecture & Menu Navigation

```text
[ Agung Gumelar Saputra - Logo ]
├── 🏠 Beranda (Hero Section, About Educator & Developer, Featured Modules, Gamification Stats Preview)
├── 📚 Learning Hub (/pembelajaran)
│   ├── 📖 Modul Belajar (Sidebar Navigasi, Reading Progress, Copy Code, Tips Pak Agung)
│   └── 🎯 Drilling TKA PPLG (/pembelajaran/tka-pplg)
│       ├── Mode Latihan Kategori (Fokus per Topik TKA PPLG)
│       └── Mode Tryout CBT (Timer & Scoring Real-time)
├── 💼 Projects (/projects) (Showcase Karya, Live Demo, Filter Tech Stack)
├── ✍️ Blog (/blog) (Artikel Tutorial & EdTech)
├── 📄 CV / Resume (/cv) (Pengalaman Mengajar, Pendidikan, Skills)
└── ✉️ Kontak (/contact) (Form & Social Links)
```

---

## 5. Gamification System Specifications

- **XP Calculation:**
  - Reading a lesson module: `+10 XP`
  - Answering quiz correctly: `+20 XP`
  - Finishing TKA Tryout with score ≥ 80: `+100 XP`
- **Levels:**
  - Level 1: *Apprentice Coder* (0 - 99 XP)
  - Level 2: *Junior Developer* (100 - 299 XP)
  - Level 3: *Logic Architect* (300 - 599 XP)
  - Level 4: *PPLG Specialist* (600 - 999 XP)
  - Level 5: *Code Master* (1000+ XP)
- **Badges:**
  - 🏅 **Rongga Coder**: Selesaikan 3 modul dasar PPLG.
  - ⚡ **TKA Warrior**: Ikuti simulasi TKA PPLG pertama.
  - 👑 **Perfect Score**: Dapatkan nilai 100 di Tryout TKA.
  - 🔥 **Daily Learner**: Belajar 3 hari berturut-turut.

---

## 6. Acceptance Criteria & Quality Checklist

- [x] Unik & Khas (Branding Agung Gumelar Saputra - SMKN 1 Rongga & S2 Tekpen).
- [ ] Dark/Light mode toggle yang mulus tanpa FOUC.
- [ ] Tampilan responsive sempurna di Mobile, Tablet, dan Desktop.
- [ ] Engine Gamification berjalan 100% di browser client via LocalStorage.
- [ ] Modul Drilling TKA PPLG dengan timer, scoring, dan pembahasan.
- [ ] Deployable ke Vercel tanpa error build.