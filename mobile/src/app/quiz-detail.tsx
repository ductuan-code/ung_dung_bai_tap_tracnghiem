import { useCallback } from 'react';
import { View, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { quizService } from '@/services/quizService';
import { useScreenData } from '@/hooks/useScreenData';
import { useTheme } from '@/hooks/useTheme';
import { Screen, PageHeading, screenStyles } from '@/components/Screen';
import { EmptyState } from '@/components/EmptyState';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingScreen } from '@/components/LoadingScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { routeId } from '@/utils/study';
export default function QuizDetailScreen() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const { colors } = useTheme();
  const loader = useCallback(
    async () => quizService.getById(routeId(quizId)),
    [quizId],
  );
  const { data: quiz, loading, error, refresh } = useScreenData(loader);
  return (
    <Screen>
      <PageHeading title="Chi tiết đề thi" back />
      {loading ? (
        <LoadingScreen message="Đang tải thông tin..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refresh} />
      ) : quiz ? (
        <>
          <View
            style={[
              screenStyles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                padding: 24,
              },
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={34}
              color={colors.primary}
            />
            <Text
              style={{
                color: colors.text,
                fontSize: 25,
                lineHeight: 34,
                fontWeight: '800',
              }}
            >
              {quiz.title}
            </Text>
            {!!quiz.description && (
              <Text style={{ color: colors.textSecondary, lineHeight: 24 }}>
                {quiz.description}
              </Text>
            )}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.border,
                paddingTop: 18,
                gap: 12,
              }}
            >
              <Text style={{ color: colors.textSecondary }}>
                Danh mục:{' '}
                <Text style={{ color: colors.text }}>
                  {quiz.categoryName ?? '—'}
                </Text>
              </Text>
              <Text style={{ color: colors.textSecondary }}>
                Số câu:{' '}
                <Text style={{ color: colors.accent, fontWeight: '700' }}>
                  {quiz.questionCount ?? '—'}
                </Text>
              </Text>
            </View>
          </View>
          <View
            style={[
              screenStyles.card,
              {
                backgroundColor: colors.primary + '12',
                borderColor: colors.primary + '40',
              },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={colors.primary}
            />
            <Text
              style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}
            >
              Trước khi bắt đầu
            </Text>
            <Text style={{ color: colors.textSecondary, lineHeight: 24 }}>
              Mỗi câu hỏi có 4 đáp án và chỉ có 1 đáp án đúng. Bạn có thể chuyển
              giữa các câu để xem lại lựa chọn trước khi nộp bài.
            </Text>
            <Text style={{ color: colors.warning, lineHeight: 24 }}>
              Toàn bộ bài có 60 giây kể từ khi tải xong câu hỏi. Hết giờ, bài tự
              động nộp cả khi còn câu bỏ trống. Thời gian vẫn trôi khi chuyển
              sang ứng dụng khác.
            </Text>
          </View>
          <PrimaryButton
            title="Bắt đầu làm bài"
            disabled={quiz.questionCount === 0}
            onPress={() =>
              router.push({
                pathname: '/quiz-play',
                params: { quizId: quiz.quizId },
              })
            }
          />
        </>
      ) : (
        <EmptyState message="Không tìm thấy đề thi này." />
      )}
    </Screen>
  );
}
