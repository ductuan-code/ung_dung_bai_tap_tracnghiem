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
import { resultService } from '@/services/resultService';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorMessage } from '@/components/ErrorMessage';
import { PrimaryButton } from '@/components/PrimaryButton';
import type { Result } from '@/types';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function ResultScreen() {
  const { colors, spacing, fontSize, fontWeight, radius, shadow } = useTheme();
  const { resultId } = useLocalSearchParams<{ resultId: string }>();

  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resultId) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await resultService.getById(Number(resultId));
        setResult(data);
      } catch {
        setError('Không thể tải kết quả. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    })();
  }, [resultId]);

  if (loading) return <LoadingScreen message="Đang tải kết quả..." />;

  function getScoreColor(score: number) {
    if (score >= 80) return colors.correct;
    if (score >= 50) return colors.warning;
    return colors.incorrect;
  }

  function getScoreLabel(score: number) {
    if (score >= 80) return 'Xuất sắc! 🎉';
    if (score >= 50) return 'Khá tốt! 👍';
    return 'Cố gắng hơn nhé! 💪';
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md }]}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          accessibilityRole="button"
          accessibilityLabel="Về trang chủ"
        >
          <Ionicons name="home-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.semibold }]}>
          Kết quả
        </Text>
      </View>

      {error && (
        <View style={{ paddingHorizontal: spacing.lg }}>
          <ErrorMessage message={error} />
        </View>
      )}

      {result && (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          {/* Score card */}
          <View style={[styles.scoreCard, { backgroundColor: colors.card, borderRadius: radius.xl, borderColor: colors.border, ...shadow.md }]}>
            <Text style={[styles.quizTitle, { color: colors.textSecondary, fontSize: fontSize.sm }]} numberOfLines={2}>
              {result.quizTitle}
            </Text>
            <View style={[styles.scoreCircle, { borderColor: getScoreColor(result.score), backgroundColor: getScoreColor(result.score) + '15' }]}>
              <Text style={[styles.scoreNumber, { color: getScoreColor(result.score), fontSize: fontSize.xxxl, fontWeight: fontWeight.extrabold }]}>
                {result.score}%
              </Text>
            </View>
            <Text style={[styles.scoreLabel, { color: getScoreColor(result.score), fontSize: fontSize.lg, fontWeight: fontWeight.semibold }]}>
              {getScoreLabel(result.score)}
            </Text>
            <View style={[styles.statRow, { borderTopColor: colors.border }]}>
              <StatItem label="Đúng" value={String(result.correctAnswers)} color={colors.correct} fontSize={fontSize} fontWeight={fontWeight} colors={colors} />
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <StatItem label="Sai" value={String(result.totalQuestions - result.correctAnswers)} color={colors.incorrect} fontSize={fontSize} fontWeight={fontWeight} colors={colors} />
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <StatItem label="Tổng" value={String(result.totalQuestions)} color={colors.text} fontSize={fontSize} fontWeight={fontWeight} colors={colors} />
            </View>
          </View>

          {/* Chi tiết từng câu */}
          {result.details && result.details.length > 0 && (
            <View style={{ gap: 10 }}>
              <Text style={[{ color: colors.text, fontSize: fontSize.md, fontWeight: fontWeight.semibold }]}>
                Chi tiết từng câu
              </Text>
              {result.details.map((detail, idx) => (
                <View
                  key={detail.questionId}
                  style={[
                    styles.detailCard,
                    {
                      backgroundColor: detail.isCorrect ? colors.correctBg : colors.incorrectBg,
                      borderColor: detail.isCorrect ? colors.correct : colors.incorrect,
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <View style={styles.detailHeader}>
                    <Ionicons
                      name={detail.isCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={20}
                      color={detail.isCorrect ? colors.correct : colors.incorrect}
                    />
                    <Text style={[styles.detailQuestion, { color: colors.text, fontSize: fontSize.sm, fontWeight: fontWeight.medium }]}>
                      Câu {idx + 1}: {detail.questionContent}
                    </Text>
                  </View>
                  <Text style={[{ color: detail.isCorrect ? colors.correct : colors.incorrect, fontSize: fontSize.xs, fontWeight: fontWeight.medium }]}>
                    Bạn chọn: {detail.selectedAnswerContent}
                  </Text>
                  {!detail.isCorrect && (
                    <Text style={[{ color: colors.correct, fontSize: fontSize.xs, fontWeight: fontWeight.medium }]}>
                      Đáp án đúng: {detail.correctAnswerContent}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <PrimaryButton
            title="Về trang chủ"
            onPress={() => router.replace('/(tabs)')}
          />
          <PrimaryButton
            title="Xem lịch sử"
            variant="outline"
            onPress={() => router.replace('/(tabs)/history')}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function StatItem({
  label,
  value,
  color,
  fontSize,
  fontWeight,
  colors,
}: {
  label: string;
  value: string;
  color: string;
  fontSize: ReturnType<typeof useTheme>['fontSize'];
  fontWeight: ReturnType<typeof useTheme>['fontWeight'];
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={styles.statItem}>
      <Text style={[{ color, fontSize: fontSize.xl, fontWeight: fontWeight.bold }]}>{value}</Text>
      <Text style={[{ color: colors.textSecondary, fontSize: fontSize.xs }]}>{label}</Text>
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
  scoreCard: {
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    gap: 16,
  },
  quizTitle: { textAlign: 'center' },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {},
  scoreLabel: {},
  statRow: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
  },
  detailCard: {
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  detailQuestion: {
    flex: 1,
    lineHeight: 20,
  },
});
