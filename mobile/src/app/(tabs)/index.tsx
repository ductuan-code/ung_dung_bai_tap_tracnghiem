import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuthContext } from '@/contexts/AuthContext';
import { categoryService } from '@/services/quizService';
import { CategoryCard } from '@/components/CategoryCard';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorMessage } from '@/components/ErrorMessage';
import type { Category } from '@/types';

export default function HomeScreen() {
  const { colors, spacing, fontSize, fontWeight } = useTheme();
  const { user, signOut } = useAuthContext();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch {
      setError('Không thể tải danh mục. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (loading) return <LoadingScreen message="Đang tải danh mục..." />;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
            Xin chào,
          </Text>
          <Text style={[styles.username, { color: colors.text, fontSize: fontSize.xl, fontWeight: fontWeight.bold }]}>
            {user?.username ?? 'Student'} 👋
          </Text>
        </View>
        <TouchableOpacity
          onPress={signOut}
          style={[styles.logoutBtn, { borderColor: colors.border, borderRadius: 20 }]}
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất"
        >
          <Text style={[{ color: colors.textSecondary, fontSize: fontSize.sm }]}>Thoát</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.semibold }]}>
          Chọn danh mục
        </Text>
        <Text style={[{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 }]}>
          {categories.length} danh mục có sẵn
        </Text>
      </View>

      {/* Error */}
      {error && (
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
          <ErrorMessage message={error} onRetry={fetchCategories} />
        </View>
      )}

      {/* Categories list */}
      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.categoryId)}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onPress={() => router.push({ pathname: '/quiz-list', params: { categoryId: item.categoryId, categoryName: item.name } })}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !error ? (
            <View style={styles.empty}>
              <Text style={[{ color: colors.textSecondary, fontSize: fontSize.md }]}>
                Chưa có danh mục nào.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { gap: 2 },
  greeting: {},
  username: {},
  logoutBtn: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  sectionTitle: {},
  empty: {
    marginTop: 48,
    alignItems: 'center',
  },
});
