# Desain Materi Interaktif Orientasi PPLG Modul 02–16

> **Status:** Implementasi terverifikasi dan dirilis pada production kanonik
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

1. `src/utils/orientasiInteractiveMaterials.ts` menjadi katalog server-side untuk 15 slug kanonik (Modul 02–16). Setiap konfigurasi memuat judul, tujuan singkat, serta dua aktivitas bertipe `explore`, `scenario`, `sequence`, atau `checklist`, dengan detail instruksional setiap butir yang selalu terlihat; feedback muncul secara lokal setelah interaksi, dan checklist menyampaikannya melalui live region.
2. `src/components/modul/InteractiveModuleMaterial.astro` merender konfigurasi sebagai kartu solid berkontras tinggi dan menangani interaksi menggunakan `data-*` attributes serta script Astro scoped. `src/utils/interactiveModuleMaterialBehavior.ts` memegang perilaku lokal aktivitas, termasuk reorder nyata dan validasi aktivitas `sequence`. Tidak ada dependency framework client atau data eksternal.
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

### Hasil rilis 2026-08-08

- `npm run test:orientasi` lulus 14/14, termasuk regression Happy DOM executable untuk reorder/validasi `sequence` dan state pilihan aksesibel; `npm run verify:orientasi-parity` menghasilkan PASS; `npm run build` menyelesaikan Astro server build dengan exit 0.
- `happy-dom` 20.11.2 adalah dev-only test harness dan sudah dipatch. Audit mencatat 0 critical, tetapi bukan audit global bersih: high chain yang tidak terkait melalui `@astrojs/vercel` → `@vercel/routing-utils` → `path-to-regexp` dan dependency `sharp` perlu ditangani pada pemeliharaan dependency terpisah.
- Deployment `dpl_CMVnY7i2RtM2SWyz299bzXssAkT2` READY hanya untuk proyek standalone di `https://orientasi-interactive-materials-5i6fvi902-agumelars-projects.vercel.app` dan alias `https://orientasi-interactive-materials.vercel.app`; bukan deployment kanonik.
- Percobaan kanonik sebelumnya `dpl_A8KAA1B3dC9oZb4XPcrEvUUnDW2Z` tetap `UNKNOWN` dan bukan dasar klaim rilis. Deployment kanonik final `dpl_8RN2agHFQJmDZX2gLPZ6xxEMbrmL` READY di `https://agunggumelarsaputra-q3bm6qzbb-agumelars-projects.vercel.app` dan teralias ke `https://www.agunggumelarsaputra.com` serta apex.
- Smoke tanpa autentikasi pada deployment final membuktikan domain kanonik `/` HTTP 200, `/pembelajaran` HTTP 302 ke `/login?redirect=%2Fpembelajaran`, dan `POST /api/gamification/claim-checkpoint` HTTP 401. Redirect tersebut tidak membuktikan konten katalog terproteksi.
- Batas yang disengaja: alur interaksi dan inspeksi katalog terproteksi memerlukan siswa legitimate yang telah enrollment. Rilis ini tidak membuat akun palsu dan tidak membypass autentikasi.

## Keputusan eksplisit

- Interaktivitas materi tidak menggantikan Quest checkpoint dan tidak mengubah reward XP.
- Katalog Orientasi tetap tepat 16 modul; HTML, SQL, dan OOP tetap di luar scope.
- `SmartMarkdownWrapper.astro` sekarang dependency tracked; clean checkout wajib dapat build tanpa salinan file workspace manual.
