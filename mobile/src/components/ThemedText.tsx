import { Text, type TextProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface ThemedTextProps extends TextProps {
  variant?: 'primary' | 'secondary' | 'inverse';
}

export function ThemedText({ style, variant = 'primary', ...props }: ThemedTextProps) {
  const { colors, fontSize, fontWeight } = useTheme();
  const color =
    variant === 'secondary'
      ? colors.textSecondary
      : variant === 'inverse'
        ? colors.textInverse
        : colors.text;

  return (
    <Text
      style={[{ color, fontSize: fontSize.md, fontWeight: fontWeight.regular }, style]}
      {...props}
    />
  );
}
