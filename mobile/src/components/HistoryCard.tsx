import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Result } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { completedDate } from '@/utils/study';
import { ResultBadge } from './ResultBadge';
export function HistoryCard({ result }: { result: Result }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={'Xem kết quả ' + result.quizTitle}
      onPress={() =>
        router.push({
          pathname: '/result',
          params: { resultId: result.resultId },
        })
      }
      style={{
        padding: 18,
        borderRadius: 20,
        borderColor: colors.border,
        borderWidth: 1,
        backgroundColor: colors.card,
        gap: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text
          style={{
            flex: 1,
            color: colors.text,
            fontSize: 16,
            lineHeight: 23,
            fontWeight: '600',
          }}
        >
          {result.quizTitle}
        </Text>
        <ResultBadge score={result.score} />
      </View>
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
        {result.correctAnswers}/{result.totalQuestions} câu đúng
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          {completedDate(result.completedAt)}
        </Text>
        <Ionicons name="arrow-forward" size={18} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
}
