# Desain Materi Interaktif Orientasi PPLG Modul 02–16

> **Status:** Disetujui untuk spesifikasi; menunggu review dokumen sebelum implementasi
> **Tanggal:** 2026-08-08
> **Acuan mutu:** `InteractiveMaterialP1.astro` pada Modul 01

## Tujuan

Menyamakan kedalaman eksplorasi materi Modul 02–16 dengan Modul 01 tanpa menyalin contoh, tugas, atau konteks pedagogis Modul 01. Setiap modul harus menawarkan aktivitas belajar yang dapat diklik dan memberi umpan balik langsung, lalu tetap memakai checkpoint tiga tahap sebagai satu-satunya gerbang reward XP dan progres.

## Ruang lingkup

- Modul 02–16 memperoleh dua aktivitas materi interaktif yang khusus terhadap topik modul.
- Markdown asli tetap tersedia sebagai bacaan rujukan/silabus yang dapat dibuka-tutup; tidak ada materi, LKPD, refleksi, KKTP, enrollment, XP, atau urutan progres yang dihapus.
- Modul 01 tidak diubah. `InteractiveMaterialP1.astro` tetap menjadi contoh mutu, bukan template yang disalin.
- Aktivitas baru bersifat formatif: tidak menyimpan data siswa, tidak memberi XP, tidak dapat membuka tab LKPD, dan tidak boleh menjadi jalur bypass checkpoint.

## Arsitektur

1. `src/utils/orientasiInteractiveMaterials.ts` menjadi katalog server-side untuk 15 slug kanonik (Modul 02–16). Setiap konfigurasi memuat judul, tujuan singkat, serta dua aktivitas bertipe `explore`, `scenario`, `sequence`, atau `checklist`.
2. `src/components/modul/InteractiveModuleMaterial.astro` merender konfigurasi sebagai kartu solid berkontras tinggi dan menangani interaksi menggunakan `data-*` attributes serta script Astro scoped. Tidak ada dependency framework client atau data eksternal.
3. Reader `src/pages/pembelajaran/[...slug].astro` menampilkan komponen baru untuk Modul 02–16, dengan Markdown dibungkus sebagai bacaan rujukan. Alur Modul 01 dan seluruh komponen bersama yang ada tidak berubah.
4. Test policy memastikan semua 15 Modul 02–16 mempunyai dua aktivitas valid dan reader memasang komponen hanya pada jalur Modul 02–16. Parity guard diperluas agar kontrak ini tidak mundur pada sesi berikutnya.

## Aktivitas per modul

| Modul | Aktivitas eksplorasi | Aktivitas penerapan |
|---|---|---|
| 02 Profesi | Eksplorasi 8 kartu profesi | Pilih rantai handoff tim produk |
| 03 Ekosistem | Bandingkan lima ekosistem kerja | Cocokkan skenario dengan ekosistem |
| 04 Skill & karier | Petakan skill terhadap jenjang | Urutkan roadmap kesiapan karier |
| 05 Job Fair | Susun prioritas kunjungan booth | Pilih pertanyaan wawancara yang bernilai |
| 06 Minat awal | Uji komponen target SMART | Pilih langkah pertama yang terukur |
| 07 Mind Map | Eksplorasi cabang mind map | Periksa kelengkapan node dan relasi |
| 08 Validasi OR-01 | Audit kelayakan evidence | Urutkan pemeriksaan file dan akses |
| 09 App Audit | Telusuri lensa audit produk | Pilih temuan berdasarkan skenario pengguna |
| 10 UI/UX | Klasifikasikan UI, UX, dan fungsi | Evaluasi keputusan desain antarmuka |
| 11 Framework Review | Eksplorasi enam komponen review | Urutkan prioritas review produk |
| 12 Anotasi CER | Bedah Claim–Evidence–Reasoning | Identifikasi bukti visual yang tepat |
| 13 Peer Feedback | Pilih kalimat feedback konstruktif | Periksa urutan metode Sandwich Feedback |
| 14 Finalisasi | Audit standar dokumen review | Tentukan tindakan pada temuan kualitas |
| 15 Validasi OR-02 | Periksa kesiapan portfolio final | Urutkan prosedur pengumpulan evidence |
| 16 Rekap | Jelajahi peta pencapaian semester | Tentukan refleksi dan komitmen lanjutan |

## Interaksi, aksesibilitas, dan desain

- Setiap aktivitas menggunakan tombol native dengan teks, state fokus keyboard, `aria-pressed` atau `aria-live` sesuai kebutuhan, dan feedback teks yang tidak bergantung pada warna saja.
- Palet mengikuti token dark-slate proyek dengan border halus dan kontras tinggi. Tidak menggunakan gradien neon, efek blur dekoratif berlebihan, atau glassmorphism yang mengurangi keterbacaan.
- Kartu eksplorasi dapat dipilih ulang; aktivitas skenario dan urutan menampilkan penjelasan setelah pilihan; checklist hanya mengubah status visual lokal.
- Script tidak mengakses `localStorage`, tidak memanggil API, tidak menyuntikkan HTML dari input siswa, dan tidak mengubah state gating/tab.

## Verifikasi dan handover

1. TDD: test katalog aktivitas harus gagal sebelum utility/renderer baru dibuat.
2. Jalankan `npm run test:orientasi`, `npm run verify:orientasi-parity`, dan `npm run build`.
3. Uji visual pada akun siswa sah bila tersedia; tanpa sesi siswa, pemeriksaan produksi hanya terbatas pada halaman publik dan build.
4. Catat perubahan, hasil test, deployment, serta batas verifikasi pada `docs/CHANGELOG.md` dan `docs/ARCHITECTURE_AND_HANDOVER.md`.

## Keputusan eksplisit

- Interaktivitas materi tidak menggantikan Quest checkpoint dan tidak mengubah reward XP.
- Katalog Orientasi tetap tepat 16 modul; HTML, SQL, dan OOP tetap di luar scope.
- `SmartMarkdownWrapper.astro` sekarang dependency tracked; clean checkout wajib dapat build tanpa salinan file workspace manual.
