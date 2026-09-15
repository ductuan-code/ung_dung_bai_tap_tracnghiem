import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { quizService } from '@/services/quizService';
import { resultService } from '@/services/resultService';
import { ProgressBar } from '@/components/ProgressBar';
import { OptionButton } from '@/components/OptionButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorMessage } from '@/components/ErrorMessage';
import type { Question, UserAnswer } from '@/types';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizPlayScreen() {
  const { colors, spacing, fontSize, fontWeight, radius, shadow } = useTheme();
  const { quizId } = useLocalSearchParams<{ quizId: string }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!quizId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await quizService.getQuestions(Number(quizId));
      setQuestions(data);
    } catch {
      setError('Không thể tải câu hỏi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const selectedAnswerId = currentQuestion ? userAnswers.get(currentQuestion.questionId) : undefined;
  const answeredCount = userAnswers.size;

  function selectAnswer(answerId: number) {
    if (!currentQuestion) return;
    setUserAnswers((prev) => new Map(prev).set(currentQuestion.questionId, answerId));
  }

  function goNext() {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }

  function handleSubmit() {
    const unanswered = totalQuestions - answeredCount;
    if (unanswered > 0) {
      Alert.alert(
        'Còn câu chưa trả lời',
        `Bạn còn ${unanswered} câu chưa chọn đáp án. Vẫn muốn nộp bài?`,
        [
          { text: 'Tiếp tục làm', style: 'cancel' },
          { text: 'Nộp bài', style: 'destructive', onPress: submitAnswers },
        ],
      );
    } else {
      Alert.alert('Nộp bài', 'Bạn có chắc muốn nộp bài không?', [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Nộp', onPress: submitAnswers },
      ]);
    }
  }

  async function submitAnswers() {
    if (!quizId) return;
    setSubmitting(true);
    try {
      const answers: UserAnswer[] = Array.from(userAnswers.entries()).map(
        ([questionId, answerId]) => ({ questionId, answerId }),
      );
      const result = await resultService.submit({
        quizId: Number(quizId),
        userAnswers: answers,
      });
      router.replace({ pathname: '/result', params: { resultId: result.resultId } });
    } catch {
      Alert.alert('Lỗi', 'Không thể nộp bài. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingScreen message="Đang tải câu hỏi..." />;
  if (error) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background, padding: spacing.lg }]}>
        <ErrorMessage message={error} onRetry={fetchQuestions} />
      </SafeAreaView>
    );
  }
  if (!currentQuestion) return null;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }]}>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Thoát bài thi', 'Tiến trình sẽ bị mất. Bạn có muốn thoát?', [
              { text: 'Ở lại', style: 'cancel' },
              { text: 'Thoát', style: 'destructive', onPress: () => router.back() },
            ])
          }
          accessibilityRole="button"
          accessibilityLabel="Thoát bài thi"
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[{ color: colors.text, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }]}>
            Câu {currentIndex + 1}/{totalQuestions}
          </Text>
          <Text style={[{ color: colors.textSecondary, fontSize: fontSize.xs }]}>
            Đã trả lời: {answeredCount}/{totalQuestions}
          </Text>
        </View>
      </View>

      {/* Progress */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
        <ProgressBar current={currentIndex + 1} total={totalQuestions} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Question card */}
        <View style={[styles.questionCard, { backgroundColor: colors.card, borderRadius: radius.lg, borderColor: colors.border, ...shadow.sm }]}>
          <Text style={[{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }]}>
            CÂU HỎI {currentIndex + 1}
          </Text>
          <Text style={[styles.questionContent, { color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.semibold }]}>
            {currentQuestion.content}
          </Text>
        </View>

        {/* Options */}
        <View style={{ gap: 10 }}>
          {currentQuestion.answers.map((answer, idx) => (
            <OptionButton
              key={answer.answerId}
              label={OPTION_LABELS[idx] ?? String(idx + 1)}
              content={answer.content}
              state={selectedAnswerId === answer.answerId ? 'selected' : 'default'}
              onPress={() => selectAnswer(answer.answerId)}
            />
          ))}
        </View>

        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[
              styles.navBtn,
              {
                backgroundColor: currentIndex === 0 ? colors.disabled : colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
              },
            ]}
            onPress={goPrev}
            disabled={currentIndex === 0}
            accessibilityRole="button"
            accessibilityLabel="Câu trước"
          >
            <Ionicons name="arrow-back" size={20} color={currentIndex === 0 ? colors.disabledText : colors.text} />
            <Text style={[{ color: currentIndex === 0 ? colors.disabledText : colors.text, fontSize: fontSize.sm }]}>
              Trước
            </Text>
          </TouchableOpacity>

          {currentIndex < totalQuestions - 1 ? (
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: colors.primary, borderColor: colors.primary, borderRadius: radius.md }]}
              onPress={goNext}
              accessibilityRole="button"
              accessibilityLabel="Câu tiếp theo"
            >
              <Text style={[{ color: colors.textInverse, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }]}>
                Tiếp
              </Text>
              <Ionicons name="arrow-forward" size={20} color={colors.textInverse} />
            </TouchableOpacity>
          ) : (
            <PrimaryButton
              title={submitting ? 'Đang nộp...' : 'Nộp bài'}
              onPress={handleSubmit}
              loading={submitting}
              style={{ flex: 1, height: 44 }}
            />
          )}
        </View>
      </ScrollView>
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
  headerCenter: { flex: 1, gap: 2 },
  questionCard: {
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  questionContent: { lineHeight: 28 },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  navBtn: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
  },
});
