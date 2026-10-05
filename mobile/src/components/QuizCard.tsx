import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  type TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import type { Quiz } from '../types';
import { Ionicons } from '@expo/vector-icons';

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
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: fontSize.md,
            fontWeight: fontWeight.semibold,
          },
        ]}
        numberOfLines={2}
      >
        {quiz.title}
      </Text>
      {quiz.description && (
        <Text
          style={[
            styles.desc,
            { color: colors.textSecondary, fontSize: fontSize.sm },
          ]}
          numberOfLines={2}
        >
          {quiz.description}
        </Text>
      )}
      <View style={styles.meta}>
        <Ionicons
          name="document-text-outline"
          size={16}
          color={colors.accent}
        />
        {quiz.questionCount !== undefined && (
          <Text
            style={[
              styles.metaText,
              {
                color: colors.accent,
                fontSize: fontSize.xs,
                fontWeight: fontWeight.medium,
              },
            ]}
          >
            {quiz.questionCount} câu hỏi
          </Text>
        )}
        {quiz.categoryName && (
          <Text
            style={[
              styles.metaText,
              { color: colors.textSecondary, fontSize: fontSize.xs },
            ]}
          >
            {quiz.categoryName}
          </Text>
        )}
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 4,
        }}
      >
        <Text style={{ color: colors.primary, fontSize: 12 }}>
          Xem chi tiết
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
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
