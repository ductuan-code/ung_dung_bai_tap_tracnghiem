import { useThemeContext } from '@/contexts/ThemeContext';
export function useColorScheme() {
  return useThemeContext().mode;
}
