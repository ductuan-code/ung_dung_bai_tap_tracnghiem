import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const { colors, radius, fontSize } = useTheme();
  const progress = total > 0 ? Math.min(current / total, 1) : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: colors.border, borderRadius: radius.full }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${progress * 100}%`,
              backgroundColor: colors.primary,
              borderRadius: radius.full,
            },
          ]}
        />
      </View>
      <Text style={[styles.label, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
        {current}/{total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  track: {
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  label: {
    minWidth: 36,
    textAlign: 'right',
  },
});
