import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../constants/theme';
import { useColorScheme } from './useColorScheme';

export function useTheme() {
  const scheme = useColorScheme();
  return {
    colors: Colors[scheme],
    spacing: Spacing,
    radius: Radius,
    fontSize: FontSize,
    fontWeight: FontWeight,
    shadow: Shadow,
    isDark: scheme === 'dark',
  };
}
