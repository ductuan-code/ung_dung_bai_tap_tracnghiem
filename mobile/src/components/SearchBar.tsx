import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
export function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        gap: 10,
      }}
    >
      <Ionicons name="search-outline" size={21} color={colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        accessibilityLabel={placeholder}
        placeholderTextColor={colors.placeholder}
        autoCorrect={false}
        returnKeyType="search"
        style={{ flex: 1, minHeight: 52, color: colors.text, fontSize: 14 }}
      />
      {!!value && (
        <TouchableOpacity
          onPress={() => onChange('')}
          accessibilityLabel="Xóa tìm kiếm"
          accessibilityRole="button"
          style={{ padding: 10 }}
        >
          <Ionicons
            name="close-circle"
            size={19}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
