import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/quiz/EmptyState';
import OptionButton from '../components/quiz/OptionButton';
import { quizzes } from '../data/quizzes';
import { getHistory } from '../storage/historyStorage';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme';
import { QuizResult } from '../types';

const LABELS = ['A', 'B', 'C', 'D'];

export default function ReviewScreen() {
  const router = useRouter();
  const { resultId } = useLocalSearchParams<{ resultId: string }>();
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    (async () => {
      const history = await getHistory();
      const found = history.find((r) => r.id === resultId);
      setResult(found ?? null);
    })();
  }, [resultId]);

  if (!result) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState icon="alert-circle-outline" title="Không tìm thấy kết quả" />
      </SafeAreaView>
    );
  }

  const quiz = quizzes.find((q) => q.id === result.quizId);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Xem lại đáp án</Text>
            <Text style={styles.headerSub}>
              {result.correctCount}/{result.totalQuestions} câu đúng
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={result.answers}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const question = quiz?.questions.find((q) => q.id === item.questionId);
            if (!question) return null;

            return (
              <View style={styles.questionBlock}>
                {/* Question header */}
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>Câu {index + 1}</Text>
                  <View
                    style={[
                      styles.resultBadge,
                      { backgroundColor: item.isCorrect ? Colors.success + '20' : Colors.danger + '20' },
                    ]}
                  >
                    <Ionicons
                      name={item.isCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={14}
                      color={item.isCorrect ? Colors.success : Colors.danger}
                    />
                    <Text
                      style={[
                        styles.resultBadgeText,
                        { color: item.isCorrect ? Colors.success : Colors.danger },
                      ]}
                    >
                      {item.isCorrect ? 'Đúng' : 'Sai'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.questionText}>{question.question}</Text>

                {/* Options */}
                <View style={styles.optionsList}>
                  {question.options.map((opt, idx) => {
                    let state: 'default' | 'correct' | 'wrong' | 'correct-unselected' = 'default';
                    if (idx === item.selectedAnswerIndex && idx === item.correctAnswerIndex) {
                      state = 'correct';
                    } else if (idx === item.selectedAnswerIndex && idx !== item.correctAnswerIndex) {
                      state = 'wrong';
                    } else if (idx === item.correctAnswerIndex && idx !== item.selectedAnswerIndex) {
                      state = 'correct-unselected';
                    }
                    return (
                      <OptionButton
                        key={idx}
                        label={LABELS[idx]}
                        text={opt}
                        state={state}
                        disabled
                      />
                    );
                  })}
                </View>

                {/* Explanation */}
                {question.explanation && (
                  <View style={styles.explanationBox}>
                    <Ionicons name="bulb-outline" size={16} color="#FDCB6E" />
                    <Text style={styles.explanationText}>{question.explanation}</Text>
                  </View>
                )}
              </View>
            );
          }}
        />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  questionBlock: {
    gap: Spacing.sm,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionNumber: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 20,
  },
  resultBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  questionText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 24,
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: Radius.md,
    ...Shadow.card,
  },
  optionsList: {
    gap: Spacing.xs,
  },
  explanationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#FFFBF0',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: '#FDCB6E',
  },
  explanationText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
