import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../theme';
import { getScoreLabel } from '../../utils/scoring';

interface Props {
  correctCount: number;
  totalQuestions: number;
  percentage: number;
}

export default function ResultCard({ correctCount, totalQuestions, percentage }: Props) {
  const scoreColor =
    percentage >= 70 ? Colors.success : percentage >= 50 ? '#FDCB6E' : Colors.danger;

  return (
    <View style={styles.card}>
      {/* Vòng tròn điểm */}
      <View style={[styles.circle, { borderColor: scoreColor }]}>
        <Text style={[styles.percentage, { color: scoreColor }]}>{percentage}%</Text>
        <Text style={styles.circleLabel}>Điểm số</Text>
      </View>

      {/* Label kết quả */}
      <Text style={styles.label}>{getScoreLabel(percentage)}</Text>

      {/* Thống kê */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.success }]}>{correctCount}</Text>
          <Text style={styles.statLabel}>Câu đúng</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.danger }]}>
            {totalQuestions - correctCount}
          </Text>
          <Text style={styles.statLabel}>Câu sai</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.primary }]}>{totalQuestions}</Text>
          <Text style={styles.statLabel}>Tổng câu</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.lg,
    ...Shadow.card,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F6FA',
  },
  percentage: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  circleLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  label: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#DFE6E9',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    backgroundColor: '#DFE6E9',
  },
});
