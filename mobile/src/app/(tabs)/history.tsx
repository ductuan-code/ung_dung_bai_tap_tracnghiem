import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { resultService } from '@/services/resultService';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorMessage } from '@/components/ErrorMessage';
import type { Result } from '@/types';

export default function HistoryScreen() {
  const { colors, spacing, fontSize, fontWeight, radius, shadow } = useTheme();

  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await resultService.getMyResults();
      // Mới nhất trước
      setResults(data.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()));
    } catch {
      setError('Không thể tải lịch sử. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) return <LoadingScreen message="Đang tải lịch sử..." />;

  function getScoreColor(score: number) {
    if (score >= 80) return colors.correct;
    if (score >= 50) return colors.warning;
    return colors.incorrect;
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md }]}>
        <Text style={[styles.title, { color: colors.text, fontSize: fontSize.xl, fontWeight: fontWeight.bold }]}>
          Lịch sử làm bài
        </Text>
        <Text style={[{ color: colors.textSecondary, fontSize: fontSize.sm }]}>
          {results.length} lần làm bài
        </Text>
      </View>

      {/* Error */}
      {error && (
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
          <ErrorMessage message={error} onRetry={fetchHistory} />
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => String(item.resultId)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderRadius: radius.lg,
                borderColor: colors.border,
                ...shadow.sm,
              },
            ]}
            onPress={() => router.push({ pathname: '/result', params: { resultId: item.resultId } })}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`Xem kết quả quiz ${item.quizTitle}`}
          >
            <View style={styles.cardTop}>
              <Text
                style={[styles.quizTitle, { color: colors.text, fontSize: fontSize.md, fontWeight: fontWeight.semibold }]}
                numberOfLines={2}
              >
                {item.quizTitle}
              </Text>
              <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(item.score) + '20', borderRadius: radius.full }]}>
                <Text style={[styles.scoreText, { color: getScoreColor(item.score), fontSize: fontSize.md, fontWeight: fontWeight.bold }]}>
                  {item.score}%
                </Text>
              </View>
            </View>
            <View style={styles.cardBottom}>
              <Text style={[{ color: colors.textSecondary, fontSize: fontSize.xs }]}>
                {item.correctAnswers}/{item.totalQuestions} câu đúng
              </Text>
              <Text style={[{ color: colors.textSecondary, fontSize: fontSize.xs }]}>
                {formatDate(item.completedAt)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !error ? (
            <View style={styles.empty}>
              <Text style={[{ color: colors.textSecondary, fontSize: fontSize.md, textAlign: 'center' }]}>
                Bạn chưa làm bài nào.{'\n'}Hãy bắt đầu từ trang chủ!
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { gap: 4 },
  title: {},
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  quizTitle: { flex: 1, lineHeight: 22 },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {},
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  empty: {
    marginTop: 64,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
