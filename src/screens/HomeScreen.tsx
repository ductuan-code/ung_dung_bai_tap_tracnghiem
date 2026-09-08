import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryCard from '../components/quiz/CategoryCard';
import { categories } from '../data/categories';
import { quizzes } from '../data/quizzes';
import { Colors, FontSize, Spacing } from '../theme';

export default function HomeScreen() {
  const router = useRouter();

  const getQuizCount = (categoryId: string) =>
    quizzes.filter((q) => q.categoryId === categoryId).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào! 👋</Text>
            <Text style={styles.title}>QuizMaster</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/history')}
            style={styles.historyBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <Text style={styles.historyText}>Lịch sử</Text>
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>Chọn chủ đề để bắt đầu ôn tập</Text>

        {/* Category list */}
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              quizCount={getQuizCount(item.id)}
              onPress={() =>
                router.push({ pathname: '/quiz-list', params: { categoryId: item.id } })
              }
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  historyText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
});
