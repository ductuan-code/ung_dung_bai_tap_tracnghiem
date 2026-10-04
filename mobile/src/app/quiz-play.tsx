import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useScreenData } from '@/hooks/useScreenData';
import { quizService } from '@/services/quizService';
import { resultService } from '@/services/resultService';
import { ProgressBar } from '@/components/ProgressBar';
import { OptionButton } from '@/components/OptionButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmSubmitModal } from '@/components/ConfirmSubmitModal';
import { QuestionNavigator } from '@/components/QuestionNavigator';
import { errorMessage, routeId } from '@/utils/study';
import { useAttemptTimer } from '@/hooks/useAttemptTimer';
import { formatTime } from '@/utils/attemptClock';
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizPlayScreen() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  // Route identity resets all local selections when a different quiz is opened.
  return <QuizAttempt key={quizId} quizId={quizId} />;
}
function QuizAttempt({ quizId }: { quizId: string }) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const scroll = useRef<ScrollView>(null);
  const submitLock = useRef(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completedId, setCompletedId] = useState<number | null>(null);
  const loader = useCallback(async () => {
    const id = routeId(quizId);
    const [quiz, questions] = await Promise.all([
      quizService.getById(id),
      quizService.getQuestions(id),
    ]);
    return { quiz, questions };
  }, [quizId]);
  const { data, loading, error, refresh } = useScreenData(loader);
  const questions = data?.questions ?? [];
  const question = questions[current];
  const answered = questions.filter((q) => answers.has(q.questionId)).length;
  const timer = useAttemptTimer(questions.length > 0 && !loading, () => {
    void submit();
  });
  const locked = timer.attempted || timer.remaining === 0;

  usePreventRemove(
    questions.length > 0 && completedId === null && !submitError,
    ({ data: actionData }) => {
      if (submitLock.current) return;
      Alert.alert(
        'Thoát bài thi?',
        'Các lựa chọn chưa nộp sẽ không được lưu.',
        [
          { text: 'Tiếp tục làm', style: 'cancel' },
          {
            text: 'Thoát',
            style: 'destructive',
            onPress: () => {
              if (!submitLock.current) navigation.dispatch(actionData.action);
            },
          },
        ],
      );
    },
  );
  useEffect(() => {
    if (completedId !== null)
      router.replace({
        pathname: '/result',
        params: { resultId: completedId },
      });
  }, [completedId]);

  function goTo(index: number) {
    if (!timer.canEdit()) return;
    setCurrent(index);
    scroll.current?.scrollTo({ y: 0, animated: true });
  }
  async function submit() {
    if (!data || questions.length === 0 || !timer.claimSubmit()) return;
    // Ref closes the double-tap window before React renders the disabled state.
    submitLock.current = true;
    setSubmitting(true);
    setConfirm(false);
    setSubmitError(null);
    try {
      const result = await resultService.submit({
        quizId: data.quiz.quizId,
        userAnswers: questions.flatMap((q) => {
          const answerId = answers.get(q.questionId);
          return answerId === undefined
            ? []
            : [{ questionId: q.questionId, answerId }];
        }),
      });
      setConfirm(false);
      setCompletedId(result.resultId);
      // Keep locked until navigation completes; never submit the successful attempt twice.
    } catch (error) {
      setSubmitError(errorMessage(error));
      // No retry in this attempt: the server may have saved a lost response.
      setSubmitting(false);
    }
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 20,
          paddingVertical: 12,
        }}
      >
        <TouchableOpacity
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel="Thoát bài thi"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/(tabs)')
          }
          style={{ padding: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, gap: 5 }}>
          <Text
            numberOfLines={2}
            style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}
          >
            {data?.quiz.title ?? 'Làm bài'}
          </Text>
          {questions.length > 0 && (
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              Câu {current + 1} / {questions.length}
            </Text>
          )}
        </View>
      </View>
      {questions.length > 0 && (
        <View style={{ paddingHorizontal: 20, paddingBottom: 12, gap: 8 }}>
          <Text
            accessibilityLabel={
              'Thời gian còn lại ' + formatTime(timer.remaining)
            }
            style={{
              fontSize: 22,
              fontWeight: '800',
              color:
                timer.remaining > 30
                  ? colors.primary
                  : timer.remaining > 10
                    ? colors.warning
                    : colors.incorrect,
            }}
          >
            ⏱ {formatTime(timer.remaining)}
          </Text>
          {submitting && (
            <View
              style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}
            >
              <ActivityIndicator color={colors.primary} />
              <Text style={{ color: colors.textSecondary, flex: 1 }}>
                {timer.remaining === 0
                  ? 'Hết thời gian! Bài của bạn đang được nộp...'
                  : 'Đang nộp bài...'}
              </Text>
            </View>
          )}
          {submitError && (
            <>
              <ErrorMessage message={submitError} />
              <Text style={{ color: colors.textSecondary }}>
                Bài đã khóa. Kiểm tra lịch sử để biết hệ thống đã lưu kết quả
                chưa.
              </Text>
              <PrimaryButton
                title="Xem lịch sử"
                onPress={() => router.replace('/(tabs)/history')}
              />
            </>
          )}
        </View>
      )}
      {loading ? (
        <LoadingScreen message="Đang tải câu hỏi..." />
      ) : error ? (
        <View style={{ padding: 20 }}>
          <ErrorMessage message={error} onRetry={refresh} />
        </View>
      ) : !question ? (
        <View style={{ padding: 20 }}>
          <EmptyState
            title="Đề chưa có câu hỏi"
            message="Quay lại danh sách để chọn một đề khác."
          />
        </View>
      ) : (
        <>
          <View style={{ paddingHorizontal: 20, paddingBottom: 18, gap: 10 }}>
            <ProgressBar current={current + 1} total={questions.length} />
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              Đã trả lời: {answered}/{questions.length}
            </Text>
          </View>
          <ScrollView
            ref={scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 28,
              gap: 20,
            }}
          >
            <View
              style={{
                padding: 22,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 22,
                backgroundColor: colors.card,
                gap: 14,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                CÂU HỎI {current + 1}
              </Text>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 20,
                  lineHeight: 30,
                  fontWeight: '600',
                }}
              >
                {question.content}
              </Text>
            </View>
            <View style={{ gap: 12 }}>
              {question.answers.map((answer, index) => (
                <OptionButton
                  key={answer.answerId}
                  label={OPTION_LABELS[index] ?? String(index + 1)}
                  content={answer.content}
                  disabled={locked}
                  state={
                    answers.get(question.questionId) === answer.answerId
                      ? 'selected'
                      : 'default'
                  }
                  onPress={() => {
                    if (timer.canEdit())
                      setAnswers((previous) =>
                        new Map(previous).set(
                          question.questionId,
                          answer.answerId,
                        ),
                      );
                  }}
                />
              ))}
            </View>
            <QuestionNavigator
              questions={questions}
              answers={answers}
              current={current}
              disabled={locked}
              onSelect={goTo}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <PrimaryButton
                title="Câu trước"
                variant="outline"
                disabled={current === 0 || locked}
                onPress={() => goTo(current - 1)}
                style={{ flex: 1, paddingHorizontal: 12 }}
              />
              {current < questions.length - 1 ? (
                <PrimaryButton
                  title="Câu tiếp"
                  disabled={locked}
                  onPress={() => goTo(current + 1)}
                  style={{ flex: 1, paddingHorizontal: 12 }}
                />
              ) : (
                <PrimaryButton
                  title="Nộp bài"
                  disabled={locked}
                  loading={submitting}
                  onPress={() => {
                    if (!timer.canEdit()) {
                      void submit();
                      return;
                    }
                    setSubmitError(null);
                    setConfirm(true);
                  }}
                  style={{ flex: 1, paddingHorizontal: 12 }}
                />
              )}
            </View>
          </ScrollView>
          <ConfirmSubmitModal
            visible={confirm}
            answered={answered}
            total={questions.length}
            busy={submitting}
            remaining={timer.remaining}
            error={submitError}
            onCancel={() => setConfirm(false)}
            onSubmit={submit}
          />
        </>
      )}
    </SafeAreaView>
  );
}
