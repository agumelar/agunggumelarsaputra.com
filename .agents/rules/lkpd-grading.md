# Rule Penilaian LKPD & Evaluasi Pembelajaran

Saat pengguna meminta bantuan untuk memeriksa, meninjau, atau menilai LKPD yang masuk ke database proyek `agunggumelarsaputra.com`:

## 1. Pemeriksaan Database & Submissions
- Query tabel `user_submissions` yang berstatus `submission_type = 'lkpd'`.
- Klasifikasikan submission berdasarkan status (`submitted` vs `graded`).

## 2. Deteksi Data Uji Coba (Test Data) vs Data Riil Siswa
- **Data Uji Coba**:
  - NIS menggunakan pola `UJI-RILIS-...` atau akun test (`siswa@gmail.com`).
  - Isian 100% identik dengan placeholder/contoh default form ➔ Berikan `Level 0` atau `Level 1` (Skor < 73, Remedial).
  - Isian berupa karakter acak tanpa arti (misal `adasdsd`, `asfe`) ➔ Berikan `Level 0` (Skor 10, Remedial).
- **Data Riil Siswa**: Evaluasi berdasarkan rubrik KKTP modul terkait.

## 3. Rubrik KKTP & Threshold KKM (73)
- `Level 0 (Belum Berkembang)`: Teks acak/kosong, drive url rusak/terkunci (< 73, Remedial)
- `Level 1 (Mulai Berkembang)`: Data contoh default / peniruan tanpa analisis mandiri (< 73, Remedial)
- `Level 2 (Mencoba ★)`: Tuntas KKM minimal (≥ 73)
- `Level 3 (Mandiri ★★)`: Analisis mendalam & orisinal (≥ 85)
- `Level 4 (Mahir & Mandiri ★★★)`: Standar industri & sangat komprehensif (≥ 95)

## 4. Format Output Laporan
- Selalu tampilkan ringkasan dan rekomendasi penilaian dalam **format tabel Markdown** yang rapi (ID, Siswa, Modul, Nilai Rekomendasi, Level KKTP, Catatan Feedback).

## 5. Eksekusi Penilaian
- Setelah pengguna mengonfirmasi, jalankan pembaruan nilai pada database production (`teacher_score`, `teacher_level`, `teacher_feedback`, `status = 'graded'`).
- Bersihkan seluruh skrip temporary setelah eksekusi dan pastikan build/deploy production berjalan bersih tanpa menyisakan file sementara.
