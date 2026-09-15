import { TouchableOpacity, View, Text, StyleSheet, type TouchableOpacityProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import type { Quiz } from '../types';

interface QuizCardProps extends TouchableOpacityProps {
  quiz: Quiz;
}

export function QuizCard({ quiz, style, ...props }: QuizCardProps) {
  const { colors, radius, fontSize, fontWeight, shadow } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          borderColor: colors.border,
          ...shadow.sm,
        },
        style,
      ]}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Quiz ${quiz.title}`}
      {...props}
    >
      <Text
        style={[styles.title, { color: colors.text, fontSize: fontSize.md, fontWeight: fontWeight.semibold }]}
        numberOfLines={2}
      >
        {quiz.title}
      </Text>
      {quiz.description && (
        <Text
          style={[styles.desc, { color: colors.textSecondary, fontSize: fontSize.sm }]}
          numberOfLines={2}
        >
          {quiz.description}
        </Text>
      )}
      <View style={styles.meta}>
        {quiz.questionCount !== undefined && (
          <Text style={[styles.metaText, { color: colors.accent, fontSize: fontSize.xs, fontWeight: fontWeight.medium }]}>
            {quiz.questionCount} câu hỏi
          </Text>
        )}
        {quiz.categoryName && (
          <Text style={[styles.metaText, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
            {quiz.categoryName}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  title: {
    lineHeight: 22,
  },
  desc: {
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  metaText: {},
});
