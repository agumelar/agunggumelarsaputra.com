import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../db';
import { literasiReports, literasiPeerReviews, userGamification } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';
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
    const { reportId, rating, comment } = body;

    if (!reportId || !rating || !comment) {
      return new Response(JSON.stringify({ error: 'Harap berikan rating bintang (1-5) dan ulasan komentar.' }), { status: 400 });
    }

    const reviewerId = locals.user.userId;

    const [report] = await db.select().from(literasiReports).where(eq(literasiReports.id, Number(reportId))).limit(1);
    if (!report) {
      return new Response(JSON.stringify({ error: 'Laporan resensi tidak ditemukan.' }), { status: 404 });
    }

    if (report.userId === reviewerId) {
      return new Response(JSON.stringify({ error: 'Anda tidak dapat mengulas resensi buku milik sendiri.' }), { status: 400 });
    }

    // Check if already reviewed by this user
    const [existing] = await db.select()
      .from(literasiPeerReviews)
      .where(and(eq(literasiPeerReviews.reportId, Number(reportId)), eq(literasiPeerReviews.reviewerId, reviewerId)))
      .limit(1);

    if (existing) {
      return new Response(JSON.stringify({ error: 'Anda sudah pernah memberikan ulasan untuk resensi ini.' }), { status: 400 });
    }

    await db.insert(literasiPeerReviews).values({
      reportId: Number(reportId),
      reviewerId,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: comment.trim(),
    });

    // Reward +5 XP for peer review participation
    let xpEarned = 5;
    let [stats] = await db.select().from(userGamification).where(eq(userGamification.userId, reviewerId)).limit(1);
    if (!stats) {
      [stats] = await db.insert(userGamification).values({ userId: reviewerId, xp: 0, level: 1 }).returning();
    }

    const newXp = stats.xp + xpEarned;
    const newLevelInfo = calculateLevel(newXp);

    await db.update(userGamification)
      .set({ xp: newXp, level: newLevelInfo.level, lastActiveDate: new Date() })
      .where(eq(userGamification.userId, reviewerId));

    return new Response(JSON.stringify({
      success: true,
      message: 'Ulasan peer review berhasil dikirim! ✨ +5 XP',
      xpEarned,
      newXp,
      newLevel: newLevelInfo.level,
    }), { status: 200 });
  } catch (err: any) {
    console.error('Error submitting peer review:', err);
    return new Response(JSON.stringify({ error: err.message || 'Gagal menyimpan peer review.' }), { status: 500 });
  }
};
