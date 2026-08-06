---
title: "Konsep Pemrograman Berorientasi Objek (OOP) JavaScript"
description: "Memahami Pilar OOP: Encapsulation, Inheritance, Polymorphism, dan Abstraction untuk siswa SMK PPLG."
category: "Algoritma & OOP"
level: "Menengah"
order: 11
duration: "20 min"
tags: ["OOP", "JavaScript", "ES6 Class", "SMK RPL"]
teacherTip: "Pikirkan 'Class' seperti cetakan kue (blueprint), dan 'Object' seperti kue asli yang dibuat dari cetakan tersebut!"
---

# Pemrograman Berorientasi Objek (OOP) dalam JavaScript

Dalam pengembangan perangkat lunak modern (**PPLG**), **OOP (Object-Oriented Programming)** adalah paradigma dasar yang mempermudah pengelolaan kode berskala besar agar lebih rapi, terstruktur, dan reusabel.

---

## 1. Class dan Object

- **Class**: Cetakan atau blueprint yang mendefinisikan atribut (property) dan perilaku (method).
- **Object**: Hasil instansiasi (wujud nyata) dari sebuah class.

```javascript
class SiswaRPL {
  constructor(nama, kelas) {
    this.nama = nama;
    this.kelas = kelas;
  }

  sapa() {
    console.log(`Halo, nama saya ${this.nama} dari kelas ${this.kelas} SMKN 1 Rongga!`);
  }
}

// Instansiasi Object
const siswa1 = new SiswaRPL("Agung", "XI PPLG 1");
siswa1.sapa();
```

---

## 2. Empat Pilar Utama OOP

1. **Encapsulation (Pembedahan & Pembungkusan)**: Menyembunyikan detail internal data menggunakan *private field* (`#property`).
2. **Inheritance (Pewarisan)**: Mengurangi duplikasi kode dengan menugaskan sub-class mewarisi atribut dari parent class via `extends`.
3. **Polymorphism (Banyak Bentuk)**: Kemampuan method dengan nama yang sama untuk bertindak berbeda tergantung class yang memanggilnya.
4. **Abstraction (Abstraksi)**: Menyederhanakan kompleksitas sistem dengan hanya menampilkan fungsi yang relevan bagi pengguna.

---

## 💡 Tips dari Pak Agung

> "Jangan terburu-buru menulis baris kode sebelum merancang class diagram sederhana. OOP bermula dari pemahaman pemodelan dunia nyata ke dalam kode!"

---

## 📝 Ringkasan Poin Kunci

1. Gunakan kata kunci `class` dan `constructor` untuk membuat objek terstruktur.
2. Gunakan `extends` dan `super()` saat mengimplementasikan pewarisan (Inheritance).
3. Kode berorientasi objek lebih mudah di-maintain dan di-test saat bekerja dalam tim software engineering.
