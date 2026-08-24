import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../db';
import { literasiReports, userGamification } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { calculateLevel } from '../../../utils/gamification';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized. Harap login terlebih dahulu.' }), { status: 401 });
  }

  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terkonfigurasi.' }), { status: 503 });
  }

  await ensureDbInitialized();

  try {
    const body = await request.json();
    const {
      weekNumber = 1,
      bookTitle,
      author,
      publisher,
      city,
      year,
      pageCount,
      edition,
      summary,
      moralMessage,
      selfChecklist = [],
    } = body;

    if (!bookTitle || !author || !publisher || !city || !year || !pageCount || !summary || !moralMessage) {
      return new Response(JSON.stringify({ error: 'Harap lengkapi seluruh field identitas, ringkasan, dan amanat buku.' }), { status: 400 });
    }

    const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
    const summaryWords = countWords(summary);
    const moralWords = countWords(moralMessage);

    if (summaryWords < 100) {
      return new Response(JSON.stringify({ 
        error: `Ringkasan buku belum memenuhi standar (${summaryWords} kata). Minimal harus 100 kata dengan menyusun 3 alur: awal (latar/tokoh), tengah (konflik/gagasan utama), dan akhir (kesimpulan).` 
      }), { status: 400 });
    }

    if (moralWords < 30) {
      return new Response(JSON.stringify({ 
        error: `Amanat / pesan moral terlalu singkat (${moralWords} kata). Minimal harus 30 kata untuk menguraikan hikmah atau nilai karakter secara bermakna.` 
      }), { status: 400 });
    }

    const userId = locals.user.userId;
    const targetWeek = Number(weekNumber) || 1;

    // Check if an un-graded report already exists for this student & week
    const { and, desc } = await import('drizzle-orm');
    const [existingReport] = await db.select()
      .from(literasiReports)
      .where(and(eq(literasiReports.userId, userId), eq(literasiReports.weekNumber, targetWeek)))
      .orderBy(desc(literasiReports.createdAt))
      .limit(1);

    let savedReport: any = null;
    let isResubmission = false;

    if (existingReport && existingReport.status !== 'graded') {
      isResubmission = true;
      const [updated] = await db.update(literasiReports).set({
        reportDate: new Date(),
        bookTitle: bookTitle.trim(),
        author: author.trim(),
        publisher: publisher.trim(),
        city: city.trim(),
        year: Number(year),
        pageCount: Number(pageCount),
        edition: edition ? edition.trim() : null,
        summary: summary.trim(),
        moralMessage: moralMessage.trim(),
        selfChecklist: JSON.stringify(selfChecklist),
        status: 'submitted',
        updatedAt: new Date(),
      }).where(eq(literasiReports.id, existingReport.id)).returning();
      savedReport = updated;
    } else {
      const [inserted] = await db.insert(literasiReports).values({
        userId,
        weekNumber: targetWeek,
        reportDate: new Date(),
        bookTitle: bookTitle.trim(),
        author: author.trim(),
        publisher: publisher.trim(),
        city: city.trim(),
        year: Number(year),
        pageCount: Number(pageCount),
        edition: edition ? edition.trim() : null,
        summary: summary.trim(),
        moralMessage: moralMessage.trim(),
        selfChecklist: JSON.stringify(selfChecklist),
        status: 'submitted',
      }).returning();
      savedReport = inserted;
    }

    // Reward +30 XP only for new submission (not double for resubmission)
    let xpEarned = isResubmission ? 0 : 30;
    let [stats] = await db.select().from(userGamification).where(eq(userGamification.userId, userId)).limit(1);
    if (!stats) {
      [stats] = await db.insert(userGamification).values({ userId, xp: 0, level: 1 }).returning();
    }

    if (!isResubmission) {
      const newXp = stats.xp + xpEarned;
      const newLevelInfo = calculateLevel(newXp);

      await db.update(userGamification)
        .set({ xp: newXp, level: newLevelInfo.level, lastActiveDate: new Date() })
        .where(eq(userGamification.userId, userId));
    }

    return new Response(JSON.stringify({
      success: true,
      message: isResubmission 
        ? 'Resensi buku Rabu Literasi berhasil diperbarui! ✨' 
        : 'Resensi buku Rabu Literasi berhasil dikumpulkan! ✨ +30 XP',
      reportId: savedReport.id,
      xpEarned,
    }), { status: 200 });
  } catch (err: any) {
    console.error('Error submitting literasi report:', err);
    return new Response(JSON.stringify({ error: err.message || 'Gagal menyimpan laporan literasi.' }), { status: 500 });
  }
};
