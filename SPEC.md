# Personal Website Specification - Agung Gumelar Saputra

> **Version:** 1.0  
> **Last Updated:** 2026-03-25  
> **Status:** Approved  
> **Timezone:** GMT+7 (WIB)

---

## 1. Project Overview

### Project Name
Agung Gumelar Saputra Personal Website

### Project Type
Personal portfolio website dengan blog system

### Core Functionality
Website personal untuk memperkenalkan diri, menampilkan CV, blog/artikel, dan contact page. Menggunakan dark theme yang professional dan clean.

### Target Audience
- Rekruter/HR
- Klien potensial
- fellow developer dan tech enthusiast
- Academic community (S2 Teknologi Pendidikan & Vokasi)

---

## 2. Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Astro | latest |
| Styling | TailwindCSS | v3.x |
| CMS | Decap CMS (formerly Netlify CMS) | latest |
| Comments | Giscus | latest |
| Deployment | Static files + Caddy | v2.x |

### Why Astro?
- Sangat ringan (zero JS by default)
- Built-in support untuk Markdown/MDX
- Perfect untuk static site
- Island architecture untuk interaktivitas

---

## 3. UI/UX Specification

### 3.1 Color Palette

| Color Role | Hex Code | Usage |
|------------|----------|-------|
| Background Primary | `#0a0a0a` | Main background |
| Background Secondary | `#141414` | Cards, sections |
| Background Tertiary | `#1f1f1f` | Hover states |
| Text Primary | `#f5f5f5` | Main text |
| Text Secondary | `#a3a3a3` | Muted text |
| Accent Primary | `#2563eb` | Links, buttons |
| Accent Hover | `#1d4ed8` | Hover states |
| Border | `#262626` | Dividers, borders |

### 3.2 Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Inter | 3rem (48px) | 700 |
| H2 | Inter | 2rem (32px) | 600 |
| H3 | Inter | 1.5rem (24px) | 600 |
| Body | Inter | 1rem (16px) | 400 |
| Small | Inter | 0.875rem (14px) | 400 |
| Code | JetBrains Mono | 0.875rem | 400 |

### 3.3 Spacing System

- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px
- Container max-width: 1200px
- Content max-width: 800px (untuk blog)

### 3.4 Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| Mobile | < 640px | Phone |
| Tablet | 640px - 1024px | Tablet |
| Desktop | > 1024px | Desktop |

---

## 4. Page Structure

### 4.1 Landing Page (`/`)

**Sections:**
1. Navigation - Fixed top, logo + nav links (Home, Blog, CV, Contact)
2. Hero - Full viewport height, nama besar, tagline, CTA button
3. About - Foto profil (atau placeholder), bio paragraph
4. Skills - Grid card untuk setiap skill category
5. Footer - Copyright, social links

### 4.2 Blog Index (`/blog`)

**Components:**
- Search input (filter by title)
- Category filter chips
- Article cards (thumbnail, title, excerpt, date, tags)
- Pagination

### 4.3 Blog Post (`/blog/[slug]`)

**Components:**
- Table of Contents (auto-generated from headings)
- Article content (MDX rendered)
- Social share buttons (Twitter, LinkedIn, Facebook)
- Comment section (Giscus)
- Tags list
- Navigation (prev/next article)

### 4.4 CV Page (`/cv`)

**Sections:**
- Header: Foto + Nama + Title
- About: Bio singkat
- Experience: List pengalaman kerja
- Education: List pendidikan
- Skills: Skills list (grouped)
- Contact: Email, social links

### 4.5 Contact Page (`/contact`)

**Components:**
- Contact form (Name, Email, Message)
- Social links (GitHub, LinkedIn, Email)
- Office hours / response time info

---

## 5. Functionality Specification

### 5.1 Blog System

| Feature | Status | Description |
|---------|--------|-------------|
| MDX Support | Yes | Write articles in MDX |
| Auto TOC | Yes | Generate from headings |
| Tags/Categories | Yes | Filter by tag |
| Search | Yes | Filter by title |
| Reading time | Yes | Auto-calculated |

### 5.2 CMS (Decap CMS)

| Feature | Status | Description |
|---------|--------|-------------|
| Admin Dashboard | Yes | `/admin` route |
| Media Library | Yes | Upload images |
| Draft/Publish | Yes | Workflow status |
| Collections | Yes | Blog posts collection |
| Password Protection | Yes | Basic auth untuk admin page |

### 5.3 Comments (Giscus)

| Feature | Status | Description |
|---------|--------|-------------|
| GitHub Discussions | Yes | Comments stored in GitHub |
| Lazy load | Yes | Load on scroll |
| Theme sync | Yes | Match dark/light |

---

## 6. Acceptance Criteria

### Landing Page
- Navigation fixed di top saat scroll
- Hero section full height dengan animasi fade-in
- About section menampilkan bio
- Skills section menampilkan grid cards
- Footer dengan social links
- Responsive di mobile/tablet/desktop

### Blog System
- Blog index menampilkan semua artikel
- Search berfungsi untuk filter title
- Tags filter berfungsi
- Blog post menampilkan TOC
- Social share buttons work
- Giscus comments load properly

### CMS
- Admin accessible di `/admin` dengan password
- Can create new post
- Can upload images
- Publish workflow works

### CV Page
- Semua sections terisi dengan data
- Responsive layout

### Contact Page
- Form validation works
- Form submission works
- Social links functional

---

## 7. Future Enhancements (Out of Scope)

- Light mode toggle
- Portfolio/Projects page
- Newsletter subscription
- Analytics dashboard
- Multi-language support (i18n)