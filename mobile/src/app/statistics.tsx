import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { resultService } from '@/services/resultService';
import { useScreenData } from '@/hooks/useScreenData';
import { useTheme } from '@/hooks/useTheme';
import {
  Screen,
  PageHeading,
  SectionTitle,
  screenStyles,
} from '@/components/Screen';
import { StatCard } from '@/components/StatCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorMessage } from '@/components/ErrorMessage';
import {
  newestResults,
  studyStats,
  percent,
  completedDate,
} from '@/utils/study';
const loadResults = async () =>
  newestResults(await resultService.getMyResults());
export default function StatisticsScreen() {
  const { colors } = useTheme();
  const { data, loading, error, refresh } = useScreenData(loadResults);
  const stats = data ? studyStats(data) : null;
  return (
    <Screen refreshing={loading && !!data} onRefresh={refresh}>
      <PageHeading
        title="Thống kê học tập"
        subtitle="Tiến bộ đến từ từng lần luyện tập."
        back
      />
      {loading && !data ? (
        <LoadingScreen message="Đang tải thống kê..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refresh} />
      ) : (
        stats &&
        data && (
          <>
            <View style={screenStyles.row}>
              <StatCard value={String(stats.count)} label="Tổng lần làm bài" />
              <StatCard
                value={percent(stats.average)}
                label="Điểm trung bình"
              />
            </View>
            <View style={screenStyles.row}>
              <StatCard value={percent(stats.best)} label="Điểm cao nhất" />
              <StatCard value={String(stats.correct)} label="Tổng câu đúng" />
              <StatCard value={String(stats.wrong)} label="Tổng câu sai" />
            </View>
            <SectionTitle title="Kết quả gần đây" />
            {data.length ? (
              data.slice(0, 5).map((result) => (
                <TouchableOpacity
                  key={result.resultId}
                  accessibilityRole="button"
                  accessibilityLabel={'Xem kết quả ' + result.quizTitle}
                  onPress={() =>
                    router.push({
                      pathname: '/result',
                      params: { resultId: result.resultId },
                    })
                  }
                  style={[
                    screenStyles.card,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: '600',
                      lineHeight: 22,
                    }}
                  >
                    {result.quizTitle}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: colors.border,
                        height: 8,
                        borderRadius: 8,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          width: `${Math.max(0, Math.min(100, result.score))}%`,
                          height: 8,
                          backgroundColor: colors.primary,
                        }}
                      />
                    </View>
                    <Text style={{ color: colors.accent, fontWeight: '700' }}>
                      {percent(result.score)}
                    </Text>
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {completedDate(result.completedAt)}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <EmptyState
                title="Chưa có kết quả học tập"
                message="Hoàn thành bài đầu tiên để theo dõi điểm số tại đây."
              />
            )}
          </>
        )
      )}
    </Screen>
  );
}
