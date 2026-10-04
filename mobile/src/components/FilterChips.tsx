import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
      style={{ flexGrow: 0 }}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          onPress={() => onChange(option.key)}
          accessibilityRole="button"
          accessibilityState={{ selected: value === option.key }}
          style={{
            minHeight: 44,
            justifyContent: 'center',
            paddingHorizontal: 17,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: value === option.key ? colors.primary : colors.border,
            backgroundColor:
              value === option.key ? colors.primary : colors.surface,
          }}
        >
          <Text
            style={{
              color:
                value === option.key
                  ? colors.textInverse
                  : colors.textSecondary,
              fontSize: 13,
              fontWeight: '600',
            }}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
