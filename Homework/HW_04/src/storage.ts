import type { ProgressMap, Quest } from './types';

const FAVORITES_KEY = 'escape-online:favorites';
const PROGRESS_KEY = 'escape-online:progress';
const CUSTOM_KEY = 'escape-online:custom-quests';

// Безпечно читаємо дані: пошкоджений localStorage не повинен ламати застосунок.
function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

export const storage = {
  favorites: () => read<string[]>(FAVORITES_KEY, []),
  saveFavorites: (value: string[]) => localStorage.setItem(FAVORITES_KEY, JSON.stringify(value)),
  progress: () => read<ProgressMap>(PROGRESS_KEY, {}),
  saveProgress: (value: ProgressMap) => localStorage.setItem(PROGRESS_KEY, JSON.stringify(value)),
  clearProgress: () => localStorage.removeItem(PROGRESS_KEY),
  customQuests: () => read<Quest[]>(CUSTOM_KEY, []),
  saveCustomQuests: (value: Quest[]) => localStorage.setItem(CUSTOM_KEY, JSON.stringify(value)),
};
