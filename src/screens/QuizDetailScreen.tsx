import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/quiz/EmptyState';
import PrimaryButton from '../components/quiz/PrimaryButton';
import { categories } from '../data/categories';
import { quizzes } from '../data/quizzes';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme';

export default function QuizDetailScreen() {
  const router = useRouter();
  const { quizId } = useLocalSearchParams<{ quizId: string }>();

  const quiz = quizzes.find((q) => q.id === quizId);
  const category = quiz ? categories.find((c) => c.id === quiz.categoryId) : null;

  if (!quiz) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState icon="alert-circle-outline" title="Không tìm thấy bài quiz" />
      </SafeAreaView>
    );
  }

  const hasQuestions = quiz.questions.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết bài quiz</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Main card */}
          <View style={styles.card}>
            {/* Category badge */}
            {category && (
              <View style={[styles.badge, { backgroundColor: category.color + '20' }]}>
                <Ionicons name={category.icon as any} size={14} color={category.color} />
                <Text style={[styles.badgeText, { color: category.color }]}>{category.name}</Text>
              </View>
            )}

            <Text style={styles.title}>{quiz.title}</Text>
            <Text style={styles.description}>{quiz.description}</Text>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="help-circle" size={20} color={Colors.primary} />
                <Text style={styles.statValue}>{quiz.questions.length}</Text>
                <Text style={styles.statLabel}>câu hỏi</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
                <Text style={styles.statValue}>~{Math.ceil(quiz.questions.length * 0.5)} phút</Text>
                <Text style={styles.statLabel}>ước tính</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="trophy-outline" size={20} color={Colors.primary} />
                <Text style={styles.statValue}>{quiz.questions.length}</Text>
                <Text style={styles.statLabel}>điểm tối đa</Text>
              </View>
            </View>
          </View>

          {/* Rules card */}
          <View style={styles.rulesCard}>
            <Text style={styles.rulesTitle}>Quy tắc làm bài</Text>
            {[
              'Mỗi câu có 4 đáp án, chọn 1 đáp án đúng',
              'Có thể thay đổi đáp án trước khi bấm Tiếp theo',
              'Có thể quay lại câu trước',
              'Kết quả được lưu vào lịch sử sau khi nộp bài',
            ].map((rule, i) => (
              <View key={i} style={styles.ruleRow}>
                <View style={styles.ruleDot} />
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Start button */}
        <View style={styles.footer}>
          {hasQuestions ? (
            <PrimaryButton
              title="Bắt đầu làm bài"
              onPress={() =>
                router.push({ pathname: '/quiz-play', params: { quizId: quiz.id } })
              }
            />
          ) : (
            <PrimaryButton title="Không có câu hỏi" onPress={() => {}} disabled />
          )}
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
    ...Shadow.card,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#DFE6E9',
    marginTop: Spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#DFE6E9',
  },
  rulesCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  rulesTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  ruleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 7,
    flexShrink: 0,
  },
  ruleText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.background,
  },
});
