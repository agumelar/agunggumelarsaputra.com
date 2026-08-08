# Desain Paritas Pembelajaran Bermakna Modul 02–16 Orientasi PPLG

> **Status:** Disetujui untuk spesifikasi; menunggu review spesifikasi tertulis sebelum rencana implementasi
> **Tanggal:** 2026-08-08
> **Acuan mutu:** Struktur, keterbacaan, dan ritme belajar Modul 01

## Tujuan

Menyamakan pengalaman Modul 02–16 dengan Modul 01 tanpa menyeragamkan isi. Setiap modul harus memiliki urutan belajar yang konsisten, materi faktual yang berasal dari modulnya sendiri, dan interaksi yang membuat siswa:

- **meaningful:** melihat kaitan konsep dengan profesi, karya, atau keputusan nyata;
- **mindful:** menjelaskan alasan, membandingkan bukti, atau mengurutkan langkah dengan sengaja;
- **joyful:** mengeksplorasi kartu, peta, simulasi, dan umpan balik singkat yang hangat tanpa mengorbankan keterbacaan.

Tidak ada perubahan pada urutan progres, Quest checkpoint, XP, LKPD, refleksi, KKTP, API, penyimpanan, atau kebijakan enrollment.

## Kontrak pengalaman setiap Modul 02–16

Urutan Tab Materi akan selalu sama:

1. **Bacaan Rujukan & Materi Lengkap** sebagai panel `details` di posisi paling atas, sebagaimana Modul 01. Markdown asli tetap lengkap dan tidak dipindahkan ke mekanik interaksi.
2. **Pesan Guru Pengampu** sebagai kartu mandiri tepat setelah rujukan, bukan sebagai bagian dari panel rujukan. Pesan ini memakai data terstruktur per modul, bukan hasil parsing Markdown.
3. **Hero pembelajaran** dengan nomor/modul, sprint, fase, durasi, judul, konteks karier/produk, dan tujuan yang dapat diamati siswa.
4. **Dua atau lebih scene interaktif kontekstual** dengan instruksi konkret, visual state yang jelas, dan umpan balik tekstual. Scene tidak memberi XP maupun membuka tab berikutnya.
5. **Quest checkpoint yang ada** sebagai satu-satunya gerbang ke LKPD; posisi dan kontraknya tidak berubah.

Modul 01 tidak diubah secara fungsional. Ia tetap menjadi baseline yang telah ada; shell baru hanya dipakai Modul 02–16 agar tidak merusak materi/interaksi Modul 01.

## Arsitektur

1. Tambahkan shell Astro bersama, misalnya `OrientasiLearningScene.astro`, untuk reference panel, kartu guru, hero, indikator scene, dan area aktivitas. Shell menggunakan token dark-slate proyek, kontras tinggi, dan fokus keyboard eksplisit; tidak memakai gradien neon, blur, atau glassmorphism.
2. Ubah katalog `orientasiInteractiveMaterials.ts` menjadi data pembelajaran terstruktur. Setiap modul memuat `teacherMessage`, `hero`, tujuan, dan dua scene dengan fakta/detail yang berasal dari Markdown modul terkait.
3. Gunakan renderer scene yang kecil dan terpisah menurut mekanik—misalnya kartu eksplorasi, pembanding, urutan, audit bukti, dan keputusan skenario—bukan satu kartu generik untuk seluruh bahan.
4. Simpan state scene hanya di DOM selama halaman aktif. Dilarang menggunakan API, `localStorage`, XP, atau navigasi untuk aktivitas formatif.
5. Reader menempatkan rujukan dan kartu guru di atas shell scene untuk Modul 02–16; Modul 01 mempertahankan urutan yang telah tervalidasi.

## Peta scene bermakna per modul

| Modul | Scene 1 — eksplorasi faktual | Scene 2 — penerapan mindful |
|---|---|---|
| 02 Profesi | Peta delapan peran dan output kerjanya | Rantai handoff tim produk dari kebutuhan sampai QA |
| 03 Ekosistem | Pembanding lima lingkungan kerja perangkat lunak | Pilih konteks kerja yang cocok berdasarkan skenario |
| 04 Skill & karier | Matriks hard skill, soft skill, dan jenjang | Susun roadmap kesiapan karier |
| 05 Job Fair | Rute booth berdasarkan minat/tujuan | Nilai kualitas pertanyaan wawancara |
| 06 Minat awal | Bedah target SMART yang terukur | Pilih langkah pertama rencana tiga tahun |
| 07 Mind Map | Jelajah node profesi, tools, dan keterkaitan | Audit kelengkapan relasi mind map |
| 08 Validasi OR-01 | Pemeriksaan akses, format, dan bukti evidence | Susun urutan validasi pengumpulan |
| 09 App Audit | Lensa audit produk digital | Klasifikasikan temuan dari kebutuhan pengguna |
| 10 UI/UX | Bedakan UI, UX, dan fungsi melalui contoh | Bandingkan keputusan antarmuka |
| 11 Framework Review | Eksplorasi enam komponen review | Prioritaskan temuan review produk |
| 12 CER | Hubungkan Claim, Evidence, dan Reasoning | Pilih bukti visual positif/negatif yang relevan |
| 13 Peer Feedback | Bedah unsur feedback konstruktif | Susun Sandwich Feedback yang bertanggung jawab |
| 14 Finalisasi | Inspector standar dokumen review | Tentukan tindakan atas temuan kualitas |
| 15 Validasi OR-02 | Peta kesiapan portofolio final | Susun prosedur pengecekan evidence |
| 16 Rekap | Peta capaian dan Skill Passport semester | Pilih komitmen reflektif lanjutan |

Seluruh label, deskripsi, dan umpan balik akan dirujukkan ke tujuan/modul Markdown masing-masing. Tidak boleh menambah klaim faktual eksternal yang tidak dapat ditopang materi pembelajaran.

## Kualitas desain dan aksesibilitas

- Hero dan scene memiliki hierarki visual seperti Modul 01: konteks dahulu, kemudian aktivitas, kemudian refleksi/umpan balik.
- Tombol native, label yang jelas, `aria-live` untuk respons, dan navigasi keyboard wajib ada.
- Aktivitas urutan menyediakan kontrol naik/turun dan validasi; aktivitas skenario menyediakan alasan hasil; aktivitas audit menampilkan bukti/detail sebelum siswa memilih.
- Pesan guru selalu terbaca tanpa membuka rujukan, memakai nama **Guru Pengampu RPL** atau **Guru Produktif RPL** yang benar.
- Materi unik, tugas LKPD, dan konteks original tidak boleh dihapus atau dipadatkan menjadi jawaban generik.

## Validasi

1. Test data memastikan 15 modul lengkap, pesan guru terstruktur, scene sesuai modul, detail tidak kosong, dan tidak ada akses API/XP/storage pada scene formatif.
2. Test DOM menjalankan mekanik per tipe scene yang dipakai: eksplorasi, keputusan/skenario, audit, dan urutan.
3. Guard reader memastikan urutan Modul 02–16: rujukan → pesan guru → hero/scene → checkpoint.
4. `npm run test:orientasi`, `npm run verify:orientasi-parity`, dan `npm run build` wajib hijau.
5. Setelah deploy, gunakan akun siswa sah yang telah diberi izin oleh pemilik untuk menguji alur faktual. Isian uji hanya digunakan karena aplikasi belum rilis; catat data yang diisi dan jangan menggunakan akun/identitas pihak lain.

## Batas rilis

- Perubahan baru boleh disebut setara dengan Modul 01 setelah struktur, desain, data pembelajaran, test, dan pemeriksaan siswa sah lulus.
- Handover harus mencatat scene per modul, bukti test, deployment, hasil sesi siswa uji, serta data uji yang perlu dibersihkan sebelum rilis Senin bila ada.
