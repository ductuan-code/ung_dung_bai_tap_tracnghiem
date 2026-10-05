import { View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
export function StatCard({ value, label }: { value: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        minWidth: 85,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 18,
        paddingHorizontal: 10,
        borderRadius: 18,
        gap: 7,
      }}
    >
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={{
          color: colors.accent,
          fontSize: 23,
          fontWeight: '800',
          textAlign: 'center',
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 11,
          lineHeight: 16,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
