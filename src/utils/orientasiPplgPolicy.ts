export const CANONICAL_ORIENTASI_SLUGS = [
  'orientasi-pplg-01-pengantar-skill-passport',
  'orientasi-pplg-02-profesi-peluang-karier',
  'orientasi-pplg-03-ekosistem-industri-pplg',
  'orientasi-pplg-04-matriks-skill-jenjang-karier',
  'orientasi-pplg-05-job-fair-kelas',
  'orientasi-pplg-06-rencana-minat-awal',
  'orientasi-pplg-07-mind-map-profesi-pplg',
  'orientasi-pplg-08-finalisasi-validasi-or01',
  'orientasi-pplg-09-app-audit-produk-digital',
  'orientasi-pplg-10-ui-ux-fungsi-produk',
  'orientasi-pplg-11-framework-review-6-komponen',
  'orientasi-pplg-12-latihan-analisis-anotasi-visual',
  'orientasi-pplg-13-review-show-peer-feedback',
  'orientasi-pplg-14-finalisasi-dokumen-review',
  'orientasi-pplg-15-pengumpulan-validasi-or02',
  'orientasi-pplg-16-rekap-skill-clinic-refleksi',
] as const;

export type OrientasiSlug = typeof CANONICAL_ORIENTASI_SLUGS[number];
export type OrientasiAction = 'checkpoint' | 'lkpd' | 'reflection' | 'complete';

const canonicalSlugSet = new Set<string>(CANONICAL_ORIENTASI_SLUGS);

export function isCanonicalOrientasiSlug(value: unknown): value is OrientasiSlug {
  return typeof value === 'string' && canonicalSlugSet.has(value);
}

export function selectCanonicalOrientasiModules<T extends { id?: string; slug?: string }>(entries: T[]): T[] {
  const bySlug = new Map(entries.map((entry) => [entry.id || entry.slug, entry]));
  return CANONICAL_ORIENTASI_SLUGS.flatMap((slug) => {
    const entry = bySlug.get(slug);
    return entry ? [entry] : [];
  });
}

export function getPreviousOrientasiSlug(slug: OrientasiSlug): OrientasiSlug | null {
  const index = CANONICAL_ORIENTASI_SLUGS.indexOf(slug);
  return index > 0 ? CANONICAL_ORIENTASI_SLUGS[index - 1] : null;
}

export function getApprovedCheckpoint(lessonSlug: unknown) {
  if (!isCanonicalOrientasiSlug(lessonSlug)) return null;
  const moduleNumber = CANONICAL_ORIENTASI_SLUGS.indexOf(lessonSlug) + 1;
  return {
    lessonSlug,
    quizId: `quest-or${String(moduleNumber).padStart(2, '0')}`,
    xpReward: 15,
  };
}

interface AuthorizationInput {
  lessonSlug: unknown;
  action: OrientasiAction;
  role?: string | null;
  isEnrolled: boolean;
  completedSlugs: string[];
  submissionTypes: string[];
}

type AuthorizationResult = { allowed: true; status: 200 } | { allowed: false; status: 400 | 403 | 409; error: string };

export function authorizeOrientasiAction(input: AuthorizationInput): AuthorizationResult {
  if (!isCanonicalOrientasiSlug(input.lessonSlug)) {
    return { allowed: false, status: 400, error: 'Slug Modul Orientasi PPLG tidak valid.' };
  }

  const isAdmin = input.role === 'admin';
  if (!isAdmin && !input.isEnrolled) {
    return { allowed: false, status: 403, error: 'Enrollment Orientasi PPLG aktif diperlukan.' };
  }

  const prerequisite = getPreviousOrientasiSlug(input.lessonSlug);
  if (!isAdmin && prerequisite && !input.completedSlugs.includes(prerequisite)) {
    return { allowed: false, status: 409, error: 'Selesaikan modul prasyarat terlebih dahulu.' };
  }

  const submitted = new Set(input.submissionTypes);
  if (input.action === 'lkpd' && !submitted.has('checkpoint')) {
    return { allowed: false, status: 409, error: 'Tuntaskan checkpoint sebelum mengirim LKPD.' };
  }
  if (input.action === 'reflection' && !submitted.has('lkpd')) {
    return { allowed: false, status: 409, error: 'Kirim LKPD sebelum mengirim jurnal refleksi.' };
  }
  if (input.action === 'complete' && (!submitted.has('checkpoint') || !submitted.has('lkpd') || !submitted.has('reflection'))) {
    return { allowed: false, status: 409, error: 'Checkpoint, LKPD, dan jurnal refleksi harus selesai sebelum modul dituntaskan.' };
  }

  return { allowed: true, status: 200 };
}

export interface EnrollmentTokenState {
  targetType: string;
  targetSlug: string | null;
  isActive: boolean;
  expiresAt: Date | string | null;
}

export function grantsOrientasiEnrollment(token: EnrollmentTokenState, lessonSlug: OrientasiSlug, now = new Date()): boolean {
  if (!token.isActive || (token.expiresAt && new Date(token.expiresAt) < now)) return false;
  return token.targetType === 'all' || token.targetSlug === 'all' || token.targetSlug === 'orientasi-pplg' || token.targetSlug === lessonSlug;
}
