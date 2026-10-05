import { useState } from 'react';
import { resultService } from '@/services/resultService';
import { useScreenData } from '@/hooks/useScreenData';
import { Screen, PageHeading } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { HistoryCard } from '@/components/HistoryCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorMessage } from '@/components/ErrorMessage';
import { matchesTitle, newestResults } from '@/utils/study';
const loadHistory = async () =>
  newestResults(await resultService.getMyResults());
export default function HistoryScreen() {
  const { data, loading, error, refresh } = useScreenData(loadHistory);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const rows =
    data?.filter(
      (r) =>
        matchesTitle(r.quizTitle, search) &&
        (filter === 'all' ||
          (filter === 'high' ? r.score >= 80 : r.score < 80)),
    ) ?? [];
  return (
    <Screen tab refreshing={loading && !!data} onRefresh={refresh}>
      <PageHeading
        title="Lịch sử làm bài"
        subtitle={
          data
            ? `${data.length} lần làm bài · Mỗi lần luyện tập là một bước tiến`
            : 'Nhìn lại hành trình luyện tập của bạn.'
        }
      />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Tìm theo tên đề..."
      />
      <FilterChips
        value={filter}
        onChange={setFilter}
        options={[
          { key: 'all', label: 'Tất cả' },
          { key: 'high', label: '≥ 80%' },
          { key: 'low', label: '< 80%' },
        ]}
      />
      {loading && !data ? (
        <LoadingScreen message="Đang tải lịch sử..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refresh} />
      ) : rows.length ? (
        rows.map((result) => (
          <HistoryCard key={result.resultId} result={result} />
        ))
      ) : (
        <EmptyState
          title={
            data?.length ? 'Không có kết quả phù hợp' : 'Bạn chưa làm bài nào'
          }
          message={
            data?.length
              ? 'Thử thay đổi từ khóa hoặc bộ lọc điểm.'
              : 'Hãy chọn một đề thi và bắt đầu luyện tập.'
          }
        />
      )}
    </Screen>
  );
}
