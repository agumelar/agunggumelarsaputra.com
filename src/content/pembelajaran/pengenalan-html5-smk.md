---
title: "Pengenalan HTML5 & Struktur Dokumen Web"
description: "Panduan dasar memahami tag HTML5, struktur semantik, dan hierarki elemen web untuk siswa SMK RPL."
category: "Pemrograman Web"
level: "Pemula"
order: 1
duration: "15 min"
tags: ["HTML5", "Web Dev", "SMK RPL", "PPLG"]
teacherTip: "Selalu gunakan struktur semantik seperti <header>, <main>, dan <footer> agar kode Anda rapi dan ramah SEO!"
---

# Pengenalan HTML5 & Struktur Dokumen Web

Selamat datang di modul dasar **Pemrograman Web dan Perangkat Bergerak (PPLG)**. Di modul ini, kita akan mempelajari landasan utama pembuatan halaman web modern menggunakan **HTML5**.

---

## 1. Apa itu HTML5?

**HTML (HyperText Markup Language)** adalah bahasa markah standar yang digunakan untuk membuat dan menyusun halaman web. Versi **HTML5** membawa banyak fitur baru seperti elemen semantik, pemutar media native (`<video>`, `<audio>`), serta performa yang lebih cepat.

---

## 2. Struktur Dasar Dokumen HTML5

Berikut adalah skeleton dasar dari sebuah file HTML5:

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Halaman Web Pertama Saya</title>
</head>
<body>
    <header>
        <h1>Selamat Datang di RPL SMKN 1 Rongga</h1>
    </header>
    
    <main>
        <p>Ini adalah paragraf pertama saya di HTML5.</p>
    </main>

    <footer>
        <p>&copy; 2026 Agung Gumelar Saputra</p>
    </footer>
</body>
</html>
```

---

## 💡 Tips dari Pak Agung

> "Banyak siswa menganggap HTML hanyalah hafalan tag. Kuncinya adalah **memahami fungsi semantik**. Gunakan `<article>` untuk konten mandiri, `<section>` untuk bagian topik, dan `<nav>` untuk menu navigasi."

---

## 📝 Ringkasan Poin Kunci

1. `<!DOCTYPE html>` memberi tahu browser bahwa dokumen ini menggunakan standar HTML5.
2. Tag `<head>` menyimpan metadata yang tidak terlihat di layar, sedangkan `<body>` berisi semua konten yang tampil di layar.
3. Selalu tutup tag berpasangan seperti `<p></p>` dan `<div></div>`.
