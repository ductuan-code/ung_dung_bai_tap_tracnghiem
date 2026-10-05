import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useScreenData } from '@/hooks/useScreenData';
import { categoryService, quizService } from '@/services/quizService';
import { resultService } from '@/services/resultService';
import {
  Screen,
  PageHeading,
  SectionTitle,
  screenStyles,
} from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { StatCard } from '@/components/StatCard';
import { CategoryCard } from '@/components/CategoryCard';
import { QuizCard } from '@/components/QuizCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingScreen } from '@/components/LoadingScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ResultBadge } from '@/components/ResultBadge';
import {
  matchesTitle,
  studyStats,
  newestResults,
  percent,
} from '@/utils/study';
const loadHome = async () => {
  const [categories, quizzes, results] = await Promise.all([
    categoryService.getAll(),
    quizService.getAll(),
    resultService.getMyResults(),
  ]);
  return { categories, quizzes, results: newestResults(results) };
};
export default function HomeScreen() {
  const { user } = useAuthContext();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const { data, loading, error, refresh } = useScreenData(loadHome);
  const stats = data ? studyStats(data.results) : null;
  const recent = data?.results[0];
  const matches =
    data?.quizzes.filter((q) => matchesTitle(q.title, search)) ?? [];
  return (
    <Screen tab refreshing={loading && !!data} onRefresh={refresh}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={{ color: colors.textSecondary }}>Xin chào,</Text>
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800' }}>
            {user?.username} 👋
          </Text>
          <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>
            Hôm nay bạn muốn luyện tập gì?
          </Text>
        </View>
        <TouchableOpacity
          accessibilityLabel="Mở hồ sơ"
          accessibilityRole="button"
          onPress={() => router.push('/(tabs)/profile')}
          style={{
            width: 48,
            height: 48,
            backgroundColor: colors.primary + '25',
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="person-outline" color={colors.primary} size={24} />
        </TouchableOpacity>
      </View>
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Tìm kiếm bài kiểm tra..."
      />
      {loading && !data ? (
        <LoadingScreen message="Đang tải trang chủ..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refresh} />
      ) : (
        data &&
        stats && (
          <>
            {!!search.trim() && (
              <>
                <SectionTitle title="Kết quả tìm kiếm" />
                <Text style={{ color: colors.textSecondary }}>
                  {matches.length} đề phù hợp
                </Text>
                {matches.length ? (
                  matches.map((q) => (
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
                    title="Không tìm thấy đề"
                    message="Thử một tên đề hoặc từ khóa khác."
                  />
                )}
              </>
            )}
            <SectionTitle
              title="Thống kê của bạn"
              action="Chi tiết"
              onPress={() => router.push('/statistics')}
            />
            <View style={screenStyles.row}>
              <StatCard value={String(stats.count)} label="Lần làm bài" />
              <StatCard
                value={percent(stats.average)}
                label="Điểm trung bình"
              />
              <StatCard
                value={String(data.categories.length)}
                label="Danh mục"
              />
            </View>
            <SectionTitle
              title="Danh mục"
              action="Tất cả đề"
              onPress={() => router.push('/(tabs)/quizzes')}
            />
            {data.categories.length ? (
              data.categories.map((category) => (
                <CategoryCard
                  key={category.categoryId}
                  category={category}
                  onPress={() =>
                    router.push({
                      pathname: '/quiz-list',
                      params: {
                        categoryId: category.categoryId,
                        categoryName: category.name,
                      },
                    })
                  }
                />
              ))
            ) : (
              <EmptyState
                title="Chưa có danh mục"
                message="Kéo xuống để cập nhật khi có nội dung mới."
              />
            )}
            <SectionTitle
              title="Gần đây"
              action="Lịch sử"
              onPress={() => router.push('/(tabs)/history')}
            />
            {recent ? (
              <View
                style={[
                  screenStyles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  BÀI LÀM GẦN NHẤT
                </Text>
                <PageHeading title={recent.quizTitle} />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: colors.textSecondary }}>
                    Điểm gần nhất
                  </Text>
                  <ResultBadge score={recent.score} />
                </View>
                <PrimaryButton
                  title="Làm lại"
                  onPress={() =>
                    router.push({
                      pathname: '/quiz-detail',
                      params: { quizId: recent.quizId },
                    })
                  }
                />
              </View>
            ) : (
              <EmptyState
                title="Bắt đầu hành trình học tập"
                message="Chọn một đề thi để có kết quả đầu tiên của bạn."
              />
            )}
          </>
        )
      )}
    </Screen>
  );
}
