import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuizResult } from '../types';

const HISTORY_KEY = '@quiz_history';

export async function getHistory(): Promise<QuizResult[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveResult(result: QuizResult): Promise<void> {
  try {
    const existing = await getHistory();
    // Mới nhất lên đầu
    const updated = [result, ...existing];
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // silent fail
  }
}

export async function deleteResult(resultId: string): Promise<QuizResult[]> {
  try {
    const existing = await getHistory();
    const updated = existing.filter((r) => r.id !== resultId);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch {
    // silent fail
  }
}
