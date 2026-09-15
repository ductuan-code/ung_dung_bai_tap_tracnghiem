import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { quizService } from '@/services/quizService';
import { QuizCard } from '@/components/QuizCard';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorMessage } from '@/components/ErrorMessage';
import type { Quiz } from '@/types';

export default function QuizListScreen() {
  const { colors, spacing, fontSize, fontWeight } = useTheme();
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
  }>();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizzes = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await quizService.getByCategory(Number(categoryId));
      setQuizzes(data);
    } catch {
      setError('Không thể tải danh sách quiz. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  if (loading) return <LoadingScreen message="Đang tải quiz..." />;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.semibold }]} numberOfLines={1}>
            {categoryName ?? 'Danh sách Quiz'}
          </Text>
          <Text style={[{ color: colors.textSecondary, fontSize: fontSize.xs }]}>
            {quizzes.length} quiz
          </Text>
        </View>
      </View>

      {error && (
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
          <ErrorMessage message={error} onRetry={fetchQuizzes} />
        </View>
      )}

      <FlatList
        data={quizzes}
        keyExtractor={(item) => String(item.quizId)}
        renderItem={({ item }) => (
          <QuizCard
            quiz={item}
            onPress={() =>
              router.push({ pathname: '/quiz-detail', params: { quizId: item.quizId } })
            }
          />
        )}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !error ? (
            <View style={styles.empty}>
              <Text style={[{ color: colors.textSecondary, fontSize: fontSize.md, textAlign: 'center' }]}>
                Danh mục này chưa có quiz nào.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerCenter: { flex: 1, gap: 2 },
  headerTitle: {},
  empty: {
    marginTop: 64,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
