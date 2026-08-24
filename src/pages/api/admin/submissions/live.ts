import type { APIRoute } from 'astro';
import { db, isDbConfigured, ensureDbInitialized } from '../../../../db';
import { userSubmissions, users, enrollmentTokens } from '../../../../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { canAccessAdminPanel } from '../../../../utils/auth';

const DEFAULT_EXAMPLES = ['whatsapp', 'tokopedia', 'gojek', 'wa', 'tokped'];

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const secretKey = url.searchParams.get('secret') || request.headers.get('x-admin-secret');
  const isSecretValid = Boolean(secretKey && (secretKey === process.env.JWT_SECRET || secretKey === process.env.POSTGRES_PASSWORD));
  const isAuthorized = (locals.user && canAccessAdminPanel(locals.user.role)) || isSecretValid;

  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: 'Akses ditolak. Khusus Guru / Administrator.' }), { status: 403 });
  }

  if (!isDbConfigured()) {
    return new Response(JSON.stringify({ error: 'Database belum terhubung.' }), { status: 500 });
  }

  try {
    await ensureDbInitialized();
    const url = new URL(request.url);
    const targetClass = url.searchParams.get('class');
    const statusFilter = url.searchParams.get('status');
    const typeFilter = url.searchParams.get('type');

    let query = db.select({
      id: userSubmissions.id,
      userId: userSubmissions.userId,
      userName: users.name,
      userEmail: users.email,
      studentClass: users.studentClass,
      lessonSlug: userSubmissions.lessonSlug,
      submissionType: userSubmissions.submissionType,
      formData: userSubmissions.formData,
      driveUrl: userSubmissions.driveUrl,
      score: userSubmissions.score,
      teacherScore: userSubmissions.teacherScore,
      teacherLevel: userSubmissions.teacherLevel,
      teacherFeedback: userSubmissions.teacherFeedback,
      status: userSubmissions.status,
      submittedAt: userSubmissions.submittedAt,
      gradedAt: userSubmissions.gradedAt,
      tokenId: userSubmissions.tokenId,
      tokenCode: enrollmentTokens.token,
    }).from(userSubmissions)
      .leftJoin(users, eq(userSubmissions.userId, users.id))
      .leftJoin(enrollmentTokens, eq(userSubmissions.tokenId, enrollmentTokens.id))
      .orderBy(desc(userSubmissions.submittedAt));

    const rawSubmissions = await query;

    let filtered = rawSubmissions;

    if (targetClass && targetClass !== 'all' && targetClass !== 'Semua') {
      filtered = filtered.filter(s => 
        s.studentClass === targetClass || 
        (s.formData && s.formData.includes(targetClass))
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(s => s.submissionType === typeFilter);
    }

    // Deduplicate: Keep only latest submission per student per lesson per submission type
    const uniqueMap = new Map();
    for (const sub of filtered) {
      const key = `${sub.userId}_${sub.lessonSlug}_${sub.submissionType}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, sub);
      }
    }
    const deduplicated = Array.from(uniqueMap.values());

    // Process & compute KKTP recommendations for each item
    const processedSubmissions = deduplicated.map(item => {
      let parsedForm: any = null;
      let nonExampleApps: any[] = [];
      let totalAppsCount = 0;
      let kktpSuggestedScore: number | null = null;
      let kktpSuggestedLevel: string | null = null;

      try {
        parsedForm = JSON.parse(item.formData || '{}');

        if (item.submissionType === 'lkpd' && Array.isArray(parsedForm.auditApps)) {
          totalAppsCount = parsedForm.auditApps.length;
          nonExampleApps = parsedForm.auditApps.filter((app: any) => {
            const nameLower = (app.name || '').toLowerCase().trim();
            return !DEFAULT_EXAMPLES.some(ex => nameLower.includes(ex));
          });

          if (nonExampleApps.length >= 3) {
            kktpSuggestedScore = 86;
            kktpSuggestedLevel = 'Level 3 (Mandiri ★★)';
          } else {
            kktpSuggestedScore = 65;
            kktpSuggestedLevel = 'Level 1 (Mulai Berkembang - Remedial)';
          }
        }
      } catch {
        parsedForm = item.formData;
      }

      return {
        ...item,
        parsedForm,
        auditSummary: item.submissionType === 'lkpd' ? {
          totalAppsCount,
          nonExampleAppsCount: nonExampleApps.length,
          nonExampleApps,
          isKktpPassing: nonExampleApps.length >= 3,
          kktpSuggestedScore,
          kktpSuggestedLevel,
        } : null,
      };
    });

    const pendingCount = processedSubmissions.filter(s => s.status === 'submitted').length;
    const gradedCount = processedSubmissions.filter(s => s.status === 'graded' || s.status === 'reviewed').length;

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      totalCount: processedSubmissions.length,
      pendingCount,
      gradedCount,
      submissions: processedSubmissions,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });

  } catch (err: any) {
    console.error('Error fetching live submissions:', err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
};
