import { TouchableOpacity, Text, StyleSheet, type TouchableOpacityProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';

type OptionState = 'default' | 'selected' | 'correct' | 'incorrect';

interface OptionButtonProps extends TouchableOpacityProps {
  label: string;
  content: string;
  state?: OptionState;
}

export function OptionButton({ label, content, state = 'default', style, ...props }: OptionButtonProps) {
  const { colors, radius, fontSize, fontWeight } = useTheme();

  const bgColor =
    state === 'correct'
      ? colors.correctBg
      : state === 'incorrect'
        ? colors.incorrectBg
        : state === 'selected'
          ? colors.primary + '18'
          : colors.surface;

  const borderColor =
    state === 'correct'
      ? colors.correct
      : state === 'incorrect'
        ? colors.incorrect
        : state === 'selected'
          ? colors.primary
          : colors.border;

  const textColor =
    state === 'correct'
      ? colors.correct
      : state === 'incorrect'
        ? colors.incorrect
        : state === 'selected'
          ? colors.primary
          : colors.text;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor,
          borderRadius: radius.md,
        },
        style,
      ]}
      activeOpacity={0.75}
      disabled={state === 'correct' || state === 'incorrect'}
      accessibilityRole="radio"
      accessibilityState={{ selected: state === 'selected' || state === 'correct' }}
      {...props}
    >
      <Text style={[styles.label, { color: borderColor, fontSize: fontSize.sm, fontWeight: fontWeight.bold }]}>
        {label}
      </Text>
      <Text style={[styles.content, { color: textColor, fontSize: fontSize.md }]}>
        {content}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
  },
  label: {
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 28,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    lineHeight: 22,
  },
});
