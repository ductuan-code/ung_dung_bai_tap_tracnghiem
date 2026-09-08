import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/quiz/EmptyState';
import { clearHistory, deleteResult, getHistory } from '../storage/historyStorage';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme';
import { QuizResult } from '../types';
import { formatDate } from '../utils/scoring';

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<QuizResult[]>([]);

  // Tải lại mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const data = await getHistory();
        setHistory(data);
      })();
    }, [])
  );

  const handleDelete = (id: string) => {
    Alert.alert('Xóa kết quả?', 'Bạn có chắc muốn xóa kết quả này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteResult(id);
          setHistory(updated);
        },
      },
    ]);
  };

  const handleClearAll = () => {
    if (history.length === 0) return;
    Alert.alert('Xóa tất cả?', 'Toàn bộ lịch sử sẽ bị xóa và không thể khôi phục.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa hết',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          setHistory([]);
        },
      },
    ]);
  };

  const scoreColor = (percentage: number) =>
    percentage >= 70 ? Colors.success : percentage >= 50 ? '#FDCB6E' : Colors.danger;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Lịch sử</Text>
            {history.length > 0 && (
              <Text style={styles.headerSub}>{history.length} lần làm bài</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleClearAll}
            style={styles.clearBtn}
            activeOpacity={0.7}
            disabled={history.length === 0}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={history.length === 0 ? Colors.textMuted : Colors.danger}
            />
          </TouchableOpacity>
        </View>

        {history.length === 0 ? (
          <EmptyState
            icon="time-outline"
            title="Chưa có lịch sử"
            subtitle="Các lần làm bài của bạn sẽ xuất hiện ở đây sau khi nộp bài."
          />
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/review', params: { resultId: item.id } })}
                activeOpacity={0.85}
                style={styles.card}
              >
                {/* Score circle */}
                <View style={[styles.scoreCircle, { borderColor: scoreColor(item.percentage) }]}>
                  <Text style={[styles.scoreText, { color: scoreColor(item.percentage) }]}>
                    {item.percentage}%
                  </Text>
                </View>

                {/* Info */}
                <View style={styles.info}>
                  <Text style={styles.quizTitle} numberOfLines={1}>
                    {item.quizTitle}
                  </Text>
                  <Text style={styles.detail}>
                    {item.correctCount}/{item.totalQuestions} câu đúng
                  </Text>
                  <Text style={styles.date}>{formatDate(item.date)}</Text>
                </View>

                {/* Actions */}
                <View style={styles.cardActions}>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
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
  clearBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.card,
  },
  scoreCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  scoreText: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  quizTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  detail: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  cardActions: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
