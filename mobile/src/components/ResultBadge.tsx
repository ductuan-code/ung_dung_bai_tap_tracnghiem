import { Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { percent } from '@/utils/study';
export function ResultBadge({ score }: { score: number }) {
  const { colors } = useTheme();
  const color =
    score >= 80
      ? colors.correct
      : score >= 50
        ? colors.warning
        : colors.incorrect;
  return (
    <View
      style={{
        backgroundColor: color + '18',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 12,
      }}
    >
      <Text style={{ color, fontWeight: '800', fontSize: 16 }}>
        {percent(score)}
      </Text>
    </View>
  );
}
