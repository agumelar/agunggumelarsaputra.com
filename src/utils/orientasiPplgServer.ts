import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { enrollmentTokens, userEnrollments, userProgress, userSubmissions } from '../db/schema';
import { grantsOrientasiEnrollment, type OrientasiSlug } from './orientasiPplgPolicy.ts';

export async function getOrientasiServerState(userId: number, lessonSlug: OrientasiSlug) {
  const [progressRows, submissionRows, enrollmentRows] = await Promise.all([
    db.select({ lessonSlug: userProgress.lessonSlug })
      .from(userProgress)
      .where(eq(userProgress.userId, userId)),
    db.select({ submissionType: userSubmissions.submissionType })
      .from(userSubmissions)
      .where(and(eq(userSubmissions.userId, userId), eq(userSubmissions.lessonSlug, lessonSlug))),
    db.select({
      tokenId: enrollmentTokens.id,
      targetType: enrollmentTokens.targetType,
      targetSlug: enrollmentTokens.targetSlug,
      title: enrollmentTokens.title,
      isActive: enrollmentTokens.isActive,
      expiresAt: enrollmentTokens.expiresAt,
    })
      .from(userEnrollments)
      .innerJoin(enrollmentTokens, eq(userEnrollments.tokenId, enrollmentTokens.id))
      .where(eq(userEnrollments.userId, userId)),
  ]);

  const enrollment = enrollmentRows.find((token) => grantsOrientasiEnrollment(token, lessonSlug));
  return {
    isEnrolled: Boolean(enrollment),
    enrollmentTokenId: enrollment?.tokenId ?? null,
    completedSlugs: progressRows.map((row) => row.lessonSlug),
    submissionTypes: submissionRows.map((row) => row.submissionType),
  };
}
