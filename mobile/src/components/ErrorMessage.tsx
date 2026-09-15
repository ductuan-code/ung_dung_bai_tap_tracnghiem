import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const { colors, radius, fontSize, fontWeight } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.incorrectBg, borderRadius: radius.md }]}>
      <Text style={[styles.text, { color: colors.incorrect, fontSize: fontSize.sm }]}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
          <Text style={[styles.retryText, { color: colors.incorrect, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }]}>
            Thử lại
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  text: {
    flex: 1,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  retryText: {},
});
