/** Правила, загадки та локальне сховище навчального клубу. */
export type Member = { id: string; name: string; joinedAt: string; solved: number[] };
export type ClubState = { members: Member[]; activeId: string | null };
export const riddles = [
  { id: 1, question: 'Що можна побачити із заплющеними очима?', answers: ['сон', 'сни'], points: 25 },
  { id: 2, question: 'Що стає більшим, якщо з нього забирати?', answers: ['яма', 'дірка'], points: 35 },
  { id: 3, question: 'Що належить вам, але інші використовують це частіше?', answers: ["ім'я", 'ім’я', 'имя'], points: 40 },
];
const key = 'secret-society-v1';
export function score(member: Member) { return riddles.filter(r => member.solved.includes(r.id)).reduce((sum, r) => sum + r.points, 0); }
export function level(member: Member) { return member.solved.length === riddles.length ? 3 : member.solved.length > 0 ? 2 : 1; }
export function loadClub(): ClubState {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) || '{}');
    if (!parsed || typeof parsed !== 'object') return { members: [], activeId: null };
    const value = parsed as Record<string, unknown>;
    const members = Array.isArray(value.members) ? value.members.filter((m): m is Member =>
      !!m && typeof m.id === 'string' && typeof m.name === 'string' && typeof m.joinedAt === 'string' &&
      Array.isArray(m.solved) && m.solved.every((id: unknown) => typeof id === 'number')) : [];
    return { members, activeId: typeof value.activeId === 'string' && members.some(m => m.id === value.activeId) ? value.activeId : null };
  } catch { return { members: [], activeId: null }; }
}
export function saveClub(value: ClubState) { localStorage.setItem(key, JSON.stringify(value)); }
