# Desain Penyamaan Modul Orientasi PPLG 02–16

> **Status:** Disetujui untuk ditinjau sebelum perencanaan implementasi  
> **Tanggal:** 2026-08-08  
> **Acuan utama:** Modul 01 — `orientasi-pplg-01-pengantar-skill-passport`

## Tujuan

Menyamakan pengalaman belajar Modul Orientasi PPLG 02–16 dengan Modul 01 tanpa menghapus materi, tugas, contoh, maupun konteks pedagogis khas masing-masing modul.

## Ruang lingkup

Setiap modul harus mengikuti kontrak pengalaman Modul 01:

1. Alur empat tab yang konsisten: Materi & Visual, LKPD, Jurnal Refleksi, dan Panduan KKTP.
2. Checkpoint Quest tiga tahap pada materi, dengan tiga nyawa, reset penuh saat gagal, reward XP, dan pembuka akses Tab LKPD.
3. Tab LKPD interaktif dengan reward XP, validasi penyimpanan, serta pembuka akses Tab Refleksi.
4. Jurnal Refleksi sebagai satu-satunya lokasi tombol `#btn-complete-lesson`, yang menyelesaikan modul dan membuka modul berikutnya.
5. Tab KKTP sebagai panduan capaian Level 0–4.
6. Gating antar-modul, indikator status modul, progress mapel 16 pertemuan, live score, dan hak bypass admin.
7. `AntiCopyPasteGuardian` diterapkan pada jawaban belajar; identitas siswa dan URL bukti tetap dikecualikan.

Materi Markdown, studi kasus, pertanyaan LKPD/refleksi, dan bukti tugas dari Modul 02–16 tetap bersifat spesifik per pertemuan.

## Pendekatan yang disetujui

Sistem bersama berbasis Modul 01 digunakan sebagai standar. Reader modul dan komponen generik dikonfigurasi dari data/konten tiap modul, bukan dengan menyalin markup Modul 01 ke lima belas modul. Pendekatan ini menjaga keseragaman perilaku dan mencegah duplikasi logika.

## Batasan dan keamanan perubahan

- Workspace sudah mengandung perubahan lokal yang belum di-commit; perubahan tersebut diperlakukan sebagai pekerjaan pengguna dan tidak boleh ditimpa atau dihapus.
- Production hanya dapat diaudit hingga halaman login tanpa akun siswa uji. Verifikasi perilaku terautentikasi dilakukan setelah sesi browser memiliki akun uji yang sah atau melalui pengujian kode yang setara.
- Tidak ada perubahan pada gelar pemilik, nomenklatur PPLG/RPL, ataupun filosofi desain dark-slate berkontras tinggi.

## Tahap kerja

1. Audit struktur lokal Modul 01 terhadap Modul 02–16 dan catat selisih per modul.
2. Tetapkan kontrak konfigurasi bersama untuk checkpoint, LKPD, refleksi, dan KKTP.
3. Terapkan penyamaan bertahap tanpa mengubah substansi materi.
4. Verifikasi gating, tab, reward XP, anti-copy-paste, dan build Astro.
5. Deploy ke Vercel production menggunakan CLI yang telah terautentikasi, lalu cek hasil publik dan—bila tersedia akun uji—alur siswa terautentikasi.

## Dokumentasi dan handover wajib

Setiap perubahan implementasi wajib dicatat pada:

- `docs/CHANGELOG.md`: fitur, perbaikan, perubahan perilaku, dan hasil penting.
- `docs/ARCHITECTURE_AND_HANDOVER.md`: kontrak sistem, alur, endpoint, komponen, prosedur verifikasi/deployment, atau keputusan operasional yang berubah.
- Dokumen spesifikasi/rencana ini: keputusan ruang lingkup dan progres pekerjaan penyamaan modul.

Jika dokumen handover belum cukup untuk membuat agen atau sesi berikutnya dapat melanjutkan pekerjaan dengan aman, dokumentasi harus diperluas sebelum pekerjaan dinyatakan selesai.

## Kriteria penerimaan

- Modul 02–16 memberi pengalaman alur inti yang sama dengan Modul 01.
- Konten dan instruksi belajar unik setiap modul tidak hilang atau berubah secara tidak sengaja.
- Tidak ada bypass siswa terhadap urutan tab atau gating modul.
- Build `npm run build` berhasil.
- Deployment production berhasil dan perubahan terdokumentasi lengkap untuk handover sesi berikutnya.
