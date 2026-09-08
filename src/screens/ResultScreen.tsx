import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/quiz/EmptyState';
import PrimaryButton from '../components/quiz/PrimaryButton';
import ResultCard from '../components/quiz/ResultCard';
import { getHistory } from '../storage/historyStorage';
import { Colors, FontSize, Spacing } from '../theme';
import { QuizResult } from '../types';

export default function ResultScreen() {
  const router = useRouter();
  const { resultId, quizId } = useLocalSearchParams<{ resultId: string; quizId: string }>();
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kết quả</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Quiz name */}
          <Text style={styles.quizTitle}>{result.quizTitle}</Text>

          {/* Result card */}
          <ResultCard
            correctCount={result.correctCount}
            totalQuestions={result.totalQuestions}
            percentage={result.percentage}
          />

          {/* Actions */}
          <View style={styles.actions}>
            <PrimaryButton
              title="Xem lại đáp án"
              onPress={() =>
                router.push({
                  pathname: '/review',
                  params: { resultId: result.id },
                })
              }
              style={styles.actionBtn}
            />

            <PrimaryButton
              title="Làm lại bài"
              variant="outline"
              onPress={() =>
                router.replace({
                  pathname: '/quiz-play',
                  params: { quizId: result.quizId },
                })
              }
              style={styles.actionBtn}
            />

            <PrimaryButton
              title="Về trang chủ"
              variant="ghost"
              onPress={() => router.replace('/')}
              style={styles.actionBtn}
            />
          </View>
        </ScrollView>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  quizTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionBtn: {
    width: '100%',
  },
});
