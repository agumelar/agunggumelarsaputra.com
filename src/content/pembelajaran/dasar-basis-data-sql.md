---
title: "Dasar Basis Data & Query SQL SELECT"
description: "Memahami struktur tabel, Primary Key, Foreign Key, dan sintaks dasar SQL SELECT di RDBMS."
category: "Basis Data"
level: "Pemula"
order: 2
duration: "20 min"
tags: ["SQL", "MySQL", "Database", "RPL"]
teacherTip: "Sebelum menulis query SQL, selalu gambar ERD (Entity Relationship Diagram) sederhana di buku catatannya!"
---

# Dasar Basis Data & Query SQL SELECT

Modul ini membahas **Basis Data Relasional (RDBMS)** yang merupakan materi inti di jurusan Rekayasa Perangkat Lunak dan juga diuji dalam TKA PPLG.

---

## 1. Konsep Dasar Relasi Tabel

Basis data relasional menyimpan informasi dalam bentuk **Tabel** yang terdiri dari **Baris (Record)** dan **Kolom (Field)**.

- **Primary Key (PK)**: Identifikasi unik untuk setiap baris data di sebuah tabel (misal: `nisn` atau `id`).
- **Foreign Key (FK)**: Kolom yang menghubungkan satu tabel dengan Primary Key pada tabel lain.

---

## 2. Perintah SQL `SELECT`

Perintah `SELECT` digunakan untuk mengambil data dari satu atau beberapa tabel:

```sql
-- Mengambil semua kolom dari tabel siswa
SELECT * FROM siswa;

-- Mengambil nama dan jurusan siswa yang berada di kelas XI
SELECT nama_siswa, jurusan 
FROM siswa 
WHERE kelas = 'XI RPL' 
ORDER BY nama_siswa ASC;
```

---

## 3. Menghubungkan Tabel dengan `INNER JOIN`

```sql
SELECT s.nama_siswa, k.nama_kelas
FROM siswa s
INNER JOIN kelas k ON s.kelas_id = k.id;
```

---

## 💡 Catatan Pak Agung

> "Di industri maupun saat Ujian TKA PPLG, soal SQL sering kali menanyakan perbedaan `INNER JOIN`, `LEFT JOIN`, dan `GROUP BY`. Pastikan kamu melatih logika penggabungan data ini!"
