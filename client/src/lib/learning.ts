// Local helpers for the learning experience: daily goal tracking and
// duration formatting. The daily goal lives in localStorage — it is a
// personal, per-device setting.

const GOAL_KEY = 'getease-daily-goal-minutes';
const todayKey = () => {
  const d = new Date();
  return `getease-learned-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export const getDailyGoalMinutes = (): number => {
  const v = parseInt(localStorage.getItem(GOAL_KEY) || '', 10);
  return Number.isFinite(v) && v > 0 ? v : 30;
};

export const setDailyGoalMinutes = (minutes: number) => {
  localStorage.setItem(GOAL_KEY, String(minutes));
};

export const getTodayLearnedSeconds = (): number => {
  const v = parseFloat(localStorage.getItem(todayKey()) || '0');
  return Number.isFinite(v) ? v : 0;
};

export const addLearnedSeconds = (seconds: number) => {
  localStorage.setItem(todayKey(), String(getTodayLearnedSeconds() + seconds));
};

export const greeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const formatDuration = (totalSeconds?: number | null): string => {
  if (!totalSeconds) return '—';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const formatPrice = (price: number): string =>
  price === 0 ? 'Free' : `₹${price}`;

export const formatDate = (d: string | Date): string =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
