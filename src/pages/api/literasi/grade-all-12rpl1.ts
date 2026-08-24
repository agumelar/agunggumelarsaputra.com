import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../db';
import { literasiReports } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terhubung.' }), { status: 500 });
  }

  try {
    await ensureDbInitialized();

    const gradesPayload = [
      { id: 38, w: 14, p: 18, feedback: "Bagus! Resensi terurai dengan alur yang runtut. Catatan EYD: Perhatikan penulisan kata 'skitar' yang seharusnya 'sekitar' dan konsistensi penggunaan huruf kapital di awal kalimat." },
      { id: 37, w: 14, p: 18, feedback: "Penulisan resensi sudah baik dan informatif. Catatan EYD: Perhatikan kapitalisasi pada nama penerbit ('Mitra Utama') dan penulisan judul buku di awal kalimat." },
      { id: 36, w: 16, p: 19, feedback: "Luar biasa! Resensi sangat mendalam, alur cerita terurai utuh (awal-tengah-akhir), amanat bermakna, dan penulisan tanda baca/EYD sangat rapi." },
      { id: 33, w: 13, p: 17, feedback: "Resensi tuntas KKM. Catatan EYD: Judul buku wajib menggunakan huruf kapital di setiap awal kata ('Berani Berubah...'), serta perbaiki tipografi 'memperbaikin' menjadi 'memperbaiki'." },
      { id: 31, w: 14, p: 18, feedback: "Bagus! Menguraikan sejarah perjuangan Bung Karno dengan baik. Catatan EYD: Berikan spasi setelah tanda koma (contoh: 'Indonesia, Soekarno') dan kapitalisasi nama tokoh." },
      { id: 27, w: 15, p: 18, feedback: "Sangat terstruktur dan lengkap! Catatan EYD: Hindari menyertakan label 'Paragraf Awal:' langsung di dalam teks resensi, buat narasi mengalir secara alami." },
      { id: 26, w: 13, p: 17, feedback: "Tuntas KKM. Catatan EYD: Perhatikan penulisan gelar dan nama 'Ir. Soekarno' (gunakan spasi setelah titik) serta kapitalisasi judul buku." },
      { id: 25, w: 14, p: 18, feedback: "Ulasan karya sastra yang baik. Catatan EYD: Perbaiki tipografi pada judul 'da' menjadi 'dan' serta perhatikan penggunaan huruf kapital pada judul buku." },
      { id: 24, w: 14, p: 17, feedback: "Bagus! Topik buku sangat relevan dengan ekonomi digital. Catatan EYD: Penulisan merek/platform gunakan 'TikTok' dan kapitalisasi nama penulis 'Suwandi Baskara'." },
      { id: 23, w: 13, p: 17, feedback: "Resensi tuntas KKM. Catatan EYD: Tuliskan teks dalam bentuk paragraf narasi tanpa menyertakan label 'Paragraf 1:' serta gunakan huruf kapital pada awal kata judul buku." },
      { id: 22, w: 14, p: 17, feedback: "Bagus! Melestarikan kebudayaan lokal Sunda. Catatan EYD: Perhatikan perbaikan tipografi kata 'ulinka' menjadi 'ulikan' dan 'tetang' menjadi 'tentang'." },
      { id: 21, w: 15, p: 19, feedback: "Sangat baik dan komprehensif! Penulisan ringkasan dan amanat terurai runtut dengan tata bahasa dan EYD yang rapi." },
      { id: 20, w: 15, p: 18, feedback: "Sangat bagus! Mengaitkan amanat kebangsaan dengan refleksi diri siswa. Tata bahasa dan EYD sudah tertata rapi." },
      { id: 19, w: 15, p: 18, feedback: "Ulasan sejarah yang menginspirasi. Penulisan judul buku dengan huruf miring/cetak tebal sudah sesuai kaidah EYD." },
      { id: 18, w: 15, p: 18, feedback: "Resensi dongeng yang sangat kaya akan amanat moral. Catatan EYD: Perhatikan penggunaan tanda koma sebelum kata sambung 'dan' pada rincian lebih dari dua hal." },
      { id: 16, w: 15, p: 19, feedback: "Resensi buku pengembangan diri yang sangat menyentuh dan motivatif. Tata bahasa, alur, dan EYD ditulis dengan sangat baik." },
      { id: 15, w: 14, p: 18, feedback: "Resensi yang religius dan informatif. Catatan EYD: Kapitalisasikan setiap awal kata pada judul buku kecuali kata depan seperti 'di'." },
      { id: 14, w: 15, p: 18, feedback: "Resensi buku kesehatan keluarga yang bermanfaat. Catatan EYD: Selalu berikan spasi setelah tanda koma ('Kesimpulannya, buku...')." },
      { id: 13, w: 15, p: 18, feedback: "Bagus sekali! Pemahaman alur biografi sangat jelas. Catatan EYD: Perhatikan spasi setelah tanda titik pada gelar singkat 'Ir. Soekarno'." },
      { id: 12, w: 15, p: 18, feedback: "Sangat terstruktur! Catatan EYD: Awalan pasif 'di-' pada kata kerja harus disambung, seperti 'dikenal' (bukan 'di kenal')." },
      { id: 11, w: 14, p: 17, feedback: "Resensi praktis budidaya yang informatif. Catatan EYD: Perbaiki tipografi kata 'dati' menjadi 'dari' dan gunakan huruf kapital pada awal kalimat." },
      { id: 10, w: 14, p: 17, feedback: "Resensi penanaman karakter disiplin yang baik. Catatan EYD: Berikan spasi setelah tanda koma pada judul ('Ayo, Bangun...')." },
      { id: 9, w: 15, p: 18, feedback: "Sangat baik! Menguraikan pembentukan kebiasaan positif secara logis. Tata bahasa dan EYD sudah sesuai standar." },
      { id: 7, w: 13, p: 17, feedback: "Tuntas KKM. Catatan EYD: Perbaiki penggabungan kata 'kepribadian' (sambung) dan awalan pasif 'disebut' (bukan 'di sebut')." },
      { id: 6, w: 15, p: 18, feedback: "Sangat komprehensif! Menguraikan ketenangan psikologis dan solusinya. Catatan EYD: Gunakan huruf kapital pada setiap awal kata judul buku." },
      { id: 4, w: 14, p: 18, feedback: "Bagus! Menguraikan keteladanan Bung Hatta dan relevansinya bagi programmer RPL. Catatan EYD: Perbaiki tipografi 'seprang' menjadi 'seorang' dan awalan pasif 'diambil'." },
      { id: 3, w: 14, p: 18, feedback: "Bagus! Ulasan sejarah proklamasi terurai jelas. Catatan EYD: Kata ganti '-nya' harus ditulis serangkai dengan kata dasar ('lingkungannya', 'perjuangannya')." },
    ];

    const results = [];

    for (const item of gradesPayload) {
      const writingScore = item.w;
      const presentationScore = item.p;
      const finalScore = Math.min(100, Math.max(0, Math.round(((writingScore + presentationScore) / 36) * 100)));

      const [updated] = await db.update(literasiReports)
        .set({
          writingScore,
          presentationScore,
          finalScore,
          teacherFeedback: item.feedback,
          gradedAt: new Date(),
          status: 'graded',
          updatedAt: new Date(),
        })
        .where(eq(literasiReports.id, item.id))
        .returning();

      if (updated) results.push(updated);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Berhasil memperbarui penilaian literasi RESIK untuk ${results.length} siswa 12 RPL 1!`,
      count: results.length,
      results,
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
};
