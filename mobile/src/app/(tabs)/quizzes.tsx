import { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { categoryService, quizService } from '@/services/quizService';
import { useScreenData } from '@/hooks/useScreenData';
import { useTheme } from '@/hooks/useTheme';
import { Screen, PageHeading } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { QuizCard } from '@/components/QuizCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingScreen } from '@/components/LoadingScreen';
import { matchesTitle } from '@/utils/study';
const loadQuizzes = async () => {
  const [categories, quizzes] = await Promise.all([
    categoryService.getAll(),
    quizService.getAll(),
  ]);
  return { categories, quizzes };
};
export default function QuizzesScreen() {
  const { colors } = useTheme();
  const { data, loading, error, refresh } = useScreenData(loadQuizzes);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const rows =
    data?.quizzes.filter(
      (q) =>
        (category === 'all' || String(q.categoryId) === category) &&
        matchesTitle(q.title, search),
    ) ?? [];
  return (
    <Screen tab refreshing={loading && !!data} onRefresh={refresh}>
      <PageHeading
        title="Đề thi"
        subtitle="Chọn một thử thách, học thêm một điều mới."
      />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Tìm kiếm bài kiểm tra..."
      />
      {loading && !data ? (
        <LoadingScreen message="Đang tải đề thi..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refresh} />
      ) : (
        data && (
          <>
            <FilterChips
              value={category}
              onChange={setCategory}
              options={[
                { key: 'all', label: 'Tất cả' },
                ...data.categories.map((c) => ({
                  key: String(c.categoryId),
                  label: c.name,
                })),
              ]}
            />
            <Text style={{ color: colors.textSecondary }}>
              {rows.length} đề thi
            </Text>
            {rows.length ? (
              rows.map((q) => (
                <QuizCard
                  key={q.quizId}
                  quiz={q}
                  onPress={() =>
                    router.push({
                      pathname: '/quiz-detail',
                      params: { quizId: q.quizId },
                    })
                  }
                />
              ))
            ) : (
              <EmptyState
                title="Chưa có đề phù hợp"
                message="Thử thay đổi bộ lọc hoặc kéo xuống để cập nhật đề mới."
              />
            )}
          </>
        )
      )}
    </Screen>
  );
}
