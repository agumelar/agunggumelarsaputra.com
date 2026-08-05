export interface UserGamificationState {
  xp: number;
  level: number;
  levelTitle: string;
  completedLessons: string[]; // List of lesson slugs
  completedQuizzes: string[];
  badges: Badge[];
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export const ALL_BADGES: Badge[] = [
  {
    id: 'rongga-coder',
    title: 'Rongga Coder',
    description: 'Menyelesaikan 3 modul pembelajaran dasar PPLG.',
    icon: '🌱'
  },
  {
    id: 'tka-warrior',
    title: 'TKA Warrior',
    description: 'Menyelesaikan simulasi Drilling TKA PPLG pertama.',
    icon: '⚔️'
  },
  {
    id: 'tka-master',
    title: 'TKA Champion',
    description: 'Mencapai nilai ≥ 80 pada Tryout TKA PPLG.',
    icon: '👑'
  },
  {
    id: 'database-architect',
    title: 'Database Architect',
    description: 'Menyelesaikan modul Dasar Basis Data.',
    icon: '🗄️'
  },
  {
    id: 'logic-master',
    title: 'Logic Master',
    description: 'Menyelesaikan modul Algoritma & Pemrograman.',
    icon: '⚡'
  },
  {
    id: 'daily-learner',
    title: 'Daily Streak',
    description: 'Aktif belajar 3 hari berturut-turut.',
    icon: '🔥'
  }
];

const STORAGE_KEY = 'ags_learning_gamification_v1';

export function getGamificationState(): UserGamificationState {
  if (typeof window === 'undefined') {
    return getDefaultState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    return updateStreakIfNeeded(parsed);
  } catch (e) {
    return getDefaultState();
  }
}

function getDefaultState(): UserGamificationState {
  return {
    xp: 0,
    level: 1,
    levelTitle: 'Apprentice Coder',
    completedLessons: [],
    completedQuizzes: [],
    badges: [],
    streak: 1,
    lastActiveDate: new Date().toISOString().split('T')[0]
  };
}

export function calculateLevel(xp: number): { level: number; title: string; nextLevelXp: number; currentLevelMinXp: number } {
  if (xp < 100) {
    return { level: 1, title: 'Apprentice Coder', nextLevelXp: 100, currentLevelMinXp: 0 };
  } else if (xp < 300) {
    return { level: 2, title: 'Junior Developer', nextLevelXp: 300, currentLevelMinXp: 100 };
  } else if (xp < 600) {
    return { level: 3, title: 'Logic Architect', nextLevelXp: 600, currentLevelMinXp: 300 };
  } else if (xp < 1000) {
    return { level: 4, title: 'PPLG Specialist', nextLevelXp: 1000, currentLevelMinXp: 600 };
  } else {
    return { level: 5, title: 'Code Master', nextLevelXp: 2000, currentLevelMinXp: 1000 };
  }
}

function updateStreakIfNeeded(state: UserGamificationState): UserGamificationState {
  const today = new Date().toISOString().split('T')[0];
  const lastActive = state.lastActiveDate;

  if (lastActive === today) {
    return state;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastActive === yesterdayStr) {
    state.streak += 1;
  } else {
    state.streak = 1;
  }

  state.lastActiveDate = today;
  saveGamificationState(state);

  if (state.streak >= 3) {
    unlockBadge(state, 'daily-learner');
  }

  return state;
}

export function saveGamificationState(state: UserGamificationState) {
  if (typeof window === 'undefined') return;
  const levelInfo = calculateLevel(state.xp);
  state.level = levelInfo.level;
  state.levelTitle = levelInfo.title;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  // Dispatch custom event so UI components can update dynamically
  window.dispatchEvent(new CustomEvent('ags-xp-updated', { detail: state }));
}

export function addXp(amount: number, reason?: string): { newState: UserGamificationState; leveledUp: boolean } {
  const state = getGamificationState();
  const oldLevel = state.level;
  state.xp += amount;
  
  const levelInfo = calculateLevel(state.xp);
  state.level = levelInfo.level;
  state.levelTitle = levelInfo.title;
  const leveledUp = state.level > oldLevel;

  saveGamificationState(state);
  return { newState: state, leveledUp };
}

export function markLessonComplete(lessonSlug: string): UserGamificationState {
  const state = getGamificationState();
  if (!state.completedLessons.includes(lessonSlug)) {
    state.completedLessons.push(lessonSlug);
    addXp(10, 'Membaca modul');

    if (state.completedLessons.length >= 3) {
      unlockBadge(state, 'rongga-coder');
    }
  }
  return state;
}

export function unlockBadge(state: UserGamificationState, badgeId: string): boolean {
  if (state.badges.some(b => b.id === badgeId)) return false;
  const target = ALL_BADGES.find(b => b.id === badgeId);
  if (target) {
    state.badges.push({
      ...target,
      unlockedAt: new Date().toISOString()
    });
    saveGamificationState(state);
    return true;
  }
  return false;
}
