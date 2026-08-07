import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../db';
import { userSubmissions } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ submissions: [] }), { status: 200 });
  }

  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ submissions: [] }), { status: 200 });
  }

  try {
    await ensureDbInitialized();
    const userId = locals.user.userId;
    const url = new URL(request.url);
    const lessonSlug = url.searchParams.get('slug');

    if (!lessonSlug) {
      return new Response(JSON.stringify({ error: 'Parameter slug diperlukan.' }), { status: 400 });
    }

    const submissions = await db.select()
      .from(userSubmissions)
      .where(and(
        eq(userSubmissions.userId, userId),
        eq(userSubmissions.lessonSlug, lessonSlug)
      ));

    return new Response(JSON.stringify({
      success: true,
      submissions: submissions.map(s => ({
        id: s.id,
        submissionType: s.submissionType,
        formData: JSON.parse(s.formData || '{}'),
        driveUrl: s.driveUrl,
        score: s.score,
        teacherScore: s.teacherScore,
        teacherLevel: s.teacherLevel,
        teacherFeedback: s.teacherFeedback,
        gradedAt: s.gradedAt,
        status: s.status,
        submittedAt: s.submittedAt,
        updatedAt: s.updatedAt,
      })),
    }), { status: 200 });

  } catch (err: any) {
    console.error('Error fetching submissions:', err);
    return new Response(JSON.stringify({ error: err.message || 'Gagal memuat data jawaban.' }), { status: 500 });
  }
};
