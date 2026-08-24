# Desain Paritas Pembelajaran Bermakna Modul 02–16 Orientasi PPLG

> **Status:** Implementasi dan verifikasi lokal selesai; **RELEASE BLOCKED** oleh akses team Vercel, deployment kanonis belum `READY` dan uji siswa masih wajib
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

## Arsitektur terimplementasi

1. `OrientasiLearningScene.astro` menjadi shell bersama hero dan dua scene Modul 02–16. Hero menerima durasi frontmatter sebagai prop wajib dan menampilkannya bersama kode, sprint, serta fase. `TeacherMessageCard.astro` tetap komponen mandiri di luar shell dan di luar panel `details`. Keduanya memakai token dark-slate, kontras tinggi, serta fokus keyboard eksplisit tanpa gradien neon, blur, atau glassmorphism.
2. Katalog `orientasiInteractiveMaterials.ts` menyimpan data pembelajaran terstruktur. Setiap modul memuat `teacherMessage`, `hero`, tujuan, dan dua scene dengan fakta/detail yang berasal dari Markdown modul terkait.
3. Renderer membedakan mekanik choice/scenario/checklist dan sequence; umpan balik tinggal pada scene yang dioperasikan, sedangkan sequence menyediakan kontrol naik/turun dan validasi. ID relasi aksesibilitas diturunkan dari `lessonSlug`, dan initializer memproses setiap root `[data-learning-scene]` agar aman bila lebih dari satu instance dirender.
4. State scene hanya berada di DOM selama halaman aktif. Tidak ada API, `localStorage`, XP, atau navigasi pada aktivitas formatif.
5. Urutan sibling DOM reader Modul 02–16 adalah: `details[data-reference-material]` → `TeacherMessageCard` → hero dan dua scene dalam `OrientasiLearningScene` → area checkpoint `InteractiveKnowledgeCheck`. Modul 01 mempertahankan urutan baseline yang telah tervalidasi.

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

## Hasil verifikasi dan status rilis 2026-08-08

- Commit implementasi yang diverifikasi: `c13ef14`. `npm run test:orientasi` lulus 18/18, `npm run verify:orientasi-parity` menghasilkan `Orientasi PPLG parity guard: PASS`, `npm run build` exit 0, dan `git -c core.whitespace=cr-at-eol diff --check` exit 0.
- Happy DOM tetap hanya dependency development untuk regression test DOM; status audit residual yang telah dicatat di changelog/handover tetap berlaku dan tidak dinyatakan selesai oleh pekerjaan ini.
- Metadata project Vercel pada worktree telah dibuat sama persis dengan `.vercel/project.json` root kanonis. Deployment yang dihasilkan adalah `dpl_EiYNktHu2XLAsiHfGVdcDA8sS5Ui` di `https://agunggumelarsaputra-aturbn3yx-agumelars-projects.vercel.app`, tetapi inspect menunjukkan `readyState: BLOCKED` dan alias tidak mencakup `www.agunggumelarsaputra.com`.
- Alasan resmi Vercel adalah `TEAM_ACCESS_REQUIRED`: author commit harus memiliki akses ke team `agumelar's projects`. Build internal berstatus `READY`, tetapi deployment induk tetap `BLOCKED`; karena itu tidak ada klaim release kanonis.
- Domain `www` masih menunjuk deployment lama `dpl_FgAixUKU1VJM6wUAP9v2BfRJzidu`. Smoke terhadap baseline lama memberi `/` HTTP 200, `/pembelajaran` guest HTTP 302 ke login, dan POST checkpoint guest HTTP 401; bukti tersebut tidak memvalidasi fitur baru atau route terproteksi.
- Uji akun siswa sah ditunda sampai deployment fitur `READY` dan beralias kanonis. Tidak ada login, submission, progress, atau XP akun uji yang dimutasi, sehingga tidak ada cleanup test-data saat ini.
- Untuk membuka status release: perbaiki akses author/team tanpa memalsukan metadata, deploy ulang commit yang direview, inspect sampai `READY` dengan alias `www`, lakukan alur faktual Module 01 dan inspeksi/interaksi Module 02 pada akun sah, logout, lalu catat mutasi dan keputusan cleanup.
