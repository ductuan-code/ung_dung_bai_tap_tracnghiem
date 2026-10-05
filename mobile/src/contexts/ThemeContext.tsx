import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark';
export const THEME_STORAGE_KEY = 'quizapp_theme';
const ThemeContext = createContext<{
  mode: ThemeMode;
  ready: boolean;
  saving: boolean;
  error: string | null;
  setMode: (mode: ThemeMode) => Promise<void>;
} | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setTheme] = useState<ThemeMode>('dark');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  useEffect(() => {
    if (ready && Platform.OS !== 'web') Appearance.setColorScheme(mode);
  }, [mode, ready]);
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((value) => {
        if (active && (value === 'light' || value === 'dark')) setTheme(value);
      })
      .catch(() => {
        if (active)
          setError('Không thể đọc giao diện đã lưu. Đang dùng chế độ tối.');
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  async function setMode(next: ThemeMode) {
    if (lock.current || !ready) return;
    lock.current = true;
    setSaving(true);
    setError(null);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, next);
      setTheme(next);
    } catch {
      setError('Không thể lưu giao diện. Vui lòng thử lại.');
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }
  return (
    <ThemeContext.Provider value={{ mode, ready, saving, error, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useThemeContext() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('ThemeProvider is required');
  return value;
}
