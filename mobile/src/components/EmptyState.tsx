import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
export function EmptyState({
  title = 'Chưa có dữ liệu',
  message,
}: {
  title?: string;
  message: string;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        padding: 26,
        gap: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: 20,
      }}
    >
      <Ionicons name="albums-outline" size={30} color={colors.primary} />
      <Text
        style={{
          color: colors.text,
          fontSize: 16,
          fontWeight: '600',
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 22,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
