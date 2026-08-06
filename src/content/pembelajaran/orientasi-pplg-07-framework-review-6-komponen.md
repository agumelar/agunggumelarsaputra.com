---
title: "Framework Review Produk Digital 6 Komponen"
description: "Mempelajari kerangka kerja analisis software profesional 6 komponen dan teknik membangun argumen berbasis bukti (evidence-based review)."
category: "Orientasi PPLG (OR-02)"
level: "Pemula"
order: 7
duration: "2 JP (90 Menit)"
tags: ["Framework 6 Komponen", "Review Produk", "Analisis Software", "Evidence-Based", "OR-02"]
teacherTip: "Latih siswa untuk menghindari kalimat opini subjektif tanpa bukti seperti 'aplikasinya jelek'. Ajarkan format CER (Claim, Evidence, Reasoning) seperti 'Fitur pencarian lambat (Claim) karena membutuhkan 8 detik memuat data katalog (Evidence), hal ini mengindikasikan query database belum terindeks dengan baik (Reasoning)'."
---

# Framework Review Produk Digital 6 Komponen

Sebuah ulasan (*review*) software yang profesional tidak sama dengan sekadar memberi bintang 1 atau bintang 5 di PlayStore dengan komentar pendek *"bagus"* atau *"jelek"*. 

Di industri PPLG, ulasan produk disusun secara ilmiah dan terstruktur agar dapat dijadikan acuan oleh tim pengembang (*developer* dan *product manager*) untuk memperbaiki kode dan desain aplikasi. 

Pada modul ini, kalian akan menguasai **Framework Review Produk Digital 6 Komponen** yang menjadi standar baku penyusunan Evidence **Skill Passport OR-02**.

---

## 📌 Identitas Pembelajaran

| Komponen | Keterangan |
| :--- | :--- |
| **Mata Pelajaran** | Orientasi PPLG (Dasar-Dasar PPLG) |
| **Fase / Kelas / Semester** | Fase E / Kelas 10 RPL / Semester Ganjil |
| **Kode Skill Passport** | **OR-02** (Sprint 2 - Pertemuan 11 & 12) |
| **Elemen CP** | Wawasan Dunia Kerja Bidang Pengembangan Perangkat Lunak dan Gim |
| **Output / Evidence** | LKPD P11: Draft Dokumen Review Produk Digital Berbasis 6 Komponen (PDF) |

---

## 🎯 Tujuan Pembelajaran

1. **Menguasai Framework 6 Komponen**: Siswa memahami fungsi dan struktur dari setiap komponen analisis.
2. **Menyusun Argumen Berbasis Bukti (Evidence-Based)**: Siswa mampu menggunakan metode *CER (Claim, Evidence, Reasoning)* yang dilengkapi tangkapan layar (*screenshot*) otentik.
3. **Menganalisis Kebutuhan Pengguna**: Siswa mampu memetakan siapa target audiens dan masalah apa yang ingin diselesaikan oleh aplikasi tersebut.
4. **Memberikan Solusi Teknis yang Aplikatif**: Siswa mampu merumuskan saran perbaikan yang realistis bagi programmer dan desainer.

---

## 📖 Materi Pembelajaran: 6 Komponen Framework Review

```
┌────────────────────────────────────────────────────────────────────────┐
│              FRAMEWORK REVIEW PRODUK DIGITAL (6 KOMPONEN)              │
└────────────────────────────────────────────────────────────────────────┘
        │
        ├── 1. IDENTITAS PRODUK (Nama, Pengembang, Versi, Platform, Kategori)
        │
        ├── 2. TARGET PENGGUNA & PROBLEM STATEMENT (Profil User & Masalah)
        │
        ├── 3. FUNGSI & FITUR UTAMA (Fitur Kunci & Alur Kerja Sistem)
        │
        ├── 4. ANALISIS UI & UX (Tata Letak, Tipografi, Kontras, & Alur Navigasi)
        │
        ├── 5. KELEBIHAN & KEKURANGAN (Analisis Komparatif & Temuan Kendala)
        │
        └── 6. SARAN PERBAIKAN SOLUTIF (Rekomendasi Nyata untuk Tim Pengembang)
```

---

### Penjelasan Rinci 6 Komponen

#### 1. Identitas Produk Digital
Menyajikan informasi faktual mengenai perangkat lunak yang diulas:
- Nama Aplikasi & Logo Resmi.
- Perusahaan Pengembang (*Developer / Publisher*).
- Platform yang Didukung (*Android, iOS, Web Browser, Windows, Linux*).
- Versi Aplikasi saat Diamati & Tanggal Rilis Terakhir.
- Kategori Industri (*E-Commerce, FinTech, EdTech, Game, Media Sosial*).

#### 2. Target Pengguna & Problem Statement
- **Siapa Pengguna Utamanya?** (Misal: Siswa sekolah, ibu rumah tangga, pengusaha UMKM, dokter).
- **Masalah Nyata Apa yang Ingin Diselesaikan?** (Contoh: *"Masyarakat kesulitan membeli tiket bus antar-kota tanpa harus antre fisik di terminal"*).

#### 3. Fungsi & Fitur Utama
Menjelaskan 2-4 fitur inti yang paling menentukan keberhasilan aplikasi:
- Nama Fitur & Manfaatnya bagi Pengguna.
- Alur Langkah Penggunaan Fitur (*User Journey*).

#### 4. Analisis User Interface (UI) & User Experience (UX)
- **Aspek UI**: Harmonisasi warna, keterbacaan teks (*font size & hierarchy*), konsistensi bentuk ikon dan tombol aksi.
- **Aspek UX**: Kemudahan mencari menu utama, waktu tunggu (*loading time*), keramahan pesan error (*error state feedback*).

#### 5. Kelebihan & Kekurangan (SWOT Ringkas)
- **Kelebihan (Strengths)**: Fitur unik yang tidak dimiliki pesaing, kemudahan navigasi, integrasi pembayaran lengkap.
- **Kekurangan (Pain Points)**: Bug yang sering muncul, konsumsi memori/kuota yang boros, iklan yang terlalu mengganggu (*intrusive ads*).

#### 6. Saran & Rekomendasi Solutif bagi Developer
Rekomendasi teknis yang jelas dan dapat diimplementasikan:
- Usulan perbaikan desain antarmuka (*UI Redesign suggestion*).
- Usulan penambahan fitur baru atau optimasi alur tombol (*UX Optimization*).

---

## 🔬 Teknik Membangun Argumen: Metode CER

Agar ulasan kalian berbobot dan bernilai ilmiah, gunakan rumus **CER (Claim - Evidence - Reasoning)**:

```text
[ CLAIM ]     : Nyatakan pernyataan temuan kalian secara tegas.
                "Fitur pendaftaran akun baru pada aplikasi X membingungkan pengguna."

[ EVIDENCE ]  : Sertakan bukti konkret (screenshot layar / data waktu).
                "Pada langkah verifikasi OTP, tidak ada tombol 'Kirim Ulang Kode', 
                 dan kotak isian nomor HP otomatis menghapus angka 0 di depan."

[ REASONING ] : Jelaskan alasan logis dari sudut pandang PPLG.
                "Sistem validasi input pada frontend belum menangani sanitasi format 
                 nomor telepon Indonesia (+62 / 08xx), sehingga request API gagal 
                 diterima oleh server backend."
```

---

## 📝 Lembar Kerja Peserta Didik (LKPD P11)

### Template Draft Awal Review 6 Komponen
Pilihlah **1 Aplikasi/Website** yang akan kalian jadikan objek tugas akhir OR-02:

```text
1. IDENTITAS PRODUK
   - Nama Aplikasi       : ....................................................
   - Pengembang/Studio   : ....................................................
   - Platform & Versi    : ....................................................

2. TARGET PENGGUNA & MASALAH
   - Target Pengguna     : ....................................................
   - Masalah Utama       : ....................................................

3. FITUR UTAMA
   - Fitur 1             : ....................................................
   - Fitur 2             : ....................................................

4. ANALISIS UI & UX
   - Aspek UI (Tampilan) : ....................................................
   - Aspek UX (Alur Pakai): ....................................................

5. KELEBIHAN & KEKURANGAN
   - Keunggulan          : ....................................................
   - Kelemahan/Kendala   : ....................................................

6. REKOMENDASI PERBAIKAN
   - Saran untuk Tim Dev : ....................................................
```

---

## ✅ Checklist KKTP P11 & P12

| No | Indikator KKTP | Sudah (Ya) | Belum |
| :---: | :--- | :---: | :---: |
| 1 | Mampu menjelaskan fungsi 6 komponen dalam framework review produk digital. | [ ] | [ ] |
| 2 | Mampu menyusun minimal 1 analisis temuan dengan format CER (Claim, Evidence, Reasoning). | [ ] | [ ] |
| 3 | Mengisi template draft awal review 6 komponen pada LKPD P11. | [ ] | [ ] |

---

## 💭 Jurnal Refleksi Pembelajaran Mendalam

1. **Mengapa kritik yang disertai bukti konkret (*evidence*) dan alasan teknis (*reasoning*) jauh lebih dihargai oleh developer daripada sekadar komplain di kolom komentar?**
   > *Jawaban:* ........................................................................................................................................
2. **Bagian mana dari 6 komponen yang menurutmu paling membutuhkan ketelitian tinggi saat dianalisis?**
   > *Jawaban:* ........................................................................................................................................

---

## 💡 Catatan Guru Pengampu

> *"Ketika kalian mampu menganalisis aplikasi buatan orang lain dengan kritis dan objektif, kalian sedang melatih diri sendiri untuk tidak membuat kesalahan yang sama saat kelak membangun aplikasi buatan kalian sendiri!"*
> 
> — **Agung Gumelar Saputra, S.Tr.T, Gr**
