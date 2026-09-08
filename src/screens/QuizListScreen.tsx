import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/quiz/EmptyState';
import QuizCard from '../components/quiz/QuizCard';
import { categories } from '../data/categories';
import { quizzes } from '../data/quizzes';
import { Colors, FontSize, Spacing } from '../theme';

export default function QuizListScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();

  const category = categories.find((c) => c.id === categoryId);
  const categoryQuizzes = quizzes.filter((q) => q.categoryId === categoryId);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{category?.name ?? 'Chủ đề'}</Text>
            <Text style={styles.headerSub}>{categoryQuizzes.length} bài quiz</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* List */}
        {categoryQuizzes.length === 0 ? (
          <EmptyState
            icon="albums-outline"
            title="Chưa có bài quiz"
            subtitle="Chủ đề này chưa có bài quiz nào. Hãy thử chủ đề khác."
          />
        ) : (
          <FlatList
            data={categoryQuizzes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <QuizCard
                quiz={item}
                onPress={() =>
                  router.push({ pathname: '/quiz-detail', params: { quizId: item.id } })
                }
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
});
