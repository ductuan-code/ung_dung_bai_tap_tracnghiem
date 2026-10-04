import { useCallback, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { quizService } from '@/services/quizService';
import { useScreenData } from '@/hooks/useScreenData';
import { Screen, PageHeading } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { QuizCard } from '@/components/QuizCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingScreen } from '@/components/LoadingScreen';
import { matchesTitle, routeId } from '@/utils/study';
export default function QuizListScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
  }>();
  const loader = useCallback(
    async () => quizService.getByCategory(routeId(categoryId)),
    [categoryId],
  );
  const { data, loading, error, refresh } = useScreenData(loader);
  const [search, setSearch] = useState('');
  const rows = data?.filter((q) => matchesTitle(q.title, search)) ?? [];
  return (
    <Screen refreshing={loading && !!data} onRefresh={refresh}>
      <PageHeading
        back
        title={categoryName || 'Đề theo danh mục'}
        subtitle={
          data
            ? `${data.length} đề thi sẵn sàng`
            : 'Chọn bài kiểm tra để bắt đầu.'
        }
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
      ) : rows.length ? (
        rows.map((quiz) => (
          <QuizCard
            key={quiz.quizId}
            quiz={quiz}
            onPress={() =>
              router.push({
                pathname: '/quiz-detail',
                params: { quizId: quiz.quizId },
              })
            }
          />
        ))
      ) : (
        <EmptyState
          title="Chưa có đề phù hợp"
          message="Thử từ khóa khác hoặc kéo xuống để cập nhật nội dung."
        />
      )}
    </Screen>
  );
}
