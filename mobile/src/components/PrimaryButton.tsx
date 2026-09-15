import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function PrimaryButton({
  title,
  loading = false,
  variant = 'primary',
  style,
  disabled,
  ...props
}: PrimaryButtonProps) {
  const { colors, radius, fontWeight, fontSize } = useTheme();

  const isDisabled = disabled || loading;

  const bgColor =
    variant === 'outline'
      ? 'transparent'
      : variant === 'secondary'
        ? colors.surface
        : isDisabled
          ? colors.disabled
          : colors.primary;

  const textColor =
    variant === 'outline'
      ? colors.primary
      : variant === 'secondary'
        ? colors.primary
        : colors.textInverse;

  const borderStyle =
    variant === 'outline'
      ? { borderWidth: 1.5, borderColor: colors.primary }
      : {};

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: bgColor, borderRadius: radius.md },
        borderStyle,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            { color: textColor, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  text: {
    letterSpacing: 0.3,
  },
});
