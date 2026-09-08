import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OptionButton from '../components/quiz/OptionButton';
import ProgressBar from '../components/quiz/ProgressBar';
import { quizzes } from '../data/quizzes';
import { saveResult } from '../storage/historyStorage';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme';
import { AnswerRecord } from '../types';
import { buildResult } from '../utils/scoring';

const LABELS = ['A', 'B', 'C', 'D'];

export default function QuizPlayScreen() {
  const router = useRouter();
  const { quizId } = useLocalSearchParams<{ quizId: string }>();

  const quiz = quizzes.find((q) => q.id === quizId);

  const [currentIndex, setCurrentIndex] = useState(0);
  // null = chưa chọn, number = index đáp án đã chọn
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  // Lưu đáp án đã chọn cho từng câu để back/forward giữ nguyên
  const [answersMap, setAnswersMap] = useState<Record<number, number | null>>({});
  // Mảng kết quả cuối cùng (chỉ đẩy vào khi nộp bài)
  const isSubmitting = useRef(false);

  const handleSelectOption = useCallback((index: number) => {
    setSelectedAnswerIndex(index);
    setAnswersMap((prev) => ({ ...prev, [currentIndex]: index }));
  }, [currentIndex]);

  const handleNext = useCallback(async () => {
    if (!quiz) return;
    if (selectedAnswerIndex === null) return;

    const isLast = currentIndex === quiz.questions.length - 1;

    if (isLast) {
      // Nộp bài
      if (isSubmitting.current) return;
      isSubmitting.current = true;

      // Build mảng answers đầy đủ
      // Câu cuối dùng selectedAnswerIndex hiện tại (chưa lưu vào answersMap kịp)
      const finalAnswers: AnswerRecord[] = quiz.questions.map((q, i) => {
        const actualSelected = i === currentIndex ? (selectedAnswerIndex ?? 0) : (answersMap[i] ?? 0);
        return {
          questionId: q.id,
          selectedAnswerIndex: actualSelected,
          correctAnswerIndex: q.correctAnswerIndex,
          isCorrect: actualSelected === q.correctAnswerIndex,
        };
      });

      const result = buildResult(quiz.id, quiz.title, finalAnswers, quiz.questions);
      await saveResult(result);

      router.replace({
        pathname: '/result',
        params: {
          resultId: result.id,
          quizId: quiz.id,
        },
      });
    } else {
      // Sang câu tiếp theo
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      // Khôi phục đáp án nếu đã từng làm câu này
      const saved = answersMap[nextIndex];
      setSelectedAnswerIndex(saved !== undefined ? saved : null);
    }
  }, [quiz, currentIndex, selectedAnswerIndex, answersMap, router]);

  const handleBack = useCallback(() => {
    if (currentIndex === 0) {
      // Xác nhận thoát
      Alert.alert('Thoát bài thi?', 'Tiến trình sẽ bị mất và không được lưu.', [
        { text: 'Ở lại', style: 'cancel' },
        { text: 'Thoát', style: 'destructive', onPress: () => router.back() },
      ]);
      return;
    }
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    const saved = answersMap[prevIndex];
    setSelectedAnswerIndex(saved !== undefined ? saved : null);
  }, [currentIndex, answersMap, router]);

  if (!quiz || quiz.questions.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ padding: 20, color: Colors.textPrimary }}>Không tìm thấy bài quiz.</Text>
      </SafeAreaView>
    );
  }

  const question = quiz.questions[currentIndex];
  const isLast = currentIndex === quiz.questions.length - 1;
  const canProceed = selectedAnswerIndex !== null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* Progress */}
        <ProgressBar current={currentIndex + 1} total={quiz.questions.length} />

        {/* Quiz title */}
        <Text style={styles.quizTitle} numberOfLines={1}>
          {quiz.title}
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Question card */}
          <View style={styles.questionCard}>
            <Text style={styles.questionNumber}>Câu {currentIndex + 1}</Text>
            <Text style={styles.questionText}>{question.question}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsList}>
            {question.options.map((opt, idx) => (
              <OptionButton
                key={idx}
                label={LABELS[idx]}
                text={opt}
                state={selectedAnswerIndex === idx ? 'selected' : 'default'}
                onPress={() => handleSelectOption(idx)}
              />
            ))}
          </View>
        </ScrollView>

        {/* Footer nav */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={20} color={Colors.primary} />
            <Text style={styles.backText}>{currentIndex === 0 ? 'Thoát' : 'Trước'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            disabled={!canProceed}
            activeOpacity={0.85}
            style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
          >
            <Text style={[styles.nextText, !canProceed && styles.nextTextDisabled]}>
              {isLast ? 'Nộp bài' : 'Tiếp theo'}
            </Text>
            <Ionicons
              name={isLast ? 'checkmark-circle' : 'chevron-forward'}
              size={20}
              color={canProceed ? '#fff' : Colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  quizTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  questionNumber: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  optionsList: {
    gap: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.background,
    gap: Spacing.md,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    ...Shadow.button,
  },
  nextBtnDisabled: {
    backgroundColor: Colors.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextText: {
    fontSize: FontSize.md,
    color: '#fff',
    fontWeight: '700',
  },
  nextTextDisabled: {
    color: Colors.textMuted,
  },
});
