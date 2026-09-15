import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { quizService } from '@/services/quizService';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorMessage } from '@/components/ErrorMessage';
import type { Quiz } from '@/types';

export default function QuizDetailScreen() {
  const { colors, spacing, fontSize, fontWeight, radius, shadow } = useTheme();
  const { quizId } = useLocalSearchParams<{ quizId: string }>();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await quizService.getById(Number(quizId));
        setQuiz(data);
      } catch {
        setError('Không thể tải thông tin quiz.');
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  if (loading) return <LoadingScreen message="Đang tải thông tin..." />;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Quay lại">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.semibold }]} numberOfLines={1}>
          Chi tiết Quiz
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {error && <ErrorMessage message={error} />}

        {quiz && (
          <>
            {/* Quiz info card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderRadius: radius.lg, borderColor: colors.border, ...shadow.md }]}>
              <Text style={[styles.quizTitle, { color: colors.text, fontSize: fontSize.xl, fontWeight: fontWeight.bold }]}>
                {quiz.title}
              </Text>
              {quiz.description && (
                <Text style={[styles.desc, { color: colors.textSecondary, fontSize: fontSize.md }]}>
                  {quiz.description}
                </Text>
              )}

              {/* Meta info */}
              <View style={[styles.metaRow, { borderTopColor: colors.border }]}>
                <MetaItem
                  icon="layers-outline"
                  label="Danh mục"
                  value={quiz.categoryName ?? '—'}
                  colors={colors}
                  fontSize={fontSize}
                  fontWeight={fontWeight}
                />
                <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
                <MetaItem
                  icon="help-circle-outline"
                  label="Số câu"
                  value={quiz.questionCount !== undefined ? `${quiz.questionCount} câu` : '—'}
                  colors={colors}
                  fontSize={fontSize}
                  fontWeight={fontWeight}
                />
              </View>
            </View>

            {/* Hướng dẫn */}
            <View style={[styles.infoBox, { backgroundColor: colors.primary + '12', borderRadius: radius.md, borderColor: colors.primary + '30' }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.primary, fontSize: fontSize.sm }]}>
                Mỗi câu hỏi có 4 đáp án, chỉ 1 đáp án đúng. Bạn có thể xem lại kết quả sau khi nộp bài.
              </Text>
            </View>

            {/* CTA */}
            <PrimaryButton
              title="Bắt đầu làm bài"
              onPress={() => router.push({ pathname: '/quiz-play', params: { quizId: quiz.quizId } })}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaItem({
  icon,
  label,
  value,
  colors,
  fontSize,
  fontWeight,
}: {
  icon: string;
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>['colors'];
  fontSize: ReturnType<typeof useTheme>['fontSize'];
  fontWeight: ReturnType<typeof useTheme>['fontWeight'];
}) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon as any} size={18} color={colors.textSecondary} />
      <View style={styles.metaText}>
        <Text style={[{ color: colors.textSecondary, fontSize: fontSize.xs }]}>{label}</Text>
        <Text style={[{ color: colors.text, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: { flex: 1 },
  card: {
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  quizTitle: { lineHeight: 30 },
  desc: { lineHeight: 22 },
  metaRow: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaDivider: {
    width: 1,
    marginHorizontal: 12,
  },
  metaText: { gap: 2 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  infoText: { flex: 1, lineHeight: 20 },
});
