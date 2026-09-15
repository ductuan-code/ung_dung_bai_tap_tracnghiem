import { TouchableOpacity, Text, StyleSheet, type TouchableOpacityProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import type { Category } from '../types';

interface CategoryCardProps extends TouchableOpacityProps {
  category: Category;
}

export function CategoryCard({ category, style, ...props }: CategoryCardProps) {
  const { colors, radius, fontSize, fontWeight, shadow } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          borderColor: colors.border,
          ...shadow.md,
        },
        style,
      ]}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Danh mục ${category.name}`}
      {...props}
    >
      <Text
        style={[styles.name, { color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.semibold }]}
        numberOfLines={1}
      >
        {category.name}
      </Text>
      {category.description && (
        <Text
          style={[styles.desc, { color: colors.textSecondary, fontSize: fontSize.sm }]}
          numberOfLines={2}
        >
          {category.description}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderWidth: 1,
    gap: 6,
  },
  name: {},
  desc: {
    lineHeight: 20,
  },
});
