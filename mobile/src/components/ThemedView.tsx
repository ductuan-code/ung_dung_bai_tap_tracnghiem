import { View, type ViewProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface ThemedViewProps extends ViewProps {
  variant?: 'background' | 'surface' | 'card';
}

export function ThemedView({ style, variant = 'background', ...props }: ThemedViewProps) {
  const { colors } = useTheme();
  const bg =
    variant === 'surface'
      ? colors.surface
      : variant === 'card'
        ? colors.card
        : colors.background;

  return <View style={[{ backgroundColor: bg }, style]} {...props} />;
}
