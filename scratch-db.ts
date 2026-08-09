import { db, ensureDbInitialized } from './src/db/index.ts';
import { userEnrollments, enrollmentTokens, userProgress } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';

async function run() {
  await ensureDbInitialized();
  const enrolls = await db.select({
      id: userEnrollments.id,
      token: enrollmentTokens.token,
      targetType: enrollmentTokens.targetType,
      targetSlug: enrollmentTokens.targetSlug,
      title: enrollmentTokens.title
  }).from(userEnrollments)
    .innerJoin(enrollmentTokens, eq(userEnrollments.tokenId, enrollmentTokens.id))
    .where(eq(userEnrollments.userId, 4));
  
  console.log('Enrollments for user 4:', enrolls);

  const progress = await db.select().from(userProgress).where(eq(userProgress.userId, 4));
  console.log('Progress for user 4:', progress);
}

run();
